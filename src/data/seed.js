// ===========================================================================
// Dati di seed estratti VERBATIM dall'index.html originale.
// Non modificare a mano i record qui sotto: sono la fonte iniziale caricata
// una sola volta in Supabase (poi i dati vivono nel database).
// ===========================================================================

export const startups = [
      {
        id:"iotilize",
        name:"iotilize.me",
        area:"Ambiente / Smart Operations",
        path:"PoC operativo",
        badge:"amber",
        maturity:"Soluzione con componente hardware con piattaforma digitale",
        audience:"Municipalizzate, centri di raccolta, operatori rifiuti, aree logistiche pubbliche",
        what:"Soluzione IoT per il monitoraggio di container e asset ambientali, con rilevazione di posizione, livello di riempimento, movimento e condizioni operative.",
        description:"iotilize.me consente di rendere monitorabili container e asset ambientali normalmente non connessi. Il sistema consente di sapere dove si trova un container, quanto è pieno, se è stato spostato e quando può essere necessario pianificare uno svuotamento. Il valore della soluzione risiede nella combinazione tra sensore fisico, connettività, raccolta dati e supporto alla pianificazione operativa.",
        problem:"Nei processi di raccolta e gestione dei rifiuti, molte decisioni sono ancora basate su stime, telefonate o calendari fissi. Questo può generare ritiri non necessari, saturazione non ottimale dei mezzi, scarsa visibilità sugli asset e difficoltà a misurare efficienza logistica o impatto ambientale.",
        relevance:"Potenzialmente rilevante per centri di raccolta, municipalizzate, aree logistiche pubbliche e gestione dei rifiuti basata su dati aggiornati dal campo.",
        usecases:["Centro di raccolta comunale: monitoraggio dei container e pianificazione svuotamenti in base al riempimento reale.","Municipalizzata: riduzione dei viaggi non necessari e miglioramento della saturazione media dei ritiri.","Aree portuali, ferroviarie o logistiche: localizzazione e controllo di container distribuiti su più siti.","Evoluzioni possibili: applicazioni su caditoie o tombini richiedono verifica tecnica dedicata."],
        technologies:[["Sensori IoT","Dispositivi installati sul container per raccogliere dati fisici."],["Misura riempimento","Stima del livello di riempimento del container, centrale per ottimizzare il ritiro."],["GPS / movimento","Localizzazione e rilevazione di spostamenti o eventi anomali."],["Dashboard cloud","Interfaccia per visualizzare asset, stato, alert e indicatori logistici."]],
        differentiator:"Rispetto a un semplice GPS tracker, la soluzione aggiunge informazioni operative sul riempimento. Rispetto a un gestionale rifiuti, aggiunge dati fisici in tempo reale dal campo. Rispetto alla gestione manuale, può supportare decisioni più misurabili su ritiri, saturazione e logistica.",
        input:"Container, sensori, anagrafica asset, storico ritiri.",
        processing:"Raccolta dati sensori, stima riempimento, alert, analisi dati.",
        output:"Mappa asset, stato riempimento, indicatori logistici, priorità di svuotamento.",
        poc:"20-50 container in centro raccolta o municipalizzata",
        duration:"8-12 settimane",
        prereq:"Asset fisici e piano manutenzione sensori",
        kpi:"Ritiri evitati, saturazione media, riduzione viaggi",
        deepen:"Affidabilità sensori e gestione operativa",
        why:"Il valore dipende da batteria, connettività, manutenzione e accuratezza della stima di riempimento.",
        material:"Scheda tecnica sensori, SLA manutenzione, API, pricing PoC",
        next1:"Selezionare un soggetto gestore dell’asset pubblico o partecipato con un parco container monitorabile.",
        next2:"Definire un perimetro pilota con numero container, tipologia rifiuto, storico ritiri e indicatori logistici.",
        nextOut:"Piano PoC con sensori, responsabilità operative, indicatori e modello di estensione."
      },
      {
        id:"fedro",
        name:"FEDRO",
        area:"Data Quality / Data Intelligence",
        path:"Co-progettazione tecnica",
        badge:"red",
        maturity:"Soluzione early-stage da validare su dataset reale",
        audience:"Enti con dati frammentati, uffici data/innovazione, progetti AI e interoperabilità",
        what:"Soluzione per migliorare qualità e utilizzabilità di dati eterogenei della PA, attraverso acquisizione, normalizzazione, deduplicazione e riconciliazione di fonti diverse.",
        description:"FEDRO si posiziona a monte dei progetti AI e di analisi dati: prima di interrogare, automatizzare o visualizzare dati, contribuisce a renderli più coerenti. La soluzione lavora su fonti eterogenee e mira a riconoscere campi equivalenti, collegare record, ridurre duplicati e costruire una vista più ordinata dei dati disponibili.",
        problem:"Molti enti dispongono di dati utili ma distribuiti in formati non omogenei: PDF, Excel, export gestionali, database legacy, archivi non integrati. Questa frammentazione rende difficile costruire chatbot affidabili, dashboard, controlli automatici, digital twin o modelli AI.",
        relevance:"Rilevante per progetti PA che richiedono dati affidabili prima di analisi dati, chatbot, AI o digital twin.",
        usecases:["Preparazione dati per un assistente AI basato su fonti documentali e dataset strutturati.","Integrazione di fonti eterogenee per un processo amministrativo specifico.","Verifica e riconciliazione di autodichiarazioni o pratiche con dati già presenti negli archivi.","Supporto all’inserimento di nuove sorgenti in un progetto di digital twin o analisi dati."],
        technologies:[["Data ingestion","Acquisizione di file, PDF, database, API o export gestionali."],["Schema matching","Riconoscimento di campi equivalenti con nomi diversi."],["Entity resolution","Individuazione di record che possono riferirsi alla stessa entità."],["Human-in-the-loop","Segnalazione di ambiguità a operatori umani quando la decisione automatica non è sicura."]],
        differentiator:"Non va letto come un semplice ETL. L’interesse della soluzione risiede nella capacità di lavorare sul significato dei dati: riconoscere campi equivalenti, deduplicare entità e migliorare l’affidabilità della base dati prima di costruire servizi digitali a valle.",
        input:"PDF, Excel, CSV, database, API, export gestionali.",
        processing:"Parsing, schema matching, deduplica, normalizzazione, validazione umana.",
        output:"Dataset pulito, mapping fonti, eccezioni e base per analisi dati.",
        poc:"Data quality su 2-4 fonti PA",
        duration:"8-10 settimane",
        prereq:"Dataset reale e casi validati manualmente",
        kpi:"Accuratezza deduplica, errori ridotti, tempo risparmiato",
        deepen:"Readiness prodotto e funzionamento su dati reali",
        why:"Serve verificare che la soluzione sia sufficientemente pronta e non solo progettuale.",
        material:"Demo MVP, esempi prima/dopo, metriche accuratezza, roadmap prodotto",
        next1:"Individuare un processo PA circoscritto con dati frammentati ma disponibili.",
        next2:"Richiedere una demo su dati realistici o anonimizzati, confrontando output automatico e verifica manuale.",
        nextOut:"Valutazione tecnica su maturità, accuratezza, effort umano e possibile percorso di co-progettazione."
      },
      {
        id:"talpa",
        name:"TALPA Inspection",
        area:"Infrastrutture / Ambiente",
        path:"Approfondimento tecnico",
        badge:"purple",
        maturity:"Tecnologia ispettiva da validare rispetto a standard e responsabilità",
        audience:"Gestori infrastrutturali, enti proprietari di asset, utilities, concessionari",
        what:"Soluzione di ispezione tecnica non distruttiva per infrastrutture in cemento armato, finalizzata a rilevare indicatori di rischio corrosione tramite sensori installabili su drone o robot.",
        description:"TALPA Inspection utilizza sensori per rilevare indicatori collegati alla corrosione interna dell’armatura nel cemento armato. Il drone o il robot sono il mezzo di trasporto del sensore; il valore principale è nella misura tecnica e nella possibilità di geolocalizzare i dati su una rappresentazione digitale della struttura.",
        problem:"La corrosione interna del cemento armato può restare invisibile a lungo. Le ispezioni tradizionali possono essere lente, costose, puntuali, dipendenti dall’accesso fisico e difficili da confrontare nel tempo. Una rilevazione più strutturata può supportare la manutenzione preventiva e la definizione delle priorità di intervento.",
        relevance:"Rilevante per manutenzione preventiva di ponti, viadotti, dighe e infrastrutture pubbliche in cemento armato.",
        usecases:["Ispezione di una porzione di ponte o viadotto per mappare aree a rischio corrosione.","Confronto con ispezioni manuali o dati manutentivi già disponibili.","Monitoraggio periodico dello stesso asset per costruire storico digitale.","Applicazione su dighe o infrastrutture difficili da raggiungere, previa verifica operativa."],
        technologies:[["NDT","Controllo non distruttivo: analizza lo stato della struttura senza danneggiarla."],["Sensore contactless","Misura tecnica portata vicino alla superficie da drone o robot."],["Potenziale di corrosione","Indicatore elettrochimico che aiuta a stimare il rischio di corrosione dell’acciaio interno."],["Digital twin","Visualizzazione dei dati ispettivi su una rappresentazione digitale della struttura."]],
        differentiator:"Rispetto a un drone visuale, TALPA non si limita a produrre immagini. Rispetto a un’ispezione manuale puntuale, punta a creare una mappa geolocalizzata del rischio. La differenza va però verificata rispetto a standard tecnici e responsabilità del report.",
        input:"Asset fisico, documentazione struttura, autorizzazioni, storico manutenzione.",
        processing:"Misura non distruttiva, geolocalizzazione dati, visualizzazione su digital twin.",
        output:"Mappa rischio corrosione, report ispezione, priorità di intervento.",
        poc:"Ispezione porzione asset in cemento armato",
        duration:"6-8 settimane + autorizzazioni",
        prereq:"Asset disponibile, accesso e documentazione tecnica",
        kpi:"Qualità mappa corrosione, confronto con ispezioni esistenti",
        deepen:"Standard applicabili e responsabilità del report tecnico",
        why:"Per asset pubblici è essenziale capire validazione, firma tecnica e utilizzo del dato in decisioni manutentive.",
        material:"Validation report, standard applicabili, esempio report, responsabilità firma",
        next1:"Identificare un asset non critico ma rappresentativo per una demo tecnica o ispezione pilota.",
        next2:"Richiedere validazioni tecniche, standard applicabili, esempio report e responsabilità della firma.",
        nextOut:"Scenario di demo tecnica con perimetro, condizioni operative, report atteso e criteri di valutazione."
      },
      {
        id:"surwiz",
        name:"Surwiz",
        area:"Data Intelligence / Citizen Feedback",
        path:"Approfondimento funzionale",
        badge:"green",
        maturity:"Prodotto digitale adatto a demo rapida",
        audience:"Uffici comunicazione, innovazione, qualità servizi, consultazioni pubbliche",
        what:"Soluzione di analisi dei feedback testuali che organizza risposte aperte, survey e contributi non strutturati in temi ricorrenti, priorità e possibili azioni di miglioramento.",
        description:"Surwiz analizza risposte aperte, commenti o feedback testuali e li organizza in cluster tematici, sintesi, priorità e possibili azioni. Il prodotto è utile quando l’ente raccoglie molte risposte qualitative ma fatica a leggerle, classificarle e trasformarle in decisioni operative.",
        problem:"I feedback aperti sono ricchi di informazione ma difficili da analizzare manualmente. Nelle consultazioni pubbliche, nelle survey cittadini o nel monitoraggio dei servizi digitali, il rischio è produrre report descrittivi senza collegamento chiaro tra evidenze e azioni.",
        relevance:"Rilevante per citizen experience, consultazioni pubbliche, analisi feedback su servizi digitali e miglioramento dei processi.",
        usecases:["Analisi di una survey cittadini sulla qualità di un servizio pubblico.","Sintesi di contributi aperti in una consultazione pubblica.","Analisi di commenti su portali, app, servizi digitali o sportelli.","Supporto alla prioritizzazione di interventi sulla base di feedback ricorrenti."],
        technologies:[["NLP","Analisi del linguaggio naturale per leggere e classificare risposte aperte."],["LLM / GenAI","Sintesi, categorizzazione e generazione di insight a partire da testo."],["Clustering tematico","Raggruppamento di risposte simili in temi ricorrenti."],["Action report","Traduzione degli insight in aree di intervento o raccomandazioni operative."]],
        differentiator:"Rispetto a un tool di survey, Surwiz non si limita alla raccolta. Rispetto a una dashboard BI tradizionale, lavora su testo aperto. Rispetto all’analisi manuale, può ridurre i tempi di lettura e aumentare la replicabilità, purché sia garantita la tracciabilità degli output.",
        input:"Risposte aperte, survey, feedback, metadati.",
        processing:"NLP, clustering semantico, sintesi AI, generazione insight.",
        output:"Cluster, report, priorità, action plan.",
        poc:"Survey cittadini o consultazione pubblica",
        duration:"4-6 settimane",
        prereq:"Dataset feedback disponibile",
        kpi:"Qualità cluster, tracciabilità insight, utilità azioni",
        deepen:"Tracciabilità delle raccomandazioni",
        why:"Per contesto pubblico serve poter ricondurre raccomandazioni, cluster e insight ai dati originali.",
        material:"Esempio report, data flow, source traceability, policy uso dati",
        next1:"Selezionare un dataset di feedback o una survey già disponibile, preferibilmente con risposte aperte.",
        next2:"Organizzare una demo su dati campione per verificare cluster, sintesi, raccomandazioni e tracciabilità.",
        nextOut:"Report dimostrativo con temi emersi, priorità, esempi di evidenza e possibili azioni."
      },
      {
        id:"act4city",
        name:"Act4City",
        area:"Servizi al cittadino / GovTech",
        path:"Approfondimento funzionale",
        badge:"green",
        maturity:"Assistente AI verticale per contesto comunale",
        audience:"Comuni, URP, uffici digitali, piccoli e medi enti locali",
        what:"Soluzione di assistenza digitale multicanale per enti locali, basata su fonti informative dell’amministrazione e orientata a richieste ricorrenti dei cittadini.",
        description:"Act4City organizza le informazioni ufficiali di un comune o ente locale in una base informativa interrogabile. Il cittadino può porre domande in linguaggio naturale tramite canali digitali o vocali e ricevere risposte basate sulle fonti disponibili.",
        problem:"Molti cittadini faticano a trovare informazioni su siti comunali, moduli, orari, pratiche, ordinanze, ZTL, parcheggi o servizi locali. Gli uffici ricevono richieste ripetitive che assorbono tempo e riducono la capacità di gestire casi più complessi.",
        relevance:"Rilevante per URP digitale, piccoli e medi comuni, accesso ai servizi e riduzione delle richieste informative ripetitive.",
        usecases:["Assistente per domande frequenti su anagrafe, tributi, ZTL, rifiuti o trasporti.","Supporto multicanale fuori dagli orari degli uffici.","Dashboard sulle domande più frequenti per individuare lacune informative del sito comunale.","Eventuale supporto a comunicazioni e servizi partecipativi, previa verifica dei moduli disponibili."],
        technologies:[["Knowledge base","Archivio strutturato delle fonti ufficiali dell’ente."],["RAG","Recupero di informazioni dalle fonti per generare risposte più controllate."],["Omnicanalità","Possibile uso su web, WhatsApp, Telegram, telefono o altri canali."],["Analytics","Dashboard per analizzare domande ricorrenti e bisogni informativi."]],
        differentiator:"Rispetto a FAQ statiche, consente interazione in linguaggio naturale. Rispetto a chatbot generici, è orientata a processi e fonti comunali. Rispetto all’URP tradizionale, può contribuire a ridurre le richieste ripetitive e aumentare la disponibilità del servizio.",
        input:"Sito comunale, FAQ, ordinanze, modulistica, regole di escalation.",
        processing:"Ingestion fonti, knowledge base, retrieval, generazione risposta.",
        output:"Risposte ai cittadini, dashboard domande, insight su lacune informative.",
        poc:"Assistente URP su 3-5 ambiti",
        duration:"8-12 settimane",
        prereq:"Knowledge base comunale validata",
        kpi:"Accuratezza risposte, fonte corretta, escalation adeguata",
        deepen:"Governance delle risposte e aggiornamento fonti",
        why:"La qualità della risposta dipende da fonti aggiornate, fallback, log ed escalation verso operatori.",
        material:"Demo live, data flow conversazioni, guardrail, escalation, policy retention",
        next1:"Identificare un comune o un set di fonti pubbliche su 3-5 ambiti informativi prioritari.",
        next2:"Verificare in demo la qualità delle risposte, la citazione delle fonti, il fallback e l’escalation.",
        nextOut:"Schema PoC con ambiti informativi, canali, regole di escalation e metriche di accuratezza."
      },
      {
        id:"ask4pa",
        name:"Heres / ASK4PA",
        area:"Workflow PA / Help Desk",
        path:"Approfondimento funzionale",
        badge:"green",
        maturity:"Piattaforma modulare di agenti e workflow",
        audience:"PA con volumi elevati di richieste, URP evoluti, help desk, servizi operativi",
        what:"Piattaforma modulare per la gestione assistita delle richieste alla PA, con funzionalità di orientamento, classificazione, apertura ticket, smistamento e automazione dei flussi operativi.",
        description:"ASK4PA non si limita alla risposta informativa. La piattaforma è orientata a interpretare richieste, orientare l’utente, aprire ticket, smistare verso l’ufficio corretto e attivare flussi operativi. È quindi più vicina a un livello operativo di automazione dei processi di front-office.",
        problem:"Molte richieste alla PA arrivano da canali diversi e richiedono classificazione, raccolta di informazioni, apertura ticket, routing e monitoraggio. Se questi passaggi restano manuali, aumentano tempi, carico sugli operatori e rischio di smistamenti errati.",
        relevance:"Rilevante quando l’obiettivo non è solo rispondere, ma gestire richieste, ticket, routing e processi operativi.",
        usecases:["Orientamento dell’utente verso il servizio corretto.","Apertura automatica o assistita di ticket strutturati.","Smistamento delle richieste agli uffici competenti.","Voice agent per gestire richieste telefoniche ad alto volume.","Workflow verticali su servizi specifici, previa verifica dei moduli già disponibili."],
        technologies:[["Agenti AI","Moduli specializzati che interpretano richieste e attivano azioni."],["Orchestrazione","Coordinamento tra agenti, knowledge base e workflow."],["Workflow automation","Automazione di passaggi come apertura ticket, routing, comunicazioni o aggiornamenti."],["RAG dedicato","Recupero di informazioni da fonti specifiche per ciascun modulo o servizio."]],
        differentiator:"Rispetto a un chatbot informativo, ASK4PA lavora sul processo. Rispetto a un CRM o sistema di ticketing tradizionale, aggiunge interfaccia conversazionale e automazione dei flussi. La distinzione importante è tra moduli pronti, configurabili e sviluppo custom.",
        input:"Knowledge base, processi, categorie ticket, regole di routing.",
        processing:"Intent recognition, agent orchestration, workflow automation, ticketing.",
        output:"Risposte, ticket strutturati, routing, dashboard indicatori.",
        poc:"Orienta + Ticket su un servizio specifico",
        duration:"8-12 settimane",
        prereq:"Workflow e categorie ticket definiti",
        kpi:"Ticket corretti, routing corretto, riduzione lavoro manuale",
        deepen:"Moduli pronti, integrazioni e procurement",
        why:"È importante distinguere funzionalità già disponibili, configurabili, custom o in roadmap.",
        material:"Scheda moduli, scheda MePA, architettura, export workflow, pricing modulare",
        next1:"Selezionare un processo pubblico con richieste ripetitive e regole di routing chiare.",
        next2:"Verificare in demo i moduli Orienta e Ticket, distinguendo funzionalità pronte, configurabili e custom.",
        nextOut:"Mappa workflow, requisiti di integrazione, metriche di ticketing e proposta di PoC modulare."
      },
      {
        id:"civimatica",
        name:"Civimatica",
        area:"Smart City / Mobilità",
        path:"PoC operativo",
        badge:"amber",
        maturity:"Soluzione edge AI da validare in contesto urbano",
        audience:"Comuni, mobility manager, gestori TPL, smart city office",
        what:"Soluzione con dispositivi di elaborazione locale per trasformare dati visivi e sensoriali raccolti in ambiente urbano in metadati utili alla gestione di traffico, parcheggi e anomalie.",
        description:"Civimatica utilizza dispositivi fisici con capacità di elaborazione locale per osservare lo spazio urbano e trasformare immagini o segnali in informazioni strutturate. L’obiettivo è produrre metadati utili su traffico, parcheggi, code, deviazioni o anomalie senza dipendere solo da GPS o telecamere passive.",
        problem:"Le città spesso dispongono di dati incompleti sulla mobilità: GPS aggregati, telecamere non analizzate, sensori puntuali e sistemi non integrati. Questo limita la capacità di ottimizzare semafori, parcheggi, percorsi TPL o interventi in caso di anomalie.",
        relevance:"Rilevante per smart mobility, digital twin urbano, gestione parcheggi, semafori e monitoraggio di aree critiche.",
        usecases:["Rilevazione disponibilità parcheggi in un’area urbana delimitata.","Analisi traffico su un incrocio o corridoio bus.","Supporto a stime ETA del trasporto pubblico tramite dati di contesto.","Rilevazione di anomalie o deviazioni, previa verifica tecnica e autorizzativa."],
        technologies:[["Computer vision","Interpretazione automatica di immagini per rilevare veicoli, parcheggi, code o anomalie."],["Edge AI","Elaborazione direttamente sul dispositivo, prima dell’invio al cloud."],["Metadata extraction","Trasformazione di immagini in dati strutturati come conteggi, occupazione o eventi."],["Digital twin urbano","Visualizzazione e, se disponibile, simulazione dello stato urbano su una piattaforma digitale."]],
        differentiator:"Rispetto a Google Maps o Waze, può fornire dati fisici puntuali su contesto urbano. Rispetto a telecamere tradizionali, mira a generare metadati utilizzabili. Il punto centrale di verifica riguarda il trattamento delle immagini e la conformità privacy.",
        input:"Device, area urbana, immagini/sensori, autorizzazioni.",
        processing:"Computer vision on-device, estrazione metadati, privacy filtering.",
        output:"Metadati traffico/parcheggi, dashboard, digital twin, insight operativi.",
        poc:"Area urbana limitata: incrocio, tratta bus o parcheggio",
        duration:"10-12 settimane dopo assessment privacy",
        prereq:"Data flow, autorizzazioni e piano installazione",
        kpi:"Accuratezza metadati, stabilità device, conformità privacy",
        deepen:"Trattamento immagini e conformità privacy",
        why:"Prima di qualunque sperimentazione è necessario chiarire se immagini o video vengono salvati, trasmessi o trasformati solo in metadati.",
        material:"Data flow immagini/metadati, DPIA template, accuracy benchmark, requisiti installazione",
        next1:"Individuare un’area urbana delimitata e un casi d’uso misurabile, per esempio parcheggi o incrocio critico.",
        next2:"Verificare data flow, autorizzazioni, trattamento immagini, requisiti device e benchmark di accuratezza.",
        nextOut:"Piano PoC urbano con perimetro, dati trattati, metriche, autorizzazioni e criteri privacy."
      }
    ];

