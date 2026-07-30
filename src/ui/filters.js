// ===========================================================================
// filters.js — modello filtri/ordinamento unico, condiviso da Board, Tabella,
// Analytics. Fonte di verità unica; le viste chiamano getFilteredStartups().
// ===========================================================================
import { state } from "../store.js";

const DEFAULTS = {
  search: "",
  sector: "all",
  stage: "all",
  psn: "all",
  valuation: "all",
  trlMin: null,
  trlMax: null,
  sort: { key: "name", dir: "asc" },
};

let f = structuredClone(DEFAULTS);
const listeners = new Set();

export function getFilters() { return f; }
export function onFiltersChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }
function emit() { listeners.forEach((l) => { try { l(); } catch (e) { console.error(e); } }); }

export function setFilter(key, val) { f[key] = val; emit(); }
export function setFilters(obj) { f = { ...structuredClone(DEFAULTS), ...obj, sort: { ...DEFAULTS.sort, ...(obj.sort || {}) } }; emit(); }
export function resetFilters() { f = structuredClone(DEFAULTS); emit(); }

export function setSort(key) {
  if (f.sort.key === key) f.sort.dir = f.sort.dir === "asc" ? "desc" : "asc";
  else f.sort = { key, dir: "asc" };
  emit();
}

export function activeFilterCount() {
  let n = 0;
  if (f.search) n++;
  if (f.sector !== "all") n++;
  if (f.stage !== "all") n++;
  if (f.psn !== "all") n++;
  if (f.valuation !== "all") n++;
  if (f.trlMin != null || f.trlMax != null) n++;
  return n;
}

// ---- Helper di lettura -----------------------------------------------------
export function psnPrimary(s) { return (s.psn && s.psn.primary) || (s.data && s.data.area) || "—"; }
export function sectorOf(s) { return s.sector || "—"; }
export function valuationOf(s) { return (s.data && s.data.valuation) || "—"; }
export function sedeOf(s) { return (s.data && s.data.sede) || "—"; }
export function trlOf(s) { const t = parseInt(s.data && s.data.trl, 10); return Number.isNaN(t) ? null : t; }

// Città normalizzata: rimuove l'indirizzo tra parentesi, la sigla provincia
// e l'eventuale testo dopo la virgola. Così "Milano (Via Ripamonti 190)" e
// "Milano" vengono conteggiate come un'unica città.
export function cityOf(s) {
  const raw = sedeOf(s);
  if (!raw || raw === "—") return "—";
  const c = String(raw).split("(")[0].split(",")[0].replace(/\s+/g, " ").trim();
  return c || "—";
}

// Macro-area geografica (per il clustering territoriale).
const CITY_MACRO = {
  "Milano": "Nord", "Torino": "Nord", "Bologna": "Nord", "Lecco": "Nord",
  "Udine": "Nord", "San Sebastiano da Po": "Nord", "Pisa": "Centro",
  "Roma": "Centro", "Ascoli Piceno": "Centro", "Salerno": "Sud e Isole",
  "Bari": "Sud e Isole",
};
export function macroAreaOf(s) {
  const c = cityOf(s);
  if (c === "—") return "—";
  return CITY_MACRO[c] || "Altro";
}

// Stadio di maturità normalizzato (dedotto da valuation + TRL) per clusterizzare
// stringhe libere eterogenee in poche categorie confrontabili.
export function maturityBucketOf(s) {
  const v = (valuationOf(s) || "").toLowerCase();
  if (v !== "—" && /ready to scale|scale-?up|growth|roll-?out|industrializzazione/.test(v)) return "Ready to scale";
  if (/seed|early traction|pre-?seed|traction/.test(v)) return "Seed / Early traction";
  const t = trlOf(s);
  if (t != null) { if (t >= 8) return "Ready to scale"; if (t >= 6) return "Seed / Early traction"; return "Early stage"; }
  return "n.d.";
}
export function stageName(id) { const st = state.stages.find((x) => x.id === id); return st ? st.name : "—"; }

export function distinctSectors() { return [...new Set(state.startups.map(sectorOf).filter((v) => v !== "—"))].sort(); }
export function distinctPsn() { return [...new Set(state.startups.map(psnPrimary).filter((v) => v !== "—"))].sort(); }
export function distinctValuations() { return [...new Set(state.startups.map(valuationOf).filter((v) => v !== "—"))].sort(); }

// ---- Applicazione ----------------------------------------------------------
export function applyFilters(list) {
  return list.filter((s) => {
    if (f.sector !== "all" && sectorOf(s) !== f.sector) return false;
    if (f.stage !== "all" && s.stage_id !== f.stage) return false;
    if (f.psn !== "all" && psnPrimary(s) !== f.psn) return false;
    if (f.valuation !== "all" && valuationOf(s) !== f.valuation) return false;
    const t = trlOf(s);
    if (f.trlMin != null && (t == null || t < f.trlMin)) return false;
    if (f.trlMax != null && (t == null || t > f.trlMax)) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const hay = (s.name + " " + (s.sector || "") + " " + JSON.stringify(s.data || {}) + " " + JSON.stringify(s.psn || {})).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortStartups(list) {
  const { key, dir } = f.sort;
  const m = dir === "asc" ? 1 : -1;
  const val = (s) => {
    switch (key) {
      case "name": return (s.name || "").toLowerCase();
      case "sector": return sectorOf(s);
      case "stage": return stageName(s.stage_id);
      case "psn": return psnPrimary(s);
      case "trl": return trlOf(s) ?? -1;
      case "valuation": return valuationOf(s);
      case "sede": return sedeOf(s);
      case "updated": return s.updated_at || "";
      default: return "";
    }
  };
  return [...list].sort((a, b) => {
    const A = val(a), B = val(b);
    if (A < B) return -1 * m;
    if (A > B) return 1 * m;
    return 0;
  });
}

// Startup filtrate (+ordinate) per Tabella/Board; per Analytics basta applyFilters.
export function getFilteredStartups() { return sortStartups(applyFilters(state.startups)); }
