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

// Chip testuali (certificazioni, premi) con icona opzionale.
function chips(items, icon) {
  const list = (Array.isArray(items) ? items : []).filter(has);
  if (!list.length) return "";
  return `<div class="cred-chips">${list
    .map((x) => `<span class="cred-chip">${icon ? `<span class="cred-ico">${icon}</span>` : ""}${t(x)}</span>`)
    .join("")}</div>`;
}

// Normalizza una voce in {name, logo} (accetta stringa o oggetto).
function asEntity(x) { return typeof x === "string" ? { name: x } : (x || {}); }

// Investitori: chip con mini-logo se disponibile.
function investorsBlock(investors) {
  const list = (Array.isArray(investors) ? investors : []).map(asEntity).filter((x) => has(x.name) || has(x.logo));
  if (!list.length) return "";
  return `<div class="cred-chips">${list
    .map((x) => `<span class="cred-chip">${has(x.logo) ? `<img class="chip-logo" src="${esc(x.logo)}" alt="" loading="lazy">` : `<span class="cred-ico">💼</span>`}${t(x.name)}</span>`)
    .join("")}</div>`;
}

// ---- Approfondimenti (verbali delle call con la startup) -----------------
const OUTCOME_CLASS = {
  "Prosegue": "ok",
  "In attesa di materiali": "wait",
  "Da rivalutare": "hold",
  "Non prosegue": "stop",
};

function ddList(title, items, cls) {
  const list = (Array.isArray(items) ? items : []).filter(has);
  if (!list.length) return "";
  return `<div class="dd-list dd-${cls}">
    <div class="dd-list-k">${esc(title)}</div>
    <ul>${list.map((x) => `<li>${t(x)}</li>`).join("")}</ul>
  </div>`;
}

function ddActions(actions) {
  const list = (Array.isArray(actions) ? actions : []).filter((a) => a && has(a.text));
  if (!list.length) return "";
  return `<div class="dd-list dd-actions">
    <div class="dd-list-k">Impegni presi</div>
    <ul>${list.map((a) => `<li>
      ${has(a.owner) ? `<span class="dd-owner">${t(a.owner)}</span>` : ""}${t(a.text)}${has(a.due) ? ` <span class="dd-due">entro ${t(a.due)}</span>` : ""}
    </li>`).join("")}</ul>
  </div>`;
}

