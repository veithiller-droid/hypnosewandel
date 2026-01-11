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
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function fullName() {
  const fn = (document.getElementById("fname")?.value || "").trim();
  const ln = (document.getElementById("lname")?.value || "").trim();
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
   Modal (Popup) – echtes <dialog>, Close funktioniert
============================== */
function ensureModalStyles() {
  if (document.getElementById("quiz-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "quiz-modal-styles";
  style.textContent = `
    dialog#resultModal.modal{
      width:min(860px, calc(100% - 28px));
      border:1px solid var(--line);
      border-radius:16px;
      padding:0;
      background:#fff;
      box-shadow:0 18px 42px rgba(25,25,25,.18);
    }
    dialog#resultModal.modal::backdrop{ background:rgba(25,25,25,.55); }

    #resultModal .modal-head{
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      padding:14px 16px;
      border-bottom:1px solid var(--line);
      background:rgba(255,255,255,.96);
      position:sticky; top:0;
    }
    #resultModal .modal-title{ font-weight:800; }

    #resultModal .modal-close{
      width:38px;height:38px;
      border-radius:12px;
      border:1px solid var(--line);
      background:#fff;
      cursor:pointer;
      font-size:22px;
      line-height:1;
      font-weight:800;
    }

    #resultModal .modal-body{
      padding:16px;
      max-height:70vh;
      overflow:auto;
    }

    #resultModal .modal-foot{
      padding:14px 16px;
      border-top:1px solid var(--line);
      background:rgba(255,255,255,.96);
    }

    /* Content-Optik */
    .r-h1{ margin:0 0 10px 0; color:#b1976b; font-size:24px; line-height:1.2; }
    .r-p{ margin:0 0 12px 0; font-size:16px; line-height:1.6; color:#333; }
    .r-cta{ display:flex; justify-content:center; margin-top:14px; }
    .r-btn{
      display:inline-block;
      background:#b1976b; color:#fff; text-decoration:none;
      padding:12px 18px; border-radius:12px;
      font-weight:800;
    }
    .r-note{ margin-top:12px; color:var(--muted); font-size:14px; }
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
      <div class="modal-title">Deine Auswertung</div>
      <button type="button" class="modal-close" data-close-modal aria-label="Schließen">×</button>
    </div>

    <div id="resultModalBody" class="modal-body"></div>

    <div class="modal-foot">
      <div class="cta-row" style="margin:0;">
        <button type="button" class="btn btn-ghost" data-close-modal>Schließen</button>
      </div>
    </div>
  `;
  document.body.appendChild(dlg);

  // Close buttons
  dlg.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => dlg.close());
  });

  // Klick auf Backdrop schließt (wenn direkt das dialog getroffen wird)
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  return dlg;
}

function openResultModal(contentHtml) {
  const dlg = ensureModal();
  const body = dlg.querySelector("#resultModalBody");
  if (!body) return;

  body.innerHTML = contentHtml;
  dlg.showModal();

  // Scroll im Modal nach oben
  body.scrollTop = 0;
}

/* ==============================
   Templates (nur HTML-Fragmente!)
============================== */
function tplHigh(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return `
    <h2 class="r-h1">Du bist bereit für Veränderung</h2>
    <p class="r-p">${hello}</p>
    <p class="r-p">Dein Ergebnis liegt bei <strong>${pct}%</strong>. Das spricht für eine hohe innere Bereitschaft – Veränderung darf jetzt leicht und stimmig werden.</p>
    <p class="r-p">Im kostenlosen Erstgespräch klären wir, ob das virtuelle Magenband gerade gut zu dir passt und wie Hypnose dich am besten unterstützt.</p>
    <div class="r-cta">
      <a class="r-btn" href="${BOOKING_LINK}" target="_blank" rel="noopener">Kostenloses Erstgespräch buchen</a>
    </div>
    <div class="r-note">Der Link öffnet in einem neuen Tab.</div>
  `;
}

function tplMid(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return `
    <h2 class="r-h1">Du bist auf dem Weg</h2>
    <p class="r-p">${hello}</p>
    <p class="r-p">Dein Ergebnis liegt bei <strong>${pct}%</strong>. Du hast bereits eine gute Basis – jetzt hilft oft ein klarer nächster Schritt.</p>
    <p class="r-p">Im kostenlosen Erstgespräch schauen wir gemeinsam, welches Tempo und welche Unterstützung für dich gerade passt.</p>
    <div class="r-cta">
      <a class="r-btn" href="${BOOKING_LINK}" target="_blank" rel="noopener">Kostenloses Erstgespräch buchen</a>
    </div>
    <div class="r-note">Der Link öffnet in einem neuen Tab.</div>
  `;
}

function tplLow(pct, name) {
  const hello = name ? `Hallo ${name},` : `Hallo,`;
  return `
    <h2 class="r-h1">Veränderung beginnt mit einem Gedanken</h2>
    <p class="r-p">${hello}</p>
    <p class="r-p">Dein Ergebnis liegt bei <strong>${pct}%</strong>. Vielleicht braucht dein System gerade zuerst Ruhe und Stabilität – das ist völlig okay.</p>
    <p class="r-p">Ein sanfter Einstieg kann helfen: eine kostenlose Hypnose als kleine Auszeit, ohne Druck.</p>
    <div class="r-cta">
      <a class="r-btn" href="${FREEBIE_LINK}" target="_blank" rel="noopener">Gratis-Hypnose anhören</a>
    </div>
    <div class="r-note">Der Link öffnet in einem neuen Tab.</div>
  `;
}

/* ==============================
   Inline-Auswertung (kurz)
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

    // Fragen-Check (damit nicht „leere“ Scores rauskommen)
    const required = ["q1","q2","q3","q4","q5","q6","q7","q8"];
    for (const q of required) {
      if (!val(q)) {
        alert("Bitte beantworte alle Fragen, damit wir dich sauber auswerten können.");
        // Scroll zur ersten offenen Frage:
        const first = document.querySelector(`input[name="${q}"]`);
        if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    const p = computeScore();
    const name = fullName();

    renderInline(p);

    const key = bucketFor(p);
    let content = "";
    if (key === "high") content = tplHigh(p, name);
    else if (key === "mid") content = tplMid(p, name);
    else content = tplLow(p, name);

    openResultModal(content);
  });
}
