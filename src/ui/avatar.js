// ===========================================================================
// avatar.js — identità utente coerente (iniziali + colore stabile) riusata da
// note, registro attività e command palette.
// ===========================================================================

// Nome visualizzato: parte prima della @, con maiuscola iniziale.
export function displayName(email) {
  if (!email) return "utente";
  const local = String(email).split("@")[0] || String(email);
  return local.charAt(0).toUpperCase() + local.slice(1);
}

// Iniziali (1-2 lettere) dal local-part dell'email.
export function initialsFor(email) {
  if (!email) return "•";
  const local = String(email).split("@")[0].replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = local.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "•";
}

// Hash stabile → tonalità: stesso utente = stesso colore ovunque.
function hueFor(email) {
  const s = String(email || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

// { initials, color, fg } per un badge avatar accessibile.
export function avatarFor(email) {
  const hue = hueFor(email);
  return {
    initials: initialsFor(email),
    color: `hsl(${hue} 62% 52%)`,
    soft: `hsl(${hue} 62% 94%)`,
    fg: "#ffffff",
  };
}

// Markup badge avatar riutilizzabile.
export function avatarHtml(email, size = 26) {
  const a = avatarFor(email);
  const s = Number(size) || 26;
  return `<span class="uavatar" title="${escAttr(email || "")}" style="--uav:${a.color};width:${s}px;height:${s}px;font-size:${Math.round(s * 0.42)}px">${escHtml(a.initials)}</span>`;
}

function escHtml(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(v) {
  return escHtml(v).replace(/"/g, "&quot;");
}
