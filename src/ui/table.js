// ===========================================================================
// table.js — vista Tabella/Database: colonne ordinabili, editing inline,
// selezione multipla e azioni di massa. Rispetta i filtri attivi.
// ===========================================================================
import { state, moveCard, upsertStartup, deleteStartup, reloadStartups, emitChange } from "../store.js";
import {
  getFilteredStartups, getFilters, setSort,
  psnPrimary, sectorOf, valuationOf, sedeOf, trlOf, stageName, distinctSectors,
} from "./filters.js";
import { openStartupModal } from "./modal.js";
import { toast, toastError } from "./toast.js";

let selected = new Set();
let noteCountMap = {};
export function setTableNoteCounts(m) { noteCountMap = m || {}; }

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function fmtDate(iso) { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "2-digit" }); }

const COLS = [
  { key: "name", label: "Startup", sortable: true },
  { key: "sector", label: "Settore", sortable: true },
  { key: "stage", label: "Fase", sortable: true },
  { key: "psn", label: "Verticale PSN", sortable: true },
  { key: "trl", label: "TRL", sortable: true },
  { key: "valuation", label: "Valuation", sortable: true },
  { key: "sede", label: "Sede", sortable: true },
  { key: "notes", label: "Note", sortable: false },
  { key: "updated", label: "Aggiornato", sortable: true },
];

function headCell(c, sort) {
  if (!c.sortable) return `<th>${esc(c.label)}</th>`;
  const arrow = sort.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : "";
  return `<th class="th-sort ${sort.key === c.key ? "active" : ""}" data-sort="${c.key}">${esc(c.label)}${arrow}</th>`;
}

function stageSelect(s) {
  return `<select class="cell-select" data-edit="stage" data-id="${s.id}">${state.stages
    .map((st) => `<option value="${st.id}" ${st.id === s.stage_id ? "selected" : ""}>${esc(st.name)}</option>`)
    .join("")}</select>`;
}

