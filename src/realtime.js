// ===========================================================================
// realtime.js — sincronizzazione live via Supabase Realtime.
// Le modifiche di altri utenti (o le proprie da altri dispositivi) ricaricano
// lo store e innescano un re-render con debounce, senza disturbare un drag.
// ===========================================================================
import { supabase } from "./supabase.js";
import { reloadAll } from "./store.js";
import { isBoardDragging } from "./ui/board.js";
import { getOpenStartupId, refreshNotes } from "./ui/modal.js";

let channel = null;
let pending = false;
let timer = null;

function scheduleReload() {
  if (pending) return;
  pending = true;
  const run = async () => {
    // Se l'utente sta trascinando, rimanda il re-render per non perdere il gesto.
    if (isBoardDragging()) {
      timer = setTimeout(run, 400);
      return;
    }
    pending = false;
    try { await reloadAll(); } catch (e) { console.error("realtime reload", e); }
  };
  timer = setTimeout(run, 250);
}

export function subscribeRealtime() {
  if (channel) return;
  channel = supabase
    .channel("crm")
    .on("postgres_changes", { event: "*", schema: "public", table: "stages" }, scheduleReload)
    .on("postgres_changes", { event: "*", schema: "public", table: "startups" }, scheduleReload)
    .on("postgres_changes", { event: "*", schema: "public", table: "glossary" }, scheduleReload)
    .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, (payload) => {
      const sid = payload.new?.startup_id || payload.old?.startup_id;
      if (sid && sid === getOpenStartupId()) refreshNotes();
      scheduleReload(); // aggiorna i conteggi note sulle tile
    })
    .subscribe();
}

export function unsubscribeRealtime() {
  if (timer) clearTimeout(timer);
  if (channel) { supabase.removeChannel(channel); channel = null; }
}
