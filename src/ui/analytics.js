// ===========================================================================
// analytics.js — vista Analytics del portfolio.
// Hero KPI scuro + bento di pannelli, dati normalizzati e colore per-entità.
// Identità → categoriale (settore, maturità); magnitudo → tinta unica
// sequenziale (verticali, città); ordinale → ramp (TRL, fasi).
// ===========================================================================
import { state } from "../store.js";
import {
  applyFilters, psnPrimary, sectorOf, trlOf,
  cityOf, macroAreaOf, maturityBucketOf,
} from "./filters.js";
import { barList, stackedBar, columnChart, donut } from "./charts.js";
import { sectorColor, maturityColor, stageColor, trlColor } from "./chartcolors.js";

const SINGLE = "#5F75C5"; // tinta unica per i grafici di magnitudo

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function countBy(list, keyFn, { dropDash = true } = {}) {
  const m = new Map();
  list.forEach((s) => {
    const k = keyFn(s);
    if (dropDash && (k == null || k === "—")) return;
    m.set(k, (m.get(k) || 0) + 1);
  });
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}
const tint = (items, color) => items.map((it) => ({ ...it, color }));

function hero(list) {
  const n = list.length;
  const trls = list.map(trlOf).filter((t) => t != null);
  const avgTrl = trls.length ? (trls.reduce((a, b) => a + b, 0) / trls.length).toFixed(1).replace(".", ",") : "—";
  const ready = list.filter((s) => maturityBucketOf(s) === "Ready to scale").length;
  const readyPct = n ? Math.round((ready / n) * 100) : 0;
  const sectors = new Set(list.map(sectorOf).filter((v) => v !== "—")).size;
  const verticals = new Set(list.map(psnPrimary).filter((v) => v !== "—")).size;
  const cities = new Set(list.map(cityOf).filter((v) => v !== "—")).size;
  const cells = [
    { v: n, l: "Startup nel perimetro", s: "sul totale filtrato" },
    { v: avgTrl, l: "TRL medio", s: "maturità tecnologica" },
    { v: `${ready}`, l: "Ready to scale", s: `${readyPct}% del portfolio` },
    { v: sectors, l: "Settori", s: "categorie coperte" },
    { v: verticals, l: "Verticali PSN", s: "aree di interesse" },
    { v: cities, l: "Città", s: "presidio territoriale" },
  ];
  return `<div class="an-hero">${cells
    .map((c, i) => `<div class="an-hcell${i === 0 ? " an-hcell-lead" : ""}"><div class="an-hval">${esc(c.v)}</div><div class="an-hlab">${esc(c.l)}</div><div class="an-hsub">${esc(c.s)}</div></div>`)
    .join("")}</div>`;
}

function panel(title, subtitle, body, cls = "") {
  return `<section class="an-panel ${cls}">
    <div class="an-head"><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>
    <div class="an-body">${body}</div>
  </section>`;
}
function sectionTitle(t) { return `<h2 class="an-section">${esc(t)}</h2>`; }

export function renderAnalytics(container) {
  if (!container) return;
  const list = applyFilters(state.startups);
  const n = list.length;
  if (!n) { container.innerHTML = `<div class="an-empty">Nessuna startup nel perimetro dei filtri attivi.</div>`; return; }

  // Pipeline (fasi = ordinale → ramp)
  const stageItems = state.stages.map((st, i) => ({ label: st.name, value: list.filter((s) => s.stage_id === st.id).length, color: stageColor(i) }));

  // Portafoglio
  const sectorItems = countBy(list, sectorOf).map((it) => ({ ...it, color: sectorColor(it.label) }));
  const psnItems = tint(countBy(list, psnPrimary), SINGLE);

  // Maturità tecnologica
  const trlMap = new Map();
  list.forEach((s) => { const t = trlOf(s); if (t != null) trlMap.set(t, (trlMap.get(t) || 0) + 1); });
  const trlItems = [...trlMap.entries()].sort((a, b) => a[0] - b[0]).map(([t, v]) => ({ label: `TRL ${t}`, value: v, color: trlColor(t) }));
  const MAT_ORDER = ["Ready to scale", "Seed / Early traction", "Early stage", "n.d."];
  const maturityItems = countBy(list, maturityBucketOf, { dropDash: false })
    .sort((a, b) => MAT_ORDER.indexOf(a.label) - MAT_ORDER.indexOf(b.label))
    .map((it) => ({ ...it, color: maturityColor(it.label) }));

  // Geografia (magnitudo → tinta unica)
  const cityItems = tint(countBy(list, cityOf), SINGLE);
  const AREA_ORDER = ["Nord", "Centro", "Sud e Isole", "Altro"];
  const areaItems = tint(countBy(list, macroAreaOf).sort((a, b) => AREA_ORDER.indexOf(a.label) - AREA_ORDER.indexOf(b.label)), SINGLE);

  container.innerHTML = `
    ${hero(list)}

    ${sectionTitle("Pipeline")}
    <div class="an-grid">
      ${panel("Distribuzione della pipeline", "Composizione per fase sul portfolio filtrato", stackedBar(stageItems, { total: n }), "an-wide")}
    </div>

    ${sectionTitle("Portafoglio")}
    <div class="an-grid an-grid-32">
      ${panel("Composizione per settore", "Quota di ciascun settore", donut(sectorItems), "an-span-3")}
      ${panel("Copertura verticali PSN", "Startup per verticale — evidenzia i gap", barList(psnItems, { total: n }), "an-span-5")}
    </div>

    ${sectionTitle("Maturità tecnologica")}
    <div class="an-grid">
      ${panel("Distribuzione TRL", "Livelli di maturità tecnologica (1–9)", trlItems.length ? columnChart(trlItems, { total: n }) : `<p class="muted chart-empty">Nessun TRL indicato.</p>`)}
      ${panel("Stadio di maturità", "Fase di crescita normalizzata (valuation + TRL)", barList(maturityItems, { total: n }))}
    </div>

    ${sectionTitle("Geografia")}
    <div class="an-grid an-grid-53">
      ${panel("Distribuzione per città", "Sedi ricondotte alla città", cityItems.length ? barList(cityItems, { total: n }) : `<p class="muted chart-empty">Nessuna sede indicata.</p>`, "an-span-5")}
      ${panel("Macro-area", "Nord · Centro · Sud e Isole", areaItems.length ? barList(areaItems, { total: n }) : `<p class="muted chart-empty">Nessuna sede.</p>`, "an-span-3")}
    </div>`;
}
