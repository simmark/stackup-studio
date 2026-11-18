/* SIMONLATION · Impedance Quick Engine v0.2
 * Local, deterministic, quasi-static analytical estimates only.
 * Sources/methods: Hammerstad–Jensen (microstrip incl. finite t),
 * Cohn/Wadell (symmetric stripline), IPC-2141A style differential coupling.
 * Not a 2D field solver, loss solver, manufacturer stackup qualification or fullwave EM model.
 */
(function(root){
'use strict';
const ETA = 376.730313668, C = 299792458;
const finite = n => Number.isFinite(n) && n > 0;
const isDiel = l=>l.type==='core'||l.type==='prepreg';
const isPlane = l=>l.type==='copper'&&['ground','power'].includes(l.role);
const error = message=>({ok:false,error:message});
function findRefs(stackup,signalId){
 const layers=stackup.layers||[];const index=layers.findIndex(l=>l.id===signalId&&l.type==='copper');
 if(index<0)return error('Select a valid copper signal layer.');
 const copperIndices=layers.map((l,i)=>l.type==='copper'?i:-1).filter(i=>i>=0);
 function side(dir){let diel=[];let copperSeen=false;
  for(let i=index+dir;i>=0&&i<layers.length;i+=dir){const l=layers[i];if(isDiel(l)){diel.push(l);continue;}
   if(l.type==='copper'){
    // Any intervening copper invalidates a geometric model, even if not plane-designated.
    if(!isPlane(l))return {blocked:true,blockedName:l.name};
    return {layer:l,distanceMM:diel.reduce((s,x)=>s+x.thicknessMM,0),dielectrics:diel};
   }
  }
  return null;
 }
 return {index,signal:layers[index],surface:copperIndices[0]===index||copperIndices.at(-1)===index, top:side(-1), bottom:side(1), copperIndices};
}
function homogeneous(dielectrics){
 if(!dielectrics.length)return error('No dielectric between signal and plane.');
 const h=dielectrics.reduce((s,l)=>s+l.thicknessMM,0);
 const er=dielectrics[0].epsilonR;
 if(!finite(h)||!finite(er)||er<1||er>30)return error('Invalid dielectric height or Dk.');
 if(dielectrics.some(l=>!finite(l.thicknessMM)||Math.abs(l.epsilonR-er)>.01))return error('Different Dk values between trace and reference plane. A multilayer field solver is required; no artificial averaged Dk will be used.');
 return {ok:true,h,er};
}
const sech = x=>1/Math.cosh(x);
const coth = x=>1/Math.tanh(x);
function hammerstad(w,h,t,er){
 if(![w,h,er].every(finite)||t<0)return error('Nonpositive geometry or invalid dielectric constant.');
 const u=w/h, tn=t/h;
 if(u<.01||u>100||er<1||er>30)return error('Out of analytical model range: 0.01 ≤ W/H ≤ 100 and 1 ≤ Dk ≤ 30.');
 const du1=tn>1e-8?tn/Math.PI*Math.log(1+4*Math.E/(tn*Math.pow(coth(Math.sqrt(6.517*u)),2))):0;
 const du=du1*(1+sech(Math.sqrt(Math.max(0,er-1))))/2;
 const u1=u+du1,ur=u+du;
 const zAir=x=>{
  const fu=6+(2*Math.PI-6)*Math.exp(-Math.pow(30.666/x,.7528));
  return ETA/(2*Math.PI)*Math.log(fu/x+Math.sqrt(1+Math.pow(2/x,2)));
 };
 const a=1+Math.log((Math.pow(ur,4)+Math.pow(ur/52,2))/(Math.pow(ur,4)+.432))/49+Math.log(1+Math.pow(ur/18.1,3))/18.7;
 const b=.564*Math.pow((er-.9)/(er+3),.053);
 const eff0=(er+1)/2+(er-1)/2*Math.pow(1+10/ur,-a*b);
 const zr=zAir(ur),z1=zAir(u1);
 const z0=zr/Math.sqrt(eff0),eff=eff0*Math.pow(z1/zr,2);
 if(!finite(z0)||!finite(eff))return error('Unstable microstrip result.');
 return {ok:true,z0,epsEff:eff,method:'Hammerstad–Jensen, finite-thickness correction',quality:'analytical', warnings:tn>.2?['T/H > 0.2: finite thickness correction is near its practical limits.']:[]};
}
function stripline(w,hTop,hBottom,t,er){
 if(![w,hTop,hBottom,er].every(finite)||t<0)return error('Invalid stripline geometry.');
 const symmetry=Math.abs(hTop-hBottom)/((hTop+hBottom)/2);
 if(symmetry>.1)return error('Asymmetric stripline (unequal top/bottom distances). Requires a 2D solver; no symmetric model applied.');
 const b=hTop+hBottom+t, d=b-t;
 if(t/b>.25)return error('Copper thickness above Cohn model limit (T/B > 0.25).');
 const ratio=w/d;
 if(ratio<=.35)return error('Narrow stripline W/(B–T) ≤ 0.35. Cohn wide-strip model not applicable.');
 const m=2*b/d;
 const cf=b/(Math.PI*d)*(m*Math.log((m+1)/(m-1))-Math.log((m*m-1)/4));
 const z0=ETA/(4*Math.sqrt(er)*(w/d+cf/Math.PI));
 if(!finite(z0))return error('Unstable stripline result.');
 const warnings=[];
 if(symmetry>.02)warnings.push('Small top/bottom offset: symmetric Cohn model is approximate.');
 return {ok:true,z0,epsEff:er,method:'Cohn / Wadell symmetric wide-strip model',quality:'analytical',warnings};
}
function calculate(input){
 const {stackup,signalId,mode='microstrip',widthMM,spacingMM=.15}=input;
 if(!stackup?.layers)return error('Missing stackup.');
 if(!['microstrip','diff-microstrip','stripline','diff-stripline'].includes(mode))return error('Unknown transmission line geometry.');
 const w=Number(widthMM),s=Number(spacingMM),paired=mode.startsWith('diff-');
 if(!finite(w)||w<.025||w>5)return error('Width must be between 0.025 and 5 mm.');
 if(paired&&(!finite(s)||s<.025||s>5))return error('Gap must be between 0.025 and 5 mm.');
 const refs=findRefs(stackup,signalId);if(!refs.signal)return refs;
 const t=refs.signal.thicknessMM;
 if(!finite(t))return error('Copper thickness must be positive.');
 let calc, h, er,refNames=[], warnings=[];
 if(mode.includes('microstrip')){
  if(!refs.surface)return error('Microstrip requires an outer copper layer. For internal signals choose stripline.');
  const r=refs.index===refs.copperIndices[0]?refs.bottom:refs.top;
  if(!r||r.blocked)return error('No adjacent GND/PWR reference plane. Assign the nearest copper layer as GND or PWR and verify real plane coverage in PCB layout.');
  const d=homogeneous(r.dielectrics);if(!d.ok)return d;
  h=d.h;er=d.er;refNames=[r.layer.name];calc=hammerstad(w,h,t,er);
  if(stackup.maskEnabled&&stackup.layers.some(l=>l.type==='soldermask'))warnings.push('Solder mask loading is not included; actual microstrip impedance can differ.');
 }else{
  if(refs.surface)return error('Stripline requires an internal copper layer.');
  if(!refs.top||!refs.bottom||refs.top.blocked||refs.bottom.blocked)return error('Stripline requires GND/PWR reference planes immediately above and below the signal layer.');
  const a=homogeneous(refs.top.dielectrics),b=homogeneous(refs.bottom.dielectrics);
  if(!a.ok)return a;if(!b.ok)return b;
  if(Math.abs(a.er-b.er)>.01)return error('Different top/bottom Dk values: 2D field solver required.');
  h=a.h+b.h;er=a.er;refNames=[refs.top.layer.name,refs.bottom.layer.name];
  calc=stripline(w,a.h,b.h,t,er);
 }
 if(!calc.ok)return calc;
 const result={...calc,mode,widthMM:w,spacingMM:paired?s:null,copperThicknessMM:t,epsilonR:er,referenceNames:refNames,referenceHeightMM:h,
  delayPsPerMM:1e9/C*Math.sqrt(calc.epsEff),wOverH:w/h};
 if(paired){
  // Empirical IPC-2141A coupling factor. It is NOT an eigenmode field computation.
  const c=mode==='diff-microstrip'?0.48*Math.exp(-.96*s/h):.347*Math.exp(-2.9*s/h);
  result.zOdd=calc.z0*(1-c);result.zEven=calc.z0*(1+c);
  result.zDiff=2*result.zOdd;result.zCommon=result.zEven/2;
  result.method+=' + empirical IPC-style edge-coupling correction';
  result.quality='empirical differential estimate';
  warnings.push('Delay is the uncoupled-line quasi-static estimate, not odd/even modal delay.');
  if(s/h<.5)warnings.push('Strong coupling (S/H < 0.5): empirical differential correction may be inaccurate.');
 }
 if(t/w>.5)warnings.push('Copper T/W > 0.5: approximation is sensitive to sidewall/etch profile.');
 warnings.push('Copper roles do not prove continuous reference-plane coverage. Check actual layout.');
 warnings.push('Quasi-static geometry only: no frequency dispersion, roughness, insertion loss, impedance discontinuities or manufacturing verification.');
 result.warnings=[...new Set([...(calc.warnings||[]),...warnings])];
 return result;
}
function solveWidth(input,targetOhms){
 const target=Number(targetOhms);
 if(!finite(target)||target<10||target>250)return error('Target impedance must be between 10 and 250 Ω.');
 const evaluate=w=>{const r=calculate({...input,widthMM:w});return r.ok?(r.zDiff??r.z0):null;};
 // Sample in log width, because narrow-stripline Cohn formula has a finite valid range.
 const samples=[];
 for(let i=0;i<=180;i++){
  const w=.025*Math.pow(5/.025,i/180),value=evaluate(w);
  if(value!==null)samples.push({w,value});
 }
 let bracket=null;
 for(let i=0;i<samples.length-1;i++){
  const a=samples[i],b=samples[i+1];
  if((a.value-target)*(b.value-target)<=0){bracket=[a,b];break;}
 }
 if(!bracket)return error('Target not reachable in the geometry/model validity range (width 0.025–5 mm).');
 let lo=bracket[0].w,hi=bracket[1].w;
 for(let i=0;i<55;i++){
  const mid=(lo+hi)/2,val=evaluate(mid);
  if(val===null)return error('Solver entered unsupported range.');
  if(val>target)lo=mid;else hi=mid;
 }
 const widthMM=(lo+hi)/2;
 return {ok:true,widthMM,calculated:calculate({...input,widthMM})};
}
function toleranceCorners(input, tolerances={w:10,h:10,t:10,s:10,er:5}){
 const original=calculate(input);if(!original.ok)return original;
 for(const n of Object.values(tolerances))if(!Number.isFinite(n)||n<0||n>30)return error('Tolerances must be in 0–30 %.');
 const values=[],params=['w','h','t','s','er'];
 const indices=(input.stackup.layers||[]).findIndex(l=>l.id===input.signalId);
 const baseStack=JSON.parse(JSON.stringify(input.stackup));
 for(let mask=0;mask<32;mask++){
  const factors=params.map((p,i)=>1+(mask&(1<<i)?1:-1)*(tolerances[p]||0)/100);
  const copy=JSON.parse(JSON.stringify(baseStack));
  copy.layers[indices].thicknessMM*=factors[2];
  // Shift only homogeneous dielectric(s) adjacent to selected signal until a plane is reached;
  // otherwise the estimate would mix stackup and local transmission-line tolerances.
  for(const direction of [-1,1]){
   for(let j=indices+direction;j>=0&&j<copy.layers.length;j+=direction){const l=copy.layers[j];
    if(l.type==='copper')break;
    if(isDiel(l)){l.thicknessMM*=factors[1];l.epsilonR*=factors[4];}
   }
  }
  const r=calculate({...input,stackup:copy,widthMM:input.widthMM*factors[0],spacingMM:input.spacingMM*factors[3]});
  if(r.ok)values.push(r.zDiff??r.z0);
 }
 if(values.length!==32)return error('Tolerance corners violate calculation model limits. Reduce tolerances.');
 return {ok:true,nominal:original.zDiff??original.z0,min:Math.min(...values),max:Math.max(...values),method:'32 worst-case corners (W, H, T, S, Dk); not a statistical production yield',count:values.length};
}
root.SimonlationImpedance=Object.freeze({calculate,solveWidth,toleranceCorners,findRefs,hammerstad,stripline,VERSION:'0.2'});
})(typeof window!=='undefined'?window:globalThis);
