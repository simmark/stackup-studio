/* SIMONLATION Stackup Studio · Quick Impedance working panel, local only. */
(()=>{'use strict';
const $=id=>document.getElementById(id), engine=window.SimonlationImpedance;
const KEY='simonlation-stackup-studio-impedance-v0.3';
const LEGACY_KEY='simonlation-impedance-v0.2';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'{}')}catch{}
const state={signalId:saved.signalId||null,mode:saved.mode||'microstrip',widthMM:Number(saved.widthMM)||.25,spacingMM:Number(saved.spacingMM)||.18,target:Number(saved.target)||50,
 tolerances:{w:10,h:10,t:10,s:10,er:5,...(saved.tolerances||{})}};
let lastResult=null,lastTolerance=null,lastInput=null;
let lastWorkspaceSelectionId=window.SimonlationStackup.getSelectedId();
const txt={de:{label:'Schnellberechnung · analytische Näherung',title:'PCB Impedance Lab',info:'Der Lagenaufbau liefert H, Kupferdicke und εr. Leiterbahnbreite und Abstand werden hier ergänzt. Keine Feldsimulation.',signal:'Signallage',mode:'Leitungsgeometrie',width:'Breite W',spacing:'Abstand S',target:'Zielimpedanz',solve:'Breite berechnen',export:'Ergebnis als JSON',result:'GEOMETRIE-ERGEBNIS',noValue:'Nicht berechnet',need:'Bitte gültige Geometrie auswählen.',outline:'Querschnitt (schematisch)',model:'Rechenmodell',limits:'Gültigkeit und Grenzen',tolerance:'TOLERANZ-EXPLORER',toleranceNote:'± Eingabewerte; 32 Worst-Case-Kombinationen, keine Fertigungsstatistik.',lower:'Minimum',upper:'Maximum',nominal:'Nominal',symmetric:'Voraussetzung: symmetrischer Stripline-Aufbau; gleicher Dk zwischen Signallage und Referenzen.',action:'Schätzung aktualisiert.',warn:'Bitte Herstellerdaten und reale Masseflächen verifizieren.',calculated:'Berechnete Breite',reference:'Referenz',height:'Dielektrischer Abstand',eps:'Effektives εr',delay:'Laufzeit',pair:'Differentiell',common:'Gleichtakt',unsupported:'Geometrie für analytische Näherung nicht geeignet.',sample:'Vorläufige Analyse · nicht als Fertigungsspezifikation verwenden'},
 en:{label:'Quick calculation · analytical approximation',title:'PCB Impedance Lab',info:'The stackup supplies H, copper thickness and Dk. Width and gap are added here. No field simulation.',signal:'Signal layer',mode:'Trace geometry',width:'Width W',spacing:'Gap S',target:'Target impedance',solve:'Solve width',export:'Export result JSON',result:'GEOMETRY RESULT',noValue:'Not calculated',need:'Select a valid geometry.',outline:'Cross-section (schematic)',model:'Calculation model',limits:'Validity and limitations',tolerance:'TOLERANCE EXPLORER',toleranceNote:'± input ranges; 32 worst-case corners, not production statistics.',lower:'Minimum',upper:'Maximum',nominal:'Nominal',symmetric:'Requires symmetric stripline and matching top/bottom Dk.',action:'Estimate updated.',warn:'Verify manufacturer parameters and real reference planes.',calculated:'Solved width',reference:'Reference',height:'Dielectric separation',eps:'Effective Dk',delay:'Propagation delay',pair:'Differential',common:'Common-mode',unsupported:'Geometry unsuitable for analytical approximation.',sample:'Preliminary estimate · not a fabrication specification'}};
const de=()=>document.documentElement.lang!=='en';const t=k=>(de()?txt.de:txt.en)[k];
const fmt=(n,d=2)=>Number(n).toLocaleString(de()?'de-DE':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const safe=str=>String(str??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));

