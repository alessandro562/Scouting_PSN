// ===========================================================================
// charts.js — grafici leggeri, on-brand, senza dipendenze (HTML/CSS + SVG).
// Marchi sottili, estremità arrotondate, distacchi da 2px, etichette dirette;
// il colore arriva per-item (segue l'entità). Restituiscono stringhe HTML.
// ===========================================================================
import { CAT } from "./chartcolors.js";

export const colorFor = (i) => CAT[i % CAT.length];

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const pctOf = (v, total) => (total ? Math.round((v / total) * 100) : 0);

// ---- Barre orizzontali. items: [{label, value, color}] --------------------
export function barList(items, { total = null } = {}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  return `<div class="bar-list">${items
    .map((it, i) => {
      const w = Math.max(3, Math.round((it.value / max) * 100));
      const color = it.color || colorFor(i);
      const pct = total ? `<span class="bar-pct">${pctOf(it.value, total)}%</span>` : "";
      return `
      <div class="bar-row">
        <div class="bar-label" title="${esc(it.label)}"><span class="bar-dot" style="background:${color}"></span>${esc(it.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${w}%;background:${color}"></div></div>
        <div class="bar-value">${it.value}${pct}</div>
      </div>`;
    })
    .join("")}</div>`;
}

// ---- Barra pipeline 100% segmentata. items: [{label, value, color}] --------
export function stackedBar(items, { total = null } = {}) {
  const sum = total || items.reduce((s, i) => s + i.value, 0);
  if (!sum) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const segs = items
    .filter((it) => it.value > 0)
    .map((it, i) => `<div class="sb-seg" style="flex:${it.value};background:${it.color || colorFor(i)}" title="${esc(it.label)}: ${it.value}"><span>${it.value}</span></div>`)
    .join("");
  const legend = items
    .map((it, i) => `<div class="sb-leg"><span class="legend-dot" style="background:${it.color || colorFor(i)}"></span><span class="sb-leg-name">${esc(it.label)}</span><b>${it.value}</b><span class="legend-pct">${pctOf(it.value, sum)}%</span></div>`)
    .join("");
  return `<div class="stacked"><div class="sb-track">${segs}</div><div class="sb-legend">${legend}</div></div>`;
}

// ---- Colonne verticali. items: [{label, value, color}] --------------------
export function columnChart(items, { total = null } = {}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  return `<div class="cols">${items
    .map((it, i) => {
      const h = Math.max(6, Math.round((it.value / max) * 100));
      const color = it.color || colorFor(i);
      const pct = total ? ` · ${pctOf(it.value, total)}%` : "";
      return `
      <div class="col-item" title="${esc(it.label)}: ${it.value}${pct}">
        <div class="col-val">${it.value}</div>
        <div class="col-bar-wrap"><div class="col-bar" style="height:${h}%;background:${color}"></div></div>
        <div class="col-label">${esc(it.label)}</div>
      </div>`;
    })
    .join("")}</div>`;
}

// ---- Donut SVG con distacchi + legenda. items: [{label, value, color}] ----
export function donut(items, { size = 190, thickness = 24 } = {}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  const gap = items.length > 1 ? 3 : 0; // distacco tra archi (px lungo la circonferenza)
  let offset = 0;
  const segs = items
    .map((it, i) => {
      const len = (it.value / total) * C;
      const draw = Math.max(0.5, len - gap);
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${it.color || colorFor(i)}" stroke-width="${thickness}" stroke-linecap="round"
        stroke-dasharray="${draw} ${C - draw}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"></circle>`;
      offset += len;
      return seg;
    })
    .join("");
  const legend = items
    .map(
      (it, i) => `<div class="legend-item">
        <span class="legend-dot" style="background:${it.color || colorFor(i)}"></span>
        <span class="legend-label">${esc(it.label)}</span>
        <span class="legend-val">${it.value}</span>
        <span class="legend-pct">${pctOf(it.value, total)}%</span>
      </div>`
    )
    .join("");
  return `
    <div class="donut-wrap">
      <svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        ${segs}
        <text x="${cx}" y="${cy - 3}" text-anchor="middle" class="donut-total">${total}</text>
        <text x="${cx}" y="${cy + 15}" text-anchor="middle" class="donut-sub">startup</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>`;
}
