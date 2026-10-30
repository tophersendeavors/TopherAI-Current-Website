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

  async function lookupApproximateLocation() {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 2500) : null;
    try {
      const options = controller ? { signal: controller.signal, cache: 'no-store' } : { cache: 'no-store' };
      const response = await fetch('https://ipwho.is/?fields=success,city,region,country', options);
      if (!response.ok) return {};
      const data = await response.json();
      if (!data || data.success !== true) return {};
      return {
        city: typeof data.city === 'string' ? data.city.slice(0, 100) : '',
        region: typeof data.region === 'string' ? data.region.slice(0, 100) : '',
        country: typeof data.country === 'string' ? data.country.slice(0, 100) : ''
      };
    } catch (_) {
      return {};
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  function showLocationNotice() {
    if (document.getElementById('topher-location-notice')) return;
    const note = document.createElement('div');
    note.id = 'topher-location-notice';
    note.setAttribute('role', 'status');
    note.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9998;max-width:min(92vw,520px);padding:11px 15px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:#211E29;color:#F3E9DD;font:12px/1.5 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.28);text-align:center';
    note.textContent = 'Para esta demo estimamos tu ciudad, región y país a partir de tu conexión. No guardamos tu IP ni coordenadas GPS. ';
    const link = document.createElement('a');
    link.href = '/privacy.html';
    link.textContent = 'Política de privacidad';
    link.style.cssText = 'color:#F0B6A6;text-decoration:underline;white-space:nowrap';
    note.appendChild(link);
    document.body.appendChild(note);
    setTimeout(() => { if (note.parentNode) note.parentNode.removeChild(note); }, 9000);
  }
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
    showLocationNotice();
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
      const location = await lookupApproximateLocation();
      if (expired()) return;
      const call = await active.start(assistantId, { metadata: {
        language: 'es',
        source: kind === 'clinic' ? 'spanish-clinic-demo' : 'spanish-website',
        demo: kind === 'clinic',
        industry: kind === 'clinic' ? 'plastic-surgery-aesthetic-medicine' : 'general',
        location_city: location.city || null,
        location_region: location.region || null,
        location_country: location.country || null,
        location_source: (location.city || location.region || location.country) ? 'ipwho.is' : null
      } });
      if (expired()) { await active.stop(); return; }
      if (!call) await stop('No se pudo iniciar la llamada. Inténtalo de nuevo.');
    } catch (_) {
      if (!expired()) await stop('No se pudo iniciar la llamada. Abre la página con conexión segura y permite el micrófono para volver a intentarlo.');
    }
  }));
  ends.forEach(button => button.addEventListener('click', () => { void stop(); }));
  window.addEventListener('pagehide', () => { generation += 1; clearTimeout(connectionTimer); if(client) { try { client.stop(); } catch (_) {} } });
})();