const translations={
 'Solder mask loading is not included; actual microstrip impedance can differ.':'Die Lötstoppmaske ist im Modell nicht berücksichtigt; die reale Microstrip-Impedanz kann abweichen.',
 'Delay is the uncoupled-line quasi-static estimate, not odd/even modal delay.':'Die angezeigte Laufzeit ist die quasi-statische Einzelspur-Näherung, keine Odd-/Even-Mode-Laufzeit.',
 'Copper roles do not prove continuous reference-plane coverage. Check actual layout.':'Die Lagenfunktion beweist keine durchgehende Referenzfläche. Bitte das tatsächliche Layout prüfen.',
 'Quasi-static geometry only: no frequency dispersion, roughness, insertion loss, impedance discontinuities or manufacturing verification.':'Nur quasi-statische Geometrie: keine Dispersion, Rauheit, Einfügedämpfung, Diskontinuitäten oder Fertigungsprüfung.',
 'T/H > 0.2: finite thickness correction is near its practical limits.':'T/H > 0,2: Dickenkorrektur liegt nahe ihrer praktischen Gültigkeitsgrenze.',
 'Strong coupling (S/H < 0.5): empirical differential correction may be inaccurate.':'Starke Kopplung (S/H < 0,5): empirische Differential-Näherung ist möglicherweise ungenau.',
 'Copper T/W > 0.5: approximation is sensitive to sidewall/etch profile.':'Kupfer T/W > 0,5: Ergebnis hängt stark von Ätzprofil und Leiterbahnflanken ab.',
 'Small top/bottom offset: symmetric Cohn model is approximate.':'Leichte Asymmetrie: das symmetrische Cohn-Modell ist nur näherungsweise gültig.',
 'No adjacent GND/PWR reference plane. Assign the nearest copper layer as GND or PWR and verify real plane coverage in PCB layout.':'Keine benachbarte GND-/PWR-Referenzfläche. Die nächstliegende Kupferlage als GND oder PWR kennzeichnen und ihre reale Abdeckung im PCB-Layout prüfen.',
 'Microstrip requires an outer copper layer. For internal signals choose stripline.':'Microstrip benötigt eine äußere Kupferlage. Für Innenlagen Stripline verwenden.',
 'Stripline requires an internal copper layer.':'Stripline benötigt eine innere Kupferlage.',
 'Stripline requires GND/PWR reference planes immediately above and below the signal layer.':'Stripline benötigt unmittelbar ober- und unterhalb GND-/PWR-Referenzlagen.',
 'Different top/bottom Dk values: 2D field solver required.':'Unterschiedliche Dk-Werte oben/unten: Ein 2D-Feldsolver ist erforderlich.',
 'Different Dk values between trace and reference plane. A multilayer field solver is required; no artificial averaged Dk will be used.':'Unterschiedliche Dk-Werte zwischen Leiterbahn und Referenzfläche. Ein Mehrschicht-Feldsolver ist erforderlich; es wird kein künstlich gemittelter Dk-Wert verwendet.',
 'Asymmetric stripline (unequal top/bottom distances). Requires a 2D solver; no symmetric model applied.':'Asymmetrische Stripline (unterschiedlicher Abstand oben/unten). 2D-Solver nötig; symmetrisches Modell nicht anwendbar.',
 'Narrow stripline W/(B–T) ≤ 0.35. Cohn wide-strip model not applicable.':'Schmale Stripline W/(B–T) ≤ 0,35. Das Cohn-Modell für breite Leiterbahnen ist nicht anwendbar.',
 'Copper thickness above Cohn model limit (T/B > 0.25).':'Kupferdicke außerhalb der Cohn-Modellgrenze (T/B > 0,25).',
 'Out of analytical model range: 0.01 ≤ W/H ≤ 100 and 1 ≤ Dk ≤ 30.':'Außerhalb des analytischen Modellbereichs: 0,01 ≤ W/H ≤ 100 und 1 ≤ Dk ≤ 30.',
 'Width must be between 0.025 and 5 mm.':'Die Leiterbahnbreite muss zwischen 0,025 und 5 mm liegen.',
 'Gap must be between 0.025 and 5 mm.':'Der Leiterbahnabstand muss zwischen 0,025 und 5 mm liegen.',
 'Target impedance must be between 10 and 250 Ω.':'Die Zielimpedanz muss zwischen 10 und 250 Ω liegen.',
 'Target not reachable in the geometry/model validity range (width 0.025–5 mm).':'Das Ziel ist im zulässigen Geometrie-/Modellbereich (0,025–5 mm Breite) nicht erreichbar.',
 'Tolerance corners violate calculation model limits. Reduce tolerances.':'Einige Toleranzkombinationen liegen außerhalb der Modellgrenzen. Toleranzen verringern.',
 'Tolerances must be in 0–30 %.':'Toleranzen müssen zwischen 0 und 30 % liegen.'
};
const localize=msg=>de()?(translations[msg]||msg):msg;
const localizeMethod=msg=>!de()?msg:msg.replace('finite-thickness correction','Korrektur der Kupferdicke').replace('empirical IPC-style edge-coupling correction','empirische IPC-Koppelkorrektur').replace('symmetric wide-strip model','symmetrisches Breitstreifen-Modell');

