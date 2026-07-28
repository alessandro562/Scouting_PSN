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
  const { data: existing, error } = await supabase.from("stages").select("id, name");
  if (error) throw error;

  const byName = {};
  (existing || []).forEach((row) => { byName[row.name] = row.id; });

  const missing = SEED_STAGES.filter((name) => !(name in byName));
  if (missing.length > 0) {
    const base = existing ? existing.length : 0;
    const rows = missing.map((name, i) => ({
      name,
      position: base + SEED_STAGES.indexOf(name),
    }));
    const { data: inserted, error: insErr } = await supabase
      .from("stages")
      .insert(rows)
      .select("id, name");
    if (insErr) throw insErr;
    (inserted || []).forEach((row) => { byName[row.name] = row.id; });
  }
  return byName; // name -> id
}

async function ensureStartups(stageByName) {
  const { data: existing, error } = await supabase.from("startups").select("slug");
  if (error) throw error;
  const present = new Set((existing || []).map((r) => r.slug));

  // Contatori di posizione per colonna (spaziatura 1000).
  const posCounter = {};

  const rows = [];
  for (const s of startups) {
    if (present.has(s.id)) continue;
    const stageName = PATH_STAGE[s.path] || DEFAULT_STAGE;
    const stageId = stageByName[stageName] || stageByName[DEFAULT_STAGE] || null;
    posCounter[stageName] = (posCounter[stageName] || 0) + 1;
    rows.push({
      slug: s.id,
      name: s.name,
      sector: SLUG_SECTOR[s.id] || null,
      stage_id: stageId,
      position: posCounter[stageName] * 1000,
      data: s,            // oggetto ricco completo (round-trip col renderer del dettaglio)
      psn: psnOf(s),
    });
  }

  if (rows.length > 0) {
    // ignoreDuplicates: sicuro anche in caso di corse concorrenti sullo slug unique.
    const { error: insErr } = await supabase
      .from("startups")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
    if (insErr) throw insErr;
  }
  return rows.length;
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
