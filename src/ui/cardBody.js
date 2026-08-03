// ===========================================================================
// cardBody.js — dettaglio della scheda startup.
//
// Architettura: in cima UN SOLO paragrafo (`intro`) che risponde a quattro
// domande — che cos'è, che cosa offre, che cosa fa in pratica, per chi. Tutto
// il resto vive dentro un pettine di blocchi collassabili CHIUSI di default,
// costruiti tutti dallo stesso componente `acc()`: ordine, numero ed etichette
// non cambiano mai da una startup all'altra, così spostarsi fra una scheda
// ricca e una povera non fa "saltare" la struttura.
//
// I blocchi senza dati non spariscono: restano come riga spenta non apribile
// (`accEmpty`), perché una struttura che cambia forma è più disorientante di
// una riga vuota. Se però un intero pannello è vuoto si stampa un solo
// messaggio, non un cimitero di righe spente.
//
// `s` = { ...row.data, psn: row.psn }.
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

// Finanziamenti: una card per round, dal più recente. È l'unico punto della
// scheda dove i numeri hanno il permesso di essere grandi — serve a confrontare
// due startup in due secondi, cosa impossibile quando l'importo è sepolto in
// una frase di prosa dentro `valuation`.
function fundingBlock(s) {
  const rounds = (Array.isArray(s.funding) ? s.funding : []).filter((r) => r && (has(r.tipo) || has(r.importo)));
  const chipsInv = investorsBlock(s.investors);

  if (!rounds.length) {
    // Nessun round strutturato: si ripiega su valuation + chip investitori.
    const v = has(s.valuation) ? `<p class="acc-p">${t(s.valuation)}${confirmBadge(s, "valuation")}</p>` : "";
    return v + chipsInv;
  }

  const cards = rounds.map((r) => `
    <div class="round">
      <div class="round-top">
        ${has(r.tipo) ? `<span class="round-stage">${t(r.tipo)}</span>` : ""}
        ${has(r.importo) ? `<span class="round-amount">${t(r.importo)}</span>` : ""}
        ${has(r.data) && r.data !== "—" ? `<span class="round-date">${t(r.data)}</span>` : ""}
      </div>
      ${has(r.lead) && r.lead !== "—" ? `<div class="round-lead"><span class="round-k">Capofila</span>${t(r.lead)}</div>` : ""}
      ${Array.isArray(r.investitori) && r.investitori.filter(has).length
        ? `<div class="round-inv">${r.investitori.filter(has).map((x) => `<span class="cred-chip">${t(x)}</span>`).join("")}</div>` : ""}
      ${has(r.nota) ? `<p class="round-note">${t(r.nota)}</p>` : ""}
    </div>`).join("");

  const totale = has(s.totalRaised)
    ? `<div class="round-total"><span class="round-k">Totale raccolto</span><strong>${t(s.totalRaised)}</strong></div>`
    : "";
  return `<div class="rounds">${cards}</div>${totale}`;
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

// ---- Componente accordion condiviso --------------------------------------
// È l'unico modo in cui questa scheda mostra un blocco di dettaglio. Usarlo
// ovunque è la ragione per cui una card ricca e una povera si assomigliano:
// l'omogeneità è una proprietà del codice, non della disciplina redazionale.
// `meta` è un conteggio o uno scalare corto mostrato a destra, che permette di
// leggere la sostanza del blocco senza aprirlo.
function acc(label, meta, inner) {
  if (!inner) return accEmpty(label);
  return `
    <details class="acc">
      <summary class="acc-head">
        <span class="acc-chev" aria-hidden="true"></span>
        <span class="acc-title">${esc(label)}</span>
        ${meta ? `<span class="acc-meta">${esc(meta)}</span>` : ""}
      </summary>
      <div class="acc-body">${inner}</div>
    </details>`;
}

// Riga spenta: stessa altezza e stesso allineamento di un blocco pieno, ma non
// è un <details> — non promette un contenuto che non c'è, quindi non delude.
function accEmpty(label) {
  return `
    <div class="acc acc-row is-empty">
      <span class="acc-dash" aria-hidden="true"></span>
      <span class="acc-title">${esc(label)}</span>
      <span class="acc-meta">da raccogliere</span>
    </div>`;
}

// Sotto-titolo interno a un blocco (micro-caps).
function sub(title) { return `<div class="dsub">${esc(title)}</div>`; }

// Stato vuoto di un pannello: la struttura a schede è fissa su ogni scheda
// (stesso numero di tab, stesso ordine), così passare da una card all'altra
// non fa "saltare" la barra. Dove manca il contenuto, un messaggio dice cosa
// comparirà lì appena disponibile, invece di far sparire la scheda.
function panelEmpty(text) {
  return `<div class="panel-empty">${esc(text)}</div>`;
}

// Un pannello: se ha almeno un blocco pieno stampa TUTTI i blocchi in ordine
// (l'omogeneità serve quando c'è qualcosa da confrontare); se sono tutti vuoti
// stampa un solo messaggio, per non aprire una scheda su un cimitero di righe.
function panel(blocks, emptyText) {
  const pieni = blocks.filter((b) => !b.includes("is-empty"));
  const inner = pieni.length ? blocks.join("") : panelEmpty(emptyText);
  return `<div class="sdetail">${inner}</div>`;
}

export function startupPanels(s) {
  const p = psn(s);
  const usecases = (Array.isArray(s.usecases) ? s.usecases : []).filter(has);
  const technologies = (Array.isArray(s.technologies) ? s.technologies : []).filter(
    (x) => (Array.isArray(x) ? has(x[0]) || has(x[1]) : has(x))
  );
  const dives = (Array.isArray(s.deepDives) ? s.deepDives : []).filter((d) => d && (has(d.date) || has(d.summary)));

  // ---- Apertura: l'unica cosa esposta ------------------------------------
  // `intro` è scritto apposta per rispondere alle quattro domande. `what` resta
  // come ripiego per i record non ancora aggiornati, ma non compare mai
  // insieme: era proprio la sua sovrapposizione con `description` (50% medio,
  // 14 startup su 23 oltre il 50%) a creare il muro di testo.
  const introTxt = has(s.intro) ? s.intro : s.what;
  const lead = has(introTxt) ? `<p class="detail-lead">${t(introTxt)}</p>` : "";

  // ================= Panoramica =================
  const anagrafica = [
    fact("Settore", s.sector),
    fact("Sede", s.sede, s, "sede"),
    fact("Fondazione", s.founded, s, "founded"),
    fact("TRL", s.trl, s, "trl"),
    fact("Dipendenti", s.dipendenti, s, "dipendenti"),
    fact("Fatturato", s.fatturato, s, "fatturato"),
    fact("Ambito applicativo", s.area, s, "area", true),
    fact("Team", s.keyPeople, s, "keyPeople", true),
  ].join("");
  const bDati = acc("Dati dell'azienda",
    [s.sede, s.founded].filter(has).join(" · "),
    anagrafica ? `<div class="facts">${anagrafica}</div>` : "");

  const problemaInner =
    prose("Il problema", s.problem, s, "problem") +
    (has(s.relevance) ? `<div class="note-block">${t(s.relevance)}</div>` : "");
  const bProblema = acc("Problema e rilevanza per la PA", has(s.relevance) ? "PA" : "", problemaInner);

  const bCasi = acc("Casi d'uso concreti", usecases.length ? String(usecases.length) : "",
    usecases.length ? `<ul class="uc-list">${usecases.map((x) => `<li>${t(x)}</li>`).join("")}</ul>` : "");

  const bDistingue = acc("Che cosa la distingue", "",
    has(s.differentiator) ? `<p class="acc-p">${t(s.differentiator)}${confirmBadge(s, "differentiator")}</p>` : "");

  // Descrizione estesa: tenuta come ultimo blocco perché l'apertura ne porta
  // già la sostanza. Serve a chi vuole il testo integrale, non a chi scorre.
  const bDescrizione = acc("Descrizione estesa", "",
    has(s.description) ? `<p class="acc-p">${t(s.description)}${confirmBadge(s, "description")}</p>` : "");

  // ================= Tecnologia e PSN =================
  const flowSteps = [["Input", s.input], ["Elaborazione", s.processing], ["Output", s.output]]
    .filter(([, v]) => has(v));
  const bFlusso = acc("Come funziona, passo per passo",
    flowSteps.length ? `${flowSteps.length} passaggi` : "",
    flowSteps.length
      ? `<div class="flowrail">${flowSteps
          .map(([k, v]) => `<div class="flowrail-step"><span class="flowrail-k">${esc(k)}</span><span class="flowrail-v">${t(v)}</span></div>`)
          .join("")}</div>`
      : "");

  const bTecnologie = acc("Tecnologie e componenti",
    technologies.length ? String(technologies.length) : "",
    technologies.length
      ? `<dl class="tech-dl">${technologies
          .map((x) => {
            const label = Array.isArray(x) ? x[0] : x;
            const desc = Array.isArray(x) ? x[1] : "";
            return `<div class="tech-item"><dt>${t(label)}</dt>${has(desc) ? `<dd>${t(desc)}</dd>` : ""}</div>`;
          })
          .join("")}</dl>`
      : "");

  const psnFacts = [
    fact("Aree PSN correlate", p.secondary),
    fact("Aree di innovazione", p.innovation),
    fact("Caso d'uso PSN", p.usecase, null, null, true),
  ].join("");
  const bPsn = acc("Classificazione PSN", has(p.primary) ? p.primary : "",
    (has(p.primary) ? `<span class="psn-pill">${t(p.primary)}</span>` : "") +
      (psnFacts ? `<div class="facts">${psnFacts}</div>` : "") +
      (has(p.note) ? `<div class="note-block">${t(p.note)}</div>` : ""));

  const pocFacts = [
    fact("Perimetro proposto", s.poc, s, "poc", true),
    fact("Durata indicativa", s.duration),
    fact("Prerequisito principale", s.prereq, null, null, true),
    fact("Indicatori di valutazione", s.kpi, null, null, true),
  ].join("");
  const bPoc = acc("Ipotesi di sperimentazione (PoC)", has(s.duration) ? s.duration : "",
    pocFacts ? `<div class="facts">${pocFacts}</div>` : "");

  // `deepen` e `why` si sovrappongono al 44% in media (12 startup su 23 oltre
  // il 50%): messi in gerarchia oggetto/motivo la ridondanza si dissolve senza
  // riscrivere i testi.
  const bVerifica = acc("Da verificare prima di procedere", "",
    has(s.deepen) || has(s.why)
      ? `<div class="checkcard">
           ${has(s.deepen) ? `<div class="checkcard-k">${t(s.deepen)}</div>` : ""}
           ${has(s.why) ? `<p class="checkcard-v">${t(s.why)}</p>` : ""}
         </div>` +
        (has(s.material) ? sub("Materiali da chiedere") + `<p class="acc-p">${t(s.material)}</p>` : "")
      : "");

  const steps = [s.next1, s.next2, s.nextOut].filter(has);
  const bProssimi = acc("Prossimi passi", steps.length ? `${steps.length} passi` : "",
    steps.length ? `<ol class="steps-list">${steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol>` : "");

  // ================= Riconoscimenti e certificazioni =================
  const certs = (Array.isArray(s.certifications) ? s.certifications : []).filter(has);
  const awards = (Array.isArray(s.awards) ? s.awards : []).filter(has);
  const bCert = acc("Certificazioni e conformità", certs.length ? String(certs.length) : "",
    certs.length ? chips(certs, "📜") : "");
  const bPremi = acc("Premi e riconoscimenti", awards.length ? String(awards.length) : "",
    awards.length ? `<ul class="award-list">${awards.map((x) => `<li>${t(x)}</li>`).join("")}</ul>` : "");

  // ================= Clienti e investitori =================
  const clients = (Array.isArray(s.clients) ? s.clients : []).map(asEntity).filter((x) => has(x.name) || has(x.logo));
  const bClienti = acc("Clienti e referenze", clients.length ? String(clients.length) : "",
    clientsBlock(s.clients));

  const bInvest = acc("Investitori e round di finanziamento",
    has(s.totalRaised) ? s.totalRaised : "",
    fundingBlock(s));

  const bTrazione = acc("Trazione", "",
    has(s.traction) ? `<p class="acc-p">${t(s.traction)}${confirmBadge(s, "traction")}</p>` : "");

  // ---- Pannelli: ordine ed etichette identici su ogni startup -------------
  return [
    {
      id: "overview", label: "Panoramica",
      html: `<div class="sdetail">${lead}${[bDati, bProblema, bCasi, bDistingue, bDescrizione].join("")}</div>`,
    },
    {
      id: "deepdives", label: "Approfondimenti", count: dives.length || undefined,
      html: `<div class="sdetail">${
        dives.length ? deepDivesSection(s)
                     : panelEmpty("Nessun approfondimento ancora. Qui compariranno i verbali delle call fatte con la startup.")
      }</div>`,
    },
    {
      id: "tech", label: "Tecnologia e PSN",
      html: panel([bFlusso, bTecnologie, bPsn, bPoc, bVerifica, bProssimi],
        "Nessun dettaglio tecnico o di classificazione PSN disponibile ancora."),
    },
    {
      id: "credentials", label: "Riconoscimenti e certificazioni",
      html: panel([bCert, bPremi],
        "Nessun riconoscimento registrato. Qui compariranno certificazioni, conformità normative, premi e programmi di accelerazione."),
    },
    {
      id: "market", label: "Clienti e investitori",
      html: panel([bClienti, bInvest, bTrazione],
        "Nessun dato di mercato raccolto. Qui compariranno clienti e referenze, round di finanziamento con importi e investitori, e le metriche di trazione."),
    },
  ];
}

// Compatibilità: markup completo in un unico blocco (usato fuori dalla modale).
export function renderStartupDetail(s) {
  return startupPanels(s).map((p) => p.html).join("");
}
