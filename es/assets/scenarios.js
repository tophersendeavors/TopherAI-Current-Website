(() => {
  'use strict';
  const scenarios = {
    estetica: {label:'01 / Primera consulta',title:'Interés en bótox. Muchas preguntas.',description:'Una persona quiere conocer el costo y pedir una valoración. La recepcionista escucha y toma la preferencia de horario sin inventar precios ni disponibilidad.',messages:[['caller','¿Cuánto cuesta el bótox?'],['agent','No tengo una tarifa aprobada para esta demostración. Puedo mostrarte cómo tomaríamos una solicitud de valoración para que el equipo confirme el costo.']],outcome:'Solicitud de valoración. Precio y disponibilidad por confirmar con la clínica.'},
    cirugia: {label:'02 / Valoración con el especialista',title:'Una rinoplastia empieza con una consulta.',description:'La recepcionista identifica el motivo, pregunta si es una primera visita y ayuda a organizar una solicitud. La valoración médica y el presupuesto los define el equipo clínico.',messages:[['caller','Quiero una rinoplastia, pero primero me gustaría hablar con el cirujano.'],['agent','Podemos simular una solicitud de valoración. ¿Sería tu primera consulta con la clínica?'],['caller','Sí. Me vendría bien una tarde.']],outcome:'Primera consulta por rinoplastia. Preferencia: por la tarde. Sin cita real reservada.'},
    seguimiento: {label:'03 / Atención que reconoce sus límites',title:'Una inquietud necesita al equipo médico.',description:'La recepcionista reconoce cuando una solicitud debe salir del flujo de citas y recibir atención humana. Esta demostración no evalúa síntomas ni contacta a profesionales.',messages:[['caller','Me hice un procedimiento y quiero hablar con mi médico.'],['agent','Esta demostración no puede evaluar síntomas ni contactar a tu médico. Comunícate directamente con el equipo que te atendió; si crees que es una emergencia, busca atención de urgencia.']],outcome:'Orientación a atención humana. No se emite un diagnóstico ni se promete una transferencia médica.'}
  };
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
    const s = scenarios[button.dataset.scenario];
    if (!s) return;
    document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    for (const [id,value] of [['scenario-label',s.label],['scenario-title',s.title],['scenario-description',s.description],['scenario-outcome',s.outcome]]) document.getElementById(id).textContent=value;
    const conversation=document.getElementById('scenario-conversation');
    conversation.replaceChildren(...s.messages.map(([role,message])=>{
      const el=document.createElement('div'); el.className='bubble'+(role==='caller'?' caller':'');
      const who=document.createElement('span'); who.className='who';who.textContent=(role==='caller'?'Paciente':'Valentina')+' · ejemplo';
      el.append(who,document.createTextNode(message));return el;
    }));
  }));
})();
