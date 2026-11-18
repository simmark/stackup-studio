/* Deterministic engineering smoke / property tests, run: node tests/impedance_engine_test.js */
const assert=require('node:assert/strict');
require('../impedance-engine.js');
const E=globalThis.SimonlationImpedance;
const fourLayer={maskEnabled:false,layers:[
 {id:'top',type:'copper',role:'signal',thicknessMM:.035,name:'F.Cu'},
 {id:'p1',type:'prepreg',thicknessMM:.18,epsilonR:4.2},
 {id:'gnd',type:'copper',role:'ground',thicknessMM:.035,name:'In1.Cu'},
 {id:'c1',type:'core',thicknessMM:.18,epsilonR:4.2},
 {id:'mid',type:'copper',role:'signal',thicknessMM:.035,name:'In2.Cu'},
 {id:'p2',type:'prepreg',thicknessMM:.18,epsilonR:4.2},
 {id:'bot',type:'copper',role:'ground',thicknessMM:.035,name:'B.Cu'}]};
const caseOf=(mode,widthMM,spacingMM=.2,signalId=mode.includes('stripline')?'mid':'top',stackup=fourLayer)=>({stackup,mode,widthMM,spacingMM,signalId});
const close=(actual,expected,tol=1e-6)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
let single=E.calculate(caseOf('microstrip',.3));
assert.equal(single.ok,true);close(single.z0,52.39737881843,.000001);assert.ok(single.epsEff>1&&single.epsEff<4.2);
assert.ok(E.calculate(caseOf('microstrip',.4)).z0<single.z0);
const diff=E.calculate(caseOf('diff-microstrip',.3));
assert.equal(diff.ok,true);close(diff.zDiff,2*diff.zOdd);close(diff.zCommon,diff.zEven/2);
assert.ok(E.calculate(caseOf('diff-microstrip',.3,.05)).zDiff<diff.zDiff);
const solve=E.solveWidth(caseOf('diff-microstrip',.3),100);assert.equal(solve.ok,true);close(solve.calculated.zDiff,100,.001);
const inner=E.calculate(caseOf('stripline',.3));assert.equal(inner.ok,true);close(inner.epsEff,4.2);
assert.equal(E.solveWidth(caseOf('stripline',.3),50).ok,true);
assert.equal(E.solveWidth(caseOf('diff-stripline',.3),100).ok,true);
const tol=E.toleranceCorners(caseOf('diff-microstrip',.3));assert.equal(tol.ok,true);assert.equal(tol.count,32);assert.ok(tol.min<tol.nominal&&tol.max>tol.nominal);
assert.equal(E.calculate(caseOf('microstrip',.0001)).ok,false);
const bad=structuredClone(fourLayer);bad.layers.splice(2,0,{id:'extra',type:'prepreg',epsilonR:8,thicknessMM:.02});
assert.match(E.calculate(caseOf('microstrip',.3,.2,'top',bad)).error,/Different Dk/);
const asym=structuredClone(fourLayer);asym.layers.find(l=>l.id==='p2').thicknessMM=.3;
assert.match(E.calculate(caseOf('stripline',.3,.2,'mid',asym)).error,/Asymmetric/);
const missing=structuredClone(fourLayer);missing.layers.find(l=>l.id==='gnd').role='mixed';
assert.match(E.calculate(caseOf('microstrip',.3,.2,'top',missing)).error,/No adjacent/);
const thickness=E.hammerstad(.3,.18,0,4.2);assert.ok(thickness.z0>single.z0);
console.log('PASS: H-J microstrip, numeric reference, monotonicity, differential mode, target inversions, stripline limits, 32 corners, safety gates');
