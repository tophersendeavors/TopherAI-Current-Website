/* Topher AI — browser voice demo engine (Vapi).
   UI-agnostic: pages subscribe via TopherDemo.on(fn) and render their own states.
   Events: {type:'state', state:'connecting'|'active'|'idle'|'error'}
           {type:'transcript', role:'assistant'|'user', text, final}
           {type:'lead', phone}
   Back-compat: window.startVapiCall(lang) / window.endVapiCall(). */
window.TopherDemo = (function () {
  var PUBLIC_KEY = '9794aec6-8b69-43df-ad52-9107ea8170e5';
  var ASSISTANT = { en: '5f428f8c-2ab9-4200-91fa-511e01c08fa5', es: 'a91daf92-a477-46ed-b4cf-3e8df3a92699' };
  var LEAD_HOOK = 'https://topherai.app.n8n.cloud/webhook/web-lead';

  var vapi = null, active = false, lang = 'en', pendingToolCallId = null, phoneCollected = false;
  var subs = [];

  function emit(e) { subs.forEach(function (f) { try { f(e); } catch (err) { console.warn(err); } }); }
  function state(s) { emit({ type: 'state', state: s }); }

  function reset() { active = false; vapi = null; pendingToolCallId = null; phoneCollected = false; removeModal(); }

  async function start(l) {
    if (active) return;
    active = true;
    lang = l === 'es' ? 'es' : 'en';
    state('connecting');
    try {
      var mod = await import('https://cdn.jsdelivr.net/npm/@vapi-ai/web/+esm');
      var VapiClass = (mod.default && mod.default.default) || mod.default || mod.Vapi || mod;
      if (typeof VapiClass !== 'function') throw new Error('Vapi constructor not found');
      vapi = new VapiClass(PUBLIC_KEY);
    } catch (e) {
      console.error('[TopherDemo] SDK load failed:', e);
      reset(); state('error');
      return;
    }

    vapi.on('call-start', function () { state('active'); });
    vapi.on('call-end', function () { reset(); state('idle'); });
    vapi.on('error', function (e) { console.warn('[TopherDemo] call error:', e); reset(); state('error'); });

    vapi.on('message', function (msg) {
      if (!msg) return;

      if (msg.type === 'transcript' && msg.transcript) {
        emit({ type: 'transcript', role: msg.role === 'user' ? 'user' : 'assistant', text: msg.transcript, final: msg.transcriptType === 'final' });
        if (msg.role === 'user' && msg.transcriptType === 'final' &&
            /\b(bye|goodbye|bye bye|that's all|that is all|nothing else|nope)\b/i.test(msg.transcript)) {
          try { vapi.stop(); } catch (e) {}
        }
        return;
      }

      if (msg.type !== 'tool-calls') return;
      var list = msg.toolCallList || msg.toolCalls || [];
      var call = list.find(function (t) { return t && t.function && t.function.name === 'collect_phone'; });
      if (!call) return;
      if (phoneCollected || document.getElementById('topher-phone-modal')) return;
      pendingToolCallId = call.id;
      showModal(function (phone) {
        phoneCollected = true;
        vapi.send({ type: 'tool-call-result', toolCallId: pendingToolCallId, result: { phone: phone } });
        pendingToolCallId = null;
        vapi.send({ type: 'add-message', message: { role: 'user', content: 'Submitted.' } });
      });
    });

    vapi.start(ASSISTANT[lang], {
      metadata: { language: lang, source: 'website-demo', assistantType: lang === 'es' ? 'spanish' : 'english' }
    });
  }

  function stop() {
    active = false;
    removeModal();
    state('idle');
    if (vapi) {
      try { vapi.stop(); } catch (e) {}
      setTimeout(function () { vapi = null; }, 3000);
    }
  }

  window.addEventListener('beforeunload', function () { if (vapi) { try { vapi.stop(); } catch (e) {} } });

  function removeModal() { var m = document.getElementById('topher-phone-modal'); if (m) m.remove(); }

  function showModal(done) {
    removeModal();
    var copy = lang === 'es'
      ? { t: '¿Cuál es tu número?', s: 'Te enviamos el enlace ahora mismo.', b: 'Enviar mi enlace →', f: 'No enviamos spam. Responde STOP cuando quieras.', n: 'No, gracias', bad: 'Ingresa un número válido' }
      : { t: "What's your number?", s: "We'll text you the booking link right now.", b: 'Send my link →', f: "We won't spam you. Reply STOP anytime.", n: 'No thanks', bad: 'Please enter a valid number' };
    var m = document.createElement('div');
    m.id = 'topher-phone-modal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,.68);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div role="dialog" aria-modal="true" aria-label="' + copy.t + '" style="background:#F3E9DD;border-radius:22px;padding:34px 30px;width:100%;max-width:364px;text-align:center;box-shadow:0 28px 70px rgba(0,0,0,.4);font-family:\'Hanken Grotesk\',sans-serif">'
      + '<div style="width:48px;height:48px;background:#221E2A;border-radius:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="23" height="23" fill="none" stroke="#E8826B" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.18 4.2 2 2 0 0 1 4.17 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>'
      + '<p style="font-family:\'Quicksand\',sans-serif;font-weight:700;font-size:1.18rem;color:#1A1821;margin:0 0 6px">' + copy.t + '</p>'
      + '<p style="color:#6E6571;font-size:.88rem;margin:0 0 20px">' + copy.s + '</p>'
      + '<input id="topher-phone-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="(555) 555-5555" aria-label="' + copy.t + '" style="width:100%;padding:14px;border:1.5px solid #CFC2B4;border-radius:11px;font-size:1.05rem;font-family:inherit;color:#1A1821;text-align:center;background:#FBF6F0;outline:0;transition:border-color .2s">'
      + '<button id="topher-phone-submit" style="margin-top:12px;width:100%;background:#D26A52;color:#F3E9DD;border:0;border-radius:11px;padding:15px;font-size:1rem;font-weight:700;font-family:inherit;cursor:pointer;transition:background .2s">' + copy.b + '</button>'
      + '<p style="margin:12px 0 0;font-size:.74rem;color:#8A8087">' + copy.f + '</p>'
      + '<button id="topher-phone-close" style="margin-top:8px;background:none;border:0;color:#8A8087;font-size:.8rem;font-family:inherit;cursor:pointer">' + copy.n + '</button></div>';
    document.body.appendChild(m);

    var input = m.querySelector('#topher-phone-input');
    var btn = m.querySelector('#topher-phone-submit');
    input.addEventListener('focus', function () { input.style.borderColor = '#D26A52'; });
    input.addEventListener('blur', function () { input.style.borderColor = '#CFC2B4'; });
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 10);
      input.value = d.length > 6 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6)
        : d.length > 3 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : d.length ? '(' + d : '';
    });
    btn.addEventListener('mouseover', function () { btn.style.background = '#C0573F'; });
    btn.addEventListener('mouseout', function () { btn.style.background = '#D26A52'; });
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    m.querySelector('#topher-phone-close').addEventListener('click', function () {
      removeModal();
      if (pendingToolCallId && vapi) {
        vapi.send({ type: 'tool-call-result', toolCallId: pendingToolCallId, result: { error: 'user_declined' } });
        pendingToolCallId = null;
      }
    });
    setTimeout(function () { input.focus(); }, 100);

    function submit() {
      var raw = (input.value || '').replace(/\D/g, '');
      if (raw.length < 10) { input.style.borderColor = '#C4524A'; input.value = ''; input.placeholder = copy.bad; return; }
      var phone = raw.length === 10 ? '+1' + raw : '+' + raw;
      removeModal();
      // Web calls never carry call.customer.number, so post the lead directly.
      fetch(LEAD_HOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, source: 'vapi-voice-demo', language: lang, name: '' })
      }).then(function (r) { console.log('[TopherDemo] web-lead POST:', r.status); })
        .catch(function (e) { console.warn('[TopherDemo] web-lead POST failed:', e); });
      emit({ type: 'lead', phone: phone });
      done(phone);
    }
  }

  window.startVapiCall = start;
  window.endVapiCall = stop;
  return { on: function (f) { subs.push(f); }, start: start, stop: stop, isActive: function () { return active; } };
})();
