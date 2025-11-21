export function alertModal(title, message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("alert-overlay");
    const titleEl = document.getElementById("alert-title");
    const msgEl = document.getElementById("alert-message");
    const btnOk = document.getElementById("alert-ok");

    titleEl.textContent = title;
    msgEl.textContent = message;

    overlay.classList.remove("hidden");

    const cleanup = () => {
      overlay.classList.add("hidden");
      btnOk.onclick = null;
    };

    btnOk.onclick = () => {
      cleanup();
      resolve(true);
    };
  });
}
