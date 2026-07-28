# Scouting PSN — CRM Startup (Kanban stile Trello/Notion)

CRM per gestire le startup candidate al **PSN** (Polo Strategico Nazionale): una
**board Kanban** con card da spostare tra fasi, **note** collaborative per ogni
startup, un **campo settore** (AI, Cybersecurity, GovTech, IoT/Edge, …) e tutte
le **schede di dettaglio** già prodotte in fase di scouting.

Frontend **statico e senza build** (moduli ES + CSS), backend **Supabase**
(Postgres + Auth + Realtime) per la condivisione in tempo reale tra il team.

---

## Come funziona

- **Board**: colonne = fasi della pipeline (`In analisi`, `Approfondimento PSN`,
  `PoC`, `Archiviate`). Le colonne sono **modificabili**: rinominale, aggiungine
  di nuove, riordinale trascinando l'intestazione, eliminale (le card vengono
  spostate su un'altra colonna).
- **Card**: si trascinano tra le colonne; il click apre la **modale** con la
  scheda completa (descrizione, problema, casi d'uso, tecnologie, PoC, attività
  successive, inquadramento PSN) e il **thread di note** con autore e data.
- **Nuove startup**: pulsante **+ Startup** → form con settore e tutti i campi
  (solo il nome è obbligatorio: il resto si completa nel tempo).
- **Filtro settore** e **ricerca** globale sulla board e sul report.
- **Report**: vista secondaria con le tabelle di sintesi, la mappatura sui
  verticali PSN e il glossario, alimentate dal database.
- **Realtime**: spostamenti, note e modifiche compaiono live agli altri utenti.

---

## Setup (una tantum)

### 1. Crea il progetto Supabase
1. Vai su [supabase.com](https://supabase.com) e crea un progetto (tier gratuito).
2. **SQL Editor** → incolla ed esegui il contenuto di [`supabase/schema.sql`](supabase/schema.sql).
   Crea tabelle, indici, policy RLS, trigger e abilita il realtime.
3. **Authentication → Providers** → abilita **Email**. Crea gli account del team
   (Authentication → Users → *Add user*), oppure lascia attiva la registrazione
   e usa il link "Crea un nuovo account" nella schermata di login.

### 2. Collega il frontend
In **Project Settings → API** copia `Project URL` e la chiave `anon` `public`,
poi incollale in [`config.js`](config.js):

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

> La chiave **anon** è pubblica e sicura da committare: la sicurezza è garantita
> dalle policy RLS. **Non** inserire mai qui la chiave `service_role`.

### 3. Deploy
Sono file statici: pubblicali con qualsiasi hosting statico
(GitHub Pages, Netlify, Vercel, …). Al primo accesso i **7 dati di scouting
iniziali** e le 4 colonne vengono caricati automaticamente nel database
(operazione idempotente: non si duplicano ai riavvii).

---

## Sviluppo in locale

Serve un server statico (i moduli ES non funzionano da `file://`):

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Struttura del progetto

```
index.html            Shell dell'app (overlay login/setup, board, report, modali)
config.js             URL + anon key di Supabase
supabase/schema.sql   Schema DB: tabelle, RLS, trigger, realtime
styles/               base.css (design system) + board.css + modal.css
vendor/               Supabase (UMD) e SortableJS vendorizzati (nessuna CDN a runtime)
src/
  main.js             Entry: config → auth → seed → render → realtime
  supabase.js         Client Supabase
  auth.js             Login / sessione
  store.js            Cache in-memory + CRUD (card, colonne, note)
  realtime.js         Sottoscrizioni realtime
  data/seed.js        Dati iniziali (7 startup + tassonomia PSN + glossario)
  data/seed-runner.js Caricamento idempotente del seed
  ui/                 board · cardBody · modal · report · stages · startupForm · toast
```

## Modello dati (Supabase)

| Tabella    | Descrizione |
|------------|-------------|
| `stages`   | Colonne della board (nome, posizione). |
| `startups` | Card: `slug`, `name`, `sector`, `stage_id`, `position`, `data` (jsonb con tutti i campi ricchi), `psn` (jsonb), autore, timestamp. |
| `notes`    | Note per startup (testo, autore, data). |
| `glossary` | Glossario tecnico. |

RLS: ogni utente autenticato legge/scrive; le note sono modificabili solo dal
proprio autore; nessun accesso anonimo.
