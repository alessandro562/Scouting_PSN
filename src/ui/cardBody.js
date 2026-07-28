// ===========================================================================
// cardBody.js — template del dettaglio ricco di una startup.
// Markup ripreso VERBATIM dall'index.html originale (renderCards), reso robusto
// a campi mancanti per le startup nuove/parziali inserite dal form.
// `s` = { ...row.data, psn: row.psn }
// ===========================================================================

const DASH = '<span class="muted">—</span>';

function esc(v) {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Valore testuale con fallback "—" (il contenuto è testo, quindi lo escapiamo).
function val(v) {
  const t = (v ?? "").toString().trim();
  return t ? esc(t) : DASH;
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

// Blocco opzionale "Scheda pipeline": mostrato solo se sono presenti i campi
// tipici delle startup importate dal deck (sede, TRL, traction, key people).
function pipelineBlock(s) {
  const rows = [
    ["Sede", s.sede],
    ["TRL", s.trl],
    ["Maturità / Valuation", s.valuation],
    ["Traction", s.traction],
    ["Key people", s.keyPeople],
  ].filter(([, v]) => v && String(v).trim());
  if (!rows.length) return "";
  return `
      <div class="callout psn-callout"><strong>Scheda pipeline</strong></div>
      <div class="info-grid">
        ${rows
          .map(([k, v]) => `<div class="ibox"><div class="k">${esc(k)}</div><div class="v">${val(v)}</div></div>`)
          .join("")}
      </div>
  `;
}

export function renderStartupDetail(s) {
  const p = psn(s);
  const id = s.id || s.slug || "startup";
  const usecases = Array.isArray(s.usecases) ? s.usecases : [];
  const technologies = Array.isArray(s.technologies) ? s.technologies : [];

  return `
    <div class="startup-body">
      <div class="info-grid">
        <div class="ibox"><div class="k">Verticale PSN primario</div><div class="v">${val(p.primary)}</div></div>
        <div class="ibox"><div class="k">Aree PSN correlate</div><div class="v">${val(p.secondary)}</div></div>
        <div class="ibox"><div class="k">Aree di innovazione PSN</div><div class="v">${val(p.innovation)}</div></div>
        <div class="ibox"><div class="k">Ambito applicativo</div><div class="v">${val(s.area)}</div></div>
        <div class="ibox"><div class="k">Target potenziale</div><div class="v">${val(s.audience)}</div></div>
        <div class="ibox"><div class="k">Verifica preliminare</div><div class="v">${val(s.deepen)}</div></div>
      </div>

      ${pipelineBlock(s)}

      <div class="grid cols-2" id="${esc(id)}-descrizione">
        <div class="card inner-card">
          <h4>Descrizione della soluzione</h4>
          <p>${val(s.description)}</p>
        </div>
        <div class="card inner-card">
          <h4>Problema affrontato</h4>
          <p>${val(s.problem)}</p>
        </div>
      </div>

      <div class="callout">
        <strong>Ambito di rilevanza per la PA:</strong> ${val(s.relevance)}
      </div>

      <div class="callout psn-callout">
        <strong>Inquadramento PSN:</strong> ${val(p.primary)} · ${val(p.usecase)}
      </div>

      <div class="ipo">
        <div class="ibox"><div class="k">Input</div><div class="v">${val(s.input)}</div></div>
        <div class="ibox"><div class="k">Elaborazione</div><div class="v">${val(s.processing)}</div></div>
        <div class="ibox"><div class="k">Output</div><div class="v">${val(s.output)}</div></div>
      </div>

      <details class="sub-accordion" open id="${esc(id)}-usecase">
        <summary>
          <span class="sub-summary-title">Casi d’uso esemplificativi</span>
          <span class="sub-chevron" aria-hidden="true"></span>
        </summary>
        <div class="answer">
          ${
            usecases.length
              ? `<ul class="clean-list">${usecases.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
              : DASH
          }
        </div>
      </details>

      <details class="sub-accordion" id="${esc(id)}-tech">
        <summary>
          <span class="sub-summary-title">Tecnologie utilizzate</span>
          <span class="sub-chevron" aria-hidden="true"></span>
        </summary>
        <div class="answer">
          ${
            technologies.length
              ? `<div class="grid cols-2">${technologies
                  .map(
                    (t) => `
                    <div class="ibox">
                      <div class="k">${esc(Array.isArray(t) ? t[0] : t)}</div>
                      <div class="v">${esc(Array.isArray(t) ? t[1] : "")}</div>
                    </div>`
                  )
                  .join("")}</div>`
              : DASH
          }
        </div>
      </details>

      <details class="sub-accordion">
        <summary>
          <span class="sub-summary-title">Elementi distintivi</span>
          <span class="sub-chevron" aria-hidden="true"></span>
        </summary>
        <div class="answer">
          <p>${val(s.differentiator)}</p>
        </div>
      </details>

      <details class="sub-accordion" open id="${esc(id)}-poc">
        <summary>
          <span class="sub-summary-title">Sperimentazione / PoC e indicatori di valutazione</span>
          <span class="sub-chevron" aria-hidden="true"></span>
        </summary>
        <div class="answer">
          <div class="ipo">
            <div class="ibox"><div class="k">Sperimentazione / PoC</div><div class="v">${val(s.poc)}</div></div>
            <div class="ibox"><div class="k">Durata indicativa</div><div class="v">${val(s.duration)}</div></div>
            <div class="ibox"><div class="k">Indicatori</div><div class="v">${val(s.kpi)}</div></div>
          </div>
          <p class="answer-note"><strong>Prerequisito principale:</strong> ${val(s.prereq)}</p>
        </div>
      </details>

      <details class="sub-accordion" open id="${esc(id)}-next">
        <summary>
          <span class="sub-summary-title">Attività successive specifiche</span>
          <span class="sub-chevron" aria-hidden="true"></span>
        </summary>
        <div class="answer">
          <ol class="steps clean-steps">
            <li class="step-row"><span class="step-index">1</span><span class="step-copy">${val(s.next1)}</span></li>
            <li class="step-row"><span class="step-index">2</span><span class="step-copy">${val(s.next2)}</span></li>
            <li class="step-row"><span class="step-index">3</span><span class="step-copy">${val(s.nextOut)}</span></li>
          </ol>
        </div>
      </details>
    </div>
  `;
}
