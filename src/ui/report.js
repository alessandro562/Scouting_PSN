// ===========================================================================
// report.js — viste di sintesi (tabelle + glossario) guidate dallo store.
// Markup delle righe ripreso VERBATIM dall'index.html originale.
// ===========================================================================
import { state } from "../store.js";

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function val(v) {
  const t = (v ?? "").toString().trim();
  return t ? esc(t) : "—";
}

function psn(s) {
  return (
    s.psn || {
      primary: s.area,
      secondary: "Da classificare",
      innovation: "Da verificare",
      usecase: s.poc,
      note: "Classificazione da confermare.",
    }
  );
}

function pathNote(s) {
  if (s.path === "Approfondimento funzionale") return "Prima verifica funzionale con caso d’uso e fonti definite.";
  if (s.path === "Approfondimento tecnico") return "Verifica tecnica su standard, accuratezza e responsabilità.";
  if (s.path === "PoC operativo") return "Sperimentazione in contesto reale con asset e prerequisiti operativi.";
  if (s.path === "Co-progettazione tecnica") return "Approfondimento progettuale su perimetro, dati e requisiti tecnici.";
  return "Percorso di approfondimento da definire.";
}

// Startup dello store rimappate al formato "ricco" usato dai template.
function items() {
  return state.startups.map((row) => ({
    ...(row.data || {}),
    psn: row.psn,
    name: row.name,
    sector: row.sector,
  }));
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function renderSummary(list) {
  setHTML(
    "summaryRows",
    list
      .map((s) => {
        const p = psn(s);
        return `
        <tr class="searchable">
          <td><div class="startup-cell"><span class="startup-dot"></span><strong>${val(s.name)}</strong></div></td>
          <td>
            <span class="table-pill table-pill-path">${val(p.primary)}</span>
            <div class="table-note">${val(p.secondary)}</div>
          </td>
          <td><span class="table-pill table-pill-area">${val(p.innovation)}</span></td>
          <td><div class="table-main-text">${val(s.what)}</div></td>
          <td>
            <span class="table-pill table-pill-neutral">${val(s.path)}</span>
            <div class="table-note">${esc(pathNote(s))}</div>
          </td>
        </tr>`;
      })
      .join("")
  );
}

function renderPsnMap(list) {
  setHTML(
    "psnRows",
    list
      .map((s) => {
        const p = psn(s);
        return `
        <tr class="searchable">
          <td><div class="startup-cell"><span class="startup-dot"></span><strong>${val(s.name)}</strong></div></td>
          <td>
            <span class="table-pill table-pill-path">${val(p.primary)}</span>
            <div class="table-note">${val(p.secondary)}</div>
          </td>
          <td><span class="table-pill table-pill-area">${val(p.innovation)}</span></td>
          <td><div class="table-main-text">${val(p.usecase)}</div></td>
          <td><div class="table-note">${val(p.note)}</div></td>
        </tr>`;
      })
      .join("")
  );
}

function renderPoc(list) {
  setHTML(
    "pocRows",
    list
      .map(
        (s) => `
      <tr class="searchable">
        <td><div class="startup-cell"><span class="startup-dot"></span><strong>${val(s.name)}</strong></div></td>
        <td><div class="table-main-text">${val(s.poc)}</div></td>
        <td><span class="table-pill table-pill-neutral">${val(s.duration)}</span></td>
        <td><div class="table-main-text">${val(s.prereq)}</div></td>
        <td><div class="table-main-text">${val(s.kpi)}</div></td>
      </tr>`
      )
      .join("")
  );
}

function renderDeepening(list) {
  setHTML(
    "deepeningRows",
    list
      .map(
        (s) => `
      <tr class="searchable">
        <td><div class="startup-cell"><span class="startup-dot"></span><strong>${val(s.name)}</strong></div></td>
        <td><span class="table-pill table-pill-path">${val(s.deepen)}</span></td>
        <td><div class="table-main-text">${val(s.why)}</div></td>
        <td><div class="table-note">${val(s.material)}</div></td>
      </tr>`
      )
      .join("")
  );
}

function renderNext(list) {
  setHTML(
    "nextRows",
    list
      .map(
        (s) => `
      <tr class="searchable">
        <td><div class="startup-cell"><span class="startup-dot"></span><strong>${val(s.name)}</strong></div></td>
        <td><div class="table-main-text">${val(s.next1)}</div></td>
        <td><div class="table-main-text">${val(s.next2)}</div></td>
        <td><div class="table-note">${val(s.nextOut)}</div></td>
      </tr>`
      )
      .join("")
  );
}

function renderGlossary() {
  setHTML(
    "glossaryGrid",
    state.glossary
      .map(
        (g) => `
      <div class="card searchable">
        <h4>${esc(g.term)}</h4>
        <p>${esc(g.text)}</p>
        ${g.refs ? `<span class="pill blue">${esc(g.refs)}</span>` : ""}
      </div>`
      )
      .join("")
  );
}

// Copia verbatim di enhanceTables dall'originale (arricchisce le celle .visual-table).
function enhanceTables() {
  document.querySelectorAll(".visual-table table").forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim().toLowerCase());
    table.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      tds.forEach((td, i) => {
        const label = headers[i] || "";
        td.setAttribute("data-col", label);
        const txt = td.textContent.trim();
        if (td.querySelector(".table-pill") || td.querySelector(".startup-cell")) return;
        if (label.includes("startup")) {
          td.innerHTML = `<div class="startup-cell"><span class="startup-dot"></span><strong>${txt}</strong></div>`;
        } else if (label.includes("ambito")) {
          td.innerHTML = `<span class="table-pill table-pill-area">${txt}</span>`;
        } else if (label.includes("percorso")) {
          td.innerHTML = `<span class="table-pill table-pill-path">${txt}</span>`;
        }
        if (label.includes("verifica") || label.includes("approfondire") || label.includes("rilevanza della verifica")) {
          td.classList.add("table-risk");
        }
        if (label.includes("indicatori") || label.includes("priorità") || label.includes("attività")) {
          td.classList.add("table-priority");
        }
      });
    });
  });
}

export function renderReport() {
  const list = items();
  renderSummary(list);
  renderPsnMap(list);
  renderPoc(list);
  renderDeepening(list);
  renderNext(list);
  renderGlossary();
  try { enhanceTables(); } catch (e) { console.warn("enhanceTables skipped", e); }
}