const project=()=>window.SimonlationStackup.getSnapshot();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function input(){return {stackup:project(),signalId:state.signalId,mode:state.mode,widthMM:state.widthMM,spacingMM:state.spacingMM};}
function modeNames(){return de()?{'microstrip':'Microstrip','diff-microstrip':'Differential Microstrip','stripline':'Symmetrische Stripline','diff-stripline':'Differential Stripline'}:{'microstrip':'Microstrip','diff-microstrip':'Differential microstrip','stripline':'Symmetric stripline','diff-stripline':'Differential stripline'};}
function syncLayer(){const p=project();const signals=p.layers.filter(l=>l.type==='copper');if(!signals.some(l=>l.id===state.signalId))state.signalId=(signals.find(l=>l.role==='signal')||signals[0]||{}).id||null;
 const selected=window.SimonlationStackup.getSelectedId();const sel=signals.find(l=>l.id===selected);
 if(selected!==lastWorkspaceSelectionId&&sel&&['signal','mixed'].includes(sel.role))state.signalId=sel.id; // only synchronize on a NEW main-workspace selection
 lastWorkspaceSelectionId=selected;
 return signals;
}
function drawCross(r){
 const paired=state.mode.startsWith('diff-'),strip=state.mode.includes('stripline');
 const canvas=$('impSvg');if(!canvas)return;
 const top=strip?28:122,ground1=strip?55:249,ground2=strip?244:0,traceY=strip?144:114;
 const dark=document.documentElement.dataset.theme!=='light',ink=dark?'#d6e5ef':'#3c596b',sub=dark?'#86a6b9':'#647f90';
 const w=Math.min(138,Math.max(45, state.widthMM/.65*125)),gap=Math.min(125,Math.max(20,state.spacingMM/.5*90)),center=310;
 const left=paired?center-gap/2-w:center-w/2,right=center+gap/2;
 const lines=(y)=>`<rect x="38" y="${y}" width="544" height="13" rx="1.5" fill="#c69358" stroke="#efcc8d" stroke-width=".8"/>`;
 let svg=`<defs><pattern id="impgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${dark?'#254053':'#cad9e3'}" stroke-width=".6"/></pattern></defs><rect width="620" height="310" fill="${dark?'#0e1b28':'#eef4f8'}"/><rect width="620" height="310" fill="url(#impgrid)"/>`;
 svg+=`<rect x="38" y="${strip?73:132}" width="544" height="${strip?170:117}" rx="1" fill="#295f69" opacity=".65"/><text x="52" y="${strip?91:153}" font-size="12" fill="#d9f0ef">εr ${r.ok?fmt(r.epsilonR,2):'—'}</text>`;
 if(strip)svg+=lines(56)+lines(244);else svg+=lines(249);
 svg+=`<g fill="#e0a668" stroke="#f6c47d" stroke-width="1"><rect x="${left}" y="${traceY}" width="${w}" height="15" rx="1"/>${paired?`<rect x="${right}" y="${traceY}" width="${w}" height="15" rx="1"/>`:''}</g>`;
 const centerOfTrace=paired?(left+w/2):center;
 svg+=`<path d="M${left} ${traceY-15}v-7h${w}v7" stroke="${ink}" fill="none"/><text x="${left+w/2}" y="${traceY-26}" text-anchor="middle" fill="${ink}" font-size="13" font-weight="700">W = ${fmt(state.widthMM,3)} mm</text>`;
 if(paired)svg+=`<path d="M${left+w} ${traceY+7}h${gap}" stroke="${ink}" stroke-dasharray="3 2"/><text x="${left+w+gap/2}" y="${traceY+40}" text-anchor="middle" fill="${ink}" font-size="12">S = ${fmt(state.spacingMM,3)} mm</text>`;
 if(r.ok){const hr=strip?`${fmt(r.referenceHeightMM/2,3)} + ${fmt(r.referenceHeightMM/2,3)} mm`:fmt(r.referenceHeightMM,3)+' mm';svg+=`<path d="M593 ${traceY+16}V${strip?244:249}" stroke="${ink}" stroke-width="1.2" stroke-dasharray="4 3"/><text x="570" y="${strip?194:210}" fill="${ink}" font-size="12" text-anchor="end">H = ${hr}</text>`;}
 svg+=`<text x="45" y="27" font-size="11" fill="${sub}">${strip?(de()?'OBERE REFERENZ':'UPPER PLANE'):(de()?'SIGNAL · OBEN':'SIGNAL · TOP')}</text><text x="45" y="295" font-size="11" fill="${sub}">${strip?(de()?'UNTERE REFERENZ':'LOWER PLANE'):(de()?'REFERENZFLÄCHE':'REFERENCE PLANE')}</text>`;
 canvas.innerHTML=svg;
}
function render(){const p=project(),signals=syncLayer(),paired=state.mode.startsWith('diff-');
 document.querySelectorAll('[data-imp-label]').forEach(el=>el.textContent=t(el.dataset.impLabel));
 $('impMode').innerHTML=Object.entries(modeNames()).map(([v,lab])=>`<option value="${v}" ${v===state.mode?'selected':''}>${safe(lab)}</option>`).join('');
 $('impSignal').innerHTML=signals.map(l=>`<option value="${safe(l.id)}" ${l.id===state.signalId?'selected':''}>${safe(l.name)} · ${safe(l.role)}</option>`).join('');
 $('impWidth').value=String(state.widthMM);$('impGap').value=String(state.spacingMM);$('impTarget').value=String(state.target);
 $('impGapField').classList.toggle('imp-muted',!paired);$('impGap').disabled=!paired;
 for(const key of ['w','h','t','s','er']){$('impTol'+key.toUpperCase()).value=state.tolerances[key]??0;}
 $('impTolSField').classList.toggle('imp-muted',!paired);$('impTolS').disabled=!paired;
 const i=input();lastInput=i;const r=engine.calculate(i);lastResult=r;lastTolerance=r.ok?engine.toleranceCorners(i,state.tolerances):null;
 const put=(id,value)=>$(id).textContent=value;
 put('impMainResult',r.ok?fmt(r.zDiff??r.z0,2)+' Ω':'— Ω');put('impSubResult',r.ok?(paired?`Zodd ${fmt(r.zOdd,2)} Ω · Zeven ${fmt(r.zEven,2)} Ω`:`Z₀ ${fmt(r.z0,2)} Ω`):t('noValue'));
 put('impEps',r.ok?fmt(r.epsEff,3):'—');put('impDelay',r.ok?fmt(r.delayPsPerMM,2)+' ps/mm':'—');
 put('impHeight',r.ok?fmt(r.referenceHeightMM,3)+' mm':'—');put('impReference',r.ok?r.referenceNames.join(' + '):'—');
 put('impMethod',r.ok?localizeMethod(r.method):'—');put('impKind',paired?'Zdiff':'Z₀');
 $('impResultCard').classList.toggle('imp-invalid',!r.ok);
 $('impIssue').innerHTML=r.ok?`<strong>${safe(t('limits'))}</strong><ul>${r.warnings.map(w=>`<li>${safe(localize(w))}</li>`).join('')}</ul>`:`<strong>${safe(t('unsupported'))}</strong><p>${safe(localize(r.error))}</p>`;
 if(lastTolerance?.ok){put('impTolNominal',fmt(lastTolerance.nominal,2)+' Ω');put('impTolMin',fmt(lastTolerance.min,2)+' Ω');put('impTolMax',fmt(lastTolerance.max,2)+' Ω');const lo=lastTolerance.min,hi=lastTolerance.max,x=lastTolerance.nominal;
  const p0=100*(x-lo)/Math.max(1e-9,hi-lo);$('impTolIndicator').style.left=`${Math.max(1,Math.min(99,p0))}%`;$('impTolBar').classList.remove('imp-muted');
 }else{['impTolNominal','impTolMin','impTolMax'].forEach(id=>put(id,'—'));$('impTolBar').classList.add('imp-muted');}
 $('impSolveBtn').disabled=!r.ok;
 $('impExportBtn').disabled=!r.ok;
 drawCross(r);persist();
}
function download(content,name){const blob=new Blob([content],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function exportResult(){if(!lastResult?.ok)return;
 const payload={schema:'com.simonlation.impedance-result',version:1,software:'SIMONLATION Stackup Studio + PCB Impedance Lab 0.2',createdAt:new Date().toISOString(),units:{length:'mm',impedance:'ohm',delay:'ps/mm'},
 geometry:{signalLayerId:state.signalId,mode:state.mode,widthMM:state.widthMM,spacingMM:state.mode.startsWith('diff-')?state.spacingMM:null},model:lastResult.method,results:lastResult,toleranceCorners:lastTolerance,
 stackup:project(),assumptions:['Quasi-static analytical estimate; not a field solution.','Copper plane roles are declared in the stackup but are not checked against real copper polygons.','No frequency-dependent losses, soldermask correction, bends, etch profile, vias or dispersion are evaluated.']};
 download(JSON.stringify(payload,null,2),(project().projectName||'board').toLowerCase().replace(/[^a-z0-9-]+/g,'-')+'.impedance-result.json');
}
function numberInput(id,cb){$(id).addEventListener('change',()=>{const val=Number($(id).value);if(!Number.isFinite(val))return render();cb(val);render();});$(id).addEventListener('keydown',ev=>{if(ev.key==='Enter')ev.target.blur();});}
$('impMode').addEventListener('change',()=>{state.mode=$('impMode').value;state.target=state.mode.startsWith('diff-')?100:50;render();});
$('impSignal').addEventListener('change',()=>{state.signalId=$('impSignal').value;render();});
numberInput('impWidth',x=>state.widthMM=x);numberInput('impGap',x=>state.spacingMM=x);numberInput('impTarget',x=>state.target=x);
for(const key of ['w','h','t','s','er'])numberInput('impTol'+key.toUpperCase(),x=>state.tolerances[key]=x);
$('impSolveBtn').addEventListener('click',()=>{const solved=engine.solveWidth(input(),state.target);if(!solved.ok){$('impIssue').innerHTML=`<strong>${safe(t('unsupported'))}</strong><p>${safe(localize(solved.error))}</p>`;return;}state.widthMM=Number(solved.widthMM.toFixed(5));render();$('impWidth').focus();});
$('impExportBtn').addEventListener('click',exportResult);
window.addEventListener('simonlation:stackup-change',render);
render();
window.SimonlationImpedanceUI={snapshot:()=>({...state}),result:()=>lastResult,tolerance:()=>lastTolerance,exportResult};
})();
