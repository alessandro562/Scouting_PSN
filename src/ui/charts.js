// ===========================================================================
// charts.js — grafici leggeri on-brand PSN (nessuna dipendenza).
// Barre e funnel in HTML/CSS, donut in SVG. Restituiscono stringhe HTML.
// ===========================================================================

// Palette categoriale derivata dal brand PSN.
export const PALETTE = [
  "#5F75C5", "#48E6EA", "#8360C2", "#F96954", "#00004F",
  "#4A5AA8", "#0F98B5", "#C0721A", "#1F9D74", "#B0519E",
];
export const colorFor = (i) => PALETTE[i % PALETTE.length];

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Barre orizzontali. items: [{label, value, color?, sub?}]
export function barList(items, { unit = "" } = {}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  return `<div class="bar-list">${items
    .map((it, i) => {
      const pct = Math.round((it.value / max) * 100);
      const color = it.color || colorFor(i);
      return `
      <div class="bar-row">
        <div class="bar-label" title="${esc(it.label)}">${esc(it.label)}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="bar-value">${it.value}${unit}</div>
      </div>`;
    })
    .join("")}</div>`;
}

// Funnel verticale: barre centrate a larghezza decrescente. items: [{label, value}]
export function funnel(items) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  return `<div class="funnel">${items
    .map((it, i) => {
      const pct = Math.max(8, Math.round((it.value / max) * 100));
      const conv = total ? Math.round((it.value / total) * 100) : 0;
      const color = colorFor(i);
      return `
      <div class="funnel-row">
        <div class="funnel-bar" style="width:${pct}%;background:${color}">
          <span class="funnel-val">${it.value}</span>
        </div>
        <div class="funnel-meta"><strong>${esc(it.label)}</strong><span>${conv}% del totale</span></div>
      </div>`;
    })
    .join("")}</div>`;
}

// Donut SVG + legenda. items: [{label, value}]
export function donut(items, { size = 168, thickness = 26 } = {}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const segs = items
    .map((it, i) => {
      const frac = it.value / total;
      const len = frac * C;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${colorFor(i)}" stroke-width="${thickness}"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"></circle>`;
      offset += len;
      return seg;
    })
    .join("");
  const legend = items
    .map(
      (it, i) => `<div class="legend-item">
        <span class="legend-dot" style="background:${colorFor(i)}"></span>
        <span class="legend-label">${esc(it.label)}</span>
        <span class="legend-val">${it.value}</span>
      </div>`
    )
    .join("");
  return `
    <div class="donut-wrap">
      <svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        ${segs}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${total}</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="donut-sub">totale</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>`;
}