export const glossary = [
      {term:"IoT", text:"Oggetti fisici collegati a una rete dati. Nel caso analizzato, container o device urbani che inviano dati operativi a una piattaforma.", refs:"iotilize.me, Civimatica"},
      {term:"NDT", text:"Controllo non distruttivo. Tecnica che analizza materiali o strutture senza danneggiarli, utile per ispezioni infrastrutturali.", refs:"TALPA"},
      {term:"RAG", text:"Tecnica con cui un assistente AI risponde recuperando informazioni da fonti documentali ufficiali, invece di basarsi solo sul modello linguistico.", refs:"Act4City, ASK4PA"},
      {term:"Edge AI", text:"Elaborazione AI direttamente sul dispositivo fisico. Può ridurre latenza e trasferimento dati, ma richiede verifica del data flow.", refs:"Civimatica"},
      {term:"Digital twin", text:"Rappresentazione digitale di un asset fisico o di un ambiente urbano, alimentata da dati reali o simulativi.", refs:"TALPA, Civimatica"},
      {term:"Entity resolution", text:"Tecnica per capire se record diversi rappresentano la stessa entità, come una persona, una pratica o un asset.", refs:"FEDRO"},
      {term:"Workflow automation", text:"Automazione di passaggi operativi tra sistemi: classificare una richiesta, aprire un ticket, smistare, inviare comunicazioni.", refs:"ASK4PA"}
    ];

