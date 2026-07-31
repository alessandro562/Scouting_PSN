// ===========================================================================
// onepager.js — scheda di presentazione su una pagina (A4) brandizzata
// WDA / PSN. Nessuna libreria: si costruisce il layout e si usa la stampa
// nativa del browser ("Salva come PDF").
// ===========================================================================

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const has = (v) => v != null && String(v).trim() !== "";
const t = (v) => esc(String(v).trim());

function initials(name) {
  const p = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "•";
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[1][0]).toUpperCase();
}

function fact(k, v) {
  if (!has(v)) return "";
  return `<div class="op-fact"><span class="op-fk">${esc(k)}</span><span class="op-fv">${t(v)}</span></div>`;
}

function chipRow(label, items, icon) {
  const list = (Array.isArray(items) ? items : []).map((x) => (typeof x === "string" ? { name: x } : x || {})).filter((x) => has(x.name));
  if (!list.length) return "";
  return `<div class="op-chiprow"><span class="op-chip-k">${esc(label)}</span><span class="op-chips">${list
    .map((x) => `<span class="op-chip">${icon ? icon + " " : ""}${t(x.name)}</span>`).join("")}</span></div>`;
}

function root() {
  let el = document.getElementById("print-root");
  if (!el) { el = document.createElement("div"); el.id = "print-root"; document.body.appendChild(el); }
  return el;
}

// row: record startup (con .data e .psn). stageName: nome della fase corrente.
export function buildOnePager(row, stageName = "") {
  const s = { ...(row.data || {}), psn: row.psn, name: row.name, sector: row.sector };
  const p = s.psn || {};
  const usecases = (Array.isArray(s.usecases) ? s.usecases : []).filter(has).slice(0, 5);
  const logo = has(s.logo)
    ? `<img class="op-logo" src="${esc(s.logo)}" alt="">`
    : `<span class="op-logo op-logo-mono">${esc(initials(row.name))}</span>`;

  const facts = [
    fact("Settore", row.sector), fact("Sede", s.sede), fact("Fondazione", s.founded),
    fact("TRL", s.trl), fact("Dipendenti", s.dipendenti), fact("Fatturato", s.fatturato),
    fact("Maturità", s.valuation), fact("Fase nel CRM", stageName),
  ].join("");

  const oggi = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  return `
    <article class="onepager">
      <header class="op-head">
        <div class="op-id">
          ${logo}
          <div>
            <h1>${t(row.name)}</h1>
            ${has(s.website) ? `<div class="op-site">${t(String(s.website).replace(/^https?:\/\//, "").replace(/\/$/, ""))}</div>` : ""}
          </div>
        </div>
        <div class="op-brand">
          <img src="assets/logo-wda.png" alt="WDA">
          <span class="op-brand-div"></span>
          <img src="assets/logo-psn.png" alt="Polo Strategico Nazionale">
        </div>
      </header>

      ${has(s.what) ? `<p class="op-lead">${t(s.what)}</p>` : ""}

      <div class="op-facts">${facts}</div>

      <div class="op-cols">
        <div class="op-col">
          ${has(s.description) ? `<h2>Cosa fa</h2><p>${t(s.description)}</p>` : ""}
          ${has(s.problem) ? `<h2>Il problema che risolve</h2><p>${t(s.problem)}</p>` : ""}
        </div>
        <div class="op-col">
          ${usecases.length ? `<h2>Casi d'uso</h2><ul class="op-uc">${usecases.map((x) => `<li>${t(x)}</li>`).join("")}</ul>` : ""}
          ${has(s.relevance) ? `<h2>Rilevanza per la PA</h2><p>${t(s.relevance)}</p>` : ""}
        </div>
      </div>

      ${has(p.primary) || has(p.innovation) ? `
        <div class="op-psn">
          <span class="op-psn-k">Classificazione PSN</span>
          <span class="op-psn-v">${[p.primary, p.secondary, p.innovation].filter(has).map(t).join(" · ")}</span>
        </div>` : ""}

      ${has(s.traction) ? `<div class="op-block"><h2>Traction &amp; riconoscimenti</h2><p>${t(s.traction)}</p></div>` : ""}

      ${chipRow("Clienti", s.clients)}
      ${chipRow("Investitori", s.investors, "💼")}
      ${chipRow("Certificazioni", s.certifications, "📜")}
      ${chipRow("Premi", s.awards, "🏅")}

      <footer class="op-foot">
        <span>Scheda generata il ${esc(oggi)} · CRM di scouting startup per la Pubblica Amministrazione</span>
        ${has(s.keyPeople) ? `<span class="op-foot-team">${t(s.keyPeople)}</span>` : ""}
      </footer>
    </article>`;
}

// Apre l'anteprima di stampa del sistema con la sola scheda in pagina.
export function printOnePager(row, stageName = "") {
  root().innerHTML = buildOnePager(row, stageName);
  document.body.classList.add("printing");
  const cleanup = () => {
    document.body.classList.remove("printing");
    root().innerHTML = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // Lascia al browser un frame per applicare gli stili prima della stampa.
  setTimeout(() => window.print(), 60);
}
