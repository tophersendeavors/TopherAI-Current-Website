/* Topher AI — Sales Playbook · "Understanding Topher AI" product training.
   Injected into #learn-body before playbook.js binds search / copy / favorites / nav. */
(function(){
var H=[];
function p(s){H.push(s)}

/* ── nav chips ─────────────────────────── */
var TOPICS=[['t-what','What it is'],['t-door','Front door'],['t-flow','Call → action'],['t-model','Mental model'],['t-layers','The 3 layers'],['t-er','Event → response'],['t-data','Where info goes'],['t-live','During the call'],['t-sched','Scheduling'],['t-vs','vs. the alternatives'],['t-custom','Customizable'],['t-cases','Scenarios'],['t-explain','How to explain it'],['t-never','Never promise'],['t-faq','Prospect questions'],['t-tech','Tech talk'],['t-final','Final reminder']];
p('<div class="tabs" aria-label="Training topics">'+TOPICS.map(function(t){return '<button data-goto="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>');

/* ── the core rule up front ────────────── */
p('<div class="rule"><h3>Don\'t sell "AI." Sell the call they\'re currently missing.</h3><p style="color:var(--cream);font-size:14.5px">No owner wakes up wanting artificial intelligence. They think: we miss calls, my staff is overwhelmed, customers call after hours, we lose leads, employees answer the same questions all day, we\'re slow to follow up, we need more appointments. Start there.</p><div class="swap"><div class="no"><em>Don\'t open with</em>"Would you like an AI receptionist?"</div><div class="yes"><em>Open with</em>"What happens when somebody calls your business and nobody answers?"</div></div></div>');

/* ── 1. what it is ─────────────────────── */
p('<h2 class="sec" id="t-what" data-search data-title="What Topher AI is" data-kind="training">What is Topher AI?</h2><p class="sub">Section 1 · The honest, complete answer.</p>');
p('<div class="quote"><small>The simple explanation</small>Topher AI gives a business an intelligent front desk that can talk with customers — and then connect those conversations to the rest of the business.</div>');
p('<div class="card" style="margin-top:12px"><h3>It\'s a platform, not a phone gadget</h3><p>Topher AI is a business automation platform built around AI-powered customer communication and workflow automation. The AI receptionist is usually the first part anyone experiences — it is the front door into a larger system.</p></div>');
p('<div class="ind-blk" style="margin-top:12px"><em>◎ A system can be configured to</em><ul class="bul tight"><li>Answer incoming phone calls</li><li>Speak naturally with callers</li><li>Identify why someone is calling</li><li>Answer approved questions about the business</li><li>Collect customer or lead information</li><li>Qualify a lead using the business\'s rules</li><li>Capture appointment or service requests</li><li>Record what happened in the conversation</li><li>Trigger alerts or follow-up actions</li><li>Connect information to scheduling, CRM, database, messaging and automation systems</li><li>Start business workflows automatically based on the call</li></ul></div>');
p('<div class="caution" style="margin-top:12px">Exact capabilities depend on what has been configured for that customer. Say "can be configured to," never "always does."</div>');

/* ── 2. front door ─────────────────────── */
p('<h2 class="sec" id="t-door" data-search data-title="The receptionist is only the front door" data-kind="training">The receptionist is only the front door</h2><p class="sub">Section 2 · Never describe it as "a voice bot."</p>');
p('<div class="card"><p>The caller hears a natural conversation. Behind that conversation, depending on setup, the system may be:</p><ul class="bul tight"><li>Determining the caller\'s intent</li><li>Gathering information</li><li>Checking business rules</li><li>Saving information</li><li>Triggering another workflow</li><li>Alerting someone at the company</li><li>Passing information into a connected system</li></ul><p style="margin-top:10px;color:var(--cream)">That\'s why it\'s far more useful than replacing voicemail.</p></div>');

/* ── 3. conversation → action flow ─────── */
p('<h2 class="sec" id="t-flow" data-search data-title="Conversation-to-action flow" data-kind="training diagram">Conversation → action flow</h2><p class="sub">Section 21 · The diagram to draw in your head on every call.</p>');
p('<div class="flow good">'+['Customer calls','Topher AI answers','Understands why they are calling','Answers questions + collects information','Event is identified','Business rules determine the response','Information recorded / passed to connected systems','Next action happens'].map(function(n,i,a){return '<div class="node">'+n+'</div>'+(i<a.length-1?'<div class="arrow">↓</div>':'')}).join('')+'</div>');
p('<div class="ind-blk" style="margin-top:12px"><em>★ Examples of that final action</em><div class="chipwrap">'+['Lead captured','Staff alerted','Follow-up started','Appointment workflow started','Customer information saved','Call escalated','Request routed appropriately'].map(function(c){return '<span class="pill on">'+c+'</span>'}).join('')+'</div></div>');
p('<div class="quote" style="margin-top:12px">The conversation is only the beginning. The value comes from what the system can do with the information after it understands what the customer needs.</div>');

/* ── 4. mental model ───────────────────── */
p('<h2 class="sec" id="t-model" data-search data-title="Mental model — answer, understand, collect, act, record" data-kind="training">Cesar\'s mental model</h2><p class="sub">Section 22 · Five words. Memorize them.</p>');
p('<div class="model">'+[['Answer','Make sure the customer gets a response.'],['Understand','Determine why they\'re contacting the business.'],['Collect','Gather the information the business needs.'],['Act','Trigger the right workflow or next step.'],['Record','Capture what\'s useful from the interaction.']].map(function(m,i){return '<div class="model-step"><b>'+(i+1)+'. '+m[0]+'</b><span>'+m[1]+'</span></div>'}).join('')+'</div>');
p('<div class="model-band">Answer → Understand → Collect → Act → Record</div>');

/* ── 5. layers ─────────────────────────── */
p('<h2 class="sec" id="t-layers" data-search data-title="The three layers of the system" data-kind="training">The three layers</h2><p class="sub">Section 4 · You don\'t need the code. You need the purpose.</p><div class="stack">');
p('<details class="acc"><summary>Layer 1 — Communication</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">How the customer reaches the business: phone calls, text messaging, website interactions, and other supported channels. For the AI receptionist, it\'s a normal phone call.</p></div></details>');
p('<details class="acc"><summary>Layer 2 — AI conversation</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">The AI understands the caller and responds using instructions built for that business — hours, services, locations, FAQs, approved pricing, appointment policies, service areas, qualification questions, escalation rules, and when a human should be brought in.</p><div class="caution">The AI should only provide information it has been authorized and configured to provide.</div></div></details>');
p('<details class="acc"><summary>Layer 3 — Business logic / orchestration</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">The part that decides what happens next.</p><ul class="bul tight"><li><b style="color:var(--cream)">If</b> a caller wants a normal appointment → begin the normal appointment workflow.</li><li><b style="color:var(--cream)">If</b> a caller reports an urgent problem → trigger the urgent alert.</li><li><b style="color:var(--cream)">If</b> a caller is outside the service area → follow the approved response process.</li></ul><p style="color:var(--cream);font-size:14.5px;margin-top:10px">A conversation triggers action automatically instead of an employee processing every call by hand.</p></div></details></div>');

/* ── 6. event → response ───────────────── */
p('<h2 class="sec" id="t-er" data-search data-title="Event to response" data-kind="training">Event → response</h2><p class="sub">Section 5 · Something happens; the system decides what happens next.</p><div class="stack">');
[['A customer calls after hours asking for an appointment','The AI answers, gathers information, and starts the configured appointment or follow-up process.'],
['A customer reports an urgent service problem','The system identifies it as urgent and triggers the configured alert or escalation workflow.'],
['A qualified sales lead calls the company','The lead information is captured and recorded, and a sales notification or follow-up workflow can be triggered.'],
['Someone asks a common question about hours','The AI answers immediately — no employee has to stop what they\'re doing.']].forEach(function(e){
p('<div class="er"><div class="er-e"><em>Event</em>'+e[0]+'</div><div class="er-arrow">↓</div><div class="er-r"><em>Response</em>'+e[1]+'</div></div>')});
p('</div><div class="card" style="margin-top:12px"><h3>Why it matters</h3><p>Traditional systems wait for an employee to notice something and act. Topher AI can be configured so events create responses automatically — proactive, not just informational.</p></div>');

/* ── 7. data ───────────────────────────── */
p('<h2 class="sec" id="t-data" data-search data-title="Where the collected information goes" data-kind="training">Where the information goes</h2><p class="sub">Section 6 · A call becomes usable data.</p>');
p('<div class="card"><p>Nothing has to disappear when the call ends. Depending on setup, information can be stored or passed into customer records, lead records, CRM systems, internal databases, scheduling systems, notification systems, follow-up workflows and reporting.</p></div>');
p('<div class="grid two" style="margin-top:12px"><div class="ind-blk"><em>⚑ Before</em><p>An employee listens to a two-minute voicemail and writes down the name, phone number, service needed, address and urgency by hand.</p></div><div class="ind-blk" style="border-color:rgba(232,130,107,.35)"><em>◎ After</em><p>The information is gathered during the conversation and sent straight into the configured workflow.</p></div></div>');

/* ── 8. during the call ────────────────── */
p('<h2 class="sec" id="t-live" data-search data-title="Actions during the call" data-kind="training">Actions can happen during the call</h2><p class="sub">Section 7 · Nothing waits for someone to press play.</p>');
p('<div class="card"><p>Depending on configuration, actions can trigger while the caller is still talking. A homeowner reports a major leak — the AI keeps gathering details while the system can already alert the right person. With voicemail, nothing happens until somebody listens later.</p></div>');

/* ── 9. scheduling ─────────────────────── */
p('<h2 class="sec" id="t-sched" data-search data-title="How scheduling can work" data-kind="training">How scheduling can work</h2><p class="sub">Section 8 · Careful language required.</p>');
p('<div class="card"><p>Where it\'s configured, the system may gather an appointment request, collect preferred dates or times, connect to an approved scheduling system, start an appointment workflow, or send information to staff for confirmation.</p></div>');
p('<div class="danger" style="margin-top:12px"><b style="font-size:14px">Never promise automatic booking unless it\'s in that customer\'s actual configuration.</b></div>');
p('<div class="script" id="t-sched-line" data-id="t-sched-line" data-search data-title="Approved scheduling language" data-kind="phrasing" style="margin-top:12px"><div class="lines"><p>"We can configure the system around your scheduling process and connect it to supported scheduling workflows depending on what your business uses."</p></div><button class="copy full" data-copy><span>Copy this line</span></button></div>');

/* ── 10. comparisons ───────────────────── */
p('<h2 class="sec" id="t-vs" data-search data-title="Voicemail vs chatbot vs answering service" data-kind="training">Versus the alternatives</h2><p class="sub">Sections 9–11 · One line each, then the detail.</p><div class="stack">');
p('<details class="acc" data-search data-title="Difference from voicemail" data-kind="comparison"><summary>vs. voicemail</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">Voicemail records a message. Somebody still has to listen to it, understand it, write the information down, decide what to do and call back — by then the customer may have already called a competitor.</p><p style="color:var(--mute);font-size:14.5px">Topher AI can talk with the caller immediately: ask follow-up questions, gather structured information, answer approved questions, work out why they called, and trigger configured actions.</p><div class="quote" style="font-size:17px">"Voicemail records the problem. Topher AI can start handling the problem."</div></div></details>');
p('<details class="acc" data-search data-title="Difference from a basic chatbot" data-kind="comparison"><summary>vs. a basic chatbot</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">A basic chatbot waits for someone to visit a website and type. The real difference isn\'t that Topher AI can talk — it\'s that the conversation connects to actions and business systems.</p><div class="quote" style="font-size:17px">"A chatbot answers questions. Topher AI can be configured to answer the customer and then start the next business process."</div></div></details>');
p('<details class="acc" data-search data-title="Difference from an answering service" data-kind="comparison"><summary>vs. a traditional answering service</summary><div class="body"><p style="color:var(--mute);font-size:14.5px">Answering services generally rely on human agents reading scripts. Topher AI provides automated coverage configured around the business\'s own information and workflows.</p><ul class="bul tight"><li>24/7 availability</li><li>Consistent handling of routine calls</li><li>Business-specific instructions</li><li>Automatic data capture</li><li>Workflow integration</li><li>Automatic alerts and follow-up</li><li>Less repetitive work for employees</li></ul><div class="caution">No cost-savings claims unless an actual comparison has been calculated for that customer.</div></div></details></div>');

/* ── 11. customization ─────────────────── */
p('<h2 class="sec" id="t-custom" data-search data-title="What can be customized" data-kind="training">What can be customized</h2><p class="sub">Section 12 · Not one generic receptionist for everybody.</p>');
p('<div class="ind-blk"><em>◎ Configured per business</em><div class="chipwrap">'+['Greeting','Tone of voice','Business information','Services','Hours','Locations','Service areas','FAQs','Questions the AI asks','Lead qualification rules','Escalation rules','Appointment processes','Information to collect','Alerts','Follow-up workflows','Connected systems'].map(function(c){return '<span class="pill">'+c+'</span>'}).join('')+'</div></div>');
p('<div class="quote" style="margin-top:12px"><small>Say it like this</small>"We build the receptionist around how your business actually operates rather than forcing your business into one generic script."</div>');

/* ── 12. scenarios ─────────────────────── */
p('<h2 class="sec" id="t-cases" data-search data-title="Scenario examples" data-kind="training">Three scenarios</h2><p class="sub">Sections 15–17 · Use the one that matches who you\'re calling.</p><div class="stack">');
[['Hair salon','A stylist is mid-service. The phone rings. Without help she stops working, ignores it, or lets it go to voicemail. Topher AI can answer, handle approved questions, and gather the customer name, phone number, requested service, preferred time and preferred stylist — then send it into the salon\'s workflow.','The stylist should not have to stop doing hair to answer the phone.'],
['HVAC / plumbing / home services','A homeowner has an urgent problem after hours. These callers keep dialing companies until somebody answers. Topher AI can answer immediately, gather the details, work out what kind of request it is, and trigger the company\'s configured next step.','When someone needs urgent help, answering the call can be the difference between winning and losing the job.'],
['Dental office','The receptionist is checking in a patient. Another patient is at the desk. The phone rings — and the employee has to choose. Topher AI can handle routine inbound calls, approved questions and appointment inquiries while staff stay with the people in the room.','The front desk should not have to choose between the patient in front of them and the phone.']].forEach(function(c){
p('<div class="card"><h3>'+c[0]+'</h3><p>'+c[1]+'</p><div class="hail ind-benefit" style="margin-top:12px"><small>★ The sales point</small>'+c[2]+'</div></div>')});
p('</div>');

/* ── 13. how to explain ────────────────── */
p('<h2 class="sec" id="t-explain" data-search data-title="How to explain Topher AI" data-kind="training">How to explain it</h2><p class="sub">Section 14 · Three lengths. Pick by how much room you have.</p><div class="stack">');
[['t-explain-10','10 seconds','"Topher AI gives businesses an AI receptionist that can answer customers 24/7, gather the information they need, and connect those conversations to the business\'s follow-up and automation systems."'],
['t-explain-30','30 seconds','"Topher AI isn\'t just an answering service. The AI receptionist is the part your customer talks to, but behind it is an automation system connected to the business. It can understand why someone is calling, collect the right information, answer approved questions, record what happened, and trigger things like alerts, follow-up, lead workflows, or scheduling processes depending on how the company wants it configured."'],
['t-explain-simple','Very simple','"Think of it as an intelligent front desk that can answer the customer and then help start whatever needs to happen next."']].forEach(function(e){
p('<div class="script" id="'+e[0]+'" data-id="'+e[0]+'" data-search data-title="Explanation — '+e[1]+'" data-kind="explanation"><header><span style="flex:1"><span class="tag">'+e[1]+'</span><h3>Explaining Topher AI</h3></span><button class="star" data-fav="'+e[0]+'" aria-label="Star this">☆</button></header><div class="lines"><p>'+e[2]+'</p></div><button class="copy full" data-copy><span>Copy</span></button></div>')});
p('</div>');

/* ── 14. never promise ─────────────────── */
p('<h2 class="sec" id="t-never" data-search data-title="What Cesar should never promise" data-kind="warning">What to never promise</h2><p class="sub">Section 18 · The most important page in this section.</p>');
p('<div class="danger"><h3 style="font-size:17px;margin-bottom:8px">Never promise a capability unless it\'s actually included or configurable for that implementation.</h3><ul class="bul tight" style="color:#F0A79E"><li>Integration with every CRM</li><li>Integration with every scheduling platform</li><li>Automatic appointment booking</li><li>Automatic payment processing</li><li>Medical advice</li><li>Legal advice</li><li>Insurance advice</li><li>Emergency-response services</li><li>Guaranteed revenue increases</li><li>Guaranteed cost savings</li><li>Guaranteed lead conversion</li><li>Unlimited capabilities</li></ul></div>');
p('<div class="script" id="t-deflect" data-id="t-deflect" data-search data-title="Approved deflection lines" data-kind="phrasing" style="margin-top:12px"><header><span style="flex:1"><span class="tag">Say this instead</span><h3>Two safe deflections</h3></span><button class="star" data-fav="t-deflect" aria-label="Star this">☆</button></header><div class="lines"><p>"That\'s something we can look at during the setup process to determine how it can integrate with the systems you\'re already using."</p><p class="stage">or</p><p>"We customize the workflow based on what your business needs, so we\'d confirm the exact setup before promising that functionality."</p></div><button class="copy full" data-copy><span>Copy both lines</span></button></div>');
p('<div class="caution" style="margin-top:12px">Heads up for review: the product section of this guide lists <b>appointment booking</b> as a flat capability. On calls, frame booking as configurable per business — use the approved scheduling line above.</div>');

/* ── 15. FAQ ───────────────────────────── */
p('<h2 class="sec" id="t-faq" data-search data-title="Common prospect questions" data-kind="training faq">Common prospect questions</h2><p class="sub">Section 19 · Tap the one they just asked.</p><div class="stack">');
[['q-robot','"Is this just a robot answering the phone?"',['"No. The voice receptionist is just the part the caller interacts with. Behind it, the system can gather information and connect the conversation to workflows like lead capture, notifications, follow-up, scheduling processes, and other systems depending on your setup."'],''],
['q-knowai','"Will customers know it\'s AI?"',['"It is an AI receptionist designed to have a natural conversation. We focus on making the interaction helpful, clear, and consistent with your business."'],'Never claim callers won\'t be able to tell it\'s AI.'],
['q-answerqs','"Can it answer questions about my business?"',['"Yes, we configure it with the approved information you want it to use, such as your hours, services, locations, policies, and common questions."'],''],
['q-book','"Can it book appointments?"',['"It can be configured around appointment and scheduling workflows. The exact setup depends on the scheduling system you use and how you want appointments handled."'],''],
['q-transfer','"Can it transfer calls?"',['"Call routing and escalation can be part of the workflow depending on how your system is configured. We would determine exactly how you want different types of calls handled during setup."'],''],
['q-unknown','"What if somebody asks something it doesn\'t know?"',['"We establish rules for situations the system shouldn\'t answer on its own. Depending on your setup, it can collect the person\'s information, explain that someone will follow up, or follow another approved escalation process."'],''],
['q-replace','"Does it replace my employees?"',['"It doesn\'t have to. For many businesses, the goal is to take repetitive calls and missed calls off the staff\'s plate so employees can focus on customers and work that actually needs a person."'],'']].forEach(function(f){
p('<details class="acc" id="'+f[0]+'" data-id="'+f[0]+'" data-search data-title="'+f[1].replace(/"/g,'&quot;')+'" data-kind="prospect question"><summary>'+f[1]+'</summary><div class="body"><div class="lines">'+f[2].map(function(x){return '<p>'+x+'</p>'}).join('')+'</div>'+(f[3]?'<div class="caution">'+f[3]+'</div>':'')+'<button class="copy" data-copy><span>Copy response</span></button></div></details>')});
p('</div>');

/* ── 16. tech talk ─────────────────────── */
p('<h2 class="sec" id="t-tech" data-search data-title="How to talk about the technology" data-kind="training">Talking about the technology</h2><p class="sub">Section 20 · Lead with results, not vendor names.</p>');
p('<div class="card"><p>The system uses technology for phone and messaging connectivity, AI voice conversations, workflow automation, database and customer records, and scheduling or external integrations. The stack evolves — learn what each layer <b style="color:var(--cream)">does</b>, don\'t memorize product names.</p><div class="caution" style="margin-top:12px">If a prospect has a technical team and wants depth, book a technical follow-up. Never guess.</div></div>');

/* ── 17. final ─────────────────────────── */
p('<h2 class="sec" id="t-final" data-search data-title="Final sales reminder" data-kind="training">Final reminder</h2>');
p('<div class="quote" style="font-size:clamp(18px,5vw,23px)"><small>Open every call here</small>"What happens when somebody calls your business and nobody answers?"</div>');
p('<div class="card" style="margin-top:12px"><p>Don\'t start with databases, automation platforms, APIs, or AI architecture. Once the owner recognizes the problem, explain that Topher AI is the intelligent communication and automation layer that helps solve it. The goal isn\'t to impress them with AI terminology — it\'s to show them how many opportunities their current process can\'t respond to fast enough.</p></div>');

/* ── comprehension checklist ───────────── */
p('<h2 class="sec">Am I ready?</h2><p class="sub">Tick these off when you could explain each one out loud, cold.</p><div data-check="learn"><div class="stack">'+
['I can explain Topher AI without using the word "AI" first','I can name the three layers and what each one does','I can walk somebody through the call → action flow','I know Answer → Understand → Collect → Act → Record by heart','I can give the voicemail, chatbot and answering-service differences','I know the full never-promise list','I can answer all seven common prospect questions'].map(function(c){return '<label class="chk"><input type="checkbox"><span>'+c+'</span></label>'}).join('')+
'</div><div class="meter"><div class="bar"><i data-bar></i></div><div class="out" data-out></div></div></div>');

var host=document.getElementById('learn-body');
if(host)host.innerHTML=H.join('');
})();
