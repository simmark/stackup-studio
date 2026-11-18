/* SIMONLATION Stackup / Impedance / Via Fence workbench · local-first beta 0.4 */
(()=>{'use strict';
const $=id=>document.getElementById(id), E=window.SimonlationImpedance,V=window.SimonlationViaFence;
const KEY='simonlation-stackup-studio-impedance-v0.3',OLD='simonlation-impedance-v0.2';
const saved=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD)||'{}')}catch{return {}}})();
const sane=(n,def)=>Number.isFinite(Number(n))&&Number(n)>0?Number(n):def;
const state={signalId:saved.signalId||null,mode:saved.mode||'microstrip',widthMM:sane(saved.widthMM,.25),spacingMM:sane(saved.spacingMM,.18),target:sane(saved.target,50),optimize:saved.optimize||'width',view:saved.view||'schematic',
 tolerances:{w:10,h:10,t:10,s:10,er:5,...(saved.tolerances||{})},toleranceUnits:{w:'percent',h:'percent',t:'percent',s:'percent',...(saved.toleranceUnits||{})},
 via:{frequencyGHz:5,pitchMM:2,padMM:.6,drillMM:.3,edgeClearanceMM:.4,lengthMM:30,minTraceClearanceMM:.15,minAnnularMM:.1,minViaGapMM:.2,...(saved.via||{})}};
