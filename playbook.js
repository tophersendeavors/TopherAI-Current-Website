/* Topher AI — Sales Playbook. Vanilla, no deps. State in localStorage; swap for CRM/Supabase later. */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const KEY='topher.playbook.';
const store={get(k,d){try{const v=localStorage.getItem(KEY+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(KEY+k,JSON.stringify(v))}catch(e){}}};

/* ── toast ─────────────────────────────── */
let tT;const toast=(msg)=>{const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),1600)};

/* ── routing ───────────────────────────── */
const VIEWS=['home','product','learn','scripts','industry','objections','cheat'];
function route(v,opts){
  if(!VIEWS.includes(v))v='home';
  $$('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
  $$('[data-nav]').forEach(b=>b.setAttribute('aria-current',b.dataset.nav===v?'page':'false'));
  store.set('view',v);
  if(history.replaceState)history.replaceState(null,'','#'+v);
  if(!opts||!opts.keepScroll)window.scrollTo({top:0,behavior:'auto'});
}
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.nav)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>jump(b.dataset.goto)));

function jump(id){
  const el=document.getElementById(id);if(!el)return;
  const view=el.closest('.view');
  route(view?view.id.replace('v-',''):'home',{keepScroll:true});
  closeSheet();
  // open the containing accordion / activate the containing tab panel
  const det=el.closest('details');if(det)det.open=true;
  if(el.tagName==='DETAILS')el.open=true;
  const panel=el.closest('[data-panel]');
  if(panel){const g=panel.closest('[data-tabgroup]');if(g)selectTab(g,panel.dataset.panel)}
  requestAnimationFrame(()=>{
    const top=el.getBoundingClientRect().top+window.pageYOffset-84;
    window.scrollTo({top:Math.max(top,0),behavior:'smooth'});
    el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1700);
  });
  const card=el.closest('[data-id]')||el;
  if(card.dataset&&card.dataset.id)pushRecent(card.dataset.id);
}

/* ── tabs / segmented ──────────────────── */
function selectTab(group,name){
  $$('[data-tab]',group).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));
  $$('[data-panel]',group).forEach(p=>p.hidden=p.dataset.panel!==name);
  if(group.dataset.tabgroup)store.set('tab.'+group.dataset.tabgroup,name);
}
$$('[data-tabgroup]').forEach(group=>{
  $$('[data-tab]',group).forEach(b=>b.addEventListener('click',()=>selectTab(group,b.dataset.tab)));
  const saved=store.get('tab.'+group.dataset.tabgroup,null);
  const first=$('[data-tab]',group);
  selectTab(group,saved&&$('[data-tab="'+saved+'"]',group)?saved:(first?first.dataset.tab:''));
});

/* ── copy ──────────────────────────────── */
function scriptText(card){
  return $$('.lines p',card).filter(p=>!p.classList.contains('stage')).map(p=>p.textContent.trim()).join('\n\n');
}
async function copy(text){
  try{await navigator.clipboard.writeText(text)}
  catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}
}
$$('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
  const card=btn.closest('[data-id]');if(!card)return;
  const body=card.querySelector('[data-panel]:not([hidden]) .lines')?card.querySelector('[data-panel]:not([hidden])'):card;
  await copy(scriptText(body));
  const label=btn.querySelector('span')||btn;const was=label.textContent;
  btn.classList.add('done');label.textContent='Copied ✓';
  setTimeout(()=>{btn.classList.remove('done');label.textContent=was},1600);
  toast('Copied ✓');pushRecent(card.dataset.id);
}));

/* ── favorites ─────────────────────────── */
let favs=store.get('favs',[]);
function renderFavBtns(){$$('[data-fav]').forEach(b=>{const on=favs.includes(b.dataset.fav);b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));b.textContent=on?'★':'☆'})}
function renderFavList(){
  const box=$('#fav-list');if(!box)return;
  if(!favs.length){box.innerHTML='<p class="empty">No starred scripts yet — tap ☆ on any script to pin it here.</p>';return}
  box.innerHTML=favs.map(id=>{const el=document.getElementById(id);if(!el)return'';
    return '<button class="tile" data-goto="'+id+'"><span class="ic">★</span><span><b>'+(el.dataset.title||id)+'</b><small>'+(el.dataset.kind||'script')+'</small></span><span class="go">›</span></button>'}).join('');
  $$('[data-goto]',box).forEach(b=>b.addEventListener('click',()=>jump(b.dataset.goto)));
}
$$('[data-fav]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.fav;
  favs=favs.includes(id)?favs.filter(x=>x!==id):[id].concat(favs);
  store.set('favs',favs);renderFavBtns();renderFavList();
  toast(favs.includes(id)?'Starred':'Removed');
}));

