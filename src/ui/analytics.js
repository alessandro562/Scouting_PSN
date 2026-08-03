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

// Striscia di sintesi. Era un blocco scuro alto quanto un pannello, con dentro
// il TRL medio (gia' nella toolbar) e una micro-barra della pipeline (gia' nel
// grafico sotto): pesava molto e diceva poco di nuovo. Restano le sole misure
// di copertura che nessun altro elemento porta.
function hero(list) {
  const n = list.length;
  const ready = list.filter((s) => maturityBucketOf(s) === "Ready to scale").length;
  const readyPct = n ? Math.round((ready / n) * 100) : 0;
  const stats = [
    { v: ready, l: "Ready to scale", s: `${readyPct}%` },
    { v: new Set(list.map(sectorOf).filter((v) => v !== "—")).size, l: "Settori" },
    { v: new Set(list.map(psnPrimary).filter((v) => v !== "—")).size, l: "Verticali PSN" },
    { v: new Set(list.map(cityOf).filter((v) => v !== "—")).size, l: "Città" },
  ];
  return `
    <section class="an-strip">
      <div class="an-strip-lead">
        <span class="an-strip-val">${esc(n)}</span>
        <span class="an-strip-lab">startup nel perimetro</span>
      </div>
      ${stats.map((c) => `
        <div class="an-stat">
          <div class="an-stat-val">${esc(c.v)}${c.s ? `<span class="an-stat-tag">${esc(c.s)}</span>` : ""}</div>
          <div class="an-stat-lab">${esc(c.l)}</div>
        </div>`).join("")}
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
  const trlSub = trlMissing ? `${trlTot - trlMissing} di ${trlTot} startup · ${trlMissing} senza TRL` : "";
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
    ${hero(list)}

    ${sectionTitle("Pipeline e portafoglio")}
    <div class="an-grid">
      ${panel("Distribuzione della pipeline", "Clicca una fase per filtrare",
        stackedBar(stageItems, { total: stScope.length, fk: "stage", active: act("stage") }), "an-wide")}
    </div>
    <div class="an-grid">
      ${panel("Composizione per settore", "",
        donut(sectorItems, { size: 148, thickness: 18, fk: "sector", active: act("sector") }))}
      ${panel("Copertura verticali PSN", "Evidenzia i gap di copertura",
        barList(psnItems, { total: psnScope.length, fk: "psn", active: act("psn"), maxRows: 7 }))}
    </div>

    ${sectionTitle("Maturità e presidio territoriale")}
    <div class="an-grid an-grid-53">
      ${panel("Distribuzione per città", "", cityItems.length
        ? barList(cityItems, { total: cityScope.length, fk: "city", active: act("city"), maxRows: 6 })
        : `<p class="muted chart-empty">Nessuna sede indicata.</p>`, "an-span-5")}
      <div class="an-col">
        ${panel("Stadio di maturità", "Normalizzato da valuation + TRL",
          barList(maturityItems, { total: matScope.length, fk: "maturity", active: act("maturity") }))}
        ${panel("Macro-area", "", areaItems.length
          ? barList(areaItems, { total: areaScope.length, fk: "area", active: act("area") })
          : `<p class="muted chart-empty">Nessuna sede.</p>`)}
      </div>
    </div>
    <div class="an-grid">
      ${panel("Distribuzione TRL", trlSub, trlItems.length
        ? columnChart(trlItems, { total: trlTot, fk: "trl", active: act("trl") })
        : `<p class="muted chart-empty">Nessun TRL indicato.</p>`, "an-wide")}
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
    const more = e.target.closest("[data-more]");
    if (more) {
      const list = more.closest(".bar-list");
      const open = list.classList.toggle("show-all");
      more.textContent = more.getAttribute(open ? "data-less-label" : "data-more-label");
      return;
    }
    const t = e.target.closest("[data-fk]");
    if (t) pick(t);
  });
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest("[data-fk]");
    if (t) { e.preventDefault(); pick(t); }
  });
}
