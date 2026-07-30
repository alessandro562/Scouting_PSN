// ===========================================================================
// activity.js — registro attività condiviso: drawer globale + timeline nella
// modale di dettaglio. Legge da store.fetchActivity (tabella Supabase activity).
// ===========================================================================
import { fetchActivity } from "../store.js";
import { avatarHtml, displayName } from "./avatar.js";

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function relTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h fa`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} g fa`;
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

// Frase leggibile per un evento di attività.
function phrase(a) {
  const d = a.detail || {};
  const name = d.name ? `<strong>${esc(d.name)}</strong>` : "una startup";
  switch (a.type) {
    case "move": return `ha spostato ${name}: <em>${esc(d.from || "—")}</em> → <em>${esc(d.to || "—")}</em>`;
    case "create": return `ha creato ${name}`;
    case "update": return `ha aggiornato ${name}`;
    case "note": return `ha annotato ${name}${d.excerpt ? `: “${esc(d.excerpt)}”` : ""}`;
    case "stage": return `ha modificato una colonna${d.name ? ` (${esc(d.name)})` : ""}`;
    default: return `ha registrato un'attività su ${name}`;
  }
}

function itemHtml(a) {
  const email = a.actor_email || "";
  return `
    <li class="act-item act-${esc(a.type)}">
      ${avatarHtml(email, 30)}
      <div class="act-body">
        <div class="act-line"><span class="act-actor">${esc(displayName(email))}</span> ${phrase(a)}</div>
        <div class="act-time">${relTime(a.created_at)}</div>
      </div>
    </li>`;
}

// Timeline compatta (per la modale di una singola startup).
export async function renderActivityTimeline(startupId, hostEl) {
  if (!hostEl) return;
  hostEl.innerHTML = `<p class="muted">Caricamento attività…</p>`;
  const list = await fetchActivity({ startupId, limit: 20 });
  if (!list.length) {
    hostEl.innerHTML = `<p class="muted">Nessuna attività registrata.</p>`;
    return;
  }
  hostEl.innerHTML = `<ul class="act-list">${list.map(itemHtml).join("")}</ul>`;
}

// Drawer globale a scomparsa da destra: attività recenti di tutto il team.
export async function openActivityDrawer() {
  const root = document.getElementById("activity-root");
  if (!root) return;
  root.innerHTML = `
    <div class="drawer-overlay" data-close-overlay>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Registro attività">
        <header class="drawer-head">
          <h3>🕘 Registro attività</h3>
          <button class="icon-btn" data-close aria-label="Chiudi">✕</button>
        </header>
        <div class="drawer-scroll" id="activity-scroll"><p class="muted">Caricamento…</p></div>
      </aside>
    </div>
  `;
  const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", onEsc); };
  const onEsc = (e) => { if (e.key === "Escape") close(); };
  root.querySelector("[data-close]")?.addEventListener("click", close);
  root.querySelector("[data-close-overlay]")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
  document.addEventListener("keydown", onEsc);

  const scroll = root.querySelector("#activity-scroll");
  const list = await fetchActivity({ limit: 60 });
  if (!list.length) {
    scroll.innerHTML = `<p class="muted">Nessuna attività registrata.<br><span class="drawer-hint">Se hai appena aggiunto la tabella <code>activity</code>, le nuove azioni compariranno qui.</span></p>`;
    return;
  }
  scroll.innerHTML = `<ul class="act-list">${list.map(itemHtml).join("")}</ul>`;
}
