// ===========================================================================
// chartcolors.js — sistema colore dei grafici Analytics.
// Principio (dataviz): il colore segue l'ENTITÀ, non il rango — la stessa
// categoria ha lo stesso colore in tutti i grafici.
// Categoriale: blu · magenta · teal · corallo. Validata su superficie chiara
// controllando TUTTE le coppie, non solo le adiacenti, perché nel donut due
// fette qualsiasi possono ritrovarsi accostate. Peggior coppia ΔE 10.1 in
// protanopia: sopra la soglia 8, senza affidarsi a codifiche secondarie.
// (La versione precedente si fermava a 7.3 fra indigo e violetto.)
// Le categorie oltre le quattro principali confluiscono in un NEUTRO ("Altro"),
// come prescritto: mai generare una quinta tinta.
// ===========================================================================

export const CAT = ["#3B5BDB", "#B5179E", "#0F9B8A", "#E76F3C"];
export const NEUTRAL = "#8A93AD";

// Tinta unica per i grafici di magnitudo (non identità).
export const SINGLE = "#3B5BDB";

// Mappe stabili entità → colore (ordine fisso, mai ciclato).
const SECTOR = {
  "Cybersecurity": "#E76F3C", // corallo
  "AI": "#3B5BDB",            // blu
  "IoT/Edge": "#0F9B8A",      // teal
  "GovTech": "#B5179E",       // magenta
  "Data": NEUTRAL,
  "FinTech": NEUTRAL,
  "HealthTech": NEUTRAL,
};

// Stadio di maturità: semantico ordinale (pronto → early → grezzo → n.d.).
const MATURITY = {
  "Ready to scale": "#0F9B8A",
  "Seed / Early traction": "#B5179E",
  "Early stage": "#3B5BDB",
  "n.d.": NEUTRAL,
};

// Fasi pipeline: ramp sequenziale (ordinale) — progressione, non arcobaleno.
export const STAGE_RAMP = ["#9DB3E8", "#7C96DA", "#5C79C8", "#3F5CAA", "#26407F"];

export function sectorColor(label) { return SECTOR[label] || NEUTRAL; }
export function maturityColor(label) { return MATURITY[label] || NEUTRAL; }
export function stageColor(i) { return STAGE_RAMP[Math.min(i, STAGE_RAMP.length - 1)]; }

// TRL: una sola serie ("quante startup per livello"), quindi una sola tinta.
// Colorare ogni colonna secondo il proprio livello raddoppiava sull'asse
// un'informazione che le etichette gia' danno, e nove passi della stessa tinta
// non riescono a restare distinguibili: i gradini finivano sotto la soglia di
// separazione e l'estremo chiaro spariva sul fondo bianco.
export function trlColor() { return SINGLE; }
