// ===========================================================================
// main.js — punto d'ingresso dell'app CRM.
// Flusso: config → auth gate → seed → carica store → render → realtime.
// ===========================================================================
import { isConfigured } from "./supabase.js";
import { getSession, onAuthChange, signIn, signUp, signOut } from "./auth.js";
import { state, subscribe, reloadAll, noteCounts, setCurrentUser } from "./store.js";
import { ensureSeeded } from "./data/seed-runner.js";
import { renderBoard, setNoteCounts } from "./ui/board.js";
import { renderReport } from "./ui/report.js";
import { renderTable, setTableNoteCounts } from "./ui/table.js";
import { renderAnalytics } from "./ui/analytics.js";
import { mountFilterBar, syncControls, renderSavedViews } from "./ui/filterBar.js";
import {
  onFiltersChange, getFilters, setFilters, getFilteredStartups,
  psnPrimary, sectorOf, stageName, trlOf, valuationOf, sedeOf,
} from "./ui/filters.js";
import { openStartupForm } from "./ui/startupForm.js";
import { openStageMenu } from "./ui/stages.js";
import { cardsForStage } from "./store.js";
import { subscribeRealtime, unsubscribeRealtime } from "./realtime.js";
import { openPalette } from "./ui/palette.js";
import { openActivityDrawer } from "./ui/activity.js";
import { toast, toastError } from "./ui/toast.js";

const LS_VIEW = "crm-view";
const LS_DENSITY = "crm-density";
const LS_FILTERS = "crm-filters";

const el = (id) => document.getElementById(id);
let currentView = "board";
let booted = false;
let rendering = false;

const VIEWS = {
  board: { title: "Board pipeline", showFilter: true, showKpis: true },
  table: { title: "Tabella / Database", showFilter: true, showKpis: true },
  analytics: { title: "Analytics", showFilter: true, showKpis: true },
  report: { title: "Report & sintesi", showFilter: false, showKpis: false },
};

// --------------------------------------------------------------------------
// Rendering
// --------------------------------------------------------------------------
async function render() {
  if (rendering) return;
  rendering = true;
  try {
    try {
      const counts = await noteCounts();
      window.__noteCounts = counts;
      setNoteCounts(counts);
      setTableNoteCounts(counts);
    } catch (e) { /* i conteggi note sono best-effort */ }

    renderTopbar();
    renderBoard(el("board"));
    renderTable(el("table-view"));
    renderAnalytics(el("analytics-view"));
    renderReport();
    renderSavedViews();
  } finally {
    rendering = false;
  }
}

