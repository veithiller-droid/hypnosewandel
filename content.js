export async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json();
}

function getByPath(obj, path) {
  return path.split(".").reduce((o, k) =>
    (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined
  , obj);
}

export function fillConfig(cfg) {
  // simple text fills
  document.querySelectorAll("[data-config]").forEach(el => {
    const key = el.getAttribute("data-config");
    const val = cfg?.[key];
    if (typeof val === "string") el.textContent = val;
  });

  // tel/mail hrefs
  const telA = document.querySelector("[data-tel]");
  if (telA && typeof cfg?.phone === "string") {
    telA.textContent = cfg.phone;
    telA.href = `tel:${cfg.phone.replace(/\s+/g, "")}`;
  }
  const mailA = document.querySelector("[data-mail]");
  if (mailA && typeof cfg?.email === "string") {
    mailA.textContent = cfg.email;
    mailA.href = `mailto:${cfg.email}`;
  }

  // nav
  const ul = document.querySelector("[data-nav-items]");
  if (ul && Array.isArray(cfg?.nav)) {
    ul.innerHTML = cfg.nav.map(i => `<li><a href="${i.href}">${i.label}</a></li>`).join("");
  }
}

export function fillText(texts) {
  // data-text="home.hero.h1" etc.
  document.querySelectorAll("[data-text]").forEach(el => {
    const path = el.getAttribute("data-text");
    const val = getByPath(texts, path);
    if (typeof val === "string") {
      // Paragraphs: allow \n\n => new paragraph feel via <br><br>
      if (el.tagName === "P") {
        el.innerHTML = escapeHTML(val).replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
      } else {
        el.textContent = val;
      }
    }
  });
}

function escapeHTML(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export function bindConfigHrefs(cfg) {
  document.querySelectorAll("[data-config-href]").forEach(a => {
    const path = a.getAttribute("data-config-href");
    const val = getByPath(cfg, path);
    if (typeof val === "string" && val.length > 0) a.href = val;
  });
}

export function bindTextHrefs(texts) {
  document.querySelectorAll("[data-href-text]").forEach(a => {
    const path = a.getAttribute("data-href-text");
    const val = getByPath(texts, path);
    if (typeof val === "string" && val.length > 0) a.href = val;
  });
}