export const psnTaxonomy = {
      iotilize: {
        primary: "Smart Cities",
        secondary: "Ambiente · Sostenibilità",
        innovation: "AI · Data · Edge/IoT",
        usecase: "Gestione ottimizzata dei rifiuti e monitoraggio di asset ambientali",
        note: "Rientra nel verticale Smart Cities per la digitalizzazione di asset urbani e ambientali; l’area Ambiente/Sostenibilità è rilevante come lettura complementare."
      },
      fedro: {
        primary: "Data Intelligence",
        secondary: "Legal & Procurement · FinOps",
        innovation: "AI · Data",
        usecase: "Data quality, smart data integration e normalizzazione di fonti eterogenee",
        note: "Rientra nel verticale Data Intelligence perché abilita qualità, riconciliazione e usabilità del dato prima di analytics, AI o automazioni."
      },
      talpa: {
        primary: "Ambiente",
        secondary: "Smart Cities · Sicurezza infrastrutturale",
        innovation: "AI · Data · Edge",
        usecase: "Monitoraggio infrastrutturale e prioritizzazione della manutenzione",
        note: "Rientra nel verticale Ambiente per il monitoraggio preventivo di infrastrutture fisiche; la sicurezza infrastrutturale è il caso d’uso operativo più specifico."
      },
      surwiz: {
        primary: "Data Intelligence",
        secondary: "Help Desk · FinOps",
        innovation: "AI · Data",
        usecase: "Analisi di feedback non strutturati e generazione di piani d’azione",
        note: "Rientra nel verticale Data Intelligence perché trasforma dati testuali e feedback in priorità operative e raccomandazioni leggibili."
      },
      act4city: {
        primary: "Help Desk",
        secondary: "Smart Cities · Data Intelligence",
        innovation: "AI · Data",
        usecase: "Assistenza digitale multicanale per servizi comunali e richieste ricorrenti",
        note: "Rientra nel verticale Help Desk perché supporta l’interazione cittadino-ente su canali digitali e vocali."
      },
      ask4pa: {
        primary: "Help Desk",
        secondary: "AI · Open Source · Sanità",
        innovation: "AI · Open Source · Data",
        usecase: "Gestione assistita di richieste, ticket, orientamento e workflow PA",
        note: "Rientra nel verticale Help Desk con un’estensione più ampia su workflow, agenti AI e componenti open source."
      },
      civimatica: {
        primary: "Smart Cities",
        secondary: "Mobilità urbana · Edge AI",
        innovation: "AI · Edge · Data",
        usecase: "Monitoraggio urbano, traffico, parcheggi, deviazioni e anomalie",
        note: "Rientra nel verticale Smart Cities per la lettura dello spazio urbano tramite dispositivi edge e generazione di metadati operativi."
      }
    };

