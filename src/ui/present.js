// ===========================================================================
// present.js — modalità presentazione a schermo intero: una slide pulita per
// startup, navigabile con frecce/click. Rispetta i filtri attivi.
// ===========================================================================
import { getFilteredStartups, stageName } from "./filters.js";

let list = [];
let idx = 0;

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const has = (v) => v != null && String(v).trim() !== "";
const t = (v) => esc(String(v).trim());

function initials(name) {
  const p = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "•";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[1][0]).toUpperCase();
}
function root() {
  let el = document.getElementById("present-root");
  if (!el) { el = document.createElement("div"); el.id = "present-root"; document.body.appendChild(el); }
  return el;
}

function slide(row, i, n) {
  const s = { ...(row.data || {}), psn: row.psn };
  const p = s.psn || {};
  const usecases = (Array.isArray(s.usecases) ? s.usecases : []).filter(has).slice(0, 4);
  const logo = has(s.logo)
    ? `<img class="ps-logo" src="${esc(s.logo)}" alt="">`
    : `<span class="ps-logo ps-logo-mono">${esc(initials(row.name))}</span>`;
  const facts = [
    ["Settore", row.sector], ["Fase", stageName(row.stage_id)], ["TRL", s.trl],
    ["Sede", s.sede], ["Fondazione", s.founded], ["Dipendenti", s.dipendenti],
  ].filter(([, v]) => has(v));

  return `
    <div class="ps-slide">
      <div class="ps-top">
        ${logo}
        <div class="ps-title">
          <h1>${t(row.name)}</h1>
          ${has(p.primary) ? `<div class="ps-vert">${t(p.primary)}</div>` : ""}
        </div>
        <div class="ps-count">${i + 1} <span>/ ${n}</span></div>
      </div>

      ${has(s.what) ? `<p class="ps-lead">${t(s.what)}</p>` : ""}

      <div class="ps-body">
        ${usecases.length ? `<div class="ps-uc">
          <div class="ps-k">Casi d'uso</div>
          <ul>${usecases.map((x) => `<li>${t(x)}</li>`).join("")}</ul>
        </div>` : ""}
        ${facts.length ? `<div class="ps-facts">
          ${facts.map(([k, v]) => `<div class="ps-fact"><span class="ps-fk">${esc(k)}</span><span class="ps-fv">${t(v)}</span></div>`).join("")}
        </div>` : ""}
      </div>

      ${has(s.traction) ? `<div class="ps-traction"><span class="ps-k">Traction</span><p>${t(s.traction)}</p></div>` : ""}

      <div class="ps-foot">
        <div class="ps-brand">
          <img src="assets/logo-wda.png" alt="WDA">
        </div>
        ${has(s.website) ? `<span class="ps-site">${t(String(s.website).replace(/^https?:\/\//, "").replace(/\/$/, ""))}</span>` : ""}
      </div>
    </div>`;
}

function render() {
  const host = root().querySelector(".ps-stage");
  if (!host || !list.length) return;
  host.innerHTML = slide(list[idx], idx, list.length);
}

function go(delta) {
  if (!list.length) return;
  idx = (idx + delta + list.length) % list.length;
  render();
}

function onKey(e) {
  if (e.key === "Escape") { closePresent(); return; }
  if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
  else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
}

// startId: slug/id da cui partire (opzionale).
export function openPresent(startId = null) {
  list = getFilteredStartups();
  if (!list.length) return;
  idx = Math.max(0, list.findIndex((x) => x.id === startId));
  if (idx === -1) idx = 0;

  root().innerHTML = `
    <div class="ps-overlay" role="dialog" aria-modal="true" aria-label="Modalità presentazione">
      <button class="ps-nav ps-prev" aria-label="Precedente">‹</button>
      <div class="ps-stage"></div>
      <button class="ps-nav ps-next" aria-label="Successiva">›</button>
      <button class="ps-close" aria-label="Esci dalla presentazione">✕ Esc</button>
    </div>`;
  render();

  const r = root();
  r.querySelector(".ps-prev").addEventListener("click", () => go(-1));
  r.querySelector(".ps-next").addEventListener("click", () => go(1));
  r.querySelector(".ps-close").addEventListener("click", closePresent);
  document.addEventListener("keydown", onKey);
  document.body.classList.add("presenting");
  // Schermo intero quando il browser lo consente (gesto utente).
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
}

export function closePresent() {
  document.removeEventListener("keydown", onKey);
  document.body.classList.remove("presenting");
  root().innerHTML = "";
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
}
