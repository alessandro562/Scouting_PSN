// ===========================================================================
// board.js — rendering della board Kanban + drag & drop (SortableJS via CDN).
// ===========================================================================
import Sortable from "../../vendor/sortable.esm.js";
import {
  state,
  cardsForStage,
  orphanCards,
  startupById,
  computeMidpoint,
  moveCard,
  reorderStages,
} from "../store.js";
import { openStartupModal } from "./modal.js";
import { openStageMenu } from "./stages.js";
import { openStartupForm } from "./startupForm.js";
import { toastError } from "./toast.js";
import { applyFilters } from "./filters.js";

let noteCountMap = {};
let dragging = false;
let sortables = [];

export function isBoardDragging() {
  return dragging;
}

export function setNoteCounts(map) {
  noteCountMap = map || {};
}

// Colore per settore (accento card) e per fase (identità colonna) — palette PSN.
const SECTOR_COLOR = {
  AI: "#8360C2",
  Cybersecurity: "#F96954",
  "IoT/Edge": "#48E6EA",
  Data: "#5F75C5",
  GovTech: "#2FA9D6",
  FinTech: "#1F9D74",
  HealthTech: "#0F98B5",
};
const STAGE_PALETTE = ["#5F75C5", "#8360C2", "#48E6EA", "#F96954", "#2FA9D6", "#9B6FD0"];

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sectorColor(sector) {
  return SECTOR_COLOR[sector] || "#5F75C5";
}

function cardsForColumn(col, index) {
  let cards = cardsForStage(col.id);
  if (index === 0) cards = [...orphanCards(), ...cards];
  const allowed = new Set(applyFilters(state.startups).map((s) => s.id));
  return cards.filter((c) => allowed.has(c.id));
}

function tileHtml(card) {
  const primary = card.psn?.primary || card.data?.area || "";
  const what = card.data?.what || "";
  const notes = noteCountMap[card.id] || 0;
  const sector = card.sector || "Settore n/d";
  const color = sectorColor(card.sector);
  const trl = card.data?.trl;
  return `
    <article class="kcard searchable" data-id="${esc(card.id)}" style="--sector:${color}" tabindex="0" role="button" aria-label="Apri ${esc(card.name)}">
      <div class="kcard-inner">
        <div class="kcard-top">
          <span class="kcard-sector"><span class="kcard-dot"></span>${esc(sector)}</span>
          ${notes ? `<span class="kcard-notes" title="${notes} note">💬 ${notes}</span>` : ""}
        </div>
        <h4 class="kcard-title">${esc(card.name)}</h4>
        ${what ? `<p class="kcard-what">${esc(what)}</p>` : ""}
        <div class="kcard-meta">
          ${primary ? `<span class="kchip">${esc(primary)}</span>` : ""}
          ${trl ? `<span class="kchip kchip-ghost">TRL ${esc(trl)}</span>` : ""}
          ${Array.isArray(card.data?.toConfirm) && card.data.toConfirm.length ? `<span class="kchip kchip-warn" title="Contiene dati da confermare">⚠ da confermare</span>` : ""}
        </div>
      </div>
    </article>
  `;
}

function columnHtml(col, index) {
  const cards = cardsForColumn(col, index);
  const color = STAGE_PALETTE[index % STAGE_PALETTE.length];
  return `
    <section class="kcol" data-stage-id="${esc(col.id)}" style="--stage:${color}">
      <header class="kcol-head" title="Trascina per riordinare">
        <div class="kcol-head-left">
          <span class="kcol-dot"></span>
          <span class="kcol-name">${esc(col.name)}</span>
          <span class="kcol-count">${cards.length}</span>
        </div>
        <button class="kcol-menu-btn icon-btn" data-stage-menu="${esc(col.id)}" title="Opzioni colonna" aria-label="Opzioni colonna">⋯</button>
      </header>
      <div class="kcol-body" data-stage-id="${esc(col.id)}">
        ${cards.map(tileHtml).join("")}
      </div>
      <button class="kcol-add" data-add-in="${esc(col.id)}"><span>+</span> Aggiungi startup</button>
    </section>
  `;
}

