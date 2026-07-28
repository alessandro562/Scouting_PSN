// ===========================================================================
// analytics.js — vista Analytics: KPI + funnel pipeline + copertura verticali
// PSN + settore + geografia. Rispetta i filtri attivi.
// ===========================================================================
import { state } from "../store.js";
import { applyFilters, psnPrimary, sectorOf, sedeOf, trlOf, valuationOf } from "./filters.js";
import { barList, funnel, donut, colorFor } from "./charts.js";

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function countBy(list, keyFn) {
  const m = new Map();
  list.forEach((s) => { const k = keyFn(s); m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].map(([label, value]) => ({ label, value }));
}

function kpiTiles(list) {
  const trls = list.map(trlOf).filter((t) => t != null);
  const avgTrl = trls.length ? (trls.reduce((a, b) => a + b, 0) / trls.length).toFixed(1) : "—";
  const ready = list.filter((s) => /ready to scale/i.test(valuationOf(s))).length;
  const sectors = new Set(list.map(sectorOf).filter((v) => v !== "—")).size;
  const tiles = [
    { label: "Startup (filtrate)", value: list.length, sub: "nel perimetro corrente" },
    { label: "TRL medio", value: avgTrl, sub: "maturità tecnologica" },
    { label: "Ready to scale", value: ready, sub: "pronte a scalare" },
    { label: "Settori coperti", value: sectors, sub: "categorie presenti" },
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

export function renderAnalytics(container) {
  if (!container) return;
  const list = applyFilters(state.startups);

  // Funnel pipeline: stages in ordine, conteggio sul set filtrato.
  const funnelItems = state.stages.map((st) => ({ label: st.name, value: list.filter((s) => s.stage_id === st.id).length }));

  // Copertura verticali PSN (ordinata desc).
  const psnItems = countBy(list, psnPrimary).sort((a, b) => b.value - a.value);

  // Settore (donut).
  const sectorItems = countBy(list, sectorOf).sort((a, b) => b.value - a.value);

  // Geografia per sede/città (ordinata desc).
  const geoItems = countBy(list, sedeOf).filter((x) => x.label !== "—").sort((a, b) => b.value - a.value);

  container.innerHTML = `
    ${kpiTiles(list)}
    <div class="an-grid">
      ${panel("Funnel pipeline", "Distribuzione delle startup per fase", funnel(funnelItems), "an-wide")}
      ${panel("Copertura verticali PSN", "Startup per verticale PSN — evidenzia i gap", barList(psnItems))}
      ${panel("Distribuzione per settore", "Composizione del portfolio", donut(sectorItems))}
      ${panel("Distribuzione geografica", "Startup per sede", geoItems.length ? barList(geoItems) : `<p class="muted chart-empty">Nessuna sede indicata.</p>`, "an-wide")}
    </div>`;
}
