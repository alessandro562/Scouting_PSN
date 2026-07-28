// Client Supabase condiviso. La libreria è vendorizzata in locale (vendor/supabase.umd.js,
// caricata via <script> in index.html) per non dipendere da CDN a runtime.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";

const { createClient } = window.supabase;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// True se config.js è stato compilato con valori reali (non i placeholder).
export function isConfigured() {
  return (
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("INSERISCI") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("INSERISCI")
  );
}
