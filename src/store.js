// ===========================================================================
// store.js — cache in-memory + operazioni CRUD verso Supabase.
// Le viste (board, report, modale) leggono da `state` e si iscrivono a subscribe().
// ===========================================================================
import { supabase } from "./supabase.js";

export const state = {
  stages: [],   // [{id, name, position, created_at}]
  startups: [], // [{id, slug, name, sector, stage_id, position, data, psn, ...}]
  glossary: [], // [{id, term, text, refs, position}]
  savedViews: [], // [{id, name, owner_email, config, is_shared, created_at}]
};

const listeners = new Set();

// Iscrizione ai cambiamenti dello store. Ritorna una funzione di annullamento.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitChange() {
  listeners.forEach((fn) => {
    try { fn(); } catch (e) { console.error("listener error", e); }
  });
}

// --------------------------------------------------------------------------
// Caricamento dati
// --------------------------------------------------------------------------
export async function reloadStages() {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  state.stages = data || [];
}

export async function reloadStartups() {
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  state.startups = data || [];
}

export async function reloadGlossary() {
  const { data, error } = await supabase
    .from("glossary")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  state.glossary = data || [];
}

export async function reloadSavedViews() {
  const { data, error } = await supabase
    .from("saved_views")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    // La tabella potrebbe non esistere ancora: non bloccare il resto dell'app.
    console.warn("saved_views non disponibile:", error.message);
    state.savedViews = [];
    return;
  }
  state.savedViews = data || [];
}

export async function reloadAll() {
  await Promise.all([reloadStages(), reloadStartups(), reloadGlossary(), reloadSavedViews()]);
  emitChange();
}

// --------------------------------------------------------------------------
// Helper di lettura
// --------------------------------------------------------------------------
export function cardsForStage(stageId) {
  return state.startups
    .filter((s) => s.stage_id === stageId)
    .sort((a, b) => a.position - b.position);
}

// Card senza fase valida (es. dopo eliminazione di una colonna).
export function orphanCards() {
  const ids = new Set(state.stages.map((s) => s.id));
  return state.startups.filter((s) => !s.stage_id || !ids.has(s.stage_id));
}

export function startupById(id) {
  return state.startups.find((s) => s.id === id);
}

// Posizione media tra due vicini (strategia frazionaria).
export function computeMidpoint(prevPos, nextPos) {
  if (prevPos == null && nextPos == null) return 1000;
  if (prevPos == null) return nextPos - 1000;
  if (nextPos == null) return prevPos + 1000;
  return (prevPos + nextPos) / 2;
}

// --------------------------------------------------------------------------
// Operazioni sulle card
// --------------------------------------------------------------------------
export async function moveCard(id, stageId, position) {
  const local = startupById(id);
  if (local) { local.stage_id = stageId; local.position = position; }
  const { error } = await supabase
    .from("startups")
    .update({ stage_id: stageId, position })
    .eq("id", id);
  if (error) throw error;
}

export async function upsertStartup(payload) {
  // payload: { id?, slug, name, sector, stage_id, data, psn }
  if (payload.id) {
    const { id, ...rest } = payload;
    const { data, error } = await supabase
      .from("startups")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data: userData } = await supabase.auth.getUser();
  const insert = { ...payload, created_by: userData?.user?.id ?? null };
  if (insert.position == null) insert.position = 1000;
  const { data, error } = await supabase
    .from("startups")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStartup(id) {
  const { error } = await supabase.from("startups").delete().eq("id", id);
  if (error) throw error;
}

// --------------------------------------------------------------------------
// Operazioni sulle colonne (stages)
// --------------------------------------------------------------------------
export async function addStage(name) {
  const maxPos = state.stages.reduce((m, s) => Math.max(m, s.position), -1);
  const { data, error } = await supabase
    .from("stages")
    .insert({ name, position: maxPos + 1 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameStage(id, name) {
  const { error } = await supabase.from("stages").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function reorderStages(orderedIds) {
  // Riscrive le posizioni in base all'ordine fornito.
  const updates = orderedIds.map((id, index) =>
    supabase.from("stages").update({ position: index }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export async function deleteStage(id) {
  // Riassegna le card della colonna a un'altra fase, poi elimina la colonna.
  const fallback = state.stages.find((s) => s.id !== id);
  if (fallback) {
    const { error: reassignError } = await supabase
      .from("startups")
      .update({ stage_id: fallback.id })
      .eq("stage_id", id);
    if (reassignError) throw reassignError;
  }
  const { error } = await supabase.from("stages").delete().eq("id", id);
  if (error) throw error;
}

// --------------------------------------------------------------------------
// Note
// --------------------------------------------------------------------------
export async function fetchNotes(startupId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addNote(startupId, body) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const { data, error } = await supabase
    .from("notes")
    .insert({
      startup_id: startupId,
      body,
      author_id: user?.id ?? null,
      author_email: user?.email ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function noteCounts() {
  // Ritorna una mappa startup_id -> conteggio note.
  const { data, error } = await supabase.from("notes").select("startup_id");
  if (error) throw error;
  const counts = {};
  (data || []).forEach((n) => {
    counts[n.startup_id] = (counts[n.startup_id] || 0) + 1;
  });
  return counts;
}

// --------------------------------------------------------------------------
// Viste salvate (saved_views) — condivise nel team
// --------------------------------------------------------------------------
export async function addSavedView(name, config) {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData?.user?.email ?? null;
  const { data, error } = await supabase
    .from("saved_views")
    .insert({ name, config, owner_email: email, is_shared: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSavedView(id) {
  const { error } = await supabase.from("saved_views").delete().eq("id", id);
  if (error) throw error;
}
