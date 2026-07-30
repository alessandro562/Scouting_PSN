// ===========================================================================
// seed-runner.js — carica i dati iniziali in Supabase UNA SOLA VOLTA.
// Idempotente: alle esecuzioni successive è un no-op (dedupe su slug / term).
// ===========================================================================
import { supabase } from "../supabase.js";
import {
  startups,
  glossary,
  psnTaxonomy,
  SEED_STAGES,
  SLUG_SECTOR,
  PATH_STAGE,
  DEFAULT_STAGE,
  SEED_CONTENT_VERSION,
} from "./seed.js";

function psnOf(s) {
  return (
    psnTaxonomy[s.id] || {
      primary: s.area,
      secondary: "Da classificare",
      innovation: "Da verificare",
      usecase: s.poc,
      note: "Classificazione da confermare.",
    }
  );
}

async function ensureStages() {
  const { data: existing, error } = await supabase
    .from("stages")
    .select("id, name, position")
    .order("position", { ascending: true });
  if (error) throw error;

  // Le colonne sono modificabili dall'utente: NON riconciliare per nome (altrimenti
  // rinominare una colonna la farebbe "ricomparire" al reload). Si semina la board
  // SOLO se non esiste ancora nessuna colonna.
  const byName = {};
  if (existing && existing.length > 0) {
    existing.forEach((row) => { byName[row.name] = row.id; });
    byName.__first = existing[0].id; // fallback per l'assegnazione delle nuove card
    return byName;
  }

  const rows = SEED_STAGES.map((name, i) => ({ name, position: i }));
  const { data: inserted, error: insErr } = await supabase
    .from("stages")
    .insert(rows)
    .select("id, name");
  if (insErr) throw insErr;
  (inserted || []).forEach((row) => { byName[row.name] = row.id; });
  byName.__first = (inserted && inserted[0] && inserted[0].id) || null;
  return byName;
}

async function ensureStartups(stageByName) {
  const { data: existing, error } = await supabase.from("startups").select("slug, data");
  if (error) throw error;
  const byslug = new Map((existing || []).map((r) => [r.slug, r]));

  // Contatori di posizione per colonna (spaziatura 1000).
  const posCounter = {};

  const rows = [];      // nuove card da inserire
  const updates = [];   // card esistenti con contenuti da ri-sincronizzare
  for (const s of startups) {
    const seedData = { ...s, __seedVersion: SEED_CONTENT_VERSION };
    const psn = psnOf(s);
    const sector = SLUG_SECTOR[s.id] || null;

    const found = byslug.get(s.id);
    if (found) {
      // Ri-sincronizza SOLO i contenuti se il record è di una versione precedente.
      const ver = (found.data && found.data.__seedVersion) || 0;
      if (ver < SEED_CONTENT_VERSION) {
        // Preserva le chiavi runtime (es. stageSince per l'aging), senza toccare
        // stage_id/position (lo stato della board deciso dall'utente).
        if (found.data && found.data.stageSince) seedData.stageSince = found.data.stageSince;
        updates.push({ slug: s.id, name: s.name, sector, data: seedData, psn });
      }
      continue;
    }

    const stageName = PATH_STAGE[s.path] || DEFAULT_STAGE;
    const stageId = stageByName[stageName] || stageByName[DEFAULT_STAGE] || stageByName.__first || null;
    posCounter[stageName] = (posCounter[stageName] || 0) + 1;
    rows.push({
      slug: s.id,
      name: s.name,
      sector,
      stage_id: stageId,
      position: posCounter[stageName] * 1000,
      data: seedData,
      psn,
    });
  }

  if (rows.length > 0) {
    // ignoreDuplicates: sicuro anche in caso di corse concorrenti sullo slug unique.
    const { error: insErr } = await supabase
      .from("startups")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
    if (insErr) throw insErr;
  }

  if (updates.length > 0) {
    const results = await Promise.all(
      updates.map((u) =>
        supabase.from("startups")
          .update({ name: u.name, sector: u.sector, data: u.data, psn: u.psn })
          .eq("slug", u.slug)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed) console.warn("Ri-sincronizzazione contenuti parziale:", failed.error.message);
  }

  return rows.length + updates.length;
}

async function ensureGlossary() {
  const { data: existing, error } = await supabase.from("glossary").select("term");
  if (error) throw error;
  const present = new Set((existing || []).map((r) => r.term));

  const rows = glossary
    .filter((g) => !present.has(g.term))
    .map((g, i) => ({ term: g.term, text: g.text, refs: g.refs, position: i }));

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("glossary").insert(rows);
    if (insErr) throw insErr;
  }
  return rows.length;
}

// Punto d'ingresso: da chiamare dopo il login, prima di caricare lo store.
export async function ensureSeeded() {
  const stageByName = await ensureStages();
  const nStartups = await ensureStartups(stageByName);
  const nGlossary = await ensureGlossary();
  if (nStartups || nGlossary) {
    console.info(`Seed completato: ${nStartups} startup, ${nGlossary} voci glossario.`);
  }
}
