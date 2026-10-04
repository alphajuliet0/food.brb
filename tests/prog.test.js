// Run: node prog.test.js (reads the engine block out of index.html, or pass a path)
const fs=require('fs');const src=fs.readFileSync(process.argv[2]||'../index.html','utf8');
const code=src.slice(src.indexOf('/*PROG-START*/'),src.indexOf('/*PROG-END*/'));
const E=new Function(code+';return {nextTarget,progStep,progRound};')();
let pass=0,fail=0;
function t(name,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);ok?pass++:(fail++,console.log('FAIL',name,JSON.stringify(got),'want',JSON.stringify(want)));}
const S=(d,...sets)=>({date:d,sets:sets.map(x=>({w:x[0],r:x[1]}))});
const lin={mode:'linear',step:2.5,reps:8,sets:3};
const pick=r=>({weight:r.weight,reps:r.reps,sets:r.sets,stalls:r.stalls,deload:r.deload});
// no history
t('no history',pick(E.nextTarget(lin,[])),{weight:null,reps:8,sets:3,stalls:0,deload:false});
// linear hit -> +step
t('linear hit',pick(E.nextTarget(lin,[S('d1',[60,8],[60,8],[60,8])])),{weight:62.5,reps:8,sets:3,stalls:0,deload:false});
// linear miss -> same weight, stall 1
t('linear miss',pick(E.nextTarget(lin,[S('d1',[60,8],[60,8],[60,6])])),{weight:60,reps:8,sets:3,stalls:1,deload:false});
// linear: fewer sets than prescribed is a miss
t('linear short sets',E.nextTarget(lin,[S('d1',[60,8],[60,8])]).stalls,1);
// two stalls -> 10% deload, rounded to step
const two=[S('d1',[60,8],[60,8],[60,8]),S('d2',[62.5,8],[62.5,7],[62.5,6]),S('d3',[62.5,8],[62.5,6],[62.5,6])];
t('deload',pick(E.nextTarget(lin,two)),{weight:57.5,reps:8,sets:3,stalls:0,deload:true});
// after deload, a hit goes up by step again
t('hit after deload',pick(E.nextTarget(lin,two.concat([S('d4',[57.5,8],[57.5,8],[57.5,8])]))),{weight:60,reps:8,sets:3,stalls:0,deload:false});
// missed set right after deload: stall 1, same deload weight, no second deload yet
t('miss after deload',pick(E.nextTarget(lin,two.concat([S('d4',[57.5,8],[57.5,8],[57.5,6])]))),{weight:57.5,reps:8,sets:3,stalls:1,deload:false});
// a hit between misses resets the stall count
t('stall reset',E.nextTarget(lin,[S('d1',[60,8],[60,8],[60,8]),S('d2',[62.5,6],[62.5,6],[62.5,6]),S('d3',[62.5,8],[62.5,8],[62.5,8])]).weight,65);
// lifting heavier than planned is respected
t('heavier than plan',E.nextTarget(lin,[S('d1',[60,8],[60,8],[60,8]),S('d2',[65,8],[65,8],[65,8])]).weight,67.5);
// double progression: add reps at same weight until top of range
const dbl={mode:'double',step:1,repMin:8,repMax:12,sets:3};
t('double add rep',pick(E.nextTarget(dbl,[S('d1',[20,8],[20,8],[20,8])])),{weight:20,reps:9,sets:3,stalls:0,deload:false});
t('double uses weakest set',E.nextTarget(dbl,[S('d1',[20,10],[20,9],[20,12])]).reps,10);
t('double top of range',pick(E.nextTarget(dbl,[S('d1',[20,12],[20,12],[20,12])])),{weight:21,reps:8,sets:3,stalls:0,deload:false});
t('double stall',E.nextTarget(dbl,[S('d1',[20,10],[20,10],[20,10]),S('d2',[20,9],[20,9],[20,9])]).stalls,1);
t('double deload',pick(E.nextTarget(dbl,[S('d1',[20,10],[20,10],[20,10]),S('d2',[20,9],[20,9],[20,9]),S('d3',[20,9],[20,9],[20,9])])),{weight:18,reps:8,sets:3,stalls:0,deload:true});
// lbs defaults and rounding
t('step kg',E.progStep('kg','barbell'),2.5);t('step kg db',E.progStep('kg','dumbbell'),1);
t('step lbs',E.progStep('lbs','barbell'),5);t('step lbs db',E.progStep('lbs','dumbbell'),2);
t('lbs deload',E.nextTarget({mode:'linear',step:5,reps:8,sets:3},[S('d1',[135,8],[135,8],[135,8]),S('d2',[140,6],[140,6],[140,6]),S('d3',[140,6],[140,5],[140,6])],'lbs').weight,125);
// bodyweight
const bw={mode:'double',repMin:8,repMax:12,sets:3};
t('bodyweight rep',pick(E.nextTarget(bw,[S('d1',[0,8],[0,8],[0,7])])),{weight:0,reps:8,sets:3,stalls:0,deload:false});
t('bodyweight top',E.nextTarget(bw,[S('d1',[0,12],[0,12],[0,12])]).reason.indexOf('harder variation')>0,true);
// heavy top set only counts working sets at the top weight
t('warm-up ignored',E.nextTarget(lin,[S('d1',[20,8],[40,5],[60,8],[60,8],[60,8])]).weight,62.5);
// reason text present and plain
t('reason',E.nextTarget(lin,[S('d1',[60,8],[60,8],[60,8])]).reason,'You hit every target rep at 60 kg last time (8, 8, 8), so go up 2.5 kg.');
console.log(pass+' passed, '+fail+' failed');process.exit(fail?1:0);
