// ===========================================================================
// main.js — punto d'ingresso dell'app CRM.
// Flusso: config → auth gate → seed → carica store → render → realtime.
// ===========================================================================
import { isConfigured } from "./supabase.js";
import { getSession, onAuthChange, signIn, signUp, signOut } from "./auth.js";
import { state, subscribe, reloadAll, noteCounts } from "./store.js";
import { ensureSeeded } from "./data/seed-runner.js";
import { renderBoard, setNoteCounts, setSectorFilter } from "./ui/board.js";
import { renderReport } from "./ui/report.js";
import { openStartupForm } from "./ui/startupForm.js";
import { openStageMenu } from "./ui/stages.js";
import { cardsForStage } from "./store.js";
import { subscribeRealtime, unsubscribeRealtime } from "./realtime.js";
import { toast, toastError } from "./ui/toast.js";

const el = (id) => document.getElementById(id);
let currentSector = "all";
let booted = false;
let rendering = false;

// --------------------------------------------------------------------------
// Rendering
// --------------------------------------------------------------------------
async function render() {
  if (rendering) return;
  rendering = true;
  try {
    try {
      const counts = await noteCounts();
      setNoteCounts(counts);
    } catch (e) { /* i conteggi note sono best-effort */ }

    renderSectorFilter();
    setSectorFilter(currentSector);
    renderHeroMetrics();
    renderBoard(el("board"));
    renderReport();
  } finally {
    rendering = false;
  }
}

function renderHeroMetrics() {
  const host = el("hero-metrics");
  if (!host) return;
  const total = state.startups.length;
  const cards = [
    { label: "Startup totali", value: total, text: "Soluzioni in pipeline nel CRM di scouting." },
  ];
  state.stages.slice(0, 3).forEach((st) => {
    cards.push({
      label: st.name,
      value: cardsForStage(st.id).length,
      text: `Startup attualmente in fase “${st.name}”.`,
    });
  });
  host.innerHTML = cards
    .map(
      (m) => `
      <div class="metric">
        <div class="label">${m.label}</div>
        <div class="value">${m.value}</div>
        <div class="text">${m.text}</div>
      </div>`
    )
    .join("");
}

function renderSectorFilter() {
  const select = el("sector-filter");
  if (!select) return;
  const sectors = Array.from(new Set(state.startups.map((s) => s.sector).filter(Boolean))).sort();
  const opts = ['<option value="all">Tutti i settori</option>']
    .concat(sectors.map((s) => `<option value="${s}">${s}</option>`))
    .join("");
  select.innerHTML = opts;
  select.value = currentSector;
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

  try {
    await ensureSeeded();
    await reloadAll();
  } catch (e) {
    toastError("Errore nel caricamento dei dati", e);
  }

  subscribe(() => { render(); });
  await render();
  subscribeRealtime();
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

  // Toggle Board / Report
  onClick("view-board-btn", () => setView("board"));
  onClick("view-report-btn", () => setView("report"));

  // Filtro settore
  el("sector-filter")?.addEventListener("change", (e) => {
    currentSector = e.target.value;
    setSectorFilter(currentSector);
    renderBoard(el("board"));
  });

  // Nuova startup / nuova colonna (sidebar + hero)
  onClick("nav-add-startup", () => openStartupForm(null, {}));
  onClick("hero-add-startup", () => openStartupForm(null, {}));
  onClick("nav-add-column", () => openStageMenu(null, "create"));
  onClick("hero-add-column", () => openStageMenu(null, "create"));

  // Logout
  el("logout-btn")?.addEventListener("click", async () => {
    await signOut();
    toast("Sei uscito", "info");
  });

  // Ricerca globale (board + report)
  const search = el("search-input");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll(".searchable").forEach((node) => {
      node.classList.remove("search-hit");
      if (!q) { node.classList.remove("hide"); return; }
      const hit = node.innerText.toLowerCase().includes(q);
      node.classList.toggle("hide", !hit);
      if (hit && q.length > 2) node.classList.add("search-hit");
    });
  });
}

function setView(view) {
  const boardView = el("board-view");
  const reportView = el("report-view");
  const isBoard = view === "board";
  boardView?.classList.toggle("hidden", !isBoard);
  reportView?.classList.toggle("hidden", isBoard);
  el("view-board-btn")?.classList.toggle("active", isBoard);
  el("view-report-btn")?.classList.toggle("active", !isBoard);
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
