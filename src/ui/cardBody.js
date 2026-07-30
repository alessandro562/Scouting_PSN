// ===========================================================================
// cardBody.js — dettaglio della scheda startup.
// Architettura a sezioni clusterizzate con progressive disclosure:
//  · Lead (una frase di sintesi)
//  · In sintesi (anagrafica + traction)      [aperta]
//  · La soluzione (descrizione/problema/PA)   [aperta]
//  · Casi d'uso ed elementi distintivi        [aperta]
//  · Classificazione PSN                       [aperta]
//  · Come funziona (input→output, tecnologie)  [collassabile]
//  · Percorso in PSN (PoC, indicatori, next)   [collassabile]
// I campi vuoti vengono OMESSI (niente box "—"). `s` = { ...row.data, psn: row.psn }.
// ===========================================================================

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function has(v) { return v != null && String(v).trim() !== ""; }
function t(v) { return esc(String(v).trim()); }

// Badge "da confermare" per i campi dedotti (chiavi in s.toConfirm).
function confirmBadge(s, key) {
  if (!s || !key) return "";
  const list = Array.isArray(s.toConfirm) ? s.toConfirm : [];
  return list.includes(key)
    ? ` <span class="confirm-badge" title="Dato dedotto, da verificare">da confermare</span>`
    : "";
}

function psn(s) {
  return s.psn || { primary: s.area, secondary: "", innovation: "", usecase: s.poc, note: "" };
}

// Riga anagrafica (label/valore) — vuota → stringa vuota (omessa).
function fact(label, value, s, key) {
  if (!has(value)) return "";
  return `<div class="fact"><span class="fact-k">${esc(label)}</span><span class="fact-v">${t(value)}${confirmBadge(s, key)}</span></div>`;
}
function factLink(label, url, s, key) {
  if (!has(url)) return "";
  const v = `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${t(url)}</a>`;
  return `<div class="fact"><span class="fact-k">${esc(label)}</span><span class="fact-v">${v}${confirmBadge(s, key)}</span></div>`;
}

// Sotto-blocco prosa: titolo + paragrafo (omesso se vuoto).
function prose(title, body, s, key) {
  if (!has(body)) return "";
  return `<div class="prose-block"><h4>${esc(title)}</h4><p>${t(body)}${confirmBadge(s, key)}</p></div>`;
}

// Sezione collassabile con chevron.
function fold(title, inner, { open = false } = {}) {
  if (!inner) return "";
  return `
    <details class="dsection dfold" ${open ? "open" : ""}>
      <summary class="dsection-title">${esc(title)}<span class="dchevron" aria-hidden="true"></span></summary>
      <div class="dbody">${inner}</div>
    </details>`;
}
// Sezione sempre aperta (non collassabile).
function section(title, inner) {
  if (!inner) return "";
  return `<section class="dsection"><div class="dsection-title static">${esc(title)}</div><div class="dbody">${inner}</div></section>`;
}

