// ===========================================================================
// filterBar.js — barra filtri condivisa (Board/Tabella/Analytics) + viste
// salvate condivise nel team. Renderizzata una volta; i controlli aggiornano
// il modello filtri (filters.js); le viste si ridisegnano via emit.
// ===========================================================================
import { state, addSavedView, deleteSavedView, reloadSavedViews, emitChange } from "../store.js";
import {
  getFilters, setFilter, setFilters, resetFilters, activeFilterCount,
  activeFilterChips, clearFilter,
  distinctSectors, distinctPsn, distinctValuations,
} from "./filters.js";
import { toast, toastError } from "./toast.js";

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function opt(v, cur, label) { return `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(label ?? v)}</option>`; }

let mounted = false;

export function mountFilterBar(container) {
  if (!container || mounted) return;
  mounted = true;
  const f = getFilters();
  container.innerHTML = `
    <div class="filterbar">
      <div class="fb-search">
        <span class="fb-search-ico">⌕</span>
        <input id="fb-search" type="search" placeholder="Cerca in tutto il portfolio…" value="${esc(f.search)}">
      </div>
      <select id="fb-sector" class="fb-select"></select>
      <select id="fb-stage" class="fb-select"></select>
      <select id="fb-psn" class="fb-select"></select>
      <select id="fb-valuation" class="fb-select"></select>
      <div class="fb-trl">
        <label>TRL</label>
        <input id="fb-trlmin" type="number" min="1" max="9" placeholder="min">
        <span>–</span>
        <input id="fb-trlmax" type="number" min="1" max="9" placeholder="max">
      </div>
      <button id="fb-reset" class="btn ghost fb-reset">Azzera <span id="fb-count"></span></button>
      <div class="fb-spacer"></div>
      <button id="fb-save" class="btn ghost" title="Salva i filtri correnti come vista condivisa">★ Salva</button>
    </div>
    <div class="fb-chips" id="fb-chips"></div>
    <div class="saved-views" id="saved-views"></div>
  `;
  syncControls();
  renderSavedViews();

  const c = container;
  c.querySelector("#fb-search").addEventListener("input", (e) => setFilter("search", e.target.value));
  c.querySelector("#fb-sector").addEventListener("change", (e) => setFilter("sector", e.target.value));
  c.querySelector("#fb-stage").addEventListener("change", (e) => setFilter("stage", e.target.value));
  c.querySelector("#fb-psn").addEventListener("change", (e) => setFilter("psn", e.target.value));
  c.querySelector("#fb-valuation").addEventListener("change", (e) => setFilter("valuation", e.target.value));
  c.querySelector("#fb-trlmin").addEventListener("input", (e) => setFilter("trlMin", e.target.value ? parseInt(e.target.value, 10) : null));
  c.querySelector("#fb-trlmax").addEventListener("input", (e) => setFilter("trlMax", e.target.value ? parseInt(e.target.value, 10) : null));
  c.querySelector("#fb-reset").addEventListener("click", () => { resetFilters(); syncControls(); });
  c.querySelector("#fb-save").addEventListener("click", saveCurrentView);
}

// Aggiorna le opzioni/valori dei controlli (dopo reset o applicazione vista).
export function syncControls() {
  if (!mounted) return;
  const f = getFilters();
  const set = (id, html, val) => { const el = document.getElementById(id); if (el) { if (html != null) el.innerHTML = html; if (val !== undefined) el.value = val; } };

  set("fb-sector", [opt("all", f.sector, "Tutti i settori"), ...distinctSectors().map((v) => opt(v, f.sector))].join(""), f.sector);
  set("fb-stage", [opt("all", f.stage, "Tutte le fasi"), ...state.stages.map((st) => opt(st.id, f.stage, st.name))].join(""), f.stage);
  set("fb-psn", [opt("all", f.psn, "Tutti i verticali PSN"), ...distinctPsn().map((v) => opt(v, f.psn))].join(""), f.psn);
  set("fb-valuation", [opt("all", f.valuation, "Tutte le valuation"), ...distinctValuations().map((v) => opt(v, f.valuation))].join(""), f.valuation);
  const sm = document.getElementById("fb-search"); if (sm && sm.value !== f.search) sm.value = f.search;
  const tmin = document.getElementById("fb-trlmin"); if (tmin) tmin.value = f.trlMin ?? "";
  const tmax = document.getElementById("fb-trlmax"); if (tmax) tmax.value = f.trlMax ?? "";
  const cnt = document.getElementById("fb-count"); if (cnt) { const n = activeFilterCount(); cnt.textContent = n ? `(${n})` : ""; }
  renderChips();
}

// Pillole dei filtri attivi: rendono leggibile a colpo d'occhio perché l'elenco
// è ridotto e permettono di togliere una singola condizione. Sono la controparte
// necessaria del filtro-da-grafico, che altrimenti agirebbe "di nascosto".
function renderChips() {
  const host = document.getElementById("fb-chips");
  if (!host) return;
  const chips = activeFilterChips();
  if (!chips.length) { host.innerHTML = ""; host.classList.add("hidden"); return; }
  host.classList.remove("hidden");
  host.innerHTML = `
    <span class="fb-chips-k">Filtri attivi</span>
    ${chips.map((c) => `
      <button class="fb-chip" data-clear="${esc(c.key)}" title="Rimuovi questo filtro">
        <span class="fb-chip-k">${esc(c.label)}</span>
        <span class="fb-chip-v">${esc(c.value)}</span>
        <span class="fb-chip-x">✕</span>
      </button>`).join("")}
    <button class="fb-chip fb-chip-all" data-clear-all>Azzera tutto</button>`;

  host.querySelectorAll("[data-clear]").forEach((b) =>
    b.addEventListener("click", () => { clearFilter(b.getAttribute("data-clear")); syncControls(); }));
  host.querySelector("[data-clear-all]")
    ?.addEventListener("click", () => { resetFilters(); syncControls(); });
}

export function renderSavedViews() {
  const host = document.getElementById("saved-views");
  if (!host) return;
  const views = state.savedViews || [];
  // Riga nascosta del tutto quando non ci sono viste: una frase che dice
  // "niente" costava una riga di altezza su ogni schermata.
  host.classList.toggle("hidden", !views.length);
  if (!views.length) { host.innerHTML = ""; return; }
  host.innerHTML = views
    .map((v) => `
      <span class="sv-chip" data-apply="${v.id}" title="Applica vista di ${esc(v.owner_email || "")}">
        <span class="sv-name">${esc(v.name)}</span>
        <button class="sv-del" data-del="${v.id}" title="Elimina vista">✕</button>
      </span>`)
    .join("");
  host.querySelectorAll("[data-apply]").forEach((chip) =>
    chip.addEventListener("click", (e) => {
      if (e.target.closest("[data-del]")) return;
      const v = views.find((x) => x.id === chip.getAttribute("data-apply"));
      if (v) { setFilters(v.config || {}); syncControls(); toast(`Vista “${v.name}” applicata`, "info"); }
    })
  );
  host.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try { await deleteSavedView(btn.getAttribute("data-del")); await reloadSavedViews(); emitChange(); }
      catch (err) { toastError("Errore nell'eliminazione della vista", err); }
    })
  );
}

async function saveCurrentView() {
  const name = prompt("Nome della vista salvata:");
  if (!name || !name.trim()) return;
  try {
    await addSavedView(name.trim(), getFilters());
    await reloadSavedViews();
    emitChange();
    toast("Vista salvata e condivisa col team", "info");
  } catch (e) {
    toastError("Impossibile salvare la vista (hai eseguito il delta SQL saved_views?)", e);
  }
}
