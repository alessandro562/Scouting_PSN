// ===========================================================================
// modal.js — modale di dettaglio startup (contenuto ricco) + thread note.
// ===========================================================================
import { renderStartupDetail } from "./cardBody.js";
import {
  state,
  startupById,
  fetchNotes,
  addNote,
  deleteNote,
  moveCard,
  deleteStartup,
  emitChange,
  currentUser,
} from "../store.js";
import { supabase } from "../supabase.js";
import { openStartupForm } from "./startupForm.js";
import { toast, toastError } from "./toast.js";
import { avatarHtml, displayName } from "./avatar.js";
import { renderActivityTimeline } from "./activity.js";
import { renderAttachments } from "./attachments.js";
import { printOnePager } from "./onepager.js";
import { openPresent } from "./present.js";

let openId = null;
let currentUserId = null;

export function getOpenStartupId() {
  return openId;
}

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function relTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h fa`;
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function root() {
  return document.getElementById("modal-root");
}

function toDetail(row) {
  return { ...(row.data || {}), psn: row.psn, name: row.name, sector: row.sector, id: row.slug || row.id };
}

export async function openStartupModal(row, opts = {}) {
  openId = row.id;
  const { data: userData } = await supabase.auth.getUser();
  currentUserId = userData?.user?.id ?? null;
  const myEmail = userData?.user?.email || currentUser.email || "";

  const s = toDetail(row);
  const stageOptions = state.stages
    .map((st) => `<option value="${esc(st.id)}" ${st.id === row.stage_id ? "selected" : ""}>${esc(st.name)}</option>`)
    .join("");

  root().innerHTML = `
    <div class="modal-overlay" data-close-overlay>
      <div class="modal" role="dialog" aria-modal="true" aria-label="Dettaglio ${esc(row.name)}">
        <header class="modal-head">
          <div class="modal-head-main">
            <div class="modal-title-row">
              <h2>${esc(row.name)}</h2>
              ${row.sector ? `<span class="pill blue">${esc(row.sector)}</span>` : ""}
            </div>
            <div class="modal-stage">
              <label>Fase:</label>
              <select id="modal-stage-select">${stageOptions}</select>
            </div>
          </div>
          <div class="modal-head-actions">
            <button class="btn ghost" data-present title="Mostra a schermo intero">▶ Presenta</button>
            <button class="btn ghost" data-onepager title="Genera il one-pager PDF">⬇ One-pager</button>
            <button class="btn ghost" data-edit>Modifica</button>
            <button class="btn ghost danger" data-delete>Elimina</button>
            <button class="icon-btn modal-close" data-close aria-label="Chiudi">✕</button>
          </div>
        </header>

        <div class="modal-scroll">
          <div class="modal-detail">${renderStartupDetail(s)}</div>

          <section class="notes-section">
            <h3>Note</h3>
            <div class="notes-list" id="notes-list"><p class="muted">Caricamento…</p></div>
            <form class="note-form" id="note-form">
              <div class="note-form-avatar">${avatarHtml(myEmail, 30)}</div>
              <div class="note-form-main">
                <textarea id="note-input" rows="2" placeholder="Aggiungi una nota…"></textarea>
                <div class="note-form-foot">
                  <span class="note-as">Stai scrivendo come <strong>${esc(displayName(myEmail))}</strong></span>
                  <button type="submit" class="btn primary">Aggiungi nota</button>
                </div>
              </div>
            </form>
          </section>

          <section class="attach-section">
            <h3>Allegati</h3>
            <div id="modal-attachments"><p class="muted">Caricamento…</p></div>
          </section>

          <section class="activity-section">
            <h3>Attività</h3>
            <div id="modal-activity"><p class="muted">Caricamento…</p></div>
          </section>
        </div>
      </div>
    </div>
  `;

  wireModal(row);
  await refreshNotes();
  renderActivityTimeline(row.id, root().querySelector("#modal-activity"));
  renderAttachments(row.id, root().querySelector("#modal-attachments"));
  if (opts.focusNote) {
    const ta = root().querySelector("#note-input");
    if (ta) { ta.focus(); ta.scrollIntoView({ block: "center" }); }
  }
}

function wireModal(row) {
  const r = root();
  const close = () => closeModal();

  r.querySelector("[data-close]")?.addEventListener("click", close);
  r.querySelector("[data-close-overlay]")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) close();
  });
  document.addEventListener("keydown", escClose);

  r.querySelector("[data-edit]")?.addEventListener("click", () => {
    closeModal();
    openStartupForm(row);
  });

  r.querySelector("[data-onepager]")?.addEventListener("click", () => {
    const st = state.stages.find((x) => x.id === row.stage_id);
    printOnePager(row, st ? st.name : "");
  });

  r.querySelector("[data-present]")?.addEventListener("click", () => {
    const id = row.id;
    closeModal();
    openPresent(id);
  });

  r.querySelector("[data-delete]")?.addEventListener("click", async () => {
    if (!confirm(`Eliminare definitivamente "${row.name}"? L'operazione non è reversibile.`)) return;
    try {
      await deleteStartup(row.id);
      state.startups = state.startups.filter((x) => x.id !== row.id);
      closeModal();
      emitChange();
      toast("Startup eliminata", "info");
    } catch (e) {
      toastError("Errore nell'eliminazione", e);
    }
  });

  r.querySelector("#modal-stage-select")?.addEventListener("change", async (e) => {
    const stageId = e.target.value;
    const inStage = state.startups.filter((x) => x.stage_id === stageId);
    const maxPos = inStage.reduce((m, x) => Math.max(m, x.position), 0);
    try {
      await moveCard(row.id, stageId, maxPos + 1000);
      emitChange();
      toast("Fase aggiornata", "info");
    } catch (err) {
      toastError("Errore nel cambio fase", err);
    }
  });

  r.querySelector("#note-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = r.querySelector("#note-input");
    const body = input.value.trim();
    if (!body) return;
    try {
      await addNote(row.id, body);
      input.value = "";
      await refreshNotes();
      renderActivityTimeline(row.id, root().querySelector("#modal-activity"));
      emitChange(); // aggiorna il conteggio note sulle tile
    } catch (err) {
      toastError("Errore nell'aggiunta della nota", err);
    }
  });
}

