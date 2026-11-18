/* SIMONLATION Via Fence Layout Advisor 0.4 · offline, no imaginary field solution. */
(function(root){'use strict';
const SPEED=299792458, ok=n=>Number.isFinite(n)&&n>0;
function calculate({frequencyGHz=5,epsilonEff=3,pitchMM=2,padMM=.6,drillMM=.3,edgeClearanceMM=.4,minTraceClearanceMM=.15,minAnnularMM=.1,minViaGapMM=.2,lengthMM=30,rows=2}={}){
 const v={frequencyGHz,epsilonEff,pitchMM,padMM,drillMM,edgeClearanceMM,minTraceClearanceMM,minAnnularMM,minViaGapMM,lengthMM,rows};
 for(const [key,value] of Object.entries(v))if(!ok(Number(value)))return {ok:false,error:key+' must be greater than zero.'};
 if(frequencyGHz>100||epsilonEff<1||epsilonEff>30||rows>2||rows<1)return {ok:false,error:'Frequency, dielectric or row count out of input limits.'};
 const guidedWavelengthMM=SPEED/(Number(frequencyGHz)*1e9*Math.sqrt(epsilonEff))*1000;
 const max10=guidedWavelengthMM/10, max20=guidedWavelengthMM/20;
 const n=Math.ceil(lengthMM/pitchMM)+1; // Endpoints included; actual spacing never exceeds requested pitch.
 const actualPitchMM=lengthMM/(n-1);
 const annularMM=(padMM-drillMM)/2;
 const pitchGapMM=actualPitchMM-padMM;
 const warnings=[],checks=[];
 function check(name,pass,detail){checks.push({name,pass,detail});}
 check('annular ring',annularMM>=minAnnularMM-1e-10,`${annularMM.toFixed(3)} mm vs min ${minAnnularMM} mm`);
 check('edge clearance',edgeClearanceMM>=minTraceClearanceMM-1e-10,`${edgeClearanceMM.toFixed(3)} mm vs min ${minTraceClearanceMM} mm`);
 check('via pad separation',pitchGapMM>=minViaGapMM-1e-10,`${pitchGapMM.toFixed(3)} mm vs min ${minViaGapMM} mm`);
 check('λg/10 pitch',actualPitchMM<=max10+1e-10,`${actualPitchMM.toFixed(3)} mm vs max ${max10.toFixed(3)} mm`);
 check('λg/20 conservative',actualPitchMM<=max20+1e-10,`${actualPitchMM.toFixed(3)} mm vs max ${max20.toFixed(3)} mm`);
 if(edgeClearanceMM<padMM)warnings.push('Close ground fence may alter trace impedance; re-solve as GCPW / full-wave structure. No correction applied.');
 warnings.push('Via fence must connect a continuous GND copper pour to the intended reference plane. Net assignment, drill aspect ratio and antipads are not validated.');
 warnings.push('λg/10 and λg/20 are layout heuristics, not isolation guarantees or a cutoff prediction.');
 if(epsilonEff===3)warnings.push('Default effective Dk is illustrative; verify for your line or solver.');
 return {ok:true,guidedWavelengthMM,max10MM:max10,max20MM:max20,actualPitchMM,requestedPitchMM:pitchMM,viasPerRow:n,totalVias:n*rows,lengthMM,padMM,drillMM,edgeClearanceMM,annularMM,edgeToCenterMM:edgeClearanceMM+padMM/2,checks,warnings,model:'guided-wavelength pitch heuristic + geometric DRC; no Z0/fence-EM prediction'};
}
root.SimonlationViaFence=Object.freeze({calculate,VERSION:'0.4'});
})(typeof window!=='undefined'?window:globalThis);