/* ── recently viewed ───────────────────── */
let recents=store.get('recents',[]);
function pushRecent(id){if(!id)return;recents=[id].concat(recents.filter(x=>x!==id)).slice(0,5);store.set('recents',recents);renderRecents()}
function renderRecents(){
  const box=$('#recent-list');if(!box)return;
  if(!recents.length){box.innerHTML='<p class="empty">Nothing yet. Scripts you copy or open show up here.</p>';return}
  box.innerHTML=recents.map(id=>{const el=document.getElementById(id);if(!el)return'';
    return '<button class="tile" data-goto="'+id+'"><span class="ic">↻</span><span><b>'+(el.dataset.title||id)+'</b><small>'+(el.dataset.kind||'script')+'</small></span><span class="go">›</span></button>'}).join('');
  $$('[data-goto]',box).forEach(b=>b.addEventListener('click',()=>jump(b.dataset.goto)));
}

/* ── search ────────────────────────────── */
const index=$$('[data-search]').map(el=>({id:el.id,title:el.dataset.title||'',kind:el.dataset.kind||'',text:el.textContent.replace(/\s+/g,' ').trim()}));
function search(q){
  q=q.trim().toLowerCase();if(!q)return[];
  const words=q.split(/\s+/);
  return index.map(it=>{
    const hay=(it.title+' '+it.kind+' '+it.text).toLowerCase();
    let score=0;
    words.forEach(w=>{if(it.title.toLowerCase().includes(w))score+=6;if(it.kind.toLowerCase().includes(w))score+=3;if(hay.includes(w))score+=1});
    return{it:it,score:score,hit:words.every(w=>hay.includes(w))};
  }).filter(r=>r.hit&&r.score>0).sort((a,b)=>b.score-a.score).slice(0,14).map(r=>r.it);
}
function snippet(text,q){
  const i=text.toLowerCase().indexOf(q.trim().toLowerCase().split(/\s+/)[0]);
  return (i>60?'…':'')+text.slice(Math.max(0,i-60),Math.max(0,i-60)+150)+'…';
}
function runSearch(){
  const q=$('#q').value,box=$('#res');
  if(!q.trim()){box.innerHTML='';return}
  const hits=search(q);
  box.innerHTML=hits.length?hits.map(it=>'<button data-goto="'+it.id+'"><em>'+it.kind+'</em><b>'+it.title+'</b><s>'+snippet(it.text,q)+'</s></button>').join(''):'<p class="empty">Nothing for “'+q+'”. Try: receptionist, pricing, not interested, contractor, real estate, law firm, med spa.</p>';
  $$('[data-goto]',box).forEach(b=>b.addEventListener('click',()=>jump(b.dataset.goto)));
}
function openSheet(){$('#sheet').classList.add('on');const i=$('#q');i.value='';$('#res').innerHTML='';setTimeout(()=>i.focus(),60)}
function closeSheet(){$('#sheet').classList.remove('on')}
$('#search-open').addEventListener('click',openSheet);
$('#search-close').addEventListener('click',closeSheet);
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet()});
$('#q').addEventListener('input',runSearch);
$$('.hints button').forEach(b=>b.addEventListener('click',()=>{$('#q').value=b.textContent;runSearch()}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeSheet();closeCall()}
  if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();openSheet()}
});

/* ── on-call mode ──────────────────────── */
function openCall(){$('#oncall').classList.add('on');document.body.style.overflow='hidden'}
function closeCall(){$('#oncall').classList.remove('on');document.body.style.overflow=''}
$('#call-open').addEventListener('click',openCall);
$('#call-close').addEventListener('click',closeCall);

/* ── checklists ────────────────────────── */
$$('[data-check]').forEach(group=>{
  const key='check.'+group.dataset.check,saved=store.get(key,[]);
  const boxes=$$('input[type=checkbox]',group);
  boxes.forEach((b,i)=>{b.checked=saved.includes(i);b.addEventListener('change',()=>{
    store.set(key,boxes.map((x,j)=>x.checked?j:-1).filter(j=>j>=0));update();
  })});
  function update(){
    const n=boxes.filter(b=>b.checked).length,total=boxes.length;
    const out=$('[data-out]',group);if(!out)return;
    const bar=$('[data-bar]',group);if(bar)bar.style.width=Math.round(n/total*100)+'%';
    if(group.dataset.check==='qualify'){
      const band=n>=8?['High-priority prospect','Call this one first. 8+ signals.']:n>=4?['Good opportunity','Worth a real conversation. 4–7 signals.']:['Weak opportunity','0–3 signals — keep moving.'];
      out.innerHTML=n+' signal'+(n===1?'':'s')+' · '+band[0]+'<small>'+band[1]+'</small>';
    }else{
      out.innerHTML=n+' of '+total+' complete<small>'+(n===total?'Cheat sheet memorized. Go call.':'Keep going — tap each one as you finish.')+'</small>';
    }
  }
  update();
});

/* ── init ──────────────────────────────── */
renderFavBtns();renderFavList();renderRecents();
route((location.hash||'').replace('#','')||store.get('view','home'));
window.addEventListener('hashchange',()=>route((location.hash||'').replace('#','')));
})();
