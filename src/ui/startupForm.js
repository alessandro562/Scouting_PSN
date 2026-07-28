// ===========================================================================
// startupForm.js — form di creazione / modifica di una startup (card).
// Solo il nome è obbligatorio; gli altri campi si compilano nel tempo.
// ===========================================================================
import { state, upsertStartup, reloadAll } from "../store.js";
import { SECTORS } from "../data/seed.js";
import { toast, toastError } from "./toast.js";

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(name) {
  const base = String(name || "startup")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "startup";
  return `${base}-${Date.now().toString(36)}`;
}

function root() {
  let el = document.getElementById("form-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "form-root";
    document.body.appendChild(el);
  }
  return el;
}

function close() {
  root().innerHTML = "";
}

function field(label, id, value, { area = false, placeholder = "", rows = 2 } = {}) {
  const input = area
    ? `<textarea id="${id}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
    : `<input type="text" id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`;
  return `<div class="form-field"><label for="${id}">${esc(label)}</label>${input}</div>`;
}

// row: startup esistente (edit) oppure null (create). opts.stageId = fase iniziale.
export function openStartupForm(row = null, opts = {}) {
  const d = row?.data || {};
  const p = row?.psn || {};
  const isEdit = !!row;
  const defaultStage = row?.stage_id || opts.stageId || state.stages[0]?.id || "";

  const stageOptions = state.stages
    .map((s) => `<option value="${esc(s.id)}" ${s.id === defaultStage ? "selected" : ""}>${esc(s.name)}</option>`)
    .join("");
  const sectorList = SECTORS.map((s) => `<option value="${esc(s)}"></option>`).join("");

  const usecases = Array.isArray(d.usecases) ? d.usecases.join("\n") : "";
  const technologies = Array.isArray(d.technologies)
    ? d.technologies.map((t) => (Array.isArray(t) ? `${t[0]} | ${t[1] || ""}` : t)).join("\n")
    : "";

  root().innerHTML = `
    <div class="modal-overlay" data-close-overlay>
      <div class="modal form-modal" role="dialog" aria-modal="true" aria-label="${isEdit ? "Modifica" : "Nuova"} startup">
        <header class="modal-head">
          <h2>${isEdit ? "Modifica startup" : "Nuova startup"}</h2>
          <button class="icon-btn modal-close" data-cancel aria-label="Chiudi">✕</button>
        </header>
        <div class="modal-scroll">
          <form id="startup-form" class="startup-form">
            <div class="form-section">
              <div class="form-grid">
                ${field("Nome *", "f-name", row?.name || d.name || "", { placeholder: "Es. Acme Security" })}
                <div class="form-field">
                  <label for="f-sector">Settore</label>
                  <input type="text" id="f-sector" list="sector-list" value="${esc(row?.sector || "")}" placeholder="AI, Cybersecurity, …" />
                  <datalist id="sector-list">${sectorList}</datalist>
                </div>
                <div class="form-field">
                  <label for="f-stage">Fase</label>
                  <select id="f-stage">${stageOptions}</select>
                </div>
              </div>
            </div>

            <details class="form-block" open>
              <summary>Sintesi</summary>
              ${field("Cosa fa (one-liner)", "f-what", d.what || "", { area: true, placeholder: "Descrizione in una frase" })}
              <div class="form-grid">
                ${field("Ambito applicativo", "f-area", d.area || "")}
                ${field("Target potenziale", "f-audience", d.audience || "")}
              </div>
              ${field("Descrizione della soluzione", "f-description", d.description || "", { area: true, rows: 3 })}
              ${field("Problema affrontato", "f-problem", d.problem || "", { area: true, rows: 3 })}
              ${field("Rilevanza per la PA", "f-relevance", d.relevance || "", { area: true })}
              ${field("Elementi distintivi", "f-differentiator", d.differentiator || "", { area: true })}
            </details>

            <details class="form-block">
              <summary>Input · Elaborazione · Output</summary>
              <div class="form-grid">
                ${field("Input", "f-input", d.input || "")}
                ${field("Elaborazione", "f-processing", d.processing || "")}
                ${field("Output", "f-output", d.output || "")}
              </div>
            </details>

            <details class="form-block">
              <summary>Casi d’uso e tecnologie</summary>
              ${field("Casi d’uso (uno per riga)", "f-usecases", usecases, { area: true, rows: 4, placeholder: "Un caso d'uso per riga" })}
              ${field("Tecnologie (una per riga: Nome | Descrizione)", "f-technologies", technologies, { area: true, rows: 4, placeholder: "Sensori IoT | Dispositivi installati sul campo" })}
            </details>

            <details class="form-block">
              <summary>Sperimentazione / PoC</summary>
              <div class="form-grid">
                ${field("PoC possibile", "f-poc", d.poc || "")}
                ${field("Durata indicativa", "f-duration", d.duration || "")}
                ${field("Prerequisito principale", "f-prereq", d.prereq || "")}
                ${field("Indicatori (KPI)", "f-kpi", d.kpi || "")}
              </div>
            </details>

            <details class="form-block">
              <summary>Verifiche preliminari</summary>
              ${field("Verifica chiave", "f-deepen", d.deepen || "")}
              ${field("Perché è rilevante", "f-why", d.why || "", { area: true })}
              ${field("Documentazione utile", "f-material", d.material || "", { area: true })}
            </details>

            <details class="form-block">
              <summary>Attività successive</summary>
              ${field("Attività iniziale", "f-next1", d.next1 || "", { area: true })}
              ${field("Approfondimento successivo", "f-next2", d.next2 || "", { area: true })}
              ${field("Output atteso", "f-nextOut", d.nextOut || "", { area: true })}
            </details>

            <details class="form-block">
              <summary>Classificazione PSN</summary>
              <div class="form-grid">
                ${field("Verticale PSN primario", "f-psn-primary", p.primary || "")}
                ${field("Aree PSN correlate", "f-psn-secondary", p.secondary || "")}
                ${field("Aree di innovazione", "f-psn-innovation", p.innovation || "")}
              </div>
              ${field("Caso d’uso PSN", "f-psn-usecase", p.usecase || "", { area: true })}
              ${field("Nota di classificazione", "f-psn-note", p.note || "", { area: true })}
            </details>

            <div class="form-actions">
              <button type="button" class="btn ghost" data-cancel>Annulla</button>
              <button type="submit" class="btn primary">${isEdit ? "Salva modifiche" : "Crea startup"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const r = root();
  r.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", close));
  r.querySelector("[data-close-overlay]")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) close();
  });
  r.querySelector("#f-name")?.focus();

  r.querySelector("#startup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await save(row);
  });
}

