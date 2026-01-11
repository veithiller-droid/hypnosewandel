export function initContactForm() {
  const form = document.querySelector("form[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const endpoint = form.getAttribute("data-endpoint") || "";
    const status = form.querySelector("[data-form-status]");
    if (status) status.textContent = "";

    if (!endpoint) {
      if (status) status.textContent = "Kein Endpoint gesetzt (data-endpoint ist leer).";
      return;
    }

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      if (status) status.textContent = res.ok ? "Danke! Nachricht ist raus." : "Fehler beim Senden.";
      if (res.ok) form.reset();
    } catch {
      if (status) status.textContent = "Netzwerkfehler beim Senden.";
    }
  });
}
