export async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  for (const el of nodes) {
    const url = el.getAttribute("data-include");
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Include failed: ${url}`);
    el.innerHTML = await res.text();
  }
}
