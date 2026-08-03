// ===========================================================================
// palette.js — command palette (⌘K): ricerca rapida su startup, viste e azioni.
// ===========================================================================
import { state, startupById } from "../store.js";
import { openStartupModal } from "./modal.js";

let sel = 0;
let items = [];
let ctx = null;

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function root() { return document.getElementById("palette-root"); }

function buildItems(query) {
  const q = query.trim().toLowerCase();
  const out = [];

  // Viste
  const views = [
    { key: "board", label: "Vai a · Board pipeline", icon: "🗂", run: () => ctx.setView("board") },
    { key: "analytics", label: "Vai a · Analytics & Database", icon: "📊", run: () => ctx.setView("analytics") },
    // "Tabella"/"Database" restano cercabili: portano alla vista che li contiene.
    { key: "table", label: "Vai a · Tabella / Database", icon: "▦", run: () => ctx.setView("analytics") },
    { key: "report", label: "Vai a · Report & sintesi", icon: "📄", run: () => ctx.setView("report") },
  ];
  // Azioni
  const actions = [
    { key: "new-startup", label: "Nuova startup", icon: "＋", run: () => ctx.openStartupForm(null, {}) },
    { key: "new-column", label: "Nuova colonna", icon: "＋", run: () => ctx.openStageMenu(null, "create") },
  ];

  const match = (label) => !q || label.toLowerCase().includes(q);

  // Startup (priorità alta quando c'è una query)
  state.startups.forEach((s) => {
    const hay = `${s.name} ${s.sector || ""} ${(s.psn && s.psn.primary) || ""}`.toLowerCase();
    if (q && !hay.includes(q)) return;
    if (!q && out.length > 6) return; // senza query mostra solo qualche startup
    out.push({
      icon: "🚀",
      label: esc(s.name),
      sub: esc([s.sector, s.psn && s.psn.primary].filter(Boolean).join(" · ")),
      run: () => { const row = startupById(s.id); if (row) openStartupModal(row); },
    });
  });

  views.filter((v) => match(v.label)).forEach((v) => out.push({ icon: v.icon, label: v.label, run: v.run }));
  actions.filter((a) => match(a.label)).forEach((a) => out.push({ icon: a.icon, label: a.label, run: a.run }));

  return out.slice(0, 40);
}

function render(query) {
  items = buildItems(query);
  if (sel >= items.length) sel = Math.max(0, items.length - 1);
  const list = root().querySelector("#palette-list");
  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<div class="palette-empty">Nessun risultato per “${esc(query)}”.</div>`;
    return;
  }
  list.innerHTML = items
    .map(
      (it, i) => `
      <div class="palette-item ${i === sel ? "active" : ""}" data-i="${i}">
        <span class="pi-ico">${it.icon || "•"}</span>
        <span class="pi-label">${it.label}</span>
        ${it.sub ? `<span class="pi-sub">${it.sub}</span>` : ""}
      </div>`
    )
    .join("");
  const active = list.querySelector(".palette-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function run(i) {
  const it = items[i];
  closePalette();
  if (it && typeof it.run === "function") it.run();
}

function onKey(e) {
  if (e.key === "Escape") { e.preventDefault(); closePalette(); return; }
  if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); render(currentQuery()); }
  else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); render(currentQuery()); }
  else if (e.key === "Enter") { e.preventDefault(); run(sel); }
}

function currentQuery() {
  return root().querySelector("#palette-input")?.value || "";
}

export function openPalette(context) {
  ctx = context || {};
  sel = 0;
  root().innerHTML = `
    <div class="palette-overlay" data-close-overlay>
      <div class="palette" role="dialog" aria-modal="true" aria-label="Ricerca rapida e comandi">
        <div class="palette-search">
          <span class="palette-ico">⌕</span>
          <input id="palette-input" type="text" autocomplete="off" spellcheck="false"
                 placeholder="Cerca startup, cambia vista, esegui un'azione…" />
          <kbd>Esc</kbd>
        </div>
        <div class="palette-list" id="palette-list"></div>
        <div class="palette-foot"><kbd>↑</kbd><kbd>↓</kbd> naviga · <kbd>↵</kbd> apri · <kbd>Esc</kbd> chiudi</div>
      </div>
    </div>
  `;
  const input = root().querySelector("#palette-input");
  render("");
  input.addEventListener("input", () => { sel = 0; render(input.value); });
  input.addEventListener("keydown", onKey);
  root().querySelector("[data-close-overlay]")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closePalette();
  });
  root().querySelector("#palette-list")?.addEventListener("click", (e) => {
    const it = e.target.closest(".palette-item");
    if (it) run(parseInt(it.dataset.i, 10));
  });
  root().querySelector("#palette-list")?.addEventListener("mousemove", (e) => {
    const it = e.target.closest(".palette-item");
    if (it) { const i = parseInt(it.dataset.i, 10); if (i !== sel) { sel = i; render(currentQuery()); } }
  });
  setTimeout(() => input.focus(), 20);
}

export function closePalette() {
  const r = root();
  if (r) r.innerHTML = "";
}
