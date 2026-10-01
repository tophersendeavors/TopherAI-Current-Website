/* ============================================================
   HVAC AI Receptionist — interaction layer
   - Live "Watch it answer" console (job-capture scenarios)
   - EN/ES i18n
   - Hero-angle + accent Tweaks (vanilla host protocol)
   - Scroll reveals, nav state, emotional-field hue, demo form
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Accent (house hue) -------------------------- */
  var ACCENTS = {
    coral: { color: "#E8826B", soft: "#D26A52" },
    ember: { color: "#E1663C", soft: "#C9512B" },
    trust: { color: "#4F8BD0", soft: "#3D6FB0" }
  };
  var accent = "coral";

  // Emotional hues: house accent for calm/care; real emotion for the rest.
  var EMOTIONS = {
    calm:  { color: "#E8826B", soft: "#D26A52" },
    warm:  { color: "#E0A85C", soft: "#E8826B" },
    grief: { color: "#7B86C9", soft: "#E8826B" },
    anger: { color: "#D9655A", soft: "#E0A85C" },
    care:  { color: "#E8826B", soft: "#D26A52" }
  };

  function applyAccent(name) {
    var a = ACCENTS[name] || ACCENTS.coral;
    accent = name;
    EMOTIONS.calm = { color: a.color, soft: a.soft };
    EMOTIONS.care = { color: a.color, soft: a.soft };
    root.style.setProperty("--coral", a.color);
    root.style.setProperty("--coral-deep", a.soft);
    applyEmotion();
  }

  function setEmotion(name) {
    var e = EMOTIONS[name] || EMOTIONS.calm;
    root.style.setProperty("--emotion", e.color);
    root.style.setProperty("--emotion-2", e.soft);
    if (window.__topherBrain) window.__topherBrain.setEmotion(e.color);
  }
  var demoEmotion = "anger", sectionEmotion = null;
  function applyEmotion() { setEmotion(sectionEmotion || demoEmotion); }

  /* ---------- i18n ---------------------------------------- */
  var DIRECTIONS = {
    en: {
      pain: {
        eyebrow: "For HVAC &amp; home-service owners",
        title: 'The call you miss at 8pm doesn\'t leave a voicemail. It calls your <span class="em">competitor</span>.',
        sub: 'Topher is an AI receptionist that answers every call, books the job, and texts you the details — <strong>24/7</strong>. We\'ll build one on your real business, free, and you call it yourself.'
      },
      curiosity: {
        eyebrow: "For HVAC &amp; home-service owners",
        title: 'What if your phone got answered <span class="em">every time</span> — nights, weekends, two at once — without hiring anyone?',
        sub: 'Topher is an AI receptionist for home-service companies. We\'ll set up a free demo on your business: call it, hear it book a job, and watch the details hit your phone by text.'
      },
      owner: {
        eyebrow: "Owner to owner",
        title: 'How many jobs did you miss this week while you were <span class="em">on a call</span>?',
        sub: 'We build AI phone receptionists for HVAC &amp; home-service companies. Want to see one running on your business before you pay a dime? Free, live in a day, and you test it yourself.'
      }
    },
    es: {
      pain: {
        eyebrow: "Para dueños de HVAC y servicios a domicilio",
        title: 'La llamada que pierdes a las 8pm no deja mensaje. Llama a tu <span class="em">competencia</span>.',
        sub: 'Topher es un recepcionista con IA que contesta cada llamada, agenda el trabajo y te envía los detalles por texto — <strong>24/7</strong>. Lo construimos sobre tu negocio real, gratis, y tú mismo lo llamas.'
      },
      curiosity: {
        eyebrow: "Para dueños de HVAC y servicios a domicilio",
        title: '¿Y si tu teléfono se contestara <span class="em">siempre</span> — noches, fines de semana, dos a la vez — sin contratar a nadie?',
        sub: 'Topher es un recepcionista con IA para empresas de servicios. Armamos una demo gratis sobre tu negocio: llámala, escúchala agendar un trabajo y mira llegar los detalles por texto.'
      },
      owner: {
        eyebrow: "De dueño a dueño",
        title: '¿Cuántos trabajos perdiste esta semana mientras <span class="em">estabas en una llamada</span>?',
        sub: 'Construimos recepcionistas telefónicos con IA para HVAC y servicios a domicilio. ¿Quieres ver uno funcionando en tu negocio antes de pagar? Gratis, listo en un día, y tú lo pruebas.'
      }
    }
  };

  var I18N = {
    en: {
      nav_cta: "Get my free demo", cta_primary: "Get my free demo", cta_secondary: "Or call the live demo",
      offer_1: "Free demo", offer_2: "Built on your business", offer_3: "Live in 24 hours", offer_4: "No card",
      console_live: "Watch it answer · live", panel_call: "The call", panel_call_2: "audio · transcribed",
      panel_brain: "What it does", panel_brain_2: "job · capture",
      shift: 'Every missed call is a job your <span class="strike">competitor</span> <span class="em">books</span>.',
      how_eyebrow: "What it does on every call",
      how_title: "It answers, it books, and it texts you. While you're on the roof.",
      step1_t: "Answers in 2 seconds", step1_p: "Nights, weekends, two calls at once — Topher picks up every time, sounding like your front desk. It always says it's AI.",
      step2_t: "Books the job", step2_p: "It captures the service, the address, and the urgency, then drops the appointment straight into your day — no callback tag.",
      step3_t: "Texts you the details", step3_p: "The moment a call ends, you get a text: who called, what they need, and when they're booked. You stay in the loop without lifting the phone.",
      build_eyebrow: "Your free demo", build_title: 'We build it on <span class="em">your</span> business. You call it yourself.',
      build_p: "In 24 hours you get a phone number that answers as your company. Call it, ask it to book an AC repair, and watch the booking hit your phone by text.",
      build_li1: "Answers with your business name and services.", build_li2: "Books a real job and texts the details to you.", build_li3: "No card, no contract — test it, then decide.",
      phone_date: "Tuesday · 8:42 PM", phone_title: "One missed call, <em>handled</em>", phone_meta: "You were on a job. Topher wasn't.",
      cf1_k: "Incoming · 8:41 PM", cf1_t: '"My AC just died and it\'s 94° inside."', cf1_s: "Old way: <s>straight to voicemail</s>",
      cf2_k: "Booked · 8:42 PM", cf2_t: "Emergency AC repair — tomorrow, 8:00 AM", cf2_s: "Name, address &amp; issue captured.",
      cf3_k: "Text to you · 8:42 PM", cf3_t: "New job booked: Maria R., 14 Oak St — no cooling. Tue 8AM.", cf3_s: "Sent the second the call ended.",
      demo_eyebrow: "Free · live in 24 hours", demo_title: "Hear it answer for your company.",
      demo_p: "Tell us about your business and we'll build a working demo on it — free. Within 24 hours you'll get a number to call and test yourself.",
      demo_a1: "No credit card, no commitment.", demo_a2: "Built on your real business name &amp; services.", demo_a3: "You call it and decide — we talk price after.",
      form_title: "Build my free demo", form_sub: "Takes 30 seconds. We'll text you when it's ready.",
      form_name: "Your name", form_phone: "Mobile number", form_biz: "Business name", form_city: "City / service area", form_trade: "Main service",
      trade_hvac: "HVAC — heating &amp; cooling", trade_plumb: "Plumbing", trade_elec: "Electrical", trade_other: "Other home service",
      form_submit: "Build my free demo", form_fine: "By submitting you agree we can text you about your demo. No spam, opt out anytime.",
      sent_t: "You're in. Building it now.", sent_p: "We'll text you within 24 hours with a number to call and hear it answer as your company.",
      trust_eyebrow: "Straight with you", trust_title: "What it will and won't do.",
      trust1_t: "Always says it's AI", trust1_p: "Topher never pretends to be a person. The goal is to handle the call as well as your best receptionist would — out in the open.",
      trust2_t: "Hands off what it shouldn't handle", trust2_p: "A genuine emergency or a call it can't book gets routed to you or your on-call tech — not stranded in a menu.",
      trust3_t: "You see every call", trust3_p: "Each call is transcribed and texted to you. Nothing happens on your line that you can't read back later.",
      final_title: 'Stop sending after-hours jobs to <span class="em">voicemail</span>.', final_cta: "Get my free demo",
      foot1: "Topher always identifies itself as AI. It is built for human-level skill, never to pass as human.",
      foot2: 'Demo timeframe and "answers every call" depend on your setup — we\'ll only promise what we can deliver for your business.',
      foot3: "Every call is transcribed and auditable. Topher won't pressure a caller in distress.",
      foot_tag: "Answers every call. Books the job. Texts you.", mobile_cta: "Get my free demo"
    },
    es: {
      nav_cta: "Quiero mi demo gratis", cta_primary: "Quiero mi demo gratis", cta_secondary: "O llama a la demo en vivo",
      offer_1: "Demo gratis", offer_2: "Sobre tu negocio", offer_3: "Listo en 24 horas", offer_4: "Sin tarjeta",
      console_live: "Escúchalo contestar · en vivo", panel_call: "La llamada", panel_call_2: "audio · transcrito",
      panel_brain: "Lo que hace", panel_brain_2: "captura · de trabajo",
      shift: 'Cada llamada perdida es un trabajo que <span class="em">agenda</span> tu <span class="strike">competencia</span>.',
      how_eyebrow: "Lo que hace en cada llamada",
      how_title: "Contesta, agenda y te avisa por texto. Mientras tú estás en el techo.",
      step1_t: "Contesta en 2 segundos", step1_p: "Noches, fines de semana, dos llamadas a la vez — Topher contesta siempre, como tu recepción. Siempre dice que es IA.",
      step2_t: "Agenda el trabajo", step2_p: "Capta el servicio, la dirección y la urgencia, y pone la cita directo en tu día — sin notas de devolución.",
      step3_t: "Te manda los detalles", step3_p: "En cuanto termina la llamada recibes un texto: quién llamó, qué necesita y cuándo quedó agendado. Te enteras sin tocar el teléfono.",
      build_eyebrow: "Tu demo gratis", build_title: 'Lo construimos sobre <span class="em">tu</span> negocio. Tú mismo lo llamas.',
      build_p: "En 24 horas recibes un número que contesta como tu empresa. Llámalo, pídele agendar una reparación de AC y mira llegar la cita por texto.",
      build_li1: "Contesta con el nombre y los servicios de tu negocio.", build_li2: "Agenda un trabajo real y te manda los detalles.", build_li3: "Sin tarjeta, sin contrato — pruébalo y decide.",
      phone_date: "Martes · 8:42 PM", phone_title: "Una llamada perdida, <em>resuelta</em>", phone_meta: "Estabas en un trabajo. Topher no.",
      cf1_k: "Entrante · 8:41 PM", cf1_t: '"Se dañó mi AC y hay 34° adentro."', cf1_s: "Antes: <s>directo al buzón</s>",
      cf2_k: "Agendado · 8:42 PM", cf2_t: "Reparación de AC urgente — mañana, 8:00 AM", cf2_s: "Nombre, dirección y problema captados.",
      cf3_k: "Texto para ti · 8:42 PM", cf3_t: "Nuevo trabajo: Maria R., 14 Oak St — sin enfriar. Mar 8AM.", cf3_s: "Enviado al terminar la llamada.",
      demo_eyebrow: "Gratis · listo en 24 horas", demo_title: "Escúchalo contestar por tu empresa.",
      demo_p: "Cuéntanos de tu negocio y construimos una demo funcional sobre él — gratis. En 24 horas recibes un número para llamar y probar tú mismo.",
      demo_a1: "Sin tarjeta, sin compromiso.", demo_a2: "Sobre el nombre y servicios reales de tu negocio.", demo_a3: "Lo llamas y decides — el precio lo hablamos después.",
      form_title: "Construir mi demo gratis", form_sub: "Toma 30 segundos. Te avisamos por texto cuando esté lista.",
      form_name: "Tu nombre", form_phone: "Número de celular", form_biz: "Nombre del negocio", form_city: "Ciudad / zona de servicio", form_trade: "Servicio principal",
      trade_hvac: "HVAC — calefacción y aire", trade_plumb: "Plomería", trade_elec: "Electricidad", trade_other: "Otro servicio a domicilio",
      form_submit: "Construir mi demo gratis", form_fine: "Al enviar aceptas que te enviemos textos sobre tu demo. Sin spam, cancela cuando quieras.",
      sent_t: "Listo. La estamos construyendo.", sent_p: "Te enviaremos un texto en 24 horas con un número para llamar y escucharlo contestar como tu empresa.",
      trust_eyebrow: "Claro contigo", trust_title: "Lo que hará y lo que no.",
      trust1_t: "Siempre dice que es IA", trust1_p: "Topher nunca finge ser persona. La meta es manejar la llamada tan bien como tu mejor recepcionista — de frente.",
      trust2_t: "Pasa lo que no debe manejar", trust2_p: "Una emergencia real o una llamada que no puede agendar se transfiere a ti o a tu técnico de guardia — no se queda en un menú.",
      trust3_t: "Ves cada llamada", trust3_p: "Cada llamada se transcribe y te llega por texto. Nada pasa en tu línea que no puedas releer después.",
      final_title: 'Deja de mandar los trabajos de la noche al <span class="em">buzón</span>.', final_cta: "Quiero mi demo gratis",
      foot1: "Topher siempre se identifica como IA. Está hecho para habilidad de nivel humano, nunca para hacerse pasar por humano.",
      foot2: 'El tiempo de la demo y "contesta cada llamada" dependen de tu configuración — solo prometemos lo que podemos cumplir para tu negocio.',
      foot3: "Cada llamada se transcribe y es auditable. Topher no presiona a una persona en apuros.",
      foot_tag: "Contesta cada llamada. Agenda el trabajo. Te avisa.", mobile_cta: "Quiero mi demo gratis"
    }
  };

  /* ---------- Console scenarios (per language) ------------ */
  function buildScenarios(lang) {
    var es = lang === "es";
    return {
      afterhours: {
        emotion: "anger", label: es ? "Emergencia nocturna" : "After-hours emergency",
        turns: [
          { who: es ? "Llamante" : "Caller", text: es ? "Son las 11 de la noche y mi calefacción se apagó. La casa está helada y tengo un bebé." : "It's 11pm and my furnace just quit. The house is freezing and I've got a baby." },
          { who: "Topher", text: es ? "Eso no puede esperar — lo agendo como urgente ahora mismo. Tengo un técnico para mañana a las 8 AM y le aviso al dueño esta noche." : "That can't wait — I'm booking this as an emergency right now. I've got a tech for 8 AM tomorrow and I'm alerting the owner tonight." }
        ],
        brain: { intent: es ? "Sin calefacción" : "No heat", intentNote: es ? "urgente · noche" : "emergency · after-hours", intensity: 88,
          action: es ? "Agendado: reparación urgente, mañana 8:00 AM" : "Booked: emergency repair, 8:00 AM tomorrow",
          alert: es ? "Texto enviado al dueño ahora" : "Texted the owner now",
          outcome: es ? "Trabajo captado — habría ido al buzón" : "Job captured — would've hit voicemail" }
      },
      twocalls: {
        emotion: "warm", label: es ? "Dos llamadas a la vez" : "Two calls at once",
        turns: [
          { who: es ? "Llamante" : "Caller", text: es ? "Llamé dos veces, ¿hay alguien? Quiero precio para un AC nuevo." : "I've called twice — is anyone there? I want a quote for a new AC unit." },
          { who: "Topher", text: es ? "Aquí estoy, gracias por tu paciencia. Te agendo una estimación gratis: ¿te queda el jueves a las 2 PM?" : "I'm right here, thanks for your patience. Let me get you a free estimate — does Thursday at 2 PM work?" }
        ],
        brain: { intent: es ? "Estimación de instalación" : "New-install estimate", intentNote: es ? "segunda línea · en espera" : "second line · was holding", intensity: 44,
          action: es ? "Agendado: estimación gratis, jue 2:00 PM" : "Booked: free estimate, Thu 2:00 PM",
          alert: es ? "Detalles enviados al dueño" : "Details texted to owner",
          outcome: es ? "Segunda línea contestada — sin trabajo perdido" : "2nd line answered — no missed job" }
      },
      quote: {
        emotion: "calm", label: es ? "Buscando precio" : "Price shopper",
        turns: [
          { who: es ? "Llamante" : "Caller", text: es ? "Solo quiero saber cuánto cuesta cambiar un compresor." : "I just want a ballpark on replacing a compressor." },
          { who: "Topher", text: es ? "Buena pregunta — el precio depende de la unidad, así que lo mejor es una revisión gratis. ¿Te agendo el martes a las 10 AM?" : "Good question — pricing depends on the unit, so the honest move is a free diagnostic. Can I book you Tuesday at 10 AM?" }
        ],
        brain: { intent: es ? "Pregunta de precio → estimación" : "Price question → estimate", intentNote: es ? "captar antes de colgar" : "capture before they hang up", intensity: 31,
          action: es ? "Agendado: diagnóstico gratis, mar 10:00 AM" : "Booked: free diagnostic, Tue 10:00 AM",
          alert: es ? "Contacto guardado y enviado" : "Contact captured & texted",
          outcome: es ? "No se perdió por un número al teléfono" : "Not lost to a number over the phone" }
      },
      routine: {
        emotion: "care", label: es ? "Mantenimiento" : "Routine tune-up",
        turns: [
          { who: es ? "Llamante" : "Caller", text: es ? "Necesito el mantenimiento anual de mi calefacción antes del invierno." : "I need my yearly furnace tune-up before winter." },
          { who: "Topher", text: es ? "Claro. Tengo el miércoles a las 9 AM o el viernes a la 1 PM — ¿cuál te conviene?" : "Happy to help. I've got Wednesday at 9 AM or Friday at 1 PM — which works better?" }
        ],
        brain: { intent: es ? "Mantenimiento estacional" : "Seasonal maintenance", intentNote: es ? "neutral · transaccional" : "neutral · transactional", intensity: 18,
          action: es ? "Agendado: mantenimiento, mié 9:00 AM" : "Booked: tune-up, Wed 9:00 AM",
          alert: es ? "Cita confirmada y enviada" : "Appointment confirmed & texted",
          outcome: es ? "Reservado y cerrado, sin que muevas un dedo" : "Booked and closed, hands-free" }
      }
    };
  }
  var ORDER = ["afterhours", "twocalls", "quote", "routine"];
  var SCEN = buildScenarios("en");

  /* ---------- Console DOM --------------------------------- */
  var tabsEl = document.getElementById("tabs");
  var turnsEl = document.getElementById("turns");
  var traceEl = document.getElementById("trace");
  var consoleEl = document.getElementById("console");

  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  var current = "afterhours", userLocked = false, started = false;

  function renderTabs() {
    tabsEl.innerHTML = "";
    ORDER.forEach(function (key) {
      var s = SCEN[key];
      var b = document.createElement("button");
      b.className = "tab"; b.setAttribute("role", "tab"); b.dataset.key = key;
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
  function traceRow(k, vHtml) {
    var d = document.createElement("div");
    d.className = "trace__row";
    d.innerHTML = '<div class="trace__k">' + k + '</div>' + vHtml;
    return d;
  }
  function countTo(el, target, dur) {
    if (!el) return;
    if (dur <= 1) { el.textContent = target + "%"; return; }
    var start = performance.now(), done = false;
    function step(now) {
      if (done) return;
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + "%";
      if (p < 1) requestAnimationFrame(step); else done = true;
    }
    requestAnimationFrame(step);
    timers.push(setTimeout(function () { if (!done) { done = true; el.textContent = target + "%"; } }, dur + 120));
  }

  function play(key, fromUser) {
    if (fromUser) userLocked = true;
    current = key;
    clearTimers();
    var s = SCEN[key], lang = curLang;
    selectTab(key);
    demoEmotion = s.emotion; applyEmotion();
    turnsEl.innerHTML = ""; traceEl.innerHTML = "";

    var turnNodes = s.turns.map(function (t) {
      var d = document.createElement("div");
      d.className = "turn turn--" + (t.who === "Topher" ? "topher" : "caller");
      d.innerHTML = '<div class="turn__who">' + t.who + '</div><div class="turn__bubble">' + t.text + '</div>';
      turnsEl.appendChild(d);
      return d;
    });

    var b = s.brain;
    var L = lang === "es"
      ? { intent: "Intención detectada", urg: "Urgencia", act: "Acción tomada", al: "Aviso al dueño", out: "Resultado", tag: "captado" }
      : { intent: "Intent detected", urg: "Urgency", act: "Action taken", al: "Owner alert", out: "Outcome", tag: "captured" };
    var rows = [];
    rows.push(traceRow(L.intent, '<span class="trace__v"><span class="accent">' + b.intent + '</span> · ' + b.intentNote + '</span>'));
    rows.push(traceRow(L.urg, '<div class="meter"><div class="meter__track"><div class="meter__fill" id="meterFill"></div></div><div class="meter__num" id="meterNum">0%</div></div>'));
    rows.push(traceRow(L.act, '<span class="trace__v">' + b.action + '</span>'));
    rows.push(traceRow(L.al, '<span class="trace__v">' + b.alert + '</span>'));
    rows.push(traceRow(L.out, '<span class="outcome"><span class="outcome__tag">' + L.tag + '</span>' + b.outcome + '</span>'));
    rows.forEach(function (r) { traceEl.appendChild(r); });

    var T = reduce ? 0 : 1;
    after(300 * T, function () { turnNodes[0].classList.add("in"); });
    after(820 * T, function () { rows[0].classList.add("in"); });
    after(1180 * T, function () {
      rows[1].classList.add("in");
      after(120 * T, function () { var f = document.getElementById("meterFill"); if (f) f.style.width = b.intensity + "%"; });
      countTo(document.getElementById("meterNum"), b.intensity, reduce ? 1 : 1000);
    });
    after(1640 * T, function () { rows[2].classList.add("in"); });
    after(2000 * T, function () { rows[3].classList.add("in"); });
    after(2380 * T, function () { rows[4].classList.add("in"); });

    if (turnNodes[1]) {
      var typing = document.createElement("div");
      typing.className = "turn turn--topher in";
      typing.innerHTML = '<div class="turn__who">Topher</div><div class="turn__bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
      after(2650 * T, function () { if (!reduce) turnsEl.appendChild(typing); });
      after(reduce ? 700 : 3450, function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        turnNodes[1].classList.add("in");
      });
    }
    if (!userLocked) {
      after(reduce ? 4200 : 7600, function () {
        if (userLocked) return;
        play(ORDER[(ORDER.indexOf(key) + 1) % ORDER.length], false);
      });
    }
  }

  /* ---------- Language ------------------------------------ */
  var curLang = "en", curDir = "pain";

  function applyI18n(lang) {
    var dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.innerHTML = dict[k];
    });
  }
  function applyDirection(dir) {
    curDir = dir;
    var d = DIRECTIONS[curLang][dir];
    document.getElementById("heroEyebrow").innerHTML = d.eyebrow;
    document.getElementById("heroTitle").innerHTML = d.title;
    document.getElementById("heroSub").innerHTML = d.sub;
  }
  function setLang(lang) {
    curLang = lang;
    applyI18n(lang);
    applyDirection(curDir);
    SCEN = buildScenarios(lang);
    renderTabs();
    play(current, userLocked);
    // sync both toggles
    document.querySelectorAll('#lang [data-lang]').forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang); });
    document.querySelectorAll('#twkLang [data-lang]').forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang); });
  }

  document.querySelectorAll('#lang [data-lang]').forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  /* ---------- Demo form ----------------------------------- */
  var form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      if ((form.getAttribute("action") || "").indexOf("REPLACE_ME") !== -1) {
        e.preventDefault();
        form.style.display = "none";
        document.getElementById("formSent").classList.add("show");
      }
    });
  }

  /* ---------- Scroll: nav, reveals, section hue ----------- */
  var nav = document.getElementById("nav");
  var emoSections = Array.prototype.slice.call(document.querySelectorAll("[data-emotion]"));
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function checkConsole() {
    if (started || !consoleEl) return;
    var r = consoleEl.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top < vh * 0.85 && r.bottom > vh * 0.15) { started = true; play("afterhours", false); }
  }
  function checkReveals() {
    var vh = window.innerHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var r = reveals[i].getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) { reveals[i].classList.add("in"); reveals.splice(i, 1); }
    }
  }
  function onScrollHue() {
    var vh = Math.min(window.innerHeight, 1000), probe = window.scrollY + vh * 0.5, best = null;
    for (var i = 0; i < emoSections.length; i++) {
      var sec = emoSections[i], top = sec.getBoundingClientRect().top + window.scrollY, bot = top + sec.offsetHeight;
      if (probe >= top && probe < bot) { best = sec; break; }
    }
    sectionEmotion = best ? best.dataset.emotion : null;
    applyEmotion();
  }
  function onScroll() {
    if (nav) nav.classList.toggle("nav--scrolled", window.scrollY > 12);
    checkConsole(); checkReveals(); onScrollHue();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---------- Tweaks panel (vanilla host protocol) -------- */
  var twk = document.getElementById("twk");
  function twkSeg(id, attr, fn) {
    document.querySelectorAll('#' + id + ' [data-' + attr + ']').forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll('#' + id + ' [data-' + attr + ']').forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        fn(b.getAttribute("data-" + attr));
      });
    });
  }
  twkSeg("twkDir", "dir", function (v) { applyDirection(v); });
  twkSeg("twkLang", "lang", function (v) { setLang(v); });
  twkSeg("twkAccent", "accent", function (v) { applyAccent(v); });

  document.getElementById("twkX").addEventListener("click", function () {
    twk.classList.remove("show");
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  });
  window.addEventListener("message", function (e) {
    var t = e && e.data && e.data.type;
    if (t === "__activate_edit_mode") twk.classList.add("show");
    else if (t === "__deactivate_edit_mode") twk.classList.remove("show");
  });
  window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  window.parent.postMessage({ type: "__edit_mode_set_keys", keys: ["dir", "lang", "accent"] }, "*");

  // drag the panel
  (function () {
    var hd = document.getElementById("twkHd"), dragging = false, sx, sy, ox, oy;
    hd.addEventListener("mousedown", function (e) {
      dragging = true; sx = e.clientX; sy = e.clientY;
      var r = twk.getBoundingClientRect(); ox = r.left; oy = r.top;
      twk.style.right = "auto"; twk.style.bottom = "auto"; twk.style.left = ox + "px"; twk.style.top = oy + "px";
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      twk.style.left = (ox + e.clientX - sx) + "px";
      twk.style.top = (oy + e.clientY - sy) + "px";
    });
    window.addEventListener("mouseup", function () { dragging = false; });
  })();

  /* ---------- Boot ---------------------------------------- */
  applyAccent("coral");
  applyI18n("en");
  applyDirection("pain");
  renderTabs();
  onScroll();
  var warm = 0;
  (function w() { onScroll(); if (++warm < 90) requestAnimationFrame(w); })();
  window.addEventListener("load", onScroll);
  setTimeout(function () { if (!started) { started = true; play("afterhours", false); } }, reduce ? 250 : 700);

})();