function readList(id) {
  const v = document.getElementById(id)?.value || "";
  return v.split("\n").map((x) => x.trim()).filter(Boolean);
}

function readTech(id) {
  return readList(id).map((line) => {
    const idx = line.indexOf("|");
    if (idx === -1) return [line, ""];
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
  });
}

async function save(row) {
  const get = (id) => document.getElementById(id)?.value.trim() ?? "";
  const name = get("f-name");
  if (!name) { toast("Il nome è obbligatorio", "error"); return; }

  const data = {
    ...(row?.data || {}),
    name,
    what: get("f-what"),
    area: get("f-area"),
    audience: get("f-audience"),
    description: get("f-description"),
    problem: get("f-problem"),
    relevance: get("f-relevance"),
    differentiator: get("f-differentiator"),
    input: get("f-input"),
    processing: get("f-processing"),
    output: get("f-output"),
    usecases: readList("f-usecases"),
    technologies: readTech("f-technologies"),
    poc: get("f-poc"),
    duration: get("f-duration"),
    prereq: get("f-prereq"),
    kpi: get("f-kpi"),
    deepen: get("f-deepen"),
    why: get("f-why"),
    material: get("f-material"),
    next1: get("f-next1"),
    next2: get("f-next2"),
    nextOut: get("f-nextOut"),
  };

  const psn = {
    primary: get("f-psn-primary"),
    secondary: get("f-psn-secondary"),
    innovation: get("f-psn-innovation"),
    usecase: get("f-psn-usecase"),
    note: get("f-psn-note"),
  };

  const payload = {
    name,
    sector: get("f-sector") || null,
    stage_id: get("f-stage") || null,
    data,
    psn,
  };

  try {
    if (row) {
      payload.id = row.id;
    } else {
      payload.slug = slugify(name);
      const inStage = state.startups.filter((x) => x.stage_id === payload.stage_id);
      payload.position = inStage.reduce((m, x) => Math.max(m, x.position), 0) + 1000;
    }
    await upsertStartup(payload);
    await reloadAll();
    close();
    toast(row ? "Startup aggiornata" : "Startup creata", "info");
  } catch (e) {
    toastError("Errore nel salvataggio", e);
  }
}
