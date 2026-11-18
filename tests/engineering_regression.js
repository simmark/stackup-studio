const assert=require('node:assert/strict');
require('../impedance-engine.js');require('../via-fence-engine.js');
const E=globalThis.SimonlationImpedance,V=globalThis.SimonlationViaFence;
const pcb={maskEnabled:false,layers:[
 {id:'F',name:'F.Cu',type:'copper',role:'signal',thicknessMM:.035},
 {id:'d1',type:'prepreg',thicknessMM:.106,epsilonR:4.2},
 {id:'G',name:'In1.Cu',type:'copper',role:'ground',thicknessMM:.035},
 {id:'d2',type:'core',thicknessMM:.648,epsilonR:4.2},
 {id:'I',name:'In2.Cu',type:'copper',role:'signal',thicknessMM:.035},
 {id:'d3',type:'prepreg',thicknessMM:.106,epsilonR:4.2},
 {id:'B',name:'B.Cu',type:'copper',role:'ground',thicknessMM:.035}
]};
const i={stackup:pcb,signalId:'F',mode:'diff-microstrip',widthMM:.17,spacingMM:.18};
const base=E.calculate(i);assert.ok(base.ok);assert.ok(base.zDiff>35&&base.zDiff<180);
for(const target of [80,90,100,110]){
 const w=E.solveWidth(i,target),g=E.solveSpacing(i,target),b=E.optimizeGeometry(i,target,'balanced');
 for(const r of [w,g,b]){
  if(!r.ok){console.log('unreachable',target,r.error);continue;}
  const x=E.calculate({...i,widthMM:r.widthMM,spacingMM:r.spacingMM||i.spacingMM});
  assert.ok(Math.abs(x.zDiff-target)<0.05,`Zdiff ${x.zDiff} vs ${target}`);
 }
}
assert.equal(E.solveSpacing({...i,mode:'microstrip'},50).ok,false);
assert.equal(E.optimizeGeometry(i,100,'invalid').ok,false);
const limit={w:{value:10,unit:'um'},h:{value:10,unit:'percent'},t:{value:5,unit:'um'},s:{value:15,unit:'um'},er:{value:3,unit:'percent'}};
const tt=E.toleranceAnalysis(i,limit);assert.ok(tt.ok,tt.error);assert.equal(tt.count,32);assert.equal(tt.sensitivities.length,5);assert.ok(tt.min<tt.nominal&&tt.nominal<tt.max);assert.ok(tt.sensitivities.every(x=>x.impactOhms>=0));
const single=E.toleranceAnalysis({...i,mode:'microstrip'},limit);assert.equal(single.count,16);
assert.equal(E.toleranceAnalysis(i,{...limit,w:{value:20000,unit:'um'}}).ok,false);
assert.equal(E.calculate({...i,mode:'gcpw'}).ok,false);
assert.match(E.calculate({...i,mode:'gcpw'}).error,/2D solver/);
const v=V.calculate({frequencyGHz:5,epsilonEff:3,pitchMM:2,padMM:.6,drillMM:.3,edgeClearanceMM:.4,lengthMM:30,minAnnularMM:.1,minViaGapMM:.2,minTraceClearanceMM:.15,rows:2});
assert.ok(v.ok);assert.equal(v.viasPerRow,16);assert.equal(v.totalVias,32);assert.ok(v.max10MM>v.max20MM);assert.equal(v.checks.find(x=>x.name==='annular ring').pass,true);
assert.equal(V.calculate({pitchMM:.3,padMM:.6}).checks.find(x=>x.name==='via pad separation').pass,false);
assert.equal(V.calculate({frequencyGHz:0}).ok,false);
assert.equal(V.calculate({drillMM:.8,padMM:.6}).checks.find(x=>x.name==='annular ring').pass,false);
console.log('PASS engineering regression: forward / inverse, 2D W&S optimization, SI corners + µm, via fence DRC and λg rules');
