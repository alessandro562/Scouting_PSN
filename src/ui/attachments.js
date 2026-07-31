// ===========================================================================
// attachments.js — allegati per startup (deck, documenti) su Supabase Storage.
// Bucket privato "attachments": i file stanno in <startup_id>/<nome-file> e il
// download avviene con link firmati temporanei. Vedi supabase/delta_attachments.sql
// ===========================================================================
import { supabase } from "../supabase.js";
import { logActivity } from "../store.js";
import { toast, toastError } from "./toast.js";

const BUCKET = "attachments";

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fmtSize(b) {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
function icon(name) {
  const e = String(name).split(".").pop().toLowerCase();
  if (e === "pdf") return "📕";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(e)) return "🖼";
  if (["ppt", "pptx", "key"].includes(e)) return "📊";
  if (["doc", "docx"].includes(e)) return "📝";
  if (["xls", "xlsx", "csv"].includes(e)) return "📈";
  return "📎";
}
// Nome file sicuro per lo storage (niente spazi/accenti).
function safeName(name) {
  return String(name).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "file";
}

export async function listAttachments(startupId) {
  const { data, error } = await supabase.storage.from(BUCKET).list(startupId, { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (error) { console.warn("allegati non disponibili:", error.message); return null; }
  return (data || []).filter((f) => f.name && f.name !== ".emptyFolderPlaceholder");
}

export async function uploadAttachment(startupId, file) {
  const path = `${startupId}/${Date.now().toString(36)}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  logActivity("attachment", startupId, { name: file.name });
  return path;
}

export async function removeAttachment(startupId, name) {
  const { error } = await supabase.storage.from(BUCKET).remove([`${startupId}/${name}`]);
  if (error) throw error;
}

export async function openAttachment(startupId, name) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(`${startupId}/${name}`, 60);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener");
}

// Nome leggibile: toglie il prefisso temporale usato per evitare collisioni.
function displayName(name) { return String(name).replace(/^[a-z0-9]{6,10}-/, ""); }

// Renderizza la sezione allegati dentro `host` (elemento della modale).
export async function renderAttachments(startupId, host) {
  if (!host) return;
  host.innerHTML = `<p class="muted">Caricamento allegati…</p>`;
  const files = await listAttachments(startupId);

  if (files === null) {
    host.innerHTML = `<p class="muted">Allegati non disponibili.<br><span class="att-hint">Esegui <code>supabase/delta_attachments.sql</code> per abilitarli.</span></p>`;
    return;
  }

  const listHtml = files.length
    ? `<ul class="att-list">${files.map((f) => `
        <li class="att-item">
          <span class="att-ico">${icon(f.name)}</span>
          <button class="att-name" data-open="${esc(f.name)}" title="Apri ${esc(displayName(f.name))}">${esc(displayName(f.name))}</button>
          <span class="att-size">${esc(fmtSize(f.metadata && f.metadata.size))}</span>
          <button class="att-del" data-del="${esc(f.name)}" title="Elimina allegato" aria-label="Elimina">🗑</button>
        </li>`).join("")}</ul>`
    : `<p class="muted att-empty">Nessun allegato. Carica il deck o i documenti della startup.</p>`;

  host.innerHTML = `
    ${listHtml}
    <label class="att-upload">
      <input type="file" id="att-input" multiple hidden>
      <span class="btn ghost att-btn">＋ Carica file</span>
      <span class="att-note">PDF, immagini, documenti · max 50 MB</span>
    </label>`;

  host.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", async () => {
      try { await openAttachment(startupId, b.getAttribute("data-open")); }
      catch (e) { toastError("Impossibile aprire l'allegato", e); }
    }));

  host.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", async () => {
      const n = b.getAttribute("data-del");
      if (!confirm(`Eliminare l'allegato "${displayName(n)}"?`)) return;
      try { await removeAttachment(startupId, n); await renderAttachments(startupId, host); toast("Allegato eliminato", "info"); }
      catch (e) { toastError("Errore nell'eliminazione", e); }
    }));

  const input = host.querySelector("#att-input");
  input?.addEventListener("change", async () => {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    try {
      for (const f of files) await uploadAttachment(startupId, f);
      await renderAttachments(startupId, host);
      toast(files.length === 1 ? "Allegato caricato" : `${files.length} allegati caricati`, "info");
    } catch (e) {
      toastError("Errore nel caricamento", e);
    }
  });
}
