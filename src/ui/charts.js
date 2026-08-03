// ===========================================================================
// charts.js — grafici on-brand, senza dipendenze (HTML/CSS + SVG).
// Marchi sottili, estremità arrotondate, distacchi da 2px, etichette dirette
// e layer di hover con tooltip. Il colore arriva per-item (segue l'entità).
// ===========================================================================
import { CAT, NEUTRAL } from "./chartcolors.js";

export const colorFor = (i) => CAT[i % CAT.length];

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const pctOf = (v, total) => (total ? Math.round((v / total) * 100) : 0);
// Attributi per il tooltip condiviso (vedi mountChartTooltip).
const tip = (label, value, total) =>
  `data-tip="${esc(label)}" data-tip-val="${esc(value)}${total ? ` · ${pctOf(value, total)}% del totale` : ""}"`;

// ---- Cross-filtering -------------------------------------------------------
// Ogni grafico può dichiarare la dimensione che rappresenta (`fk`). Gli item che
// portano un `fv` diventano cliccabili: il click filtra l'intera vista. Quando
// la dimensione ha già una selezione, la voce scelta va in evidenza e le altre
// si smorzano — restano leggibili e cliccabili per cambiare scelta al volo.
const clickable = (it, fk) => fk && it.fv !== undefined && it.fv !== null;
const isOn = (it, active) => active != null && String(active) === String(it.fv);

// Attributi di selezione da apporre all'elemento cliccabile.
function sel(it, fk, active) {
  if (!clickable(it, fk)) return "";
  return ` data-fk="${esc(fk)}" data-fv="${esc(it.fv)}" role="button" tabindex="0" aria-pressed="${isOn(it, active)}"`;
}
// Classe corrispondente: ck = cliccabile, is-on = selezionato, is-off = smorzato.
function ck(it, fk, active, base) {
  if (!clickable(it, fk)) return base;
  return `${base} ck${active == null ? "" : isOn(it, active) ? " is-on" : " is-off"}`;
}

// ---- Barre orizzontali. items: [{label, value, color}] --------------------
// `maxRows` tiene la coda lunga (le voci da 1) ripiegata dietro un "+N altre":
// su liste come le città erano metà dell'altezza del pannello per nessuna
// informazione utile. Restano a un click, e una voce selezionata è sempre
// visibile perché viene portata in cima.
export function barList(items, { total = null, fk = null, active = null, maxRows = null } = {}) {
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const max = Math.max(1, ...items.map((i) => i.value));
  let list = items;
  if (active != null) {
    const i = list.findIndex((x) => String(x.fv) === String(active));
    if (i > -1) list = [list[i], ...list.slice(0, i), ...list.slice(i + 1)];
  }
  const cut = maxRows && list.length > maxRows + 1 ? maxRows : null;

  const rowHtml = (it, i) => {
    const w = Math.max(2, (it.value / max) * 100);
    const color = it.color || colorFor(i);
    return `
      <div class="${ck(it, fk, active, "bar-row")}" ${tip(it.label, it.value, total)}${sel(it, fk, active)}>
        <div class="bar-label" title="${esc(it.label)}"><span class="bar-dot" style="background:${color}"></span>${esc(it.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${w}%;background:${color}"></div></div>
        <div class="bar-value">${it.value}${total ? `<span class="bar-pct">${pctOf(it.value, total)}%</span>` : ""}</div>
      </div>`;
  };

  if (!cut) return `<div class="bar-list">${list.map(rowHtml).join("")}</div>`;
  const head = list.slice(0, cut).map(rowHtml).join("");
  const tail = list.slice(cut).map((it, i) => rowHtml(it, i + cut)).join("");
  return `<div class="bar-list">
    ${head}
    <div class="bar-more-wrap">${tail}</div>
    <button type="button" class="bar-more" data-more
      data-more-label="+${list.length - cut} altre" data-less-label="Mostra meno">+${list.length - cut} altre</button>
  </div>`;
}

