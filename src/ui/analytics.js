// ===========================================================================
// analytics.js — vista Analytics del portfolio.
// Gerarchia editoriale: un numero-guida, poi statistiche di supporto, poi i
// pannelli in bento. Dati normalizzati e colore per-entità (chartcolors.js).
// Identità → categoriale · magnitudo → tinta unica · ordinale → ramp.
// ===========================================================================
import { state } from "../store.js";
import {
  applyFilters, psnPrimary, sectorOf, trlOf,
  cityOf, macroAreaOf, maturityBucketOf,
  getFilters, toggleFilter, hasSelection, resetFilters,
} from "./filters.js";
import { barList, stackedBar, columnChart, donut, mountChartTooltip } from "./charts.js";
import { sectorColor, maturityColor, stageColor, trlColor, SINGLE } from "./chartcolors.js";

function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function countBy(list, keyFn, { dropDash = true } = {}) {
  const m = new Map();
  list.forEach((s) => {
    const k = keyFn(s);
    if (dropDash && (k == null || k === "—")) return;
    m.set(k, (m.get(k) || 0) + 1);
  });
  // `fv` è il valore su cui filtra il click: per queste dimensioni coincide
  // con l'etichetta mostrata.
  return [...m.entries()]
    .map(([label, value]) => ({ label, value, fv: label }))
    .sort((a, b) => b.value - a.value);
}
const tint = (items, color) => items.map((it) => ({ ...it, color }));

// Insieme su cui calcolare un grafico: tutti i filtri tranne il proprio, così la
// dimensione filtrata continua a mostrare le alternative selezionabili.
const scopeFor = (dim) => applyFilters(state.startups, { except: dim });

// Hero: numero-guida + statistiche di supporto.
function hero(list, stageItems) {
  const n = list.length;
  const trls = list.map(trlOf).filter((t) => t != null);
  const avgTrl = trls.length ? (trls.reduce((a, b) => a + b, 0) / trls.length).toFixed(1).replace(".", ",") : "—";
  const ready = list.filter((s) => maturityBucketOf(s) === "Ready to scale").length;
  const readyPct = n ? Math.round((ready / n) * 100) : 0;
  const sectors = new Set(list.map(sectorOf).filter((v) => v !== "—")).size;
  const verticals = new Set(list.map(psnPrimary).filter((v) => v !== "—")).size;
  const cities = new Set(list.map(cityOf).filter((v) => v !== "—")).size;

  // Micro-barra di composizione della pipeline dentro l'hero (contesto immediato).
  const spark = stageItems.filter((x) => x.value > 0)
    .map((x) => `<span style="flex:${x.value};background:${x.color}" title="${esc(x.label)}: ${x.value}"></span>`)
    .join("");

  const stats = [
    { v: avgTrl, l: "TRL medio" },
    { v: ready, l: "Ready to scale", s: `${readyPct}%` },
    { v: sectors, l: "Settori" },
    { v: verticals, l: "Verticali PSN" },
    { v: cities, l: "Città" },
  ];
  return `
    <section class="an-hero">
      <div class="an-lead">
        <div class="an-lead-val">${esc(n)}</div>
        <div class="an-lead-lab">startup nel perimetro</div>
        <div class="an-spark">${spark}</div>
        <div class="an-lead-sub">composizione della pipeline</div>
      </div>
      <div class="an-stats">
        ${stats.map((c) => `
          <div class="an-stat">
            <div class="an-stat-val">${esc(c.v)}${c.s ? `<span class="an-stat-tag">${esc(c.s)}</span>` : ""}</div>
            <div class="an-stat-lab">${esc(c.l)}</div>
          </div>`).join("")}
      </div>
    </section>`;
}

function panel(title, subtitle, body, cls = "") {
  return `<section class="an-panel ${cls}">
    <div class="an-head"><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>
    <div class="an-body">${body}</div>
  </section>`;
}
function sectionTitle(t) { return `<h2 class="an-section"><span>${esc(t)}</span></h2>`; }

