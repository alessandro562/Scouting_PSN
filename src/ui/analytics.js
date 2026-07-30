// ===========================================================================
// analytics.js — vista Analytics del portfolio startup.
// Metriche clusterizzate in sezioni: Pipeline · Portafoglio · Maturità
// tecnologica · Geografia. Tutti i dati sono normalizzati (es. le sedi sono
// ricondotte alla città) e rispettano i filtri attivi.
// ===========================================================================
import { state } from "../store.js";
import {
  applyFilters, psnPrimary, sectorOf, trlOf, valuationOf,
  cityOf, macroAreaOf, maturityBucketOf,
} from "./filters.js";
import { barList, funnel, donut } from "./charts.js";

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// Conteggio per chiave, ordinato desc, con esclusione dei valori non definiti.
function countBy(list, keyFn, { dropDash = true } = {}) {
  const m = new Map();
  list.forEach((s) => {
    const k = keyFn(s);
    if (dropDash && (k == null || k === "—")) return;
    m.set(k, (m.get(k) || 0) + 1);
  });
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function kpiTiles(list) {
  const n = list.length;
  const trls = list.map(trlOf).filter((t) => t != null);
  const avgTrl = trls.length ? (trls.reduce((a, b) => a + b, 0) / trls.length).toFixed(1).replace(".", ",") : "—";
  const ready = list.filter((s) => maturityBucketOf(s) === "Ready to scale").length;
  const readyPct = n ? Math.round((ready / n) * 100) : 0;
  const sectors = new Set(list.map(sectorOf).filter((v) => v !== "—")).size;
  const verticals = new Set(list.map(psnPrimary).filter((v) => v !== "—")).size;
  const cities = new Set(list.map(cityOf).filter((v) => v !== "—")).size;

  const tiles = [
    { label: "Startup nel perimetro", value: n, sub: "sul totale filtrato" },
    { label: "TRL medio", value: avgTrl, sub: "maturità tecnologica" },
    { label: "Ready to scale", value: ready, sub: `${readyPct}% del portfolio` },
    { label: "Settori coperti", value: sectors, sub: "categorie merceologiche" },
    { label: "Verticali PSN", value: verticals, sub: "aree di interesse coperte" },
    { label: "Città", value: cities, sub: "distribuzione territoriale" },
  ];
  return `<div class="kpi-row">${tiles
    .map((t) => `<div class="kpi-tile"><div class="kpi-label">${esc(t.label)}</div><div class="kpi-value">${esc(t.value)}</div><div class="kpi-sub">${esc(t.sub)}</div></div>`)
    .join("")}</div>`;
}

function panel(title, subtitle, body, cls = "") {
  return `<section class="an-panel ${cls}">
    <div class="an-head"><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>
    ${body}
  </section>`;
}

function sectionTitle(t) { return `<h2 class="an-section">${esc(t)}</h2>`; }

export function renderAnalytics(container) {
  if (!container) return;
  const list = applyFilters(state.startups);
  const n = list.length;

  if (!n) {
    container.innerHTML = `<div class="an-empty">Nessuna startup nel perimetro dei filtri attivi.</div>`;
    return;
  }

  // Pipeline
  const funnelItems = state.stages.map((st) => ({ label: st.name, value: list.filter((s) => s.stage_id === st.id).length }));

  // Portafoglio
  const psnItems = countBy(list, psnPrimary);
  const sectorItems = countBy(list, sectorOf);

  // Maturità tecnologica
  const trlItems = (() => {
    const m = new Map();
    list.forEach((s) => { const t = trlOf(s); if (t != null) m.set(t, (m.get(t) || 0) + 1); });
    return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([t, v]) => ({ label: `TRL ${t}`, value: v }));
  })();
  const MAT_ORDER = ["Ready to scale", "Seed / Early traction", "Early stage", "n.d."];
  const maturityItems = countBy(list, maturityBucketOf, { dropDash: false })
    .sort((a, b) => MAT_ORDER.indexOf(a.label) - MAT_ORDER.indexOf(b.label));

  // Geografia (normalizzata)
  const cityItems = countBy(list, cityOf);
  const AREA_ORDER = ["Nord", "Centro", "Sud e Isole", "Altro"];
  const areaItems = countBy(list, macroAreaOf).sort((a, b) => AREA_ORDER.indexOf(a.label) - AREA_ORDER.indexOf(b.label));

  container.innerHTML = `
    ${kpiTiles(list)}

    ${sectionTitle("Pipeline")}
    <div class="an-grid">
      ${panel("Funnel della pipeline", "Distribuzione delle startup per fase", funnel(funnelItems), "an-wide")}
    </div>

    ${sectionTitle("Portafoglio")}
    <div class="an-grid">
      ${panel("Copertura verticali PSN", "Startup per verticale — evidenzia i gap di copertura", barList(psnItems, { total: n }))}
      ${panel("Distribuzione per settore", "Composizione del portfolio", donut(sectorItems))}
    </div>

    ${sectionTitle("Maturità tecnologica")}
    <div class="an-grid">
      ${panel("Distribuzione TRL", "Livelli di maturità tecnologica (TRL 1–9)", trlItems.length ? barList(trlItems, { total: n }) : `<p class="muted chart-empty">Nessun TRL indicato.</p>`)}
      ${panel("Stadio di maturità", "Fase di crescita normalizzata (da valuation e TRL)", barList(maturityItems, { total: n }))}
    </div>

    ${sectionTitle("Geografia")}
    <div class="an-grid">
      ${panel("Distribuzione per città", "Sedi ricondotte alla città", cityItems.length ? barList(cityItems, { total: n }) : `<p class="muted chart-empty">Nessuna sede indicata.</p>`, "an-wide")}
      ${panel("Copertura per macro-area", "Nord · Centro · Sud e Isole", areaItems.length ? barList(areaItems, { total: n }) : `<p class="muted chart-empty">Nessuna sede indicata.</p>`)}
    </div>`;
}