// ---- Barra 100% segmentata. items: [{label, value, color}] ----------------
export function stackedBar(items, { total = null, fk = null, active = null } = {}) {
  const live = items.filter((it) => it.value > 0);
  const sum = total || items.reduce((s, i) => s + i.value, 0);
  if (!sum) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const segs = live
    .map((it, i) => {
      const p = pctOf(it.value, sum);
      return `<div class="${ck(it, fk, active, "sb-seg")}" style="flex:${it.value};background:${it.color || colorFor(i)}" ${tip(it.label, it.value, sum)}${sel(it, fk, active)}>
        <span class="sb-num">${it.value}</span>${p >= 12 ? `<span class="sb-pct">${p}%</span>` : ""}
      </div>`;
    })
    .join("");
  // Legenda: le fasi a zero restano visibili ma smorzate (informazione utile)
  // e cliccabili quanto i segmenti, perché spesso sono il bersaglio più comodo.
  const legend = items
    .map((it, i) => `<div class="${ck(it, fk, active, "sb-leg")}${it.value === 0 ? " sb-leg-zero" : ""}" ${sel(it, fk, active)}>
        <span class="legend-dot" style="background:${it.value === 0 ? NEUTRAL : it.color || colorFor(i)}"></span>
        <span>${esc(it.label)}</span><b>${it.value}</b><span class="legend-pct">${pctOf(it.value, sum)}%</span>
      </div>`)
    .join("");
  return `<div class="stacked"><div class="sb-track">${segs}</div><div class="sb-legend">${legend}</div></div>`;
}

// ---- Colonne verticali con linea di base. items: [{label, value, color}] --
export function columnChart(items, { total = null, fk = null, active = null } = {}) {
  if (!items.length) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const max = Math.max(1, ...items.map((i) => i.value));
  return `<div class="cols">${items
    .map((it, i) => {
      const h = Math.max(4, (it.value / max) * 100);
      const color = it.color || colorFor(i);
      return `
      <div class="${ck(it, fk, active, "col-item")}" ${tip(it.label, it.value, total)}${sel(it, fk, active)}>
        <div class="col-val">${it.value}</div>
        <div class="col-bar-wrap"><div class="col-bar" style="height:${h}%;background:${color}"></div></div>
        <div class="col-label">${esc(it.label)}</div>
      </div>`;
    })
    .join("")}</div>`;
}

// ---- Donut SVG con distacchi + legenda. items: [{label, value, color}] ----
export function donut(items, { size = 196, thickness = 22, fk = null, active = null } = {}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return `<p class="muted chart-empty">Nessun dato.</p>`;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  const gap = items.length > 1 ? 4 : 0;
  let offset = 0;
  const segs = items
    .map((it, i) => {
      const len = (it.value / total) * C;
      const draw = Math.max(0.6, len - gap);
      const seg = `<circle class="${ck(it, fk, active, "donut-seg")}" cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${it.color || colorFor(i)}" stroke-width="${thickness}" stroke-linecap="round"
        stroke-dasharray="${draw} ${C - draw}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})" ${tip(it.label, it.value, total)}${sel(it, fk, active)}></circle>`;
      offset += len;
      return seg;
    })
    .join("");
  const legend = items
    .map((it, i) => `<div class="${ck(it, fk, active, "legend-item")}" ${tip(it.label, it.value, total)}${sel(it, fk, active)}>
        <span class="legend-dot" style="background:${it.color || colorFor(i)}"></span>
        <span class="legend-label">${esc(it.label)}</span>
        <span class="legend-val">${it.value}</span>
        <span class="legend-pct">${pctOf(it.value, total)}%</span>
      </div>`)
    .join("");
  return `
    <div class="donut-wrap">
      <svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Composizione">
        ${segs}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-total">${total}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-sub">startup</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>`;
}

// ---- Tooltip condiviso: un solo nodo, delega sugli elementi [data-tip] ----
let tipEl = null;
export function mountChartTooltip(root) {
  if (!root) return;
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "chart-tip";
    document.body.appendChild(tipEl);
  }
  const hide = () => tipEl.classList.remove("show");
  root.addEventListener("mousemove", (e) => {
    const t = e.target.closest("[data-tip]");
    if (!t) { hide(); return; }
    tipEl.innerHTML = `<span class="ct-k">${t.getAttribute("data-tip")}</span><span class="ct-v">${t.getAttribute("data-tip-val")}</span>`;
    tipEl.classList.add("show");
    const pad = 14;
    let x = e.clientX + pad, y = e.clientY + pad;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
    tipEl.style.transform = `translate(${x}px, ${y}px)`;
  });
  root.addEventListener("mouseleave", hide);
  window.addEventListener("scroll", hide, true);
}