export function renderBoard(container) {
  if (!container) return;
  if (dragging) return; // non ridisegnare mentre l'utente trascina

  if (!state.stages.length) {
    container.innerHTML = `<div class="board-empty">Nessuna colonna. <button class="btn-inline" data-add-column>Crea la prima colonna</button></div>`;
    wireDelegation(container);
    return;
  }

  container.innerHTML =
    `<div class="kboard" id="kboard">${state.stages.map(columnHtml).join("")}</div>` +
    `<button class="kcol-add-column" data-add-column>+ Aggiungi colonna</button>`;

  wireSortables(container);
  wireDelegation(container);
}

function wireSortables(container) {
  sortables.forEach((s) => s.destroy());
  sortables = [];

  const kboard = container.querySelector("#kboard");
  if (!kboard) return;

  // Riordino colonne (drag dall'header).
  sortables.push(
    Sortable.create(kboard, {
      group: "columns",
      handle: ".kcol-head",
      draggable: ".kcol",
      animation: 150,
      onStart: () => { dragging = true; },
      onEnd: async (evt) => {
        setTimeout(() => { dragging = false; }, 0);
        const ids = Array.from(kboard.querySelectorAll(".kcol")).map((el) => el.dataset.stageId);
        try {
          await reorderStages(ids);
        } catch (e) {
          toastError("Errore nel riordino delle colonne", e);
        }
      },
    })
  );

  // Spostamento card (tra colonne e all'interno).
  container.querySelectorAll(".kcol-body").forEach((body) => {
    sortables.push(
      Sortable.create(body, {
        group: "cards",
        draggable: ".kcard",
        animation: 150,
        ghostClass: "kcard-ghost",
        onStart: () => { dragging = true; },
        onEnd: async (evt) => {
          setTimeout(() => { dragging = false; }, 0);
          await persistCardMove(evt);
        },
      })
    );
  });
}

async function persistCardMove(evt) {
  const item = evt.item;
  const id = item.dataset.id;
  const toBody = evt.to;
  const rawStage = toBody.dataset.stageId;
  const stageId = rawStage || null;

  // Vicini nel DOM di destinazione per calcolare la posizione frazionaria.
  const prevEl = item.previousElementSibling;
  const nextEl = item.nextElementSibling;
  const prevPos = prevEl ? startupById(prevEl.dataset.id)?.position ?? null : null;
  const nextPos = nextEl ? startupById(nextEl.dataset.id)?.position ?? null : null;
  const position = computeMidpoint(prevPos, nextPos);

  try {
    await moveCard(id, stageId, position);
    updateColumnCounts(evt.from, evt.to);
  } catch (e) {
    toastError("Errore nello spostamento della card", e);
  }
}

function updateColumnCounts(fromBody, toBody) {
  [fromBody, toBody].forEach((body) => {
    if (!body) return;
    const head = body.parentElement?.querySelector(".kcol-count");
    if (head) head.textContent = body.querySelectorAll(".kcard").length;
  });
}

function wireDelegation(container) {
  if (container._wired) return;
  container._wired = true;

  container.addEventListener("click", (e) => {
    if (dragging) return;

    const addColumn = e.target.closest("[data-add-column]");
    if (addColumn) { openStageMenu(null, "create"); return; }

    const stageMenu = e.target.closest("[data-stage-menu]");
    if (stageMenu) {
      openStageMenu(stageMenu.getAttribute("data-stage-menu"), "menu", stageMenu);
      return;
    }

    const addIn = e.target.closest("[data-add-in]");
    if (addIn) { openStartupForm(null, { stageId: addIn.getAttribute("data-add-in") }); return; }

    const card = e.target.closest(".kcard");
    if (card) {
      const s = startupById(card.dataset.id);
      if (s) openStartupModal(s);
    }
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".kcard");
    if (card) {
      e.preventDefault();
      const s = startupById(card.dataset.id);
      if (s) openStartupModal(s);
    }
  });
}