export function renderAnalytics(container) {
  if (!container) return;
  const f = getFilters();
  const list = applyFilters(state.startups);   // perimetro pieno: hero e conteggi
  const n = list.length;

  // Con zero risultati i grafici sparirebbero, lasciando l'utente senza modo di
  // capire o annullare la selezione: si mostra un vuoto esplicito.
  if (!n) {
    container.innerHTML = `<div class="an-empty">
      <p>Nessuna startup nel perimetro dei filtri attivi.</p>
      <button class="btn ghost" data-clear-all>Azzera i filtri</button>
    </div>`;
    wire(container);
    return;
  }

  // Ogni dimensione conta sul proprio perimetro (tutti i filtri tranne il suo).
  // `total` resta il totale di quel perimetro, così le percentuali tornano.
  const stScope = scopeFor("stage");
  const stageItems = state.stages.map((st, i) => ({
    label: st.name, fv: st.id, color: stageColor(i),
    value: stScope.filter((s) => s.stage_id === st.id).length,
  }));

  const secScope = scopeFor("sector");
  const sectorItems = countBy(secScope, sectorOf).map((it) => ({ ...it, color: sectorColor(it.label) }));
  const psnScope = scopeFor("psn");
  const psnItems = tint(countBy(psnScope, psnPrimary), SINGLE);

  // Maturità tecnologica
  const trlScope = scopeFor("trl");
  const trlMap = new Map();
  let trlMissing = 0;
  trlScope.forEach((s) => { const t = trlOf(s); if (t != null) trlMap.set(t, (trlMap.get(t) || 0) + 1); else trlMissing++; });
  const trlItems = [...trlMap.entries()].sort((a, b) => a[0] - b[0])
    .map(([t, v]) => ({ label: `TRL ${t}`, value: v, color: trlColor(t), fv: t }));
  // La copertura è esplicita: i conteggi devono sempre riconciliare col totale.
  const trlTot = trlScope.length;
  const trlSub = trlMissing
    ? `Livelli di maturità tecnologica — ${trlTot - trlMissing} di ${trlTot} startup (${trlMissing} senza TRL)`
    : `Livelli di maturità tecnologica (1–9) — tutte le ${trlTot} startup`;
  const MAT_ORDER = ["Ready to scale", "Seed / Early traction", "Early stage", "n.d."];
  const matScope = scopeFor("maturity");
  const maturityItems = countBy(matScope, maturityBucketOf, { dropDash: false })
    .sort((a, b) => MAT_ORDER.indexOf(a.label) - MAT_ORDER.indexOf(b.label))
    .map((it) => ({ ...it, color: maturityColor(it.label) }));

  // Geografia (magnitudo → tinta unica)
  const cityScope = scopeFor("city");
  const cityItems = tint(countBy(cityScope, cityOf), SINGLE);
  const AREA_ORDER = ["Nord", "Centro", "Sud e Isole", "Altro"];
  const areaScope = scopeFor("area");
  const areaItems = tint(countBy(areaScope, macroAreaOf).sort((a, b) => AREA_ORDER.indexOf(a.label) - AREA_ORDER.indexOf(b.label)), SINGLE);

  // `active` accende l'evidenza solo se quella dimensione ha una selezione.
  const act = (k) => (hasSelection(k) ? f[k] : null);

  container.innerHTML = `
    ${hero(list, stageItems)}

    ${sectionTitle("Pipeline e portafoglio")}
    <div class="an-grid">
      ${panel("Distribuzione della pipeline", "Composizione per fase — clicca una fase per filtrare",
        stackedBar(stageItems, { total: stScope.length, fk: "stage", active: act("stage") }), "an-wide")}
    </div>
    <div class="an-grid">
      ${panel("Composizione per settore", "Quota di ciascun settore",
        donut(sectorItems, { fk: "sector", active: act("sector") }))}
      ${panel("Copertura verticali PSN", "Startup per verticale — evidenzia i gap di copertura",
        barList(psnItems, { total: psnScope.length, fk: "psn", active: act("psn") }))}
    </div>

    ${sectionTitle("Maturità tecnologica")}
    <div class="an-grid">
      ${panel("Distribuzione TRL", trlSub, trlItems.length
        ? columnChart(trlItems, { total: trlTot, fk: "trl", active: act("trl") })
        : `<p class="muted chart-empty">Nessun TRL indicato.</p>`)}
      ${panel("Stadio di maturità", "Fase di crescita normalizzata (valuation + TRL)",
        barList(maturityItems, { total: matScope.length, fk: "maturity", active: act("maturity") }))}
    </div>

    ${sectionTitle("Presidio territoriale")}
    <div class="an-grid an-grid-53">
      ${panel("Distribuzione per città", "Sedi ricondotte alla città", cityItems.length
        ? barList(cityItems, { total: cityScope.length, fk: "city", active: act("city") })
        : `<p class="muted chart-empty">Nessuna sede indicata.</p>`, "an-span-5")}
      ${panel("Macro-area", "Nord · Centro · Sud e Isole", areaItems.length
        ? barList(areaItems, { total: areaScope.length, fk: "area", active: act("area") })
        : `<p class="muted chart-empty">Nessuna sede.</p>`, "an-span-3")}
    </div>`;

  mountChartTooltip(container);
  wire(container);
}

// Click (e tastiera) su un elemento di un grafico → filtra l'intera vista.
function wire(container) {
  if (container._ckWired) return;
  container._ckWired = true;
  const pick = (t) => toggleFilter(t.getAttribute("data-fk"), t.getAttribute("data-fv"));
  container.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear-all]")) { resetFilters(); return; }
    const t = e.target.closest("[data-fk]");
    if (t) pick(t);
  });
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest("[data-fk]");
    if (t) { e.preventDefault(); pick(t); }
  });
}