function escHtml(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function avgTrl() {
  const trls = state.startups
    .map((s) => parseInt(s.data && s.data.trl, 10))
    .filter((n) => !Number.isNaN(n));
  if (!trls.length) return null;
  return trls.reduce((a, b) => a + b, 0) / trls.length;
}

function kpiChip(label, value, tone = "") {
  return `<span class="kpi ${tone}"><span class="kpi-val">${escHtml(value)}</span><span class="kpi-lab">${escHtml(label)}</span></span>`;
}

// Toolbar compatta: titolo vista, conteggio risultati, striscia KPI densa.
function renderTopbar() {
  const cfg = VIEWS[currentView] || VIEWS.board;

  const titleEl = el("topbar-title");
  if (titleEl) titleEl.textContent = cfg.title;

  const total = state.startups.length;
  const shown = getFilteredStartups().length;
  const countEl = el("topbar-count");
  if (countEl) countEl.textContent = shown === total ? `${total} startup` : `${shown} / ${total} startup`;

  const kpis = el("topbar-kpis");
  if (!kpis) return;
  if (!cfg.showKpis) { kpis.classList.add("hidden"); kpis.innerHTML = ""; return; }
  kpis.classList.remove("hidden");
  const avg = avgTrl();
  const chips = [kpiChip("Totali", total, "kpi-strong")];
  state.stages.forEach((st) => chips.push(kpiChip(st.name, cardsForStage(st.id).length)));
  chips.push(kpiChip("TRL medio", avg == null ? "—" : avg.toFixed(1).replace(".", ","), "kpi-accent"));
  kpis.innerHTML = chips.join("");
}

// --------------------------------------------------------------------------
// Densità card (Notion-like) — persistita in localStorage
// --------------------------------------------------------------------------
function applyDensity() {
  const compact = localStorage.getItem(LS_DENSITY) === "compact";
  document.body.classList.toggle("density-compact", compact);
  const btn = el("topbar-density");
  if (btn) btn.setAttribute("aria-pressed", compact ? "true" : "false");
}
function toggleDensity() {
  const compact = localStorage.getItem(LS_DENSITY) === "compact";
  localStorage.setItem(LS_DENSITY, compact ? "comfortable" : "compact");
  applyDensity();
}

// --------------------------------------------------------------------------
// Export CSV delle startup filtrate
// --------------------------------------------------------------------------
function exportCsv() {
  const rows = getFilteredStartups();
  const header = ["Nome", "Settore", "Fase", "Verticale PSN", "TRL", "Valuation", "Sede", "Note", "Aggiornato"];
  const counts = window.__noteCounts || {};
  const esc = (v) => {
    const s = String(v == null ? "" : v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const lines = [header.join(",")];
  rows.forEach((s) => {
    lines.push([
      esc(s.name),
      esc(sectorOf(s)),
      esc(stageName(s.stage_id)),
      esc(psnPrimary(s)),
      esc(trlOf(s) ?? ""),
      esc(valuationOf(s)),
      esc(sedeOf(s)),
      esc(counts[s.id] || 0),
      esc(s.updated_at ? new Date(s.updated_at).toLocaleDateString("it-IT") : ""),
    ].join(","));
  });
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scouting-psn_${rows.length}-startup.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Esportate ${rows.length} startup in CSV`, "info");
}

// --------------------------------------------------------------------------
// Boot dell'app (dopo login valido)
// --------------------------------------------------------------------------
async function boot(session) {
  if (booted) return;
  booted = true;

  el("setup-overlay")?.classList.add("hidden");
  el("login-overlay")?.classList.add("hidden");
  el("app")?.classList.remove("hidden");
  const emailEl = el("user-email");
  if (emailEl) emailEl.textContent = session?.user?.email || "";
  setCurrentUser(session?.user);

  applyDensity();
  restoreFilters();
  currentView = localStorage.getItem(LS_VIEW) || "board";

  try {
    await ensureSeeded();
    await reloadAll();
  } catch (e) {
    toastError("Errore nel caricamento dei dati", e);
  }

  mountFilterBar(el("filter-bar"));
  subscribe(() => { render(); });
  onFiltersChange(() => { persistFilters(); render(); });
  await render();
  syncControls();
  setView(currentView);
  subscribeRealtime();
}

function persistFilters() {
  try { localStorage.setItem(LS_FILTERS, JSON.stringify(getFilters())); } catch (e) { /* ignora */ }
}
function restoreFilters() {
  try {
    const raw = localStorage.getItem(LS_FILTERS);
    if (raw) setFilters(JSON.parse(raw));
  } catch (e) { /* ignora */ }
}

function teardown() {
  booted = false;
  unsubscribeRealtime();
  el("app")?.classList.add("hidden");
  el("login-overlay")?.classList.remove("hidden");
}

// --------------------------------------------------------------------------
// Toolbar / interazioni globali
// --------------------------------------------------------------------------
function wireChrome() {
  const onClick = (id, fn) =>
    el(id)?.addEventListener("click", (e) => { e.preventDefault(); fn(); });

  // Switcher 4 viste
  onClick("view-board-btn", () => setView("board"));
  onClick("view-table-btn", () => setView("table"));
  onClick("view-analytics-btn", () => setView("analytics"));
  onClick("view-report-btn", () => setView("report"));

  // Nuova startup / nuova colonna (sidebar + topbar)
  onClick("nav-add-startup", () => openStartupForm(null, {}));
  onClick("topbar-add-startup", () => openStartupForm(null, {}));
  onClick("nav-add-column", () => openStageMenu(null, "create"));
  onClick("topbar-add-column", () => openStageMenu(null, "create"));

  // Toolbar: palette, registro attività, densità, export CSV
  onClick("topbar-cmd", () => openPalette({ setView, openStartupForm, openStageMenu }));
  onClick("topbar-activity", () => openActivityDrawer());
  onClick("topbar-density", () => toggleDensity());
  onClick("topbar-export", () => exportCsv());

  // Scorciatoie globali da tastiera
  document.addEventListener("keydown", onGlobalKey);

  // Logout
  el("logout-btn")?.addEventListener("click", async () => {
    await signOut();
    toast("Sei uscito", "info");
  });
}

function typingInField(e) {
  const t = e.target;
  if (!t) return false;
  const tag = (t.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable;
}

function onGlobalKey(e) {
  // ⌘K / Ctrl+K → command palette (anche mentre si digita)
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    openPalette({ setView, openStartupForm, openStageMenu });
    return;
  }
  if (typingInField(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector(".modal-overlay, .palette-overlay, .form-modal, .mini-dialog")) return;

  if (e.key === "1") { setView("board"); }
  else if (e.key === "2") { setView("table"); }
  else if (e.key === "3") { setView("analytics"); }
  else if (e.key === "4") { setView("report"); }
  else if (e.key === "n" || e.key === "N") { e.preventDefault(); openStartupForm(null, {}); }
  else if (e.key === "/") { e.preventDefault(); document.getElementById("fb-search")?.focus(); }
}

function setView(view) {
  currentView = view;
  const cfg = VIEWS[view] || VIEWS.board;
  ["board", "table", "analytics", "report"].forEach((v) => {
    el(`${v}-view`)?.classList.toggle("hidden", v !== view);
    el(`view-${v}-btn`)?.classList.toggle("active", v === view);
  });
  el("filter-bar")?.classList.toggle("hidden", !cfg.showFilter);
  try { localStorage.setItem(LS_VIEW, view); } catch (e) { /* ignora */ }
  renderTopbar();
}

// --------------------------------------------------------------------------
// Auth wiring
// --------------------------------------------------------------------------
function wireAuth() {
  const form = el("login-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("login-email").value.trim();
    const password = el("login-password").value;
    const errEl = el("login-error");
    errEl.textContent = "";
    const mode = form.dataset.mode || "signin";
    try {
      const { error } =
        mode === "signup" ? await signUp(email, password) : await signIn(email, password);
      if (error) { errEl.textContent = traduciErrore(error.message); return; }
      if (mode === "signup") {
        errEl.textContent = "Registrazione ricevuta. Se richiesta, conferma l'email, poi accedi.";
      }
    } catch (err) {
      errEl.textContent = "Errore imprevisto. Riprova.";
      console.error(err);
    }
  });

  el("toggle-signup")?.addEventListener("click", () => {
    const f = el("login-form");
    const mode = f.dataset.mode === "signup" ? "signin" : "signup";
    f.dataset.mode = mode;
    el("login-submit").textContent = mode === "signup" ? "Registrati" : "Accedi";
    el("toggle-signup").textContent = mode === "signup" ? "Hai già un account? Accedi" : "Crea un nuovo account";
    el("login-error").textContent = "";
  });
}

function traduciErrore(msg) {
  if (/invalid login/i.test(msg)) return "Credenziali non valide.";
  if (/email not confirmed/i.test(msg)) return "Email non ancora confermata.";
  if (/already registered/i.test(msg)) return "Email già registrata.";
  if (/password/i.test(msg)) return "La password deve avere almeno 6 caratteri.";
  return msg;
}

// --------------------------------------------------------------------------
// Avvio
// --------------------------------------------------------------------------
async function start() {
  if (!isConfigured()) {
    el("setup-overlay")?.classList.remove("hidden");
    el("login-overlay")?.classList.add("hidden");
    el("app")?.classList.add("hidden");
    return;
  }

  wireChrome();
  wireAuth();

  onAuthChange((session) => {
    if (session) boot(session);
    else teardown();
  });

  const session = await getSession();
  if (session) boot(session);
  else {
    el("login-overlay")?.classList.remove("hidden");
    el("app")?.classList.add("hidden");
  }
}

start();
