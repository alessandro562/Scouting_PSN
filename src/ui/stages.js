// ===========================================================================
// stages.js — gestione colonne della board (crea / rinomina / elimina).
// ===========================================================================
import { state, addStage, renameStage, deleteStage, reloadAll } from "../store.js";
import { toast, toastError } from "./toast.js";

function esc(v) {
  if (v == null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function dialogRoot() {
  let el = document.getElementById("dialog-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "dialog-root";
    document.body.appendChild(el);
  }
  return el;
}

function closeDialog() {
  dialogRoot().innerHTML = "";
}

function openDialog(html) {
  dialogRoot().innerHTML = `
    <div class="modal-overlay" data-close-overlay>
      <div class="mini-dialog" role="dialog" aria-modal="true">${html}</div>
    </div>`;
  const r = dialogRoot();
  r.querySelector("[data-close-overlay]")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeDialog();
  });
  r.querySelector("[data-cancel]")?.addEventListener("click", closeDialog);
}

// mode: "create" (nuova colonna) | "menu" (opzioni di una colonna esistente)
export function openStageMenu(stageId, mode) {
  if (mode === "create") {
    openDialog(`
      <h3>Nuova colonna</h3>
      <input type="text" id="stage-name" placeholder="Nome della fase" />
      <div class="dialog-actions">
        <button class="btn ghost" data-cancel>Annulla</button>
        <button class="btn primary" id="stage-create">Crea</button>
      </div>
    `);
    const input = dialogRoot().querySelector("#stage-name");
    input?.focus();
    const submit = async () => {
      const name = input.value.trim();
      if (!name) return;
      try {
        await addStage(name);
        await reloadAll();
        closeDialog();
        toast("Colonna creata", "info");
      } catch (e) {
        toastError("Errore nella creazione della colonna", e);
      }
    };
    dialogRoot().querySelector("#stage-create")?.addEventListener("click", submit);
    input?.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    return;
  }

  const stage = state.stages.find((s) => s.id === stageId);
  if (!stage) return;

  openDialog(`
    <h3>Colonna “${esc(stage.name)}”</h3>
    <label class="dialog-label">Rinomina</label>
    <input type="text" id="stage-rename" value="${esc(stage.name)}" />
    <div class="dialog-actions">
      <button class="btn ghost danger" id="stage-delete">Elimina colonna</button>
      <span class="dialog-spacer"></span>
      <button class="btn ghost" data-cancel>Annulla</button>
      <button class="btn primary" id="stage-save">Salva</button>
    </div>
  `);

  const input = dialogRoot().querySelector("#stage-rename");
  dialogRoot().querySelector("#stage-save")?.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name || name === stage.name) { closeDialog(); return; }
    try {
      await renameStage(stage.id, name);
      await reloadAll();
      closeDialog();
    } catch (e) {
      toastError("Errore nella rinomina", e);
    }
  });

  dialogRoot().querySelector("#stage-delete")?.addEventListener("click", async () => {
    if (state.stages.length <= 1) {
      toast("Deve restare almeno una colonna", "error");
      return;
    }
    const other = state.stages.find((s) => s.id !== stage.id);
    if (!confirm(`Eliminare la colonna "${stage.name}"? Le sue card verranno spostate in "${other?.name}".`)) return;
    try {
      await deleteStage(stage.id);
      await reloadAll();
      closeDialog();
      toast("Colonna eliminata", "info");
    } catch (e) {
      toastError("Errore nell'eliminazione della colonna", e);
    }
  });
}
