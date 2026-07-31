// ===========================================================================
// chartcolors.js — sistema colore dei grafici Analytics.
// Principio (dataviz): il colore segue l'ENTITÀ, non il rango — la stessa
// categoria ha lo stesso colore in tutti i grafici.
// La categoriale è la famiglia di brand PSN portata in banda leggibile
// (indigo · violetto · teal · corallo): validata su superficie chiara —
// lightness band PASS, chroma PASS, normal-vision ΔE 15.5 PASS, contrasto PASS.
// Le categorie oltre le quattro principali confluiscono in un NEUTRO ("Altro"),
// come prescritto: mai generare una quinta tinta.
// ===========================================================================

export const CAT = ["#2E4BA8", "#8B4FC9", "#0E9BA8", "#E0533D"];
export const NEUTRAL = "#7C86A8";

// Tinta unica per i grafici di magnitudo (non identità).
export const SINGLE = "#3D57B4";

// Mappe stabili entità → colore (ordine fisso, mai ciclato).
const SECTOR = {
  "Cybersecurity": "#E0533D", // corallo: accento di brand
  "AI": "#2E4BA8",            // indigo
  "IoT/Edge": "#0E9BA8",      // teal
  "GovTech": "#8B4FC9",       // violetto
  "Data": NEUTRAL,
  "FinTech": NEUTRAL,
  "HealthTech": NEUTRAL,
};

// Stadio di maturità: semantico ordinale (pronto → early → grezzo → n.d.).
const MATURITY = {
  "Ready to scale": "#0E9BA8",
  "Seed / Early traction": "#8B4FC9",
  "Early stage": "#3D57B4",
  "n.d.": NEUTRAL,
};

// Fasi pipeline: ramp sequenziale (ordinale) — progressione, non arcobaleno.
export const STAGE_RAMP = ["#8FA2E0", "#5F75C5", "#3D57B4", "#28387E", "#161F52"];

export function sectorColor(label) { return SECTOR[label] || NEUTRAL; }
export function maturityColor(label) { return MATURITY[label] || NEUTRAL; }
export function stageColor(i) { return STAGE_RAMP[Math.min(i, STAGE_RAMP.length - 1)]; }

// Ramp sequenziale per il TRL (basso = chiaro, alto = scuro).
export function trlColor(t) {
  const stops = {
    1:"#D6DDF3",2:"#C0CAEC",3:"#A9B6E4",4:"#92A2DC",5:"#7B8ED4",
    6:"#647AC9",7:"#4C63B8",8:"#374C99",9:"#25356F",
  };
  return stops[t] || SINGLE;
}