export function renderStartupDetail(s) {
  const p = psn(s);
  const usecases = (Array.isArray(s.usecases) ? s.usecases : []).filter(has);
  const technologies = (Array.isArray(s.technologies) ? s.technologies : []).filter(
    (x) => (Array.isArray(x) ? has(x[0]) || has(x[1]) : has(x))
  );

  // ---- Lead ---------------------------------------------------------------
  const lead = has(s.what) ? `<p class="detail-lead">${t(s.what)}</p>` : "";

  // ---- In sintesi (anagrafica + traction) --------------------------------
  const facts = [
    fact("Settore", s.sector),
    fact("Sede", s.sede, s, "sede"),
    fact("Fondazione", s.founded, s, "founded"),
    fact("TRL", s.trl, s, "trl"),
    fact("Maturità / Valuation", s.valuation, s, "valuation"),
    factLink("Sito", s.website, s, "website"),
    fact("Target di riferimento", s.audience, s, "audience"),
    fact("Team", s.keyPeople, s, "keyPeople"),
  ].join("");
  const tractionBlock = has(s.traction)
    ? `<div class="callout-soft"><span class="cs-k">Traction &amp; riconoscimenti</span><p>${t(s.traction)}${confirmBadge(s, "traction")}</p></div>`
    : "";
  const sintesi = section("In sintesi", (facts ? `<div class="facts">${facts}</div>` : "") + tractionBlock);

  // ---- La soluzione -------------------------------------------------------
  const solInner =
    prose("Cosa fa", s.description || (has(s.what) ? "" : s.what), s, "description") +
    prose("Il problema che risolve", s.problem, s, "problem") +
    prose("Perché è rilevante per la PA", s.relevance, s, "relevance");
  const soluzione = section("La soluzione", solInner);

  // ---- Casi d'uso ed elementi distintivi ---------------------------------
  const ucInner =
    (usecases.length ? `<ul class="uc-list">${usecases.map((x) => `<li>${t(x)}</li>`).join("")}</ul>` : "") +
    (has(s.differentiator)
      ? `<div class="prose-block"><h4>Elementi distintivi</h4><p>${t(s.differentiator)}${confirmBadge(s, "differentiator")}</p></div>`
      : "");
  const casiUso = section("Casi d'uso ed elementi distintivi", ucInner);

  // ---- Classificazione PSN -----------------------------------------------
  const psnFacts = [
    fact("Verticale PSN primario", p.primary),
    fact("Aree PSN correlate", p.secondary),
    fact("Aree di innovazione", p.innovation),
    fact("Caso d'uso PSN", p.usecase),
    fact("Ambito applicativo", s.area, s, "area"),
  ].join("");
  const psnNote = has(p.note) ? `<div class="note-block">${t(p.note)}</div>` : "";
  const classificazione = (psnFacts || psnNote)
    ? section("Classificazione PSN", (psnFacts ? `<div class="facts">${psnFacts}</div>` : "") + psnNote)
    : "";

  // ---- Come funziona (collassabile) --------------------------------------
  const flowSteps = [
    ["Input", s.input],
    ["Elaborazione", s.processing],
    ["Output", s.output],
  ].filter(([, v]) => has(v));
  const flowHtml = flowSteps.length
    ? `<div class="flow">${flowSteps
        .map(([k, v]) => `<div class="flow-step"><span class="flow-k">${esc(k)}</span><span class="flow-v">${t(v)}</span></div>`)
        .join('<span class="flow-arrow" aria-hidden="true">→</span>')}</div>`
    : "";
  const techHtml = technologies.length
    ? `<ul class="tech-list">${technologies
        .map((x) => {
          const label = Array.isArray(x) ? x[0] : x;
          const desc = Array.isArray(x) ? x[1] : "";
          return `<li><span class="tech-k">${t(label)}</span>${has(desc) ? `<span class="tech-v">${t(desc)}</span>` : ""}</li>`;
        })
        .join("")}</ul>`
    : "";
  const comeFunziona = fold(
    "Come funziona",
    (flowHtml ? `<div class="dsub">Dai dati al risultato</div>${flowHtml}` : "") +
      (techHtml ? `<div class="dsub">Tecnologie utilizzate</div>${techHtml}` : ""),
    { open: false }
  );

  // ---- Percorso in PSN (collassabile) ------------------------------------
  const pathFacts = [
    fact("Verifica preliminare consigliata", s.deepen, s, "deepen"),
    fact("Sperimentazione / PoC", s.poc, s, "poc"),
    fact("Durata indicativa", s.duration),
    fact("Indicatori di valutazione", s.kpi),
    fact("Prerequisito principale", s.prereq),
  ].join("");
  const steps = [s.next1, s.next2, s.nextOut].filter(has);
  const stepsHtml = steps.length
    ? `<div class="dsub">Prossimi passi</div><ol class="steps-list">${steps
        .map((x) => `<li>${t(x)}</li>`)
        .join("")}</ol>`
    : "";
  const percorso = fold(
    "Percorso in PSN",
    (pathFacts ? `<div class="facts">${pathFacts}</div>` : "") + stepsHtml,
    { open: false }
  );

  return `
    <div class="sdetail">
      ${lead}
      ${sintesi}
      ${soluzione}
      ${casiUso}
      ${classificazione}
      ${comeFunziona}
      ${percorso}
    </div>
  `;
}