// ---------------------------------------------------------------------------
// Mappe di seed aggiuntive (definiscono lo stato iniziale del CRM).
// ---------------------------------------------------------------------------

// Colonne/fasi iniziali della board (poi modificabili dall'interfaccia).
export const SEED_STAGES = ["In analisi", "Approfondimento PSN", "PoC", "Archiviate"];

// Settore/categoria per le startup esistenti (nuovo campo del CRM).
// Le nuove startup (cybersecurity, ecc.) si aggiungono dall'interfaccia.
export const SLUG_SECTOR = {
  iotilize: "IoT/Edge",
  fedro: "Data",
  talpa: "IoT/Edge",
  surwiz: "AI",
  act4city: "GovTech",
  ask4pa: "GovTech",
  civimatica: "IoT/Edge",
};

// Elenco di settori suggeriti per il form (l'utente può comunque digitarne altri).
export const SECTORS = ["AI", "Cybersecurity", "GovTech", "IoT/Edge", "Data", "FinTech", "HealthTech", "Altro"];

// Mappa dal vecchio campo `path` (percorso suggerito) alla fase iniziale della board.
export const PATH_STAGE = {
  "PoC operativo": "PoC",
  "Approfondimento funzionale": "Approfondimento PSN",
  "Approfondimento tecnico": "Approfondimento PSN",
  "Co-progettazione tecnica": "Approfondimento PSN",
};

// Fase di default per startup senza mapping esplicito.
export const DEFAULT_STAGE = "In analisi";
