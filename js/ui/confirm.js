export function confirmModal(title, message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const titleEl = document.getElementById("confirm-title");
    const msgEl = document.getElementById("confirm-message");
    const btnCancel = document.getElementById("confirm-cancel");
    const btnOk = document.getElementById("confirm-ok");

    titleEl.textContent = title;
    msgEl.textContent = message;

    overlay.classList.remove("hidden");

    const cleanup = () => {
      overlay.classList.add("hidden");
      btnCancel.onclick = null;
      btnOk.onclick = null;
    };

    btnCancel.onclick = () => {
      cleanup();
      resolve(false);
    };
    btnOk.onclick = () => {
      cleanup();
      resolve(true);
    };
  });
}