function sectorSelect(s) {
  const opts = distinctSectors();
  const cur = s.sector || "";
  const list = [...new Set([...opts, "AI", "Cybersecurity", "GovTech", "IoT/Edge", "Data"])];
  return `<select class="cell-select" data-edit="sector" data-id="${s.id}">
    <option value="">—</option>
    ${list.map((v) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(v)}</option>`).join("")}
  </select>`;
}

function row(s) {
  const notes = noteCountMap[s.id] || 0;
  const trl = trlOf(s);
  return `
    <tr data-id="${s.id}" class="${selected.has(s.id) ? "row-selected" : ""}">
      <td class="col-check"><input type="checkbox" class="row-check" data-id="${s.id}" ${selected.has(s.id) ? "checked" : ""}></td>
      <td class="col-name"><button class="cell-open" data-open="${s.id}">${esc(s.name)}</button></td>
      <td>${sectorSelect(s)}</td>
      <td>${stageSelect(s)}</td>
      <td><span class="cell-pill">${esc(psnPrimary(s))}</span></td>
      <td><span class="cell-edit" data-edit="trl" data-id="${s.id}" title="Clicca per modificare">${trl == null ? "—" : trl}</span></td>
      <td class="col-val">${esc(valuationOf(s))}</td>
      <td><span class="cell-edit" data-edit="sede" data-id="${s.id}" title="Clicca per modificare">${esc(sedeOf(s))}</span></td>
      <td class="col-notes">${notes ? `🗒 ${notes}` : "—"}</td>
      <td class="col-updated">${fmtDate(s.updated_at)}</td>
    </tr>`;
}

function bulkBar() {
  if (!selected.size) return "";
  const stageOpts = state.stages.map((st) => `<option value="${st.id}">${esc(st.name)}</option>`).join("");
  return `
    <div class="bulk-bar">
      <span class="bulk-count">${selected.size} selezionate</span>
      <label>Sposta in fase
        <select id="bulk-stage"><option value="">—</option>${stageOpts}</select>
      </label>
      <label>Settore
        <input id="bulk-sector" list="bulk-sector-list" placeholder="Es. Cybersecurity" />
        <datalist id="bulk-sector-list">${["AI","Cybersecurity","GovTech","IoT/Edge","Data"].map((v)=>`<option value="${v}">`).join("")}</datalist>
      </label>
      <button class="btn ghost danger" id="bulk-delete">Elimina</button>
      <button class="btn ghost" id="bulk-clear">Deseleziona</button>
    </div>`;
}

export function renderTable(container) {
  if (!container) return;
  const rows = getFilteredStartups();
  // Pulisci selezioni non più presenti nel set filtrato.
  const visibleIds = new Set(rows.map((r) => r.id));
  selected.forEach((id) => { if (!visibleIds.has(id)) selected.delete(id); });

  const sort = getFilters().sort;
  const allChecked = rows.length && rows.every((r) => selected.has(r.id));

  container.innerHTML = `
    ${bulkBar()}
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" id="check-all" ${allChecked ? "checked" : ""}></th>
            ${COLS.map((c) => headCell(c, sort)).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(row).join("") : `<tr><td colspan="10" class="table-empty">Nessuna startup corrisponde ai filtri.</td></tr>`}
        </tbody>
      </table>
    </div>`;

  wire(container);
}

function wire(container) {
  if (container._wired) return;
  container._wired = true;

  // Ordinamento (delegato)
  container.addEventListener("click", (e) => {
    const th = e.target.closest("[data-sort]");
    if (th) { setSort(th.getAttribute("data-sort")); return; }

    const open = e.target.closest("[data-open]");
    if (open) { const s = state.startups.find((x) => x.id === open.getAttribute("data-open")); if (s) openStartupModal(s); return; }

    if (e.target.id === "check-all") return; // gestito in change
    if (e.target.id === "bulk-clear") { selected.clear(); emitChange(); return; }
    if (e.target.id === "bulk-delete") { bulkDelete(); return; }

    const editCell = e.target.closest('.cell-edit');
    if (editCell) { startInlineEdit(editCell); return; }
  });

  container.addEventListener("change", async (e) => {
    if (e.target.id === "check-all") {
      const rows = getFilteredStartups();
      if (e.target.checked) rows.forEach((r) => selected.add(r.id));
      else selected.clear();
      emitChange();
      return;
    }
    if (e.target.classList.contains("row-check")) {
      const id = e.target.getAttribute("data-id");
      if (e.target.checked) selected.add(id); else selected.delete(id);
      emitChange();
      return;
    }
    if (e.target.id === "bulk-stage" && e.target.value) { await bulkStage(e.target.value); return; }
    if (e.target.id === "bulk-sector") { await bulkSector(e.target.value); return; }

    const sel = e.target.closest(".cell-select");
    if (sel) {
      const id = sel.getAttribute("data-id");
      const kind = sel.getAttribute("data-edit");
      await inlineSelect(id, kind, sel.value);
      return;
    }
  });
}

async function bulkStage(stageId) {
  const ids = [...selected];
  try {
    let base = state.startups.filter((x) => x.stage_id === stageId).reduce((m, x) => Math.max(m, x.position), 0);
    for (const id of ids) { base += 1000; await moveCard(id, stageId, base); }
    toast(`${ids.length} spostate`, "info"); emitChange();
  } catch (err) { toastError("Errore nello spostamento di massa", err); }
}

async function bulkSector(value) {
  const sector = (value || "").trim() || null;
  const ids = [...selected];
  try {
    for (const id of ids) { await upsertStartup({ id, sector }); const s = state.startups.find((x) => x.id === id); if (s) s.sector = sector; }
    toast(`Settore aggiornato su ${ids.length}`, "info"); emitChange();
  } catch (err) { toastError("Errore nell'aggiornamento di massa", err); }
}

async function inlineSelect(id, kind, value) {
  const s = state.startups.find((x) => x.id === id);
  if (!s) return;
  try {
    if (kind === "stage") {
      const inStage = state.startups.filter((x) => x.stage_id === value);
      const maxPos = inStage.reduce((m, x) => Math.max(m, x.position), 0);
      await moveCard(id, value, maxPos + 1000);
    } else if (kind === "sector") {
      await upsertStartup({ id, sector: value || null });
      s.sector = value || null;
    }
    emitChange();
  } catch (e) { toastError("Errore nel salvataggio", e); }
}

function startInlineEdit(span) {
  const id = span.getAttribute("data-id");
  const kind = span.getAttribute("data-edit");
  const s = state.startups.find((x) => x.id === id);
  if (!s) return;
  const cur = kind === "trl" ? (trlOf(s) ?? "") : (s.data?.[kind] ?? "");
  const input = document.createElement("input");
  input.className = "cell-input";
  input.value = cur;
  if (kind === "trl") { input.type = "number"; input.min = "1"; input.max = "9"; }
  span.replaceWith(input);
  input.focus();
  const commit = async () => {
    const val = input.value.trim();
    try {
      const data = { ...(s.data || {}) };
      data[kind] = kind === "trl" ? (val === "" ? "" : String(parseInt(val, 10) || "")) : val;
      await upsertStartup({ id, data });
      s.data = data;
      emitChange();
    } catch (e) { toastError("Errore nel salvataggio", e); emitChange(); }
  };
  input.addEventListener("blur", commit, { once: true });
  input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") input.blur(); if (ev.key === "Escape") { input.removeEventListener("blur", commit); emitChange(); } });
}

async function bulkDelete() {
  if (!selected.size) return;
  if (!confirm(`Eliminare definitivamente ${selected.size} startup? L'operazione non è reversibile.`)) return;
  const ids = [...selected];
  try {
    for (const id of ids) { await deleteStartup(id); }
    state.startups = state.startups.filter((s) => !selected.has(s.id));
    selected.clear();
    emitChange();
    toast(`${ids.length} startup eliminate`, "info");
  } catch (e) { toastError("Errore nell'eliminazione", e); await reloadStartups(); emitChange(); }
}

