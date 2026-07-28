// Notifiche non bloccanti (toast) in basso a destra.
let root;

function ensureRoot() {
  if (!root) {
    root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      document.body.appendChild(root);
    }
  }
  return root;
}

export function toast(message, type = "info", timeout = 3600) {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  ensureRoot().appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, timeout);
}

export function toastError(message, err) {
  console.error(message, err);
  const detail = err?.message ? ` (${err.message})` : "";
  toast(message + detail, "error", 5200);
}