let lastResult=null,lastTolerance=null,lastVia=null,lastInput=null;
let selectedBefore=window.SimonlationStackup.getSelectedId();
const paired=()=>state.mode.startsWith('diff-'),strip=()=>state.mode.includes('stripline');
const de=()=>document.documentElement.lang!=='en';
const fmt=(n,d=2)=>Number(n).toLocaleString(de()?'de-DE':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt={
 de:{label:'SCHNELLE ANALYTISCHE BERECHNUNG',title:'PCB Impedance Lab',info:'Referenzlagen und Materialien aus dem Stackup. W und S kannst du auch direkt im Querschnitt auswählen. Die Rechnung ist kein Feldsolver.',signal:'Signallage',mode:'Leitungsgeometrie',width:'Breite W',spacing:'Abstand S',target:'Zielimpedanz',solve:'Optimieren',optimize:'Variable',export:'Ergebnis als JSON',noValue:'Nicht berechnet',outline:'Leitungsquerschnitt',model:'Rechenmodell',limits:'Modellgrenzen & Hinweise',tolerance:'FERTIGUNGSTOLERANZEN',toleranceNote:'Deterministische Grenzfälle, keine statistische Fertigungsausbeute.',lower:'Minimum',nominal:'Nominal',upper:'Maximum',reference:'Referenzlagen',height:'Dielektrikumsabstand',eps:'Effektives Dk',delay:'Laufzeit',unsupported:'Analytische Berechnung nicht verfügbar',sample:'Ungeprüfte Näherung · keine Fertigungsvorgabe',editTip:'Maße W / S / H anklicken, um die Eingabe zu bearbeiten · Ansicht schematisch oder maßstäblich',viaTitle:'Via Fence Designer',viaSubtitle:'GND-Vias links und rechts der Leitung · Pitch, Geometrie und Fertigungsabstände',viaHeuristic:'LAYOUT-RICHTWERT',viaFreq:'Maximale relevante Frequenz',viaPitch:'Pitch / Via-Abstand',viaPad:'Pad-Durchmesser',viaDrill:'Bohrung',viaEdge:'Leiterbahnkante → Pad',viaLength:'Zaunlänge',viaMinTrace:'Min. Trace-Abstand',viaRing:'Min. Restring',viaGapMin:'Min. Pad-zu-Pad',viaAuto:'λg/20 übernehmen',viaExport:'Via JSON exportieren',viaTopView:'Draufsicht · GND-Via-Reihen (schematisch)'},
 en:{label:'QUICK ANALYTICAL ESTIMATE',title:'PCB Impedance Lab',info:'Reference planes and dielectrics come from stackup. Click W and S right in the cross-section. This is not a field solver.',signal:'Signal layer',mode:'Trace geometry',width:'Width W',spacing:'Gap S',target:'Target impedance',solve:'Optimize',optimize:'Variable',export:'Export result JSON',noValue:'Not calculated',outline:'Trace cross-section',model:'Calculation model',limits:'Model limitations & notes',tolerance:'MANUFACTURING TOLERANCES',toleranceNote:'Deterministic corners, not statistical yield.',lower:'Minimum',nominal:'Nominal',upper:'Maximum',reference:'Reference planes',height:'Dielectric separation',eps:'Effective Dk',delay:'Propagation delay',unsupported:'Analytical calculation unavailable',sample:'Unverified estimate · not a fabrication specification',editTip:'Click W / S / H labels to edit · schematic or true-ratio view',viaTitle:'Via Fence Designer',viaSubtitle:'Ground stitching left and right of traces · pitch, geometry and fabrication checks',viaHeuristic:'LAYOUT GUIDELINE',viaFreq:'Maximum relevant frequency',viaPitch:'Via pitch',viaPad:'Pad diameter',viaDrill:'Drill diameter',viaEdge:'Trace edge → via pad',viaLength:'Fence length',viaMinTrace:'Min trace clearance',viaRing:'Min annular ring',viaGapMin:'Min pad-to-pad',viaAuto:'Apply λg/20',viaExport:'Export via JSON',viaTopView:'Top view · GND via rows (schematic)'}};
const t=k=>(de()?txt.de:txt.en)[k];
const project=()=>window.SimonlationStackup.getSnapshot();
const input=()=>({stackup:project(),signalId:state.signalId,mode:state.mode,widthMM:state.widthMM,spacingMM:state.spacingMM});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const setText=(id,text)=>{const el=$(id);if(el)el.textContent=text;};
function setValue(id,val){const el=$(id);if(!el||document.activeElement===el)return;el.value=String(val);}
function modeNames(){return de()?{'microstrip':'Microstrip','diff-microstrip':'Differential Microstrip','stripline':'Symmetrische Stripline','diff-stripline':'Differential Stripline','gcpw':'GCPW · Vorschau (Solver nötig)','diff-gcpw':'Differential GCPW · Vorschau','embedded-microstrip':'Embedded Microstrip · Vorschau','asym-stripline':'Asym. Stripline · Vorschau'}:
 {'microstrip':'Microstrip','diff-microstrip':'Differential microstrip','stripline':'Symmetric stripline','diff-stripline':'Differential stripline','gcpw':'GCPW · preview (solver needed)','diff-gcpw':'Differential GCPW · preview','embedded-microstrip':'Embedded microstrip · preview','asym-stripline':'Asymmetric stripline · preview'};}
function syncLayer(){const signals=project().layers.filter(l=>l.type==='copper');if(!signals.some(l=>l.id===state.signalId))state.signalId=(signals.find(l=>l.role==='signal')||signals[0]||{}).id||null;
 const picked=window.SimonlationStackup.getSelectedId();const layer=signals.find(l=>l.id===picked);
 if(picked!==selectedBefore&&layer&&['signal','mixed'].includes(layer.role))state.signalId=layer.id;selectedBefore=picked;
 return signals;}
function localError(message){const map={
  'Geometry preview only. A validated multilayer / coplanar 2D solver is required for impedance.':'Diese Geometrie wird visualisiert. Für eine belastbare Impedanz ist ein validierter 2D-Mehrschicht-/Koplanar-Solver nötig.',
  'Microstrip requires an outer copper layer. For internal signals choose stripline.':'Microstrip erfordert eine Außenlage. Bitte für Innenlagen Stripline wählen.',
  'Stripline requires an internal copper layer.':'Stripline erfordert eine innere Kupferlage.',
  'Stripline requires GND/PWR reference planes immediately above and below the signal layer.':'Stripline benötigt zwei benachbarte GND-/Power-Referenzlagen.',
  'No adjacent GND/PWR reference plane. Assign the nearest copper layer as GND or PWR and verify real plane coverage in PCB layout.':'Keine benachbarte GND-/PWR-Lage gefunden. Im Stackup die Referenzlagenfunktion prüfen.',
  'Asymmetric stripline (unequal top/bottom distances). Requires a 2D solver; no symmetric model applied.':'Asymmetrischer Abstand zu den Referenzlagen. Das symmetrische Modell darf hier nicht verwendet werden.',
  'Different Dk values between trace and reference plane. A multilayer field solver is required; no artificial averaged Dk will be used.':'Mehrere unterschiedliche Dk-Werte. Keine unphysikalische εr-Mittelung; Feldsolver nötig.',
  'Different top/bottom Dk values: 2D field solver required.':'Unterschiedliche Dk-Werte oben und unten. 2D-Feldsolver erforderlich.',
  'Narrow stripline W/(B–T) ≤ 0.35. Cohn wide-strip model not applicable.':'Zu schmale Stripline für das Cohn-Breitstreifenmodell.',
  'Tolerance must be finite and non-negative.':'Toleranzen müssen endlich und nichtnegativ sein.',
  'Tolerance range crosses unsupported geometry: ':'Toleranzen überschreiten die Modellgrenzen: ',
  'Target not reachable with the fixed width in the model validity range (gap 0.025–5 mm).':'Ziel mit festgehaltener Breite im Gap-Bereich 0,025–5 mm nicht erreichbar.',
  'No feasible W / S combination found in supported geometry limits.':'Keine gültige Kombination aus W und S gefunden.'};
 if(!de())return message;
 return Object.keys(map).reduce((out,k)=>out.replace(k,map[k]),String(message));}
function drawCross(result){
 const svg=$('impSvg'),isDiff=paired(),isStrip=strip(),gcpw=state.mode.includes('gcpw'),embedded=state.mode==='embedded-microstrip';
 const dk=document.documentElement.dataset.theme==='dark',ink=dk?'#e4edf5':'#324e62',muted=dk?'#93b0c0':'#587789';
 const refs=E.findRefs(project(),state.signalId);
 const lay=project().layers.find(l=>l.id===state.signalId)||{};
 const ref=isStrip?(refs.top?.distanceMM||0)+(refs.bottom?.distanceMM||0):(refs.surface?(refs.index===refs.copperIndices?.[0]?refs.bottom:refs.top)?.distanceMM||.15:.15);
 const h=Math.max(.02,ref||.15),w=state.widthMM,s=state.spacingMM,pad=state.via.padMM,edge=state.via.edgeClearanceMM;
 const fenceSpan=pad+edge,span=(isDiff?2*w+s:w)+2*fenceSpan+1.0;
 const scale=Math.min(280,495/Math.max(span,.35),165/Math.max(h,.07));
 const traceW=w*scale,space=isDiff?s*scale:0,center=310;
 const left=isDiff?center-space/2-traceW:center-traceW/2,right=isDiff?center+space/2:left;
 const topTrace=isStrip?135:114,thick=Math.max(4,Math.min(12,(lay.thicknessMM||.035)*scale));
 const dy=state.view==='metric'?Math.max(6,h*scale):130;
 const upper=isStrip?Math.max(25,topTrace-(refs.top?.distanceMM||h/2)*scale-18):null;
 const lower=Math.min(275,topTrace+thick+(isStrip?Math.max(24,(refs.bottom?.distanceMM||h/2)*scale):dy));
 const dielectricTop=isStrip?(upper+9):(topTrace+thick),dielectricEnd=lower;
 const background=dk?'#0d1a27':'#edf4f8',diel=dk?'#2a6975':'#6fa0a8',copper='#d8a05e';
 const bar=(x,y,width,height=8)=>`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5" fill="${copper}" stroke="#efc58e" stroke-width=".6"/>`;
 let out=`<defs><pattern id="impgrid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" stroke="${dk?'#233b4c':'#d4e2e9'}" stroke-width=".65" fill="none"/></pattern></defs><rect width="620" height="310" fill="${background}"/><rect width="620" height="310" fill="url(#impgrid)"/>`;
 out+=`<rect x="30" y="${dielectricTop}" width="560" height="${Math.max(4,dielectricEnd-dielectricTop)}" fill="${diel}" opacity=".82"/><text x="43" y="${Math.min(lower-8,dielectricTop+20)}" font-size="11" fill="#e6fbf9">εr ${fmt(result.ok?result.epsilonR:project().layers.find(l=>l.type==='prepreg')?.epsilonR||4.2,2)}</text>`;
 if(isStrip)out+=bar(30,upper,560,9);out+=bar(30,lower,560,9);
 if((project().maskEnabled!==false)&&!isStrip){out+=`<rect x="30" y="${topTrace+thick}" width="560" height="4" fill="#499c79" opacity=".55"/>`;}
 if(gcpw){const gapPx=Math.max(10,s*scale);out+=bar(30,topTrace,Math.max(3,left-gapPx-30),thick)+bar(right+traceW+gapPx,topTrace,Math.max(3,590-(right+traceW+gapPx)),thick);}
 out+=bar(left,topTrace,traceW,thick);if(isDiff)out+=bar(right,topTrace,traceW,thick);
 const label=(text,x,y,edit)=>`<g data-edit="${edit}" role="button" tabindex="0" class="imp-label-action"><rect x="${x-82}" y="${y-16}" width="164" height="24" rx="6" fill="${dk?'#142d3d':'#dceaf0'}" opacity=".9"/><text x="${x}" y="${y}" font-size="13" font-weight="760" fill="${ink}" text-anchor="middle">${text} ✎</text></g>`;
 out+=`<path d="M${left} ${topTrace-12}v-10h${traceW}v10" stroke="${ink}" stroke-width="1.4" fill="none"/>`;
 out+=label('W = '+fmt(w,3)+' mm',left+traceW/2,topTrace-30,'impWidth');
 if(isDiff){const cx=left+traceW+space/2;
  out+=`<path d="M${left+traceW} ${topTrace+6}H${right}" stroke="${ink}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
  out+=label('S = '+fmt(s,3)+' mm',cx,topTrace+53,'impGap');
 }
 out+=`<path d="M595 ${topTrace+thick}V${lower}" stroke="${ink}" stroke-dasharray="4 3"/><g data-edit="impH" role="button" tabindex="0" class="imp-label-action"><rect x="452" y="${Math.min(255,lower+10)}" width="145" height="26" rx="5" fill="${dk?'#172b3b':'#dceaf0'}"/><text x="524" y="${Math.min(275,lower+27)}" text-anchor="middle" font-size="12" fill="${ink}">H ≈ ${fmt(h,3)} mm ✎</text></g>`;
 if(!isStrip){ // In a cross section, plated barrels connect top GND islands with the reference plane.
  const cx1=left-edge*scale-pad*scale/2,cx2=(isDiff?right+traceW:left+traceW)+edge*scale+pad*scale/2,viaR=Math.max(7,Math.min(31,pad*scale/2));
  for(const x of [cx1,cx2]){
   const x0=Math.max(33,Math.min(587,x));out+=`<rect x="${x0-4}" y="${topTrace+thick}" width="8" height="${Math.max(10,lower-topTrace-thick)}" fill="#d9a05d" opacity=".68"/><rect x="${x0-2}" y="${topTrace+thick}" width="4" height="${Math.max(10,lower-topTrace-thick)}" fill="${background}"/><circle cx="${x0}" cy="${topTrace+thick/2}" r="${viaR}" fill="#d5a367" stroke="#efd7ab" stroke-width="2"/><circle cx="${x0}" cy="${topTrace+thick/2}" r="${Math.max(2,viaR*.48)}" fill="${background}" stroke="#f0c389" stroke-width="1"/>`;
  }
  out+=`<text x="40" y="295" font-size="11" fill="${muted}">${de()?'GND-Vias schematisch · Pitch siehe unten':'GND vias schematic · pitch in top view below'}</text>`;
 }
 if(isStrip)out+=`<text x="40" y="295" font-size="11" fill="${muted}">${de()?'Referenzflächen oben / unten':'Upper / lower reference planes'}</text>`;
 out+=`<text x="44" y="28" font-size="10" letter-spacing=".8" fill="${muted}">${state.view==='metric'?'XY EQUAL SCALE · ADAPTIVE ZOOM':'SCHEMATIC · H ENLARGED FOR LEGIBILITY'}</text>`;
 if(embedded)out+=`<rect x="30" y="73" width="560" height="35" fill="${diel}" opacity=".4"/><text x="44" y="87" font-size="10" fill="${muted}">TOP DIELECTRIC · FIELD SOLVER REQUIRED</text>`;
 svg.innerHTML=out;
}
function drawVia(v){const svg=$('viaSvg');if(!svg)return;
 const dk=document.documentElement.dataset.theme==='dark',ink=dk?'#e2eff5':'#34546b',grid=dk?'#2b4453':'#d4e4ea';
 const actualCount=v.ok?v.viasPerRow:6;
 const n=Math.max(2,Math.min(36,actualCount));const viaRadius=Math.min(9,Math.max(2.2,169/Math.max(1,n-1)*.38));
 let out=`<rect width="620" height="230" rx="8" fill="${dk?'#101f2c':'#edf5f8'}"/><defs><pattern id="viaGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="${grid}" stroke-width=".7"/></pattern></defs><rect width="620" height="230" fill="url(#viaGrid)"/>`;
 const traceW=paired()?15:22,traceGap=paired()?17:0,x1=310-(paired()?traceW+traceGap/2:traceW/2),viaLeft=x1-70,viaRight=(paired()?310+traceGap/2+traceW:310+traceW/2)+70;
 out+=`<rect x="${x1}" y="24" width="${traceW}" height="172" rx="3" fill="#dba365"/>`;
 if(paired())out+=`<rect x="${310+traceGap/2}" y="24" width="${traceW}" height="172" rx="3" fill="#dba365"/>`;
 for(const x of [viaLeft,viaRight]){
  out+=`<path d="M${x} 23V198" stroke="#4c9a89" stroke-width="8" opacity=".25"/>`;
  for(let i=0;i<n;i++){const y=27+i*169/(n-1);out+=`<circle cx="${x}" cy="${y}" r="${viaRadius}" fill="#d5a064" stroke="#f0cd91" stroke-width="${viaRadius>4?1.3:.6}"/><circle cx="${x}" cy="${y}" r="${viaRadius*.44}" fill="${dk?'#122531':'#edf5f8'}"/>`;
  }
 }
 out+=`<path d="M${viaRight+18} 27V${27+169/(n-1)}" stroke="${ink}" stroke-width="1.5"/><text x="${viaRight+25}" y="45" font-size="12" fill="${ink}">P</text>`;
 out+=`<text x="310" y="218" font-size="11" fill="${ink}" text-anchor="middle">${de()?'Leitungslänge':'Fence length'} ${fmt(state.via.lengthMM,1)} mm · ${v.ok?v.totalVias:'—'} Vias${actualCount>n?(de()?' (Reihen schematisch)':' (rows schematic)'):''}</text>`;
 svg.innerHTML=out;
}
function viaRender(r){const refs=E.findRefs(project(),state.signalId);
 const nearby=[...(refs.top?.dielectrics||[]),...(refs.bottom?.dielectrics||[])].map(x=>Number(x.epsilonR)).filter(Number.isFinite);
 const effective=nearby.length?Math.max(...nearby):4.2;
 // Via-fence substrate-wave guideline uses the largest local bulk Dk (shortest wavelength),
 // not the usually smaller trace effective Dk. This is a conservative wavelength proxy.
 lastVia=V.calculate({...state.via,epsilonEff:effective,rows:2});drawVia(lastVia);
 if(lastVia.ok){
  const html=[['Dk substrate',fmt(effective,2)],['λg',fmt(lastVia.guidedWavelengthMM,2)+' mm'],['λg/10',fmt(lastVia.max10MM,2)+' mm'],['λg/20',fmt(lastVia.max20MM,2)+' mm'],[de()?'Effektiv':'Actual P',fmt(lastVia.actualPitchMM,2)+' mm'],[de()?'Vias gesamt':'Vias total',String(lastVia.totalVias)]];
  $('viaResults').innerHTML=html.map(([a,b])=>`<div><small>${safe(a)}</small><strong>${safe(b)}</strong></div>`).join('');
  $('viaWarnings').innerHTML=`<p>${safe(de()?'Pitch mit größtem benachbartem Substrat-Dk ('+fmt(effective,2)+') berechnet, nicht mit εeff der Leitung.':'Pitch uses largest adjacent substrate Dk ('+fmt(effective,2)+'), not trace εeff.')}</p><div class="via-check-grid">${lastVia.checks.map(c=>`<span class="${c.pass?'pass':'fail'}">${c.pass?'✓':'!'} ${safe(c.name)} <small>${safe(c.detail)}</small></span>`).join('')}</div><p>${safe(de()?'Keine Simulation der Impedanzveränderung durch Vias oder Masseflächen. Nur Pitch-Richtwert und Geometrieprüfung.':'No simulation of impedance alteration by vias or nearby ground. Pitch guideline and geometric checks only.')}</p>`;
 }else{$('viaResults').innerHTML='';$('viaWarnings').textContent=localError(lastVia.error);}
}
function render(){const signalLayers=syncLayer();
 document.querySelectorAll('[data-imp-label]').forEach(el=>el.textContent=t(el.dataset.impLabel));
 $('impMode').innerHTML=Object.entries(modeNames()).map(([k,n])=>`<option value="${safe(k)}" ${k===state.mode?'selected':''}>${safe(n)}</option>`).join('');
 $('impSignal').innerHTML=signalLayers.map(l=>`<option value="${safe(l.id)}" ${l.id===state.signalId?'selected':''}>${safe(l.name)} · ${safe(l.role)}</option>`).join('');
 setValue('impWidth',state.widthMM);setValue('impGap',state.spacingMM);setValue('impTarget',state.target);
 const diff=paired();$('impGapField').classList.toggle('imp-muted',!diff);$('impGap').disabled=!diff;
 const opts=$('impOptimize');opts.value=state.optimize;if(!diff&&state.optimize!=='width')state.optimize='width';opts.value=state.optimize;
 opts.querySelectorAll('option').forEach(o=>o.disabled=!diff&&o.value!=='width');
 document.querySelectorAll('[data-imp-view]').forEach(el=>{el.classList.toggle('active',el.dataset.impView===state.view);el.setAttribute('aria-pressed',String(el.dataset.impView===state.view));});
 for(const k of ['w','h','t','s','er']){setValue('impTol'+k.toUpperCase(),state.tolerances[k]);if(k!=='er')$('impUnit'+k.toUpperCase()).value=state.toleranceUnits[k];}
 $('impTolSField').classList.toggle('imp-muted',!diff);$('impTolS').disabled=!diff;$('impUnitS').disabled=!diff;
 const i=input();lastInput=i;const r=E.calculate(i);lastResult=r;
 const lim=Object.fromEntries(['w','h','t','s','er'].map(k=>[k,{value:Number(state.tolerances[k]),unit:k==='er'?'percent':state.toleranceUnits[k]}]));
 lastTolerance=r.ok?E.toleranceAnalysis(i,lim):null;
 setText('impKind',diff?'Zdiff':'Z₀');setText('impMainResult',r.ok?fmt(r.zDiff??r.z0,2)+' Ω':'— Ω');
 setText('impSubResult',r.ok?(diff?`Zodd ${fmt(r.zOdd,2)} Ω · Zeven ${fmt(r.zEven,2)} Ω`:`Z₀ ${fmt(r.z0,2)} Ω`):t('noValue'));
 setText('impEps',r.ok?fmt(r.epsEff,3):'—');setText('impDelay',r.ok?fmt(r.delayPsPerMM,2)+' ps/mm':'—');
 setText('impHeight',r.ok?fmt(r.referenceHeightMM,3)+' mm':'—');setText('impReference',r.ok?r.referenceNames.join(' + '):'—');setText('impMethod',r.ok?r.method:'—');
 $('impResultCard').classList.toggle('imp-invalid',!r.ok);
 const errorText=r.ok?(de()?'Rechenmodell: '+r.quality+' · Ohne 2D/3D-Feldlösung.':'Model: '+r.quality+' · No 2D/3D field solution.'):localError(r.error);
 $('impIssue').innerHTML=r.ok?`<strong>${safe(t('limits'))}</strong><p>${safe(errorText)}</p><ul>${r.warnings.map(w=>`<li>${safe(localError(w))}</li>`).join('')}</ul>`:`<strong>${safe(t('unsupported'))}</strong><p>${safe(errorText)}</p>`;
 if(r.ok){const actual=r.zDiff??r.z0,delta=actual-state.target;const cls=Math.abs(delta)<.5?'good':'warn';
  $('impTargetDelta').innerHTML=`<span class="${cls}">${de()?'Abweichung zum Ziel':'Error to target'}: ${delta>=0?'+':''}${fmt(delta,2)} Ω (${delta>=0?'+':''}${fmt(100*delta/state.target,1)}%)</span>`;
 }else $('impTargetDelta').textContent='';
 if(lastTolerance?.ok){setText('impTolNominal',fmt(lastTolerance.nominal,2)+' Ω');setText('impTolMin',fmt(lastTolerance.min,2)+' Ω');setText('impTolMax',fmt(lastTolerance.max,2)+' Ω');
  const indicator=100*(lastTolerance.nominal-lastTolerance.min)/Math.max(1e-9,lastTolerance.max-lastTolerance.min);$('impTolIndicator').style.left=`${Math.max(1,Math.min(99,indicator))}%`;$('impTolBar').classList.remove('imp-muted');
  const biggest=Math.max(...lastTolerance.sensitivities.map(s=>s.impactOhms),1e-9);
  $('impSensitivity').innerHTML=lastTolerance.sensitivities.map(s=>`<div class="sensitivity-row"><span>${safe(s.key.toUpperCase()==='ER'?'Dk':s.key.toUpperCase())}</span><div class="sensitivity-track"><i style="width:${100*s.impactOhms/biggest}%"></i></div><strong>${fmt(s.impactOhms,2)} Ω</strong></div>`).join('');
  $('impToleranceWarning').textContent=(de()?'Extremwerte aus ':'Extremes from ')+lastTolerance.count+(de()?' gültigen Grenzfällen. Kein Yield-Modell.':' valid corners. Not a yield model.');
 }else{['impTolNominal','impTolMin','impTolMax'].forEach(id=>setText(id,'—'));$('impTolBar').classList.add('imp-muted');$('impSensitivity').innerHTML='';$('impToleranceWarning').textContent=lastTolerance?localError(lastTolerance.error):'';}
 $('impSolveBtn').disabled=!r.ok;$('impExportBtn').disabled=!r.ok;
 for(const [id,key] of [['viaFrequency','frequencyGHz'],['viaPitch','pitchMM'],['viaPad','padMM'],['viaDrill','drillMM'],['viaEdge','edgeClearanceMM'],['viaLength','lengthMM'],['viaMinTrace','minTraceClearanceMM'],['viaMinRing','minAnnularMM'],['viaMinGap','minViaGapMM']])setValue(id,state.via[key]);
 drawCross(r);viaRender(r);save();
}
function download(content,name){const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);}
function exportResult(){if(!lastResult?.ok)return;download({schema:'com.simonlation.impedance-result',version:2,appVersion:'0.4-beta',units:{length:'mm',impedance:'ohm'},geometry:{signalId:state.signalId,mode:state.mode,widthMM:state.widthMM,spacingMM:paired()?state.spacingMM:null},result:lastResult,tolerances:lastTolerance,viaFence:lastVia,stackup:project(),disclaimer:'Models not validated as fabrication impedance or via-induced Z correction.'},'simonlation-impedance.json')}
function valueInput(id,cb){const el=$(id);el.addEventListener('input',()=>{const v=Number(el.value);if(el.value.trim()===''||!Number.isFinite(v))return;cb(v);render()});el.addEventListener('change',render);el.addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur()});}
$('impMode').addEventListener('change',()=>{state.mode=$('impMode').value;state.target=paired()?100:50;if(!paired())state.optimize='width';render()});
$('impSignal').addEventListener('change',()=>{state.signalId=$('impSignal').value;render()});
$('impOptimize').addEventListener('change',()=>{state.optimize=$('impOptimize').value;render()});
for(const [id,key] of [['impWidth','widthMM'],['impGap','spacingMM'],['impTarget','target']])valueInput(id,x=>state[key]=x);
for(const key of ['w','h','t','s','er']){
 valueInput('impTol'+key.toUpperCase(),x=>state.tolerances[key]=x);
 if(key!=='er')$('impUnit'+key.toUpperCase()).addEventListener('change',()=>{state.toleranceUnits[key]=$('impUnit'+key.toUpperCase()).value;state.tolerances[key]=state.toleranceUnits[key]==='um'?10:5;render()});
}
for(const [id,key] of [['viaFrequency','frequencyGHz'],['viaPitch','pitchMM'],['viaPad','padMM'],['viaDrill','drillMM'],['viaEdge','edgeClearanceMM'],['viaLength','lengthMM'],['viaMinTrace','minTraceClearanceMM'],['viaMinRing','minAnnularMM'],['viaMinGap','minViaGapMM']])valueInput(id,x=>state.via[key]=x);
$('impSolveBtn').addEventListener('click',()=>{const solution=E.optimizeGeometry(input(),state.target,state.optimize);
 if(!solution.ok){$('impIssue').innerHTML=`<strong>${safe(t('unsupported'))}</strong><p>${safe(localError(solution.error))}</p>`;return;}
 state.widthMM=Number(solution.widthMM.toFixed(5));state.spacingMM=Number(solution.spacingMM.toFixed(5));render();
});
$('impExportBtn').addEventListener('click',exportResult);
$('viaAutoPitch').addEventListener('click',()=>{if(!lastVia?.ok)return;state.via.pitchMM=Number(lastVia.max20MM.toFixed(3));render()});
$('viaExport').addEventListener('click',()=>{if(!lastVia?.ok)return;download({schema:'com.simonlation.via-fence',version:1,appVersion:'0.4-beta',layout:state.via,transmissionLine:{mode:state.mode,widthMM:state.widthMM,spacingMM:state.spacingMM},result:lastVia,stackup:project()},'simonlation-via-fence.json')});
document.querySelectorAll('[data-imp-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.impView;render()}));
function editLabel(id,point){
 if(id==='impH'){
  const refs=E.findRefs(project(),state.signalId);
  const dielectrics=(refs.surface?(refs.index===refs.copperIndices?.[0]?refs.bottom:refs.top)?.dielectrics:refs.top?.dielectrics)||[];
  if(dielectrics.length){window.SimonlationStackup.selectLayer(dielectrics[0].id);const inspector=$('inspThickness');if(inspector){inspector.focus();inspector.select();inspector.scrollIntoView({behavior:'smooth',block:'nearest'});}}
  return;
 }
 const old=$('impFloatingEditor');if(old)old.remove();
 const area=$('impSvg').parentElement;
 const rect=area.getBoundingClientRect();
 const popup=document.createElement('div');popup.id='impFloatingEditor';popup.className='imp-floating-editor';
 popup.style.left=Math.max(6,Math.min(rect.width-177,(point?.clientX||rect.left+rect.width/2)-rect.left-78))+'px';
 popup.style.top=Math.max(8,Math.min(rect.height-56,(point?.clientY||rect.top+rect.height/2)-rect.top+9))+'px';
 const field= id==='impGap'?'spacingMM':'widthMM';
 const label=field==='widthMM'?'W':'S';
 popup.innerHTML=`<label>${label} · mm</label><div><input type="number" min="0.025" max="5" step="0.005" value="${state[field]}"><button type="button" aria-label="Apply value">✓</button></div>`;
 area.appendChild(popup);const inp=popup.querySelector('input');
 const commit=()=>{const x=Number(inp.value);if(Number.isFinite(x)&&x>=.025&&x<=5){state[field]=x;popup.remove();render();}else inp.focus();};
 popup.querySelector('button').addEventListener('click',commit);
 inp.addEventListener('keydown',e=>{if(e.key==='Enter')commit();if(e.key==='Escape')popup.remove();e.stopPropagation()});
 inp.focus();inp.select();
}
$('impSvg').addEventListener('click',e=>{const label=e.target.closest('[data-edit]');if(label)editLabel(label.dataset.edit,e);});
$('impSvg').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const label=e.target.closest('[data-edit]');if(label){e.preventDefault();editLabel(label.dataset.edit)}});
document.addEventListener('pointerdown',e=>{if(e.target.closest('#impFloatingEditor')||e.target.closest('#impSvg [data-edit]'))return;$('impFloatingEditor')?.remove()},true);
window.addEventListener('simonlation:stackup-change',render);window.addEventListener('storage',render);
render();window.SimonlationImpedanceUI={snapshot:()=>structuredClone(state),result:()=>lastResult,tolerance:()=>lastTolerance,viaFence:()=>lastVia,exportResult};
})();
