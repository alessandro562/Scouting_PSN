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
  emitChange,
} from "../store.js";
import { openStartupModal } from "./modal.js";
import { openStageMenu } from "./stages.js";
import { openStartupForm } from "./startupForm.js";
import { toast, toastError } from "./toast.js";
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

// Iniziali dal nome (monogramma di fallback quando manca il logo).
function initials(name) {
  const parts = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Dominio leggibile da un URL.
function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return String(url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]; }
}

const STALE_DAYS = 21;

// Giorni trascorsi nella fase corrente (proxy: stageSince, poi updated_at).
function daysInStage(card) {
  const iso = card.data?.stageSince || card.updated_at || card.created_at;
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return Number.isFinite(days) && days >= 0 ? days : null;
}

function ageLabel(days) {
  if (days == null) return "";
  if (days === 0) return "oggi";
  if (days === 1) return "1g in fase";
  return `${days}g in fase`;
}

// Esito dell'ultimo approfondimento (verbale della call), se presente.
const OUTCOME_CHIP = {
  "Prosegue": ["ok", "✓"],
  "In attesa di materiali": ["wait", "⏳"],
  "Da rivalutare": ["hold", "⟳"],
  "Non prosegue": ["stop", "✕"],
};
function lastOutcome(card) {
  const dives = card.data?.deepDives;
  if (!Array.isArray(dives) || !dives.length) return null;
  const sorted = [...dives].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const o = sorted[0]?.outcome;
  return o && OUTCOME_CHIP[o] ? { label: o, cls: OUTCOME_CHIP[o][0], ico: OUTCOME_CHIP[o][1] } : null;
}

// Fase successiva nell'ordine della board (per l'azione rapida "avanza").
function nextStageOf(card) {
  const idx = state.stages.findIndex((s) => s.id === card.stage_id);
  if (idx === -1) return state.stages[0] || null;
  return state.stages[idx + 1] || null;
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
  const days = daysInStage(card);
  const stale = days != null && days > STALE_DAYS;
  const next = nextStageOf(card);
  const logo = card.data?.logo;
  const site = card.data?.website;
  const outcome = lastOutcome(card);
  const logoHtml = logo
    ? `<span class="kcard-logo"><img src="${esc(logo)}" alt="${esc(card.name)}" loading="lazy" onerror="this.parentNode.classList.add('kcard-logo-mono');this.parentNode.textContent='${esc(initials(card.name))}'"></span>`
    : `<span class="kcard-logo kcard-logo-mono">${esc(initials(card.name))}</span>`;
  const siteHtml = site
    ? `<a class="kcard-site" href="${esc(site)}" target="_blank" rel="noopener noreferrer" title="Apri ${esc(site)}"><span class="kcard-site-ico" aria-hidden="true">🔗</span>${esc(domainOf(site))}</a>`
    : "";
  return `
    <article class="kcard searchable ${stale ? "kcard-stale" : ""}" data-id="${esc(card.id)}" style="--sector:${color}" tabindex="0" role="button" aria-label="Apri ${esc(card.name)}">
      <div class="kcard-quick">
        ${next ? `<button class="kq-btn" data-advance="${esc(card.id)}" title="Avanza a “${esc(next.name)}”" aria-label="Avanza fase">→</button>` : ""}
        <button class="kq-btn" data-note="${esc(card.id)}" title="Aggiungi nota" aria-label="Aggiungi nota">💬</button>
      </div>
      <div class="kcard-inner">
        <div class="kcard-top">
          <span class="kcard-sector"><span class="kcard-dot"></span>${esc(sector)}</span>
          ${notes ? `<span class="kcard-notes" title="${notes} note">💬 ${notes}</span>` : ""}
        </div>
        <div class="kcard-head">
          ${logoHtml}
          <div class="kcard-headmain">
            <h4 class="kcard-title">${esc(card.name)}</h4>
            ${siteHtml}
          </div>
        </div>
        ${what ? `<p class="kcard-what">${esc(what)}</p>` : ""}
        <div class="kcard-meta">
          ${primary ? `<span class="kchip">${esc(primary)}</span>` : ""}
          ${trl ? `<span class="kchip kchip-ghost">TRL ${esc(trl)}</span>` : ""}
          ${Array.isArray(card.data?.toConfirm) && card.data.toConfirm.length ? `<span class="kchip kchip-warn" title="Contiene dati da confermare">⚠ da confermare</span>` : ""}
          ${days != null ? `<span class="kchip kchip-age ${stale ? "kchip-age-stale" : ""}" title="Tempo nella fase corrente">⏱ ${esc(ageLabel(days))}</span>` : ""}
          ${outcome ? `<span class="kchip kchip-out kchip-out-${outcome.cls}" title="Esito dell'ultimo approfondimento">${outcome.ico} ${esc(outcome.label)}</span>` : ""}
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
      animation: 160,
      chosenClass: "kcol-chosen",
      dragClass: "kcol-drag",
      onStart: () => { dragging = true; document.body.classList.add("dragging"); },
      onEnd: async (evt) => {
        setTimeout(() => { dragging = false; }, 0);
        document.body.classList.remove("dragging");
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
  const clearDrop = () => container.querySelectorAll(".kcol-drop").forEach((n) => n.classList.remove("kcol-drop"));
  container.querySelectorAll(".kcol-body").forEach((body) => {
    sortables.push(
      Sortable.create(body, {
        group: "cards",
        draggable: ".kcard",
        animation: 160,
        easing: "cubic-bezier(.2,.7,.3,1)",
        ghostClass: "kcard-ghost",
        chosenClass: "kcard-chosen",
        dragClass: "kcard-drag",
        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 4,
        swapThreshold: 0.65,
        scroll: true,
        scrollSensitivity: 90,
        scrollSpeed: 12,
        bubbleScroll: true,
        onStart: () => { dragging = true; document.body.classList.add("dragging"); },
        onMove: (evt) => {
          clearDrop();
          const target = evt.to;
          if (target && target.classList.contains("kcol-body")) target.classList.add("kcol-drop");
        },
        onEnd: async (evt) => {
          setTimeout(() => { dragging = false; }, 0);
          document.body.classList.remove("dragging");
          clearDrop();
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

  container.addEventListener("click", async (e) => {
    if (dragging) return;

    // Un link (es. sito web) apre la sua destinazione, non la modale.
    if (e.target.closest("a")) { e.stopPropagation(); return; }

    // Azioni rapide sulla card (non aprono la modale).
    const advance = e.target.closest("[data-advance]");
    if (advance) {
      e.stopPropagation();
      const card = startupById(advance.getAttribute("data-advance"));
      if (!card) return;
      const next = nextStageOf(card);
      if (!next) { toastError("La card è già all'ultima fase", new Error("no-next-stage")); return; }
      const inStage = state.startups.filter((x) => x.stage_id === next.id);
      const maxPos = inStage.reduce((m, x) => Math.max(m, x.position), 0);
      try { await moveCard(card.id, next.id, maxPos + 1000); emitChange(); toast(`Spostata in “${next.name}”`, "info"); }
      catch (err) { toastError("Errore nell'avanzamento di fase", err); }
      return;
    }
    const noteBtn = e.target.closest("[data-note]");
    if (noteBtn) {
      e.stopPropagation();
      const card = startupById(noteBtn.getAttribute("data-note"));
      if (card) openStartupModal(card, { focusNote: true });
      return;
    }

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
