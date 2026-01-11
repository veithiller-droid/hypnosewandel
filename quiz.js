/* ==============================
   Quiz Config (optional via window.QUIZ_CONFIG)
============================== */
const BOOKING_LINK =
  (window.QUIZ_CONFIG && window.QUIZ_CONFIG.BOOKING_LINK) ||
  "https://heidischimmel.tentary.com/p/YMDdrH/checkout";

const FREEBIE_LINK =
  (window.QUIZ_CONFIG && window.QUIZ_CONFIG.FREEBIE_LINK) ||
  "https://heidischimmel.tentary.com/p/y7PZYT/checkout";

/* ==============================
   Helpers
============================== */
function norm(v, min, max) {
  const n = Number(v);
  return Math.max(0, Math.min(1, (n - min) / (max - min)));
}

function val(name) {
  const el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : null;
}

function fullName() {
  const fn = (document.getElementById("fname").value || "").trim();
  const ln = (document.getElementById("lname").value || "").trim();
  return `${fn} ${ln}`.trim();
}

/* ==============================
   Mappings / Gewichte
============================== */
const mapQ2 = { nein: 0.2, einige: 0.5, viele: 1.0 };
const mapQ6 = {
  sehr_wohl: 0.0,
  meist_zufrieden: 0.25,
  neutral: 0.5,
  unzufrieden: 0.75,
  fremd: 1.0,
};
const mapQ8 = { sofort: 1.0, wochen: 0.7, spaeter: 0.3 };

const W = { q1: 0.2, q2: 0.05, q3: 0.22, q4: 0.15, q5: 0.18, q6: 0.1, q8: 0.1 };

/* ==============================
   Score
============================== */
function computeScore() {
  const a1 = norm(val("q1") || 0, 1, 5);
  const a2 = mapQ2[(val("q2") || "").toLowerCase()] ?? 0;
  const a3 = norm(val("q3") || 0, 1, 5);
  const a4 = norm(val("q4") || 0, 1, 5);
  const a5 = norm(val("q5") || 0, 1, 5);
  const a6 = mapQ6[(val("q6") || "").toLowerCase()] ?? 0;
  const a8 = mapQ8[(val("q8") || "").toLowerCase()] ?? 0;

  const score = a1 * W.q1 + a2 * W.q2 + a3 * W.q3 + a4 * W.q4 + a5 * W.q5 + a6 * W.q6 + a8 * W.q8;

  return Math.round(score * 100);
}

function bucketFor(p) {
  if (p >= 65) return "high";
  if (p >= 35) return "mid";
  return "low";
}

/* ==============================
   Modal (Popup) – erzeugt sich selbst, falls nicht vorhanden
============================== */
function ensureModalStyles() {
  if (document.getElementById("quiz-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "quiz-modal-styles";
  style.textContent = `
    dialog#resultModal.modal{
      width:min(820px, calc(100% - 28px));
      border:1px solid var(--line);
      border-radius:16px;
      padding:16px;
      background:#fff;
      box-shadow:0 18px 42px rgba(25,25,25,.18);
    }
    dialog#resultModal.modal::backdrop{ background:rgba(25,25,25,.55); }
    #resultModal .modal-head{
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      margin-bottom:12px;
    }
    #resultModal .modal-close{
      width:38px;height:38px;
      border-radius:12px;
      border:1px solid var(--line);
      background:#fff;
      cursor:pointer;
      font-size:22px;
      line-height:1;
    }
    #resultModal .modal-body{
      max-height:70vh;
      overflow:auto;
      padding-right:4px;
    }
  `;
  document.head.appendChild(style);
}

function ensureModal() {
  let dlg = document.getElementById("resultModal");
  if (dlg) return dlg;

  ensureModalStyles();

  dlg = document.createElement("dialog");
  dlg.id = "resultModal";
  dlg.className = "modal";
  dlg.innerHTML = `
    <div class="modal-head">
      <strong>Deine Auswertung</strong>
      <button type="button" class="modal-close" data-close-modal>×</button>
    </div>
    <div id="resultModalBody" class="modal-body"></div>
    <div class="cta-row" style="margin-top:14px;">
      <button type="button" class="btn btn-ghost" data-close-modal>Schließen</button>
    </div>
  `;
  document.body.appendChild(dlg);

  // Close Buttons
  dlg.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => dlg.close());
  });

  // Klick außerhalb schließt
  dlg.addEventListener("click", (e) => {
    const r = dlg.getBoundingClientRect();
    const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
    if (!inside) dlg.close();
  });

  return dlg;
}

function openResultModal(html) {
  const dlg = ensureModal();
  const body = dlg.querySelector("#resultModalBody");
  if (!body) return;

  body.innerHTML = html;
  dlg.showModal();
}

/* ==============================
   Templates (Modal-Content)
============================== */
const TAB_FONT = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

function cardWrap(title, innerHtml) {
  return `
    <div style="font-family:${TAB_FONT}; color:#333;">
      <h2 style="text-align:center; color:#b1976b; font-size:26px; margin:6px 0 16px;">
        ${title}
      </h2>
      <div style="background:#fff; border:1px solid #b1976b40; border-radius:10px; padding:18px;">
        ${innerHtml}
      </div>
    </div>
  `;
}

