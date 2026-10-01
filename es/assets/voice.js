(() => {
  'use strict';
  const config = window.TOPHER_DEMO_CONFIG || {};
  const starts = [...document.querySelectorAll('[data-call]')];
  const ends = [...document.querySelectorAll('[data-end-call]')];
  const statuses = [...document.querySelectorAll('[data-call-status]')];
  let client = null;
  let busy = false;
  let generation = 0;
  let connectionTimer = null;
  const status = text => statuses.forEach(el => { el.textContent = text; });
  const ready = kind => Boolean(config.publicKey && (kind === 'clinic' ? config.clinicReady && config.clinicAssistantId : config.sofiaAssistantId));
  const refresh = () => {
    starts.forEach(b => { b.disabled = busy || !ready(b.dataset.call); });
    ends.forEach(b => { b.hidden = !busy; });
  };
  const stop = async (message = 'Llamada finalizada. Puedes volver a probar cuando quieras.') => {
    generation += 1;
    clearTimeout(connectionTimer);
    const previous = client;
    client = null;
    // Retain the busy state until the microphone/call stop resolves.
    try { if (previous) await previous.stop(); } catch (_) {}
    busy = false; refresh(); status(message);
  };
  refresh();
  if (config.clinicReady && config.clinicAssistantId) status('Lista para probar. Usa datos ficticios y permite el micrófono cuando tu navegador lo solicite.');
  starts.forEach(button => button.addEventListener('click', async () => {
    if (busy || !ready(button.dataset.call)) return;
    const kind = button.dataset.call;
    const assistantId = kind === 'clinic' ? config.clinicAssistantId : config.sofiaAssistantId;
    busy = true; refresh();
    const run = ++generation;
    status(kind === 'clinic' ? 'Conectando con la recepcionista de la clínica…' : 'Conectando con Sofía, de Topher AI…');
    const expired = () => run !== generation;
    connectionTimer = setTimeout(() => { if (!expired()) void stop('La conexión tardó demasiado. Revisa tu conexión y vuelve a intentarlo.'); }, 45000);
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('microphone-unavailable');
      const mod = await import(config.sdkUrl);
      if (expired()) return;
      const Vapi = mod.default?.default || mod.default || mod.Vapi;
      if (typeof Vapi !== 'function') throw new Error('sdk-unavailable');
      const active = new Vapi(config.publicKey); client = active;
      active.on('call-start', () => {
        if (expired()) { void active.stop(); return; }
        clearTimeout(connectionTimer);
        status('Llamada en curso. Habla con naturalidad; puedes finalizarla con el botón.');
      });
      active.on('call-end', () => { if (!expired()) void stop(); });
      active.on('error', () => { if (!expired()) void stop('No se pudo completar la llamada. Revisa el permiso de micrófono y tu conexión, y vuelve a intentarlo.'); });
      // Avoid leaving the existing sales assistant waiting for its legacy phone
      // collection widget. This demo page deliberately does not collect patient data.
      active.on('message', message => {
        if (expired() || message?.type !== 'tool-calls') return;
        for (const call of (message.toolCallList || message.toolCalls || [])) {
          if (call?.function?.name !== 'collect_phone') continue;
          active.send({type:'tool-call-result',toolCallId:call.id,result:{error:'phone_collection_unavailable',message:'Este sitio de demostración no captura teléfonos. No afirmes haber guardado o enviado datos; ofrece hello@topherai.com para seguimiento.'}});
          status('Para solicitar seguimiento puedes escribir a hello@topherai.com. La llamada continúa.');
        }
      });
      const call = await active.start(assistantId, { metadata: { language:'es', source:kind==='clinic'?'spanish-clinic-demo':'spanish-website', demo:kind==='clinic', industry:kind==='clinic'?'plastic-surgery-aesthetic-medicine':'general' } });
      if (expired()) { await active.stop(); return; }
      if (!call) await stop('No se pudo iniciar la llamada. Inténtalo de nuevo.');
    } catch (_) {
      if (!expired()) await stop('No se pudo iniciar la llamada. Abre la página con conexión segura y permite el micrófono para volver a intentarlo.');
    }
  }));
  ends.forEach(button => button.addEventListener('click', () => { void stop(); }));
  window.addEventListener('pagehide', () => { generation += 1; clearTimeout(connectionTimer); if(client) { try { client.stop(); } catch (_) {} } });
})();
