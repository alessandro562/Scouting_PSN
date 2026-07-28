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
      },
      {
        id:"cyberevolution",
        name:"Cyberevolution",
        area:"Cybersecurity",
        what:"Protezione cyber per impianti industriali tramite hardware dedicato.",
        description:"Cyber Evolution sviluppa soluzioni avanzate di cybersecurity industriale che combinano componenti hardware dedicati e algoritmi di intelligenza artificiale per proteggere infrastrutture critiche, reti OT/IT e impianti produttivi da minacce informatiche evolute.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Intelligenza artificiale · Hardware dedicato",
        differentiator:"Cyber Evolution offre LECS, una piattaforma plug & play per la protezione continua di reti industriali e sistemi critici, combinando hardware dedicato e monitoraggio intelligente; facilmente integrabile nei sistemi esistenti.",
        usecases:[
          "Protezione attiva e continuativa delle reti industriali",
          "Isolamento avanzato di dispositivi critici",
          "Integrazione rapida in ecosistemi industriali esistenti"
        ],
        technologies:[
          ["AI predittiva","Rilevamento delle minacce in tempo reale"],
          ["Air-Gap energetico","Sistemi di isolamento fisico dei dispositivi critici"],
          ["Notarizzazione su blockchain","Integrità e tracciabilità dei log"],
          ["Appliance industriale","Dispositivo di sicurezza pronto all’installazione"]
        ],
        poc:"Soluzione (LECS) in fase avanzata di industrializzazione, stadio maturo orientato a roll-out e scalabilità. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Maturità industriale, referenze e adattabilità al contesto PSN.",
        why:"Verificare referenze su reti OT/IT della PA, requisiti d’installazione dell’appliance e modello di gestione/manutenzione.",
        sede:"Ascoli Piceno",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Marco Camerinisi, Roberto Camerinisi"
      },
      {
        id:"truescreen",
        name:"Truescreen",
        area:"Cybersecurity & Legal-Tech",
        what:"Certificazione legale e immodificabile di documenti e contenuti digitali.",
        description:"TrueScreen è una piattaforma di cybersecurity e legal-tech specializzata nell’acquisizione, certificazione e gestione di dati digitali con valore legale e probatorio. La soluzione consente di garantire autenticità, integrità e immodificabilità di contenuti digitali.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Piattaforma data authenticity",
        differentiator:"Piattaforma per l’acquisizione forense e la certificazione di contenuti digitali (immagini, video, documenti, file), a supporto della gestione di evidenze digitali e della riduzione del rischio di contestazioni.",
        usecases:[
          "Acquisizione e certificazione forense di contenuti digitali",
          "Firma digitale e notarizzazione dei documenti",
          "Gestione sicura di dati con valore probatorio"
        ],
        technologies:[
          ["Metodologia forense brevettata","Acquisizione sicura e verificabile di dati digitali"],
          ["Signing & notarizzazione","Firma e notarizzazione digitale cross-platform"],
          ["API di integrazione","Integrazione con sistemi e tool di processo"]
        ],
        poc:"Soluzione operativa e adottata in contesti reali ad alti standard di affidabilità e sicurezza; fase avanzata di maturità. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Valore probatorio, conformità normativa e casi d’uso nella PA.",
        why:"Verificare il valore legale/probatorio riconosciuto, la conformità e i casi d’uso applicabili nei procedimenti della PA.",
        sede:"Bologna",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Fabio Ugolini, Leonardo Baruzzi"
      },
      {
        id:"cylock",
        name:"CyLock",
        area:"Cybersecurity",
        what:"Identificazione automatica di vulnerabilità e rischi cyber esterni.",
        description:"CyLock è una piattaforma di cybersecurity AI-based, progettata per supportare le organizzazioni nella gestione proattiva del rischio cyber. Automatizza l’identificazione di vulnerabilità e superfici di attacco, fornendo indicazioni operative per la sicurezza IT.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Intelligenza artificiale e machine learning",
        differentiator:"Piattaforma AI-driven che automatizza analisi delle vulnerabilità e valutazione del rischio informatico, offrendo una visione continua e aggiornata dell’esposizione al rischio.",
        usecases:[
          "Analisi automatizzata delle vulnerabilità IT",
          "Supporto continuo alla valutazione del rischio cyber",
          "Reportistica strutturata per decisioni operative"
        ],
        technologies:[
          ["AI & ML","Vulnerability assessment e risk scoring"],
          ["OSINT & Dark Web Monitoring","Analisi delle superfici di attacco"],
          ["Automazione test","Esecuzione automatizzata dei test di sicurezza IT"]
        ],
        poc:"Soluzione operativa e già utilizzata in contesti reali di analisi del rischio cyber e sicurezza IT; fase avanzata di maturità. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Accuratezza dell’analisi, copertura e integrazione nei processi PA.",
        why:"Verificare accuratezza/copertura del vulnerability assessment, gestione dei falsi positivi e integrazione con i processi di sicurezza della PA.",
        sede:"Roma",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Diego Padovan, Paolo Antoniani"
      },
      {
        id:"resilientx",
        name:"ResilientX",
        area:"Cybersecurity",
        what:"Monitoraggio continuo dei rischi cyber provenienti dall’esterno.",
        description:"ResilientX è una piattaforma di cybersecurity specializzata nella gestione del rischio cyber esterno. La soluzione combina moduli per il monitoraggio continuo degli asset esposti, l’identificazione di vulnerabilità e la gestione automatizzata dei rischi.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · EASM & threat intelligence",
        differentiator:"Piattaforma SaaS per la gestione proattiva del rischio cyber su asset digitali esposti, punti di attacco esterni e supply chain; progettata per ambienti enterprise e regolamentati.",
        usecases:[
          "Scoperta automatica di asset esposti e vulnerabilità",
          "Monitoraggio continuo delle superfici di attacco digitali",
          "Gestione automatizzata dei rischi nella supply chain"
        ],
        technologies:[
          ["EASM","External Attack Surface Management"],
          ["Threat Intelligence","Identificazione di segnali di rischio"],
          ["Automazione remediation","Workflow di remediation e monitoraggio"]
        ],
        poc:"Adozioni internazionali con clienti enterprise e istituzionali in più paesi, con capacità di scalabilità in contesti regolamentati. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Copertura EASM, referenze istituzionali e conformità.",
        why:"Verificare copertura del monitoraggio delle superfici esterne, referenze in contesti regolamentati e adattabilità alle esigenze PA.",
        sede:"Lecco",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Lorenzo Rea"
      },
      {
        id:"intrusa",
        name:"Intrusa",
        area:"Cybersecurity",
        what:"Piattaforma centralizzata per monitoraggio log e conformità normativa.",
        description:"Intrusa è una piattaforma di cybersecurity e compliance che supporta le organizzazioni nella gestione centralizzata della sicurezza IT. La soluzione è progettata per semplificare attività complesse di controllo e governance.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Piattaforma cloud",
        differentiator:"Piattaforma cloud-based per la gestione strutturata della sicurezza informatica e della compliance, che riduce la complessità operativa e migliora prevenzione e risposta agli incidenti.",
        usecases:[
          "Gestione centralizzata dei log di sicurezza",
          "Rilevamento in tempo reale di anomalie e vulnerabilità",
          "Supporto alla conformità normativa (GDPR, ISO 27001, NIS2)"
        ],
        technologies:[
          ["Cloud log management","Log management e security monitoring cloud-based"],
          ["Microsoft 365 & DLP","Moduli dedicati per M365 e Data Loss Prevention"],
          ["Integrazione IT","Integrazione con sistemi IT e piattaforme aziendali"]
        ],
        poc:"Soluzione operativa e già utilizzata in contesti reali di gestione della sicurezza IT e compliance normativa, con clienti paganti. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Copertura normativa (GDPR/ISO 27001/NIS2) e scalabilità.",
        why:"Verificare la copertura normativa (in particolare NIS2), l’integrazione con l’ecosistema IT della PA e la scalabilità del log management.",
        sede:"Udine",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Andrea Zwirner, Gigliola Sartor"
      },
      {
        id:"aigarage",
        name:"AI Garage",
        area:"Cybersecurity & Reg-Tech",
        what:"Automazione della compliance cyber nella gestione fornitori.",
        description:"AI Garage è una piattaforma di cybersecurity e compliance che automatizza la gestione del rischio cyber nella supply chain, supportando le aziende nel monitoraggio continuo dei fornitori e nell’adeguamento alle principali normative europee.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 8 · Intelligenza artificiale · LLM",
        differentiator:"Piattaforma end-to-end per valutazione del rischio cyber dei fornitori, workflow di compliance e audit readiness, monitoraggio continuo di minacce e reportistica avanzata; riduce il carico operativo e aumenta la capacità di risposta.",
        usecases:[
          "Valutazione del rischio cyber dei fornitori",
          "Workflow di compliance e audit readiness",
          "Monitoraggio continuo di minacce e vulnerabilità",
          "Reportistica avanzata per stakeholder interni ed esterni"
        ],
        technologies:[
          ["AI & LLM","Automazione tramite modelli AI e LLM"],
          ["Semantic retrieval","Analisi documentale e recupero semantico"],
          ["Integrazione dati","Integrazione con sistemi aziendali e database interni"],
          ["Privacy-by-design","Approccio privacy-by-design e sicurezza infrastrutturale"]
        ],
        poc:"Piattaforma operativa e già utilizzata in contesti reali di valutazione del rischio e compliance supply chain. PoC completati, prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Robustezza dei modelli AI/LLM e affidabilità della compliance automatizzata.",
        why:"Verificare l’affidabilità dei modelli AI/LLM sulla compliance, la gestione del dato dei fornitori e la conformità alle normative europee applicabili alla PA.",
        sede:"Milano",
        trl:"8",
        valuation:"Early traction / Ready to scale",
        traction:"PoC completati · Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Alessandra Caringella, Roberto Troiani"
      },
      {
        id:"cyberaware",
        name:"CyberAware",
        area:"Cybersecurity",
        what:"Piattaforma di formazione per ridurre il rischio umano nella cybersecurity.",
        description:"CyberAware è una piattaforma di Cybersecurity Awareness e formazione progettata per rafforzare la consapevolezza dei rischi digitali all’interno delle organizzazioni.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 7 · Piattaforma LMS",
        differentiator:"Sistema di formazione continua sulla cybersecurity con contenuti interattivi e certificati, ideato per mitigare il rischio umano e trasformare il personale da vulnerabilità a primo presidio di difesa.",
        usecases:[
          "Programmi formativi in ambito cybersecurity awareness",
          "Quiz, percorsi didattici e certificazioni",
          "Contenuti aggiornati su phishing e protezione dati"
        ],
        technologies:[
          ["LMS avanzato","Erogazione e gestione dei corsi di formazione"],
          ["Gamification","Engagement e apprendimento tramite meccaniche di gioco"]
        ],
        poc:"Piattaforma formativa già operativa, con un’offerta strutturata di corsi e percorsi dedicati alla cybersecurity awareness. PoC completati, prodotto sul mercato, clienti attivi.",
        deepen:"Efficacia formativa misurabile e integrazione nei programmi PA.",
        why:"Verificare metriche di efficacia (riduzione del rischio umano), aggiornamento dei contenuti e integrazione nei piani formativi della PA.",
        sede:"Salerno",
        trl:"7",
        valuation:"Early traction",
        traction:"PoC completati · Prodotto sul mercato · Clienti attivi",
        keyPeople:"Domenico Campeglia"
      },
      {
        id:"pugliai",
        name:"PugliAI",
        area:"Intelligenza artificiale / Generative AI",
        what:"Automazione di contenuti e processi aziendali con AI generativa.",
        description:"PugliAI è una piattaforma di intelligenza artificiale specializzata nell’automazione dei processi di analisi e generazione di contenuti, integrando tecnologie generative e modelli di linguaggio naturale.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Generative AI",
        differentiator:"Piattaforma end-to-end che combina Generative AI (GPT-4 e custom NLP) con workflow automatizzati; semplifica la produzione di contenuti, l’analisi di dati e l’estrazione di insight significativi.",
        usecases:[
          "Generazione AI di contenuti testuali e semantici",
          "Automazione dei workflow basati su dati reali",
          "Conversione di dati grezzi in insight operativi"
        ],
        technologies:[
          ["Generative AI & NLP","Generazione di contenuti e comprensione del linguaggio"],
          ["GDPR-compliant AI","Trattamento sicuro dei dati"],
          ["Machine Learning","Ottimizzazione continua dei modelli"]
        ],
        poc:"Soluzione operativa e adottata in contesti reali per l’automazione dell’analisi dati e la generazione di contenuti. Prodotti sviluppati e validati. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Affidabilità dei contenuti generati e trattamento del dato per la PA.",
        why:"Verificare qualità/controllo dei contenuti generati, governance del dato e conformità (GDPR) nell’uso su processi della PA.",
        sede:"Bari",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Gregor Maric"
      },
      {
        id:"tiledesk",
        name:"Tiledesk",
        area:"Customer service automation",
        what:"Agenti AI personalizzabili per automatizzare assistenza e processi interni.",
        description:"TileDesk è una piattaforma di intelligenza artificiale per l’automazione del customer service che consente alle organizzazioni di creare e gestire agenti conversazionali intelligenti per il supporto a clienti e utenti interni.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Conversational AI",
        differentiator:"Piattaforma AI end-to-end per la creazione di agenti conversazionali automatizzati, utilizzabili sia nel customer service sia come copilot interni; riduce il carico sui team di supporto e migliora qualità e scalabilità dei servizi.",
        usecases:[
          "Agenti AI per customer service e supporto interno",
          "Automazione conversazionale multi-canale",
          "Creazione di soluzioni custom tramite builder no-code"
        ],
        technologies:[
          ["API OpenAI & LLM","Integrazione con modelli linguistici di grandi dimensioni"],
          ["AI Training","Automazione di task ripetitivi"],
          ["No-code builder","Sviluppo rapido di agenti conversazionali"]
        ],
        poc:"Soluzione matura e già adottata in contesti enterprise ad alta intensità di interazione con utenti e clienti, con un modello commerciale strutturato. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Integrazione con i canali della PA e governance delle risposte AI.",
        why:"Verificare integrazione con i canali/servizi della PA, accuratezza e controllo delle risposte (grounding), e requisiti di gestione del dato.",
        sede:"Milano",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Michele Pomposo"
      },
      {
        id:"ganiga",
        name:"Ganiga",
        area:"GreenTech & Smart Cities",
        what:"Trasforma i rifiuti in dati tramite riconoscimento automatico con AI.",
        description:"Ganiga sviluppa soluzioni di smart waste management basate su intelligenza artificiale e computer vision, con l’obiettivo di trasformare la gestione dei rifiuti da processo manuale e inefficiente a sistema intelligente e data-driven.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 9 · Intelligenza artificiale & computer vision",
        differentiator:"Nuova generazione di infrastrutture intelligenti per la raccolta e gestione dei rifiuti, che supera l’approccio tradizionale privo di dati; riduce contaminazione, aumenta il riciclo e ottimizza costi logistici e ambientali.",
        usecases:[
          "Riconoscimento e classificazione automatica dei rifiuti",
          "Raccolta dati su volumi, peso, tipologia e impatto",
          "Ottimizzazione operativa e logistica tramite insight AI-driven"
        ],
        technologies:[
          ["Generative AI & computer vision","Waste recognition con precisione superiore al 95% in meno di un secondo"],
          ["Dataset proprietario","Addestrato su 10 milioni di immagini, in continua espansione"],
          ["API di integrazione","Integrazione con sistemi industriali e pubblici"]
        ],
        poc:"Fase avanzata di industrializzazione, con dispositivi installati in Europa e clienti di primo livello; crescita significativa con pipeline ricorrente. Prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Accuratezza del riconoscimento e integrazione con i gestori pubblici dei rifiuti.",
        why:"Verificare accuratezza sul mix rifiuti italiano, integrazione con municipalizzate/gestori pubblici e modello di installazione/manutenzione.",
        sede:"Pisa",
        trl:"9",
        valuation:"Ready to scale",
        traction:"Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Nicolas Zeoli"
      },
      {
        id:"i2d",
        name:"i2d",
        area:"Intelligenza artificiale / Generative AI",
        what:"Analisi e interpretazione dei feedback clienti tramite Generative AI.",
        description:"i2d è una piattaforma di intelligenza artificiale e generative AI che consente alle aziende di raccogliere, interpretare e trasformare il feedback dei clienti in insight operativi e strategie data-driven. La soluzione integra componenti software e hardware.",
        audience:"PMI, corporate, pubblica amministrazione",
        maturity:"TRL 7 · Generative AI",
        differentiator:"Combina InsightGPT e YouFeed in una piattaforma end-to-end di raccolta e analisi dei feedback da molteplici touchpoint (fisici e digitali); trasforma dati qualitativi non strutturati in insight immediatamente utilizzabili.",
        usecases:[
          "Raccolta continua di feedback multi-canale",
          "Analisi AI-driven di dati qualitativi e quantitativi",
          "Generazione di insight operativi"
        ],
        technologies:[
          ["Generative AI","Interpretazione e sintesi dei feedback"],
          ["RAG framework","Insight contestuali e affidabili"],
          ["NFC technology","Raccolta dati in tempo reale"],
          ["Integrazione hw-sw","Ecosistemi fisici e digitali"]
        ],
        poc:"Soluzione operativa e già utilizzata in contesti reali di raccolta e analisi dei feedback. PoC completati, prodotto sul mercato, clienti attivi, ricavi generati.",
        deepen:"Qualità degli insight e applicabilità ai servizi al cittadino.",
        why:"Verificare l’affidabilità degli insight (grounding/RAG), la gestione del dato dei cittadini e l’applicabilità alla raccolta feedback sui servizi pubblici.",
        sede:"Milano",
        trl:"7",
        valuation:"Early traction",
        traction:"PoC completati · Prodotto sul mercato · Clienti attivi · Ricavi generati",
        keyPeople:"Tommaso Castelli"
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
      },
      cyberevolution: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "OT/IT · Infrastrutture critiche",
        innovation: "AI · Hardware · Blockchain",
        usecase: "Protezione continua di reti industriali e sistemi critici",
        note: "Rientra nel verticale Sicurezza & Cybersecurity per la protezione di reti OT/IT e infrastrutture critiche tramite hardware dedicato e AI."
      },
      truescreen: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "Legal-Tech · Data authenticity",
        innovation: "Digital forensics · Notarizzazione",
        usecase: "Acquisizione forense e certificazione legale di contenuti digitali",
        note: "Rientra nel verticale Sicurezza & Cybersecurity con estensione Legal-Tech per il valore probatorio e l’integrità dei dati digitali."
      },
      cylock: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "Vulnerability management",
        innovation: "AI · ML · OSINT",
        usecase: "Vulnerability assessment e risk scoring automatizzati",
        note: "Rientra nel verticale Sicurezza & Cybersecurity per l’identificazione automatica di vulnerabilità e superfici di attacco."
      },
      resilientx: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "EASM · Supply chain",
        innovation: "EASM · Threat Intelligence · Cloud",
        usecase: "Gestione del rischio cyber esterno e delle superfici di attacco",
        note: "Rientra nel verticale Sicurezza & Cybersecurity per il monitoraggio continuo di asset esposti e rischi di supply chain."
      },
      intrusa: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "Log management · Compliance",
        innovation: "Cloud · SIEM · Compliance",
        usecase: "Monitoraggio log e conformità normativa (GDPR, ISO 27001, NIS2)",
        note: "Rientra nel verticale Sicurezza & Cybersecurity per la gestione centralizzata della sicurezza IT e della compliance."
      },
      aigarage: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "Reg-Tech · Third-party risk",
        innovation: "AI · LLM · Semantic retrieval",
        usecase: "Compliance e rischio cyber della supply chain / fornitori",
        note: "Rientra nel verticale Sicurezza & Cybersecurity con estensione Reg-Tech per l’automazione della compliance e del rischio fornitori."
      },
      cyberaware: {
        primary: "Sicurezza & Cybersecurity",
        secondary: "Security awareness · Formazione",
        innovation: "LMS · Gamification",
        usecase: "Formazione e riduzione del rischio umano nella cybersecurity",
        note: "Rientra nel verticale Sicurezza & Cybersecurity per la formazione e l’awareness a mitigazione del rischio umano."
      },
      pugliai: {
        primary: "Data Intelligence",
        secondary: "Generative AI · Automazione contenuti",
        innovation: "Generative AI · NLP · ML",
        usecase: "Automazione dell’analisi dati e generazione di contenuti",
        note: "Rientra nel verticale Data Intelligence per la trasformazione di dati grezzi in contenuti e insight operativi tramite Generative AI."
      },
      tiledesk: {
        primary: "Help Desk",
        secondary: "Customer service · Conversational AI",
        innovation: "LLM · Conversational AI · No-code",
        usecase: "Agenti conversazionali per assistenza e supporto interno",
        note: "Rientra nel verticale Help Desk per l’automazione conversazionale multi-canale dell’assistenza a cittadini e operatori."
      },
      ganiga: {
        primary: "Ambiente",
        secondary: "Smart Cities · GreenTech",
        innovation: "Computer vision · Generative AI · IoT",
        usecase: "Smart waste management con riconoscimento automatico dei rifiuti",
        note: "Rientra nel verticale Ambiente per la digitalizzazione e ottimizzazione data-driven della gestione dei rifiuti."
      },
      i2d: {
        primary: "Data Intelligence",
        secondary: "Citizen Feedback · Generative AI",
        innovation: "Generative AI · RAG · NFC",
        usecase: "Raccolta e analisi dei feedback in insight operativi",
        note: "Rientra nel verticale Data Intelligence per la trasformazione di feedback non strutturati in insight decisionali."
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
  cyberevolution: "Cybersecurity",
  truescreen: "Cybersecurity",
  cylock: "Cybersecurity",
  resilientx: "Cybersecurity",
  intrusa: "Cybersecurity",
  aigarage: "Cybersecurity",
  cyberaware: "Cybersecurity",
  pugliai: "AI",
  tiledesk: "AI",
  ganiga: "AI",
  i2d: "AI",
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