function templateHigh(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return cardWrap(
    "Du bist bereit für Veränderung",
    `
    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">${hello}</p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Dein Ergebnis liegt bei <strong>${pct} %</strong>. Das ist ein klarer Hinweis auf eine hohe innere Bereitschaft.
      Die Signale sind deutlich: Ein Teil in dir hat längst entschieden, dass es leichter, ruhiger und stimmiger werden darf.
      Diese Klarheit entsteht nicht zufällig – sie entsteht, wenn Körper und Unterbewusstsein in dieselbe Richtung zeigen.
    </p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Du bist an einem Punkt, an dem Veränderung nicht mehr nur ein Wunsch ist, sondern ein natürlicher nächster Schritt.
      Genau hier beginnt echte Transformation.
    </p>

    <p style="margin:0 0 16px 0; font-size:18px; line-height:1.6;">
      Ich lade dich zu einem kostenlosen Erstgespräch ein. Lass uns gemeinsam herausfinden, wie dein Weg aussehen kann
      und in welcher Weise dich Hypnose optimal unterstützen kann. Sanft, strukturiert und komplett auf dich abgestimmt.
    </p>

    <div style="text-align:center; margin-top:10px;">
      <a href="${BOOKING_LINK}" target="_blank" rel="noopener"
         style="display:inline-block; background:#b1976b; color:#fff; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:16px; font-weight:700;">
        Kostenloses Erstgespräch buchen
      </a>
    </div>
  `
  );
}

function templateMid(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return cardWrap(
    "Du bist auf dem Weg",
    `
    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">${hello}</p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Dein Ergebnis liegt bei <strong>${pct} %</strong>. Das entspricht dem mittleren Bereich.
      Etwas in dir spürt bereits, dass Veränderung gut tun würde – vielleicht nicht abrupt, sondern in einem Tempo,
      das sich für dich wirklich stimmig anfühlt.
    </p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Oft braucht es nur einen klaren nächsten Schritt, um vom inneren Wissen ins entspannte Tun zu kommen.
      Die Basis dafür ist da.
    </p>

    <p style="margin:0 0 16px 0; font-size:18px; line-height:1.6;">
      Ich lade dich zu einem kostenlosen Erstgespräch ein. Lass uns gemeinsam prüfen,
      ob das virtuelle Magenband gerade gut zu dir passt und wie Hypnose dich optimal unterstützen kann.
      Ohne Druck, mit Klarheit und mit voller Freiheit für deine Entscheidung.
    </p>

    <div style="text-align:center; margin-top:10px;">
      <a href="${BOOKING_LINK}" target="_blank" rel="noopener"
         style="display:inline-block; background:#b1976b; color:#fff; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:16px; font-weight:700;">
        Kostenloses Erstgespräch buchen
      </a>
    </div>
  `
  );
}

function templateLow(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return cardWrap(
    "Veränderung beginnt mit einem Gedanken",
    `
    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">${hello}</p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Dein Ergebnis liegt bei <strong>${pct} %</strong> und damit im unteren Bereich.
      Das kann bedeuten, dass dein Fokus im Moment noch auf anderen Themen liegt
      oder dass dein System zuerst Ruhe und Stabilität braucht, bevor große Schritte leicht werden.
    </p>

    <p style="margin:0 0 12px 0; font-size:18px; line-height:1.6;">
      Genau dafür ist ein sanfter Einstieg ideal.
    </p>

    <p style="margin:0 0 16px 0; font-size:18px; line-height:1.6;">
      Ich lade dich ein, dir in der Zwischenzeit eine kostenlose Hypnose zu gönnen.
      Sie hilft dir, zur Ruhe zu kommen, dich wieder mit deinem Körper zu verbinden
      und Schritt für Schritt Vertrauen aufzubauen – ganz ohne Druck.
      Wenn du später merkst, dass du mehr willst, ist der nächste Schritt jederzeit möglich.
    </p>

    <div style="text-align:center; margin-top:10px;">
      <a href="${FREEBIE_LINK}" target="_blank" rel="noopener"
         style="display:inline-block; background:#b1976b; color:#fff; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:16px; font-weight:700;">
        Gratis-Hypnose anhören
      </a>
    </div>
  `
  );
}

/* ==============================
   Inline-Auswertung im aktuellen Tab (kurz)
============================== */
function renderInline(p) {
  const blocks = {
    high: { title: "Du bist bereit für echte Veränderung.", body: "Der richtige Moment ist da – jetzt ins Tun kommen." },
    mid: { title: "Du bist auf dem Weg.", body: "Ein kleiner Impuls – und du startest." },
    low: { title: "Veränderung beginnt mit einem Gedanken.", body: "Erst Ruhe finden, dann klar losgehen." },
  };

  const key = bucketFor(p);
  const b = blocks[key];

  const resultEl = document.getElementById("result");
  if (!resultEl) return;

  resultEl.innerHTML = `
    <div class="quiz-result">
      <p><strong>Dein Ergebnis:</strong> ${p}%</p>
      <h3>${b.title}</h3>
      <p>${b.body}</p>
      <p class="muted">Die ausführliche Auswertung wurde als Popup geöffnet.</p>
    </div>`;
}

/* ==============================
   Klick-Handler
============================== */
const submitBtn = document.getElementById("quiz-submit");
if (submitBtn) {
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const fn = document.getElementById("fname");
    const ln = document.getElementById("lname");
    if (!fn || !ln) return;

    if (!fn.value.trim() || !ln.value.trim()) {
      alert("Bitte Vorname und Nachname ausfüllen.");
      (!fn.value.trim() ? fn : ln).focus();
      return;
    }

    const p = computeScore();
    const name = fullName();

    renderInline(p);

    const key = bucketFor(p);
    let html;
    if (key === "high") html = templateHigh(p, name);
    else if (key === "mid") html = templateMid(p, name);
    else html = templateLow(p, name);

    openResultModal(html);
  });
}
