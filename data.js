/* food.brb v3 - data layer. Direction-independent: reads the shared food.brb
   state (same origin localStorage, same schema as the live app + worker).
   Pure logic only - no rendering. Keeps his 65 days, MFP pipeline and sync
   working untouched (read-only here; writes stay with the live app until the
   auth/accounts session). */
'use strict';
window.FOODBRB = (function(){
  const STORE='sadhana-v1';
  const SYNC_TOKEN_KEY='foodBrbSyncToken';
  const SYNC_API='https://super-poetry-42d8.ajay-7a2.workers.dev/data';

  function loadState(){ try{ return JSON.parse(localStorage.getItem(STORE))||null; }catch(e){ return null; } }
  function saveState(s){ localStorage.setItem(STORE, JSON.stringify(s)); }

  function keyOf(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function todayKey(){ return keyOf(new Date()); }
  function shiftKey(k,n){ const d=new Date(k+'T12:00:00'); d.setDate(d.getDate()+n); return keyOf(d); }
  function weekKeys(offset){ const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)+(offset||0)*7); const a=[]; for(let i=0;i<7;i++){ const x=new Date(d); x.setDate(d.getDate()+i); a.push(keyOf(x)); } return a; }
  function lastDays(n){ const a=[]; const d=new Date(); for(let i=n-1;i>=0;i--){ const x=new Date(d); x.setDate(d.getDate()-i); a.push(keyOf(x)); } return a; }

  function totals(day){ const t={kcal:0,protein:0,fat:0,carbs:0,fibre:0};
    for(const f of (day&&day.foods)||[]){ t.kcal+=f.kcal||0; t.protein+=f.protein||0; t.fat+=f.fat||0; t.carbs+=f.carbs||0; t.fibre+=f.fibre||0; }
    t.kcal=Math.round(t.kcal); t.protein=Math.round(t.protein*10)/10; return t; }

  function stepsOf(day){ return day&&day.ring&&day.ring.steps!=null?day.ring.steps:(day&&day.steps)||null; }
  function logged(day){ return !!(day&&day.foods&&day.foods.length); }

  function profile(state){ return Object.assign({kcalTarget:1400,proteinTarget:90,stepsTarget:8000,fibreTarget:30},(state&&state.profile)||{}); }

  /* weekly bank: budget = daily target x 7; used = logged kcal this week; bank = remainder */
  function bank(state, offset){
    const p=profile(state), keys=weekKeys(offset);
    const used=keys.reduce((a,k)=>{ const d=state.days[k]; return a+(logged(d)?totals(d).kcal:0); },0);
    const budget=p.kcalTarget*7;
    return {keys, used, budget, left:budget-used};
  }

  /* per-day outcome for the dots: future | none | under | over */
  function dayOutcome(state, k, tk){
    tk=tk||todayKey();
    if(k>tk) return 'future';
    const d=state.days[k];
    if(!logged(d)) return 'none';
    return totals(d).kcal>profile(state).kcalTarget ? 'over' : 'under';
  }

  function streak(state){
    let n=0; const d=new Date(); const has=k=>logged(state.days[k]);
    if(!has(keyOf(d))) d.setDate(d.getDate()-1);
    while(has(keyOf(d))){ n++; d.setDate(d.getDate()-1); } return n;
  }

  /* suggestion engine port: frequency-ranked foods per slot, 90-day window */
  function mealPatterns(state, mealSlot, limit){
    const map=new Map(), cutoff=shiftKey(todayKey(),-90), tk=todayKey();
    Object.keys(state.days).filter(k=>k>=cutoff&&k<=tk).sort().forEach(k=>{
      for(const f of (state.days[k]&&state.days[k].foods)||[]){
        const sl=f.slot||(f.snack?'snack':'breakfast'); if(sl!==mealSlot) continue;
        const key=(f.name||'').trim().toLowerCase(); if(!key) continue;
        const x=map.get(key)||{food:f,count:0,last:k}; x.count++; if(k>=x.last){ x.last=k; x.food=f; } map.set(key,x);
      }
    });
    return [...map.values()].sort((a,b)=>(b.count-a.count)||(b.last.localeCompare(a.last))).slice(0,limit||5);
  }

  /* read-only worker fetch (token already on device from the live app) */
  async function fetchWorker(){
    const tok=localStorage.getItem(SYNC_TOKEN_KEY); if(!tok) return {error:'no-token'};
    const r=await fetch(SYNC_API,{headers:{Authorization:'Bearer '+tok}});
    if(!r.ok) return {error:'http-'+r.status};
    const j=await r.json(); return {state:j.state, rev:j.rev, updatedAt:j.updatedAt};
  }

  return { loadState, saveState, keyOf, todayKey, shiftKey, weekKeys, lastDays, totals, stepsOf, logged, profile, bank, dayOutcome, streak, mealPatterns, fetchWorker, STORE };
})();
