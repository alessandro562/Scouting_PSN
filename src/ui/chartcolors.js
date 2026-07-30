// ===========================================================================
// chartcolors.js — sistema colore dei grafici Analytics.
// Principio (dataviz): il colore segue l'ENTITÀ, non il rango. La stessa
// categoria ha lo stesso colore in tutti i grafici. Palette categoriale
// CVD-safe (Okabe–Ito, validata su superficie chiara) per i marchi dati;
// i colori di brand PSN restano per la chrome (accenti, gradienti, header).
// ===========================================================================

// Categoriale validata (ΔE ok con etichette dirette sempre presenti).
export const CAT = ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#D55E00", "#56B4E9"];
export const NEUTRAL = "#94A3B8";

// Mappe stabili entità → colore (ordine fisso, mai ciclato).
const SECTOR = {
  "Cybersecurity": "#D55E00",
  "AI": "#0072B2",
  "IoT/Edge": "#009E73",
  "Data": "#56B4E9",
  "GovTech": "#E69F00",
  "FinTech": "#CC79A7",
  "HealthTech": NEUTRAL,
};
// Stadio di maturità: ordinale semantico (pronto → early → grezzo → n.d.).
const MATURITY = {
  "Ready to scale": "#1F9D74",
  "Seed / Early traction": "#E69F00",
  "Early stage": "#56B4E9",
  "n.d.": NEUTRAL,
};

// Fasi pipeline: ramp sequenziale indaco (ordinale) — progressione, non arcobaleno.
export const STAGE_RAMP = ["#8091D6", "#5F75C5", "#45589F", "#2C3B78", "#1B2555"];

function fallback(key) {
  let h = 0;
  const s = String(key || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CAT[h % CAT.length];
}

export function sectorColor(label) { return SECTOR[label] || fallback(label); }
export function maturityColor(label) { return MATURITY[label] || NEUTRAL; }
export function stageColor(i) { return STAGE_RAMP[Math.min(i, STAGE_RAMP.length - 1)]; }

// Colore per un TRL (ramp sequenziale: basso=chiaro, alto=scuro/brand).
export function trlColor(t) {
  const stops = { 1:"#CBD5EE",2:"#B3C1E6",3:"#9AABDD",4:"#8091D6",5:"#6A7EC9",6:"#5F75C5",7:"#4A5DA8",8:"#374A8C",9:"#26386F" };
  return stops[t] || "#5F75C5";
}
