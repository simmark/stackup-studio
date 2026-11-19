// Independent reference: exact zero-thickness symmetric stripline (Cohn, conformal mapping)
// Z0·sqrt(er) = 30π·K(k)/K(k'), k = sech(πW/2b). Values computed with scipy.special.ellipk.
// Plus finite-thickness cases from an independent 2D finite-difference Laplace solve (±2 %).
const assert=require('assert');require('../impedance-engine.js');const E=globalThis.SimonlationImpedance;
const exact=[[0.1,0.4,4.2,68.32],[0.2,0.4,4.2,49.04],[0.4,0.4,4.2,31.91],[0.8,0.4,3.5,20.64]];
for(const [w,b,er,z] of exact){const r=E.stripline(w,b/2,b/2,1e-9,er);assert.ok(r.ok,r.error);
 const e=Math.abs(r.z0-z)/z;assert.ok(e<0.01,`W=${w} b=${b}: ${r.z0.toFixed(2)} vs ${z} (${(e*100).toFixed(2)} %)`);}
const fd=[[0.15,0.2,0.018,4.2,53.42],[0.30,0.2,0.018,4.2,37.08]];
for(const [w,h,t,er,z] of fd){const r=E.stripline(w,h,h,t,er);const e=Math.abs(r.z0-z)/z;assert.ok(e<0.03,`FD case W=${w}: ${r.z0.toFixed(2)} vs ${z}`);}
console.log('PASS stripline reference (exact t=0 conformal map + independent 2D FD)');