function deepDivesSection(s) {
  const dives = (Array.isArray(s.deepDives) ? s.deepDives : []).filter((d) => d && (has(d.date) || has(d.summary)));
  if (!dives.length) return "";
  // Più recenti in alto.
  const sorted = [...dives].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const cards = sorted.map((d) => {
    const cls = OUTCOME_CLASS[d.outcome] || "hold";
    const dateLabel = has(d.date)
      ? new Date(d.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
      : "";
    const people = [
      has(d.participantsPsn) && Array.isArray(d.participantsPsn) && d.participantsPsn.length
        ? `<div class="dd-people"><span>PSN / WDA</span>${t(d.participantsPsn.join(", "))}</div>` : "",
      has(d.participantsStartup) && Array.isArray(d.participantsStartup) && d.participantsStartup.length
        ? `<div class="dd-people"><span>Startup</span>${t(d.participantsStartup.join(", "))}</div>` : "",
    ].join("");
    const topics = (Array.isArray(d.topics) ? d.topics : []).filter((x) => x && has(x.title));
    return `
      <article class="dd-card">
        <header class="dd-head">
          <div class="dd-meta">
            ${dateLabel ? `<span class="dd-date">${esc(dateLabel)}</span>` : ""}
            ${has(d.type) ? `<span class="dd-type">${t(d.type)}</span>` : ""}
          </div>
          ${has(d.outcome) ? `<span class="dd-outcome dd-out-${cls}">${t(d.outcome)}</span>` : ""}
        </header>
        ${has(d.title) ? `<div class="dd-title">${t(d.title)}</div>` : ""}
        ${people ? `<div class="dd-peoples">${people}</div>` : ""}
        ${has(d.summary) ? `<p class="dd-summary">${t(d.summary)}</p>` : ""}
        ${ddList("Punti di forza emersi", d.strengths, "ok")}
        ${ddList("Rischi e punti aperti", d.risks, "risk")}
        ${ddActions(d.actions)}
        ${topics.length ? `<details class="dd-topics">
          <summary>Temi approfonditi (${topics.length})</summary>
          <dl>${topics.map((x) => `<dt>${t(x.title)}</dt><dd>${t(x.text)}</dd>`).join("")}</dl>
        </details>` : ""}
        ${has(d.nextMeeting) || has(d.recordingUrl) ? `<footer class="dd-foot">
          ${has(d.nextMeeting) ? `<span>Prossimo incontro: <strong>${t(d.nextMeeting)}</strong></span>` : ""}
          ${has(d.recordingUrl) ? `<a href="${esc(d.recordingUrl)}" target="_blank" rel="noopener noreferrer">Appunti e trascrizione</a>` : ""}
        </footer>` : ""}
      </article>`;
  }).join("");
  // Nessun titolo di sezione: la scheda ha già l'etichetta "Approfondimenti".
  return `<div class="dd-wrap">${cards}</div>`;
}

// Richiamo all'ultimo approfondimento, mostrato in Panoramica: senza questo
// il verbale della call resta nascosto dietro una scheda che si può non notare.
function lastDiveTeaser(dives) {
  if (!dives.length) return "";
  const d = [...dives].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
  const cls = OUTCOME_CLASS[d.outcome] || "hold";
  const dateLabel = has(d.date)
    ? new Date(d.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  const counts = [
    (d.strengths || []).filter(has).length ? `${(d.strengths || []).filter(has).length} punti di forza` : "",
    (d.risks || []).filter(has).length ? `${(d.risks || []).filter(has).length} rischi` : "",
    (d.actions || []).filter((a) => a && has(a.text)).length
      ? `${(d.actions || []).filter((a) => a && has(a.text)).length} impegni` : "",
  ].filter(Boolean).join(" · ");
  return `
    <div class="dd-teaser">
      <div class="dd-teaser-head">
        <span class="dd-teaser-k">Ultimo approfondimento${dives.length > 1 ? ` · ${dives.length} call` : ""}</span>
        ${has(d.outcome) ? `<span class="dd-outcome dd-out-${cls}">${t(d.outcome)}</span>` : ""}
      </div>
      ${dateLabel || counts ? `<div class="dd-teaser-meta">${esc(dateLabel)}${dateLabel && counts ? " — " : ""}${esc(counts)}</div>` : ""}
      ${has(d.summary) ? `<p class="dd-teaser-txt">${t(d.summary)}</p>` : ""}
      <button type="button" class="dd-teaser-btn" data-goto-tab="deepdives">Apri il verbale completo →</button>
    </div>`;
}

// Clienti: muro di loghi + chip per quelli senza logo.
function clientsBlock(clients) {
  const list = (Array.isArray(clients) ? clients : []).map(asEntity).filter((x) => has(x.name) || has(x.logo));
  if (!list.length) return "";
  const withLogo = list.filter((x) => has(x.logo));
  const noLogo = list.filter((x) => !has(x.logo));
  let out = "";
  if (withLogo.length) {
    out += `<div class="logo-wall">${withLogo
      .map((x) => `<span class="logo-cell" title="${esc(x.name || "")}"><img src="${esc(x.logo)}" alt="${esc(x.name || "")}" loading="lazy"></span>`)
      .join("")}</div>`;
  }
  if (noLogo.length) {
    out += `<div class="cred-chips">${noLogo.map((x) => `<span class="cred-chip">${t(x.name)}</span>`).join("")}</div>`;
  }
  return out;
}

// Riga anagrafica (label/valore) — vuota → stringa vuota (omessa).
// `wide` = il valore è discorsivo e occupa entrambe le colonne della griglia.
function fact(label, value, s, key, wide) {
  if (!has(value)) return "";
  const cls = wide ? "fact fact-wide" : "fact";
  return `<div class="${cls}"><span class="fact-k">${esc(label)}</span><span class="fact-v">${t(value)}${confirmBadge(s, key)}</span></div>`;
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

// Stato vuoto di un pannello: la struttura a schede è fissa su ogni scheda
// (stesso numero di tab, stesso ordine), così passare da una card all'altra
// non fa "saltare" la barra. Dove manca il contenuto, un messaggio dice cosa
// comparirà lì appena disponibile, invece di far sparire la scheda.
function panelEmpty(text) {
  return `<div class="panel-empty">${esc(text)}</div>`;
}

export function startupPanels(s) {
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
    fact("Fatturato", s.fatturato, s, "fatturato"),
    fact("Dipendenti", s.dipendenti, s, "dipendenti"),
    // Il sito non è ripetuto qui: è già in evidenza nell'intestazione della
    // scheda e sulla tile della board.
    fact("Target di riferimento", s.audience, s, "audience", true),
    fact("Team", s.keyPeople, s, "keyPeople", true),
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
    fact("Caso d'uso PSN", p.usecase, null, null, true),
    fact("Ambito applicativo", s.area, s, "area", true),
  ].join("");
  const psnNote = has(p.note) ? `<div class="note-block">${t(p.note)}</div>` : "";
  const classificazione = (psnFacts || psnNote)
    ? section("Classificazione PSN", (psnFacts ? `<div class="facts">${psnFacts}</div>` : "") + psnNote)
    : "";

  // ---- Certificati e premi -----------------------------------------------
  const certChips = chips(s.certifications, "📜");
  const awardChips = chips(s.awards, "🏅");
  const credInner =
    (certChips ? `<div class="dsub">Certificazioni</div>${certChips}` : "") +
    (awardChips ? `<div class="dsub">Premi e riconoscimenti</div>${awardChips}` : "");
  const credenziali = section("Certificati e premi", credInner);

  // ---- Investitori --------------------------------------------------------
  const investitori = section("Investitori", investorsBlock(s.investors));

  // ---- Clienti ------------------------------------------------------------
  const clienti = section("Clienti", clientsBlock(s.clients));

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
  const comeFunziona = section(
    "Come funziona",
    (flowHtml ? `<div class="dsub">Dai dati al risultato</div>${flowHtml}` : "") +
      (techHtml ? `<div class="dsub">Tecnologie utilizzate</div>${techHtml}` : "")
  );

  // ---- Percorso in PSN (collassabile) ------------------------------------
  const pathFacts = [
    fact("Verifica preliminare consigliata", s.deepen, s, "deepen", true),
    fact("Sperimentazione / PoC", s.poc, s, "poc", true),
    fact("Durata indicativa", s.duration),
    fact("Indicatori di valutazione", s.kpi, null, null, true),
    fact("Prerequisito principale", s.prereq, null, null, true),
  ].join("");
  const steps = [s.next1, s.next2, s.nextOut].filter(has);
  const stepsHtml = steps.length
    ? `<div class="dsub">Prossimi passi</div><ol class="steps-list">${steps
        .map((x) => `<li>${t(x)}</li>`)
        .join("")}</ol>`
    : "";
  const percorso = section(
    "Percorso in PSN",
    (pathFacts ? `<div class="facts">${pathFacts}</div>` : "") + stepsHtml
  );

  // La scheda è divisa in pannelli tematici (schede) invece di un unico
  // scroll: si trova prima l'informazione e si scorre molto meno.
  const wrap = (inner) => `<div class="sdetail">${inner}</div>`;
  const dives = (Array.isArray(s.deepDives) ? s.deepDives : []).filter((d) => d && (has(d.date) || has(d.summary)));
  const teaser = dives.length ? lastDiveTeaser(dives) : "";

  // Le quattro schede sono sempre presenti e nello stesso ordine: dove manca
  // il contenuto compare un messaggio invece della scheda, così la barra non
  // cambia forma spostandosi da una startup all'altra.
  const relazioni = clienti + credenziali + investitori;
  const tecnico = comeFunziona + classificazione + percorso;

  const panels = [
    { id: "overview", label: "Panoramica", html: wrap(lead + sintesi + (teaser ? `<div class="dsection">${teaser}</div>` : "") + soluzione + casiUso) },
    {
      id: "deepdives", label: "Approfondimenti", count: dives.length || undefined,
      html: wrap(dives.length ? deepDivesSection(s) : panelEmpty("Nessun approfondimento ancora. Qui compariranno i verbali delle call fatte con la startup.")),
    },
    {
      id: "relations", label: "Clienti & credenziali",
      html: wrap(relazioni || panelEmpty("Nessuna credenziale raccolta ancora. Qui compariranno clienti, certificazioni, premi e investitori quando disponibili.")),
    },
    {
      id: "tech", label: "Tecnologia & PSN",
      html: wrap(tecnico || panelEmpty("Nessun dettaglio tecnico o di classificazione PSN disponibile ancora.")),
    },
  ];

  return panels;
}

// Compatibilità: markup completo in un unico blocco (usato fuori dalla modale).
export function renderStartupDetail(s) {
  return startupPanels(s).map((p) => p.html).join("");
}