function escClose(e) {
  if (e.key === "Escape") closeModal();
}

export function closeModal() {
  openId = null;
  document.removeEventListener("keydown", escClose);
  root().innerHTML = "";
}

export async function refreshNotes() {
  if (!openId) return;
  const listEl = root().querySelector("#notes-list");
  if (!listEl) return;
  try {
    const notes = await fetchNotes(openId);
    if (!notes.length) {
      listEl.innerHTML = `<p class="muted">Nessuna nota. Scrivi la prima annotazione qui sotto.</p>`;
      return;
    }
    listEl.innerHTML = notes
      .map((n) => {
        const mine = n.author_id && n.author_id === currentUserId;
        const email = n.author_email || "";
        return `
        <div class="note-item ${mine ? "note-mine" : ""}">
          ${avatarHtml(email, 30)}
          <div class="note-main">
            <div class="note-meta">
              <span class="note-author" title="${esc(email)}">${esc(displayName(email))}</span>
              ${mine ? `<span class="note-you">tu</span>` : ""}
              <span class="note-time">${relTime(n.created_at)}</span>
              ${mine ? `<button class="note-del" data-note-del="${esc(n.id)}" title="Elimina nota">🗑</button>` : ""}
            </div>
            <div class="note-body">${esc(n.body)}</div>
          </div>
        </div>`;
      })
      .join("");

    listEl.querySelectorAll("[data-note-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await deleteNote(btn.getAttribute("data-note-del"));
          await refreshNotes();
          emitChange();
        } catch (err) {
          toastError("Errore nell'eliminazione della nota", err);
        }
      });
    });
  } catch (e) {
    listEl.innerHTML = `<p class="muted">Impossibile caricare le note.</p>`;
    console.error(e);
  }
}
