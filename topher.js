/* ============================================================
   Topher — interaction layer
   - The Emotional Field: sets the whole page's hue
   - The "Watch it think" console: scenario playback
   - Scroll reveals + nav state
   ============================================================ */
(function () {
  "use strict";

  var EMOTIONS = {
    calm:  { color: "#E8826B", soft: "#D26A52" },
    warm:  { color: "#E0A85C", soft: "#E8826B" },
    grief: { color: "#7B86C9", soft: "#E8826B" },
    anger: { color: "#D9655A", soft: "#E0A85C" },
    care:  { color: "#E8826B", soft: "#D26A52" }
  };

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The page's current emotional source. Scroll-driven sections and the
  // console compete; the console wins while it is in view.
  function setEmotion(name) {
    var e = EMOTIONS[name] || EMOTIONS.calm;
    root.style.setProperty("--emotion", e.color);
    root.style.setProperty("--emotion-2", e.soft);
    if (window.__topherBrain) window.__topherBrain.setEmotion(e.color);
  }

  // Two competing sources of the page hue:
  //  - the live demo (what Topher is processing right now)
  //  - a content section the user has scrolled into
  // The demo drives the field while you're up top near the hero/console;
  // a section only takes over once it's clearly centered in the viewport.
  var demoEmotion = "calm";
  var sectionEmotion = null;
  function applyEmotion() { setEmotion(sectionEmotion || demoEmotion); }

  /* ---------- Scenarios for the console -------------------- */
  var SCENARIOS = {
    anger: {
      emotion: "anger",
      label: "Angry caller",
      turns: [
        { who: "Caller", text: "This is the third time I've called about my bill. Nobody's fixed it and I'm done." },
        { who: "Topher", text: "You're right to be frustrated — three calls is too many. I've got your account open now, and I'm going to make sure this ends today." }
      ],
      brain: {
        emotion: "Anger",
        emotionNote: "billing failure, repeated",
        intensity: 82,
        objective: "De-escalate, then resolve",
        firstMove: "Acknowledge the failure before anything else",
        blocked: "calm down"
      }
    },
    grief: {
      emotion: "grief",
      label: "Grieving caller",
      turns: [
        { who: "Caller", text: "I need to cancel my mother's appointments. She passed away on Sunday." },
        { who: "Topher", text: "I'm so sorry. I'll take care of everything on her account right now — you won't need to call back. Is there anything you'd like me to pass along to the team?" }
      ],
      brain: {
        emotion: "Grief",
        emotionNote: "bereavement disclosed",
        intensity: 71,
        objective: "Hold space, remove all friction",
        firstMove: "Acknowledge the loss before any logistics",
        blocked: "Can I ask why you're cancelling?"
      }
    },
    warm: {
      emotion: "warm",
      label: "Anxious caller",
      turns: [
        { who: "Caller", text: "I've got a consultation tomorrow and I'm honestly really nervous about it. Is that normal?" },
        { who: "Topher", text: "That's completely normal, and it's good you called. Let me walk you through exactly what tomorrow looks like — step by step." }
      ],
      brain: {
        emotion: "Anxiety",
        emotionNote: "anticipatory, pre-visit",
        intensity: 57,
        objective: "Reassure, then inform",
        firstMove: "Normalize the feeling before giving facts",
        blocked: "There's nothing to worry about"
      }
    },
    calm: {
      emotion: "calm",
      label: "Routine call",
      turns: [
        { who: "Caller", text: "Hi — I'd like to book a cleaning for sometime next week if you've got it." },
        { who: "Topher", text: "Happy to help. I've got Tuesday at 10, or Thursday at 2 — which works better for you?" }
      ],
      brain: {
        emotion: "Calm",
        emotionNote: "neutral, transactional",
        intensity: 21,
        objective: "Book it cleanly",
        firstMove: "Offer two concrete options",
        blocked: null
      }
    }
  };
  var ORDER = ["anger", "grief", "warm", "calm"];

  /* ---------- Build the console --------------------------- */
  var tabsEl = document.getElementById("tabs");
  var turnsEl = document.getElementById("turns");
  var traceEl = document.getElementById("trace");
  var consoleEl = document.getElementById("console");

  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  var current = null;
  var consoleInView = false;

  function renderTabs() {
    ORDER.forEach(function (key) {
      var s = SCENARIOS[key];
      var b = document.createElement("button");
      b.className = "tab";
      b.setAttribute("role", "tab");
      b.dataset.key = key;
      b.innerHTML = '<span class="swatch" style="background:' + EMOTIONS[s.emotion].color +
        ';box-shadow:0 0 9px ' + EMOTIONS[s.emotion].color + '"></span>' + s.label;
      b.addEventListener("click", function () { play(key, true); });
      tabsEl.appendChild(b);
    });
  }

  function selectTab(key) {
    Array.prototype.forEach.call(tabsEl.children, function (b) {
      b.setAttribute("aria-selected", b.dataset.key === key ? "true" : "false");
    });
  }

  var userLocked = false; // user clicked a tab -> stop auto-advance

  function play(key, fromUser) {
    if (fromUser) userLocked = true;
    current = key;
    clearTimers();
    var s = SCENARIOS[key];
    selectTab(key);
    demoEmotion = s.emotion;
    applyEmotion();

    // reset panels
    turnsEl.innerHTML = "";
    traceEl.innerHTML = "";

    // Build call turns (hidden)
    var turnNodes = s.turns.map(function (t, i) {
      var d = document.createElement("div");
      d.className = "turn turn--" + (t.who === "Caller" ? "caller" : "topher");
      d.innerHTML = '<div class="turn__who">' + t.who + '</div>' +
        '<div class="turn__bubble">' + t.text + '</div>';
      turnsEl.appendChild(d);
      return d;
    });

    // Build brain trace rows (hidden)
    var b = s.brain;
    var rows = [];
    rows.push(traceRow("Emotion detected",
      '<span class="trace__v"><span class="accent">' + b.emotion + '</span> · ' + b.emotionNote + '</span>'));
    var meterRow = traceRow("Intensity",
      '<div class="meter"><div class="meter__track"><div class="meter__fill" id="meterFill"></div></div>' +
      '<div class="meter__num" id="meterNum">0%</div></div>');
    rows.push(meterRow);
    rows.push(traceRow("Objective", '<span class="trace__v">' + b.objective + '</span>'));
    rows.push(traceRow("Required first move", '<span class="trace__v">' + b.firstMove + '</span>'));
    if (b.blocked) {
      rows.push(traceRow("Refused to say",
        '<span class="blocked"><span class="blocked__x">blocked</span><s>&ldquo;' + b.blocked + '&rdquo;</s></span>'));
    } else {
      rows.push(traceRow("Intervention",
        '<span class="blocked blocked--none"><span class="blocked__x">clear</span>No emotional risk — book and close.</span>'));
    }
    rows.forEach(function (r) { traceEl.appendChild(r); });

    // ----- choreograph -----
    var T = reduce ? 0 : 1;

    // caller speaks
    after(300 * T, function () { turnNodes[0].classList.add("in"); });

    // brain starts thinking right after caller
    after(820 * T, function () { rows[0].classList.add("in"); });
    after(1180 * T, function () {
      rows[1].classList.add("in");
      var fill = document.getElementById("meterFill");
      var num = document.getElementById("meterNum");
      after(120 * T, function () { if (fill) fill.style.width = b.intensity + "%"; });
      countTo(num, b.intensity, reduce ? 1 : 1000);
    });
    after(1640 * T, function () { rows[2].classList.add("in"); });
    after(2000 * T, function () { rows[3].classList.add("in"); });
    after(2380 * T, function () { rows[4].classList.add("in"); });

    // topher replies after the brain has decided
    if (turnNodes[1]) {
      var typing = document.createElement("div");
      typing.className = "turn turn--topher in";
      typing.innerHTML = '<div class="turn__who">Topher</div><div class="turn__bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
      after(2650 * T, function () {
        if (!reduce) turnsEl.appendChild(typing);
      });
      after((reduce ? 700 : 3450), function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        turnNodes[1].classList.add("in");
      });
    }

    // auto-advance to next scenario
    if (!userLocked) {
      after(reduce ? 4200 : 7200, function () {
        if (userLocked) return;
        var idx = (ORDER.indexOf(key) + 1) % ORDER.length;
        play(ORDER[idx], false);
      });
    }
  }

  function traceRow(k, vHtml) {
    var d = document.createElement("div");
    d.className = "trace__row";
    d.innerHTML = '<div class="trace__k">' + k + '</div>' + vHtml;
    return d;
  }

  function countTo(el, target, dur) {
    if (!el) return;
    if (dur <= 1) { el.textContent = target + "%"; return; }
    var start = performance.now();
    var done = false;
    function step(now) {
      if (done) return;
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + "%";
      if (p < 1) requestAnimationFrame(step);
      else done = true;
    }
    requestAnimationFrame(step);
    // Guarantee the final value even if rAF is throttled (background tab).
    timers.push(setTimeout(function () { if (!done) { done = true; el.textContent = target + "%"; } }, dur + 120));
  }

  renderTabs();

  /* ---------- Console enters view: start it --------------- */
  // Rect-based visibility (IntersectionObserver is unreliable in some
  // embedded/preview contexts, so we drive everything off scroll + rAF).
  var started = false;
  function checkConsole() {
    if (started || !consoleEl) return;
    var r = consoleEl.getBoundingClientRect();
    var vh = window.innerHeight;
    if (r.top < vh * 0.85 && r.bottom > vh * 0.15) { started = true; play("anger", false); }
  }

  /* ---------- Section-driven hue -------------------------- */
  // Sections carry data-emotion. One only takes over the field once its
  // centre is clearly near the middle of the viewport; otherwise the live
  // demo keeps driving the hue (so the hero brain glows with the demo).
  var emoSections = Array.prototype.slice.call(document.querySelectorAll("[data-emotion]"));
  function onScrollHue() {
    // Cap the assumed viewport — some embedded contexts report the full
    // document height as innerHeight, which would wrongly "center" a section.
    var vh = Math.min(window.innerHeight, 1000);
    var probe = window.scrollY + vh * 0.5;
    var best = null;
    for (var i = 0; i < emoSections.length; i++) {
      var sec = emoSections[i];
      var top = sec.getBoundingClientRect().top + window.scrollY;
      var bot = top + sec.offsetHeight;
      if (probe >= top && probe < bot) { best = sec; break; }
    }
    // A section only takes the hue once the user has actually scrolled into
    // it; near the top the live demo keeps driving the field (and the brain).
    sectionEmotion = best ? best.dataset.emotion : null;
    applyEmotion();
  }

  /* ---------- Reveals ------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function checkReveals() {
    var vh = window.innerHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) {
        el.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }

  /* ---------- Nav state ----------------------------------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("nav--scrolled", window.scrollY > 12);
    checkConsole();
    checkReveals();
    onScrollHue();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Initial passes + a short rAF warm-up so first-paint elements settle in
  // even without any scroll event.
  onScroll();
  var warmFrames = 0;
  (function warm() {
    onScroll();
    if (++warmFrames < 90) requestAnimationFrame(warm);
  })();
  window.addEventListener("load", onScroll);

  // The live demo is the core "aha" — it must play on its own within a
  // couple of seconds of landing, regardless of exact scroll position.
  setTimeout(function () {
    if (!started) { started = true; play("anger", false); }
  }, reduce ? 250 : 700);

})();
