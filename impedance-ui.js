/* SIMONLATION Stackup / Impedance / Via Fence workbench · local-first beta 0.4.2 */
(()=>{'use strict';
const $=id=>document.getElementById(id), E=window.SimonlationImpedance,V=window.SimonlationViaFence;
const KEY='simonlation-stackup-studio-impedance-v0.3',OLD='simonlation-impedance-v0.2';
const saved=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD)||'{}')}catch{return {}}})();
const sane=(n,def)=>Number.isFinite(Number(n))&&Number(n)>0?Number(n):def;
const state={showCrossVias:saved.showCrossVias===true,signalId:saved.signalId||null,mode:saved.mode||'microstrip',widthMM:sane(saved.widthMM,.25),spacingMM:sane(saved.spacingMM,.18),target:sane(saved.target,50),optimize:saved.optimize||'width',view:saved.view||'schematic',
 tolerances:{w:10,h:10,t:10,s:10,er:5,...(saved.tolerances||{})},toleranceUnits:{w:'percent',h:'percent',t:'percent',s:'percent',...(saved.toleranceUnits||{})},
 via:{placement:'both',frequencyGHz:5,pitchMM:2,padMM:.6,drillMM:.3,edgeClearanceMM:.4,lengthMM:30,minTraceClearanceMM:.15,minAnnularMM:.1,minViaGapMM:.2,...(saved.via||{})}};
let lastResult=null,lastTolerance=null,lastVia=null,lastInput=null;
let selectedBefore=window.SimonlationStackup.getSelectedId();
const paired=()=>state.mode.startsWith('diff-'),strip=()=>state.mode.includes('stripline');
const de=()=>document.documentElement.lang!=='en';
const fmt=(n,d=2)=>Number(n).toLocaleString(de()?'de-DE':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt={
 de:{label:'SCHNELLE ANALYTISCHE BERECHNUNG',title:'PCB Impedance Lab',info:'Referenzlagen und Materialien aus dem Stackup. W und S kannst du auch direkt im Querschnitt auswählen. Die Rechnung ist kein Feldsolver.',signal:'Signallage',mode:'Leitungsgeometrie',width:'Breite W',spacing:'Abstand S',target:'Zielimpedanz',solve:'Optimieren',optimize:'Anpassen',export:'Ergebnis als JSON',noValue:'Nicht berechnet',outline:'Leitungsquerschnitt',model:'Rechenmodell',limits:'Modellgrenzen & Hinweise',tolerance:'FERTIGUNGSTOLERANZEN',toleranceNote:'Deterministische Grenzfälle, keine statistische Fertigungsausbeute.',lower:'Minimum',nominal:'Nominal',upper:'Maximum',reference:'Referenzlagen',height:'Dielektrikumsabstand',eps:'Effektives Dk',delay:'Laufzeit',unsupported:'Analytische Berechnung nicht verfügbar',sample:'Ungeprüfte Näherung · keine Fertigungsvorgabe',editTip:'Maße W / S / H anklicken, um die Eingabe zu bearbeiten · Ansicht schematisch oder maßstäblich',viaTitle:'Via Fence Designer',viaSubtitle:'GND-Vias links und rechts der Leitung · Pitch, Geometrie und Fertigungsabstände',viaHeuristic:'LAYOUT-RICHTWERT',viaFreq:'Maximale relevante Frequenz',viaPitch:'Pitch / Via-Abstand',viaPad:'Pad-Durchmesser',viaDrill:'Bohrung',viaEdge:'Leiterbahnkante → Pad',viaLength:'Zaunlänge',viaMinTrace:'Min. Trace-Abstand',viaRing:'Min. Restring',viaGapMin:'Min. Pad-zu-Pad',viaAuto:'λg/20 übernehmen',viaExport:'Via JSON exportieren',viaTopView:'Draufsicht · GND-Via-Reihen',viaPreview:'Vias zeigen',viaPlacementLabel:'Via-Anordnung',viaPlacementHint:'Auswahl gilt für Zählung und Vorschau; die Impedanz wird nicht korrigiert.',viaOff:'Keine Vias',viaOnlyLeft:'Nur links',viaOnlyRight:'Nur rechts',viaBoth:'Beidseitig',viaDisabled:'Via Fence ist ausgeschaltet. Eine Via-Anordnung auswählen, um Pitch und Abstände zu prüfen.',manufacturing:'FERTIGUNGSANALYSE',toleranceTitle:'Toleranzen & Modellgrenzen'},
 en:{label:'QUICK ANALYTICAL ESTIMATE',title:'PCB Impedance Lab',info:'Reference planes and dielectrics come from stackup. Click W and S right in the cross-section. This is not a field solver.',signal:'Signal layer',mode:'Trace geometry',width:'Width W',spacing:'Gap S',target:'Target impedance',solve:'Optimize',optimize:'Adjust',export:'Export result JSON',noValue:'Not calculated',outline:'Trace cross-section',model:'Calculation model',limits:'Model limitations & notes',tolerance:'MANUFACTURING TOLERANCES',toleranceNote:'Deterministic corners, not statistical yield.',lower:'Minimum',nominal:'Nominal',upper:'Maximum',reference:'Reference planes',height:'Dielectric separation',eps:'Effective Dk',delay:'Propagation delay',unsupported:'Analytical calculation unavailable',sample:'Unverified estimate · not a fabrication specification',editTip:'Click W / S / H labels to edit · schematic or true-ratio view',viaTitle:'Via Fence Designer',viaSubtitle:'Ground stitching left and right of traces · pitch, geometry and fabrication checks',viaHeuristic:'LAYOUT GUIDELINE',viaFreq:'Maximum relevant frequency',viaPitch:'Via pitch',viaPad:'Pad diameter',viaDrill:'Drill diameter',viaEdge:'Trace edge → via pad',viaLength:'Fence length',viaMinTrace:'Min trace clearance',viaRing:'Min annular ring',viaGapMin:'Min pad-to-pad',viaAuto:'Apply λg/20',viaExport:'Export via JSON',viaTopView:'Top view · GND via rows',viaPreview:'Show vias',viaPlacementLabel:'Via placement',viaPlacementHint:'Selection controls via counts and drawing; no impedance correction is applied.',viaOff:'No vias',viaOnlyLeft:'Left only',viaOnlyRight:'Right only',viaBoth:'Both sides',viaDisabled:'Via fence is disabled. Select a placement to evaluate pitch and clearances.',manufacturing:'MANUFACTURING ANALYSIS',toleranceTitle:'Tolerances & model limits'}};
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
  'Out of stripline model range: 0.05 ≤ W/B ≤ 10.':'Außerhalb des Stripline-Modellbereichs (0,05 ≤ W/B ≤ 10).',
  'Copper thickness above model limit (T/B > 0.25).':'Kupferdicke über der Modellgrenze (T/B > 0,25).',
  'Small top/bottom offset: symmetric stripline model is approximate.':'Leicht ungleiche Abstände oben/unten: Das symmetrische Stripline-Modell ist hier eine Näherung.',
  'T/H > 0.2: finite thickness correction is near its practical limits.':'T/H > 0,2: Die Dickenkorrektur ist nahe ihrer praktischen Grenze.',
  'Solder mask loading is not included; actual microstrip impedance can differ.':'Die Lötstoppmaske ist nicht eingerechnet. Mit Maske liegt die Microstrip-Impedanz typischerweise einige Ohm niedriger.',
  'Delay is the uncoupled-line quasi-static estimate, not odd/even modal delay.':'Die Laufzeit gilt für die ungekoppelte Leitung (quasistatisch), nicht für Gegen-/Gleichtakt getrennt.',
  'Strong coupling (S/H < 0.5): empirical differential correction may be inaccurate.':'Starke Kopplung (S/H < 0,5): Die empirische Differenzkorrektur kann ungenau sein.',
  'Zeven/Zcommon are mirrored from the empirical odd-mode factor and are rough indications only.':'Zeven ist aus dem empirischen Kopplungsfaktor abgeleitet und nur ein grober Richtwert.',
  'Copper T/W > 0.5: approximation is sensitive to sidewall/etch profile.':'Kupfer T/W > 0,5: Das Ergebnis reagiert empfindlich auf Flankenform und Ätzprofil.',
  'Copper roles do not prove continuous reference-plane coverage. Check actual layout.':'Die Lagenrollen belegen keine durchgehende Referenzfläche. Das Layout prüfen.',
  'Quasi-static geometry only: no frequency dispersion, roughness, insertion loss, impedance discontinuities or manufacturing verification.':'Nur quasistatische Geometrie: keine Dispersion, Rauheit, Einfügedämpfung, Stoßstellen oder Fertigungsprüfung.',
  'Target impedance must be between 10 and 250 Ω.':'Die Zielimpedanz muss zwischen 10 und 250 Ω liegen.',
  'Target not reachable in the geometry/model validity range (width 0.025–5 mm).':'Ziel im gültigen Breitenbereich 0,025–5 mm nicht erreichbar.',
  'Width must be between 0.025 and 5 mm.':'Die Breite muss zwischen 0,025 und 5 mm liegen.',
  'Gap must be between 0.025 and 5 mm.':'Der Abstand muss zwischen 0,025 und 5 mm liegen.',
  'Tolerance must be finite and non-negative.':'Toleranzen müssen endlich und nichtnegativ sein.',
  'Tolerance range crosses unsupported geometry: ':'Toleranzen überschreiten die Modellgrenzen: ',
  'Target not reachable with the fixed width in the model validity range (gap 0.025–5 mm).':'Ziel mit festgehaltener Breite im Gap-Bereich 0,025–5 mm nicht erreichbar.',
  'No feasible W / S combination found in supported geometry limits.':'Keine gültige Kombination aus W und S gefunden.'};
 if(!de())return message;
 return Object.keys(map).reduce((out,k)=>out.replace(k,map[k]),String(message));}
function drawCross(result){
 const svg=$('impSvg'),isDiff=paired(),isStrip=strip(),isCoplanar=state.mode.includes('gcpw'),embedded=state.mode==='embedded-microstrip';
 const schematic=state.view==='schematic',showVia=state.showCrossVias&&state.via.placement!=='none'&&schematic&&!isStrip;
 const dk=document.documentElement.dataset.theme==='dark',ink='var(--sl-text, #24302e)',muted='var(--sl-muted, #56645e)';
 const refs=E.findRefs(project(),state.signalId);
 const layer=project().layers.find(l=>l.id===state.signalId)||{};
 const topRefMM=refs.top?.distanceMM||.15,bottomRefMM=refs.bottom?.distanceMM||.15;
 const h=isStrip?topRefMM+bottomRefMM:(refs.surface?(refs.index===refs.copperIndices?.[0]?bottomRefMM:topRefMM):.15);
 const w=Math.max(.025,state.widthMM),sGap=Math.max(.025,state.spacingMM),t=Math.max(.001,layer.thicknessMM||.035);
 const clip=(v,min,max)=>Math.max(min,Math.min(max,v));
 // Illustrative (NOT 1:1) view: traces retain relative sensitivity to W/S, but cannot collapse to unreadable pixels.
 // Scale/ratio view shares a single px/mm for X and Y (adaptive to the viewport; no fixed physical screen mm).
 const totalWidthMM=(isDiff?2*w+sGap:w);
 const mmPerPx=Math.min(850,480/(totalWidthMM+.16),170/Math.max(.045,h+t));
 const traceWidth=schematic?clip(58*Math.sqrt(w/.18),44,104):Math.max(2,w*mmPerPx);
 const gapPx=isDiff?(schematic?clip(52*Math.sqrt(sGap/.18),38,106):sGap*mmPerPx):0;
 const thickness=schematic?9:Math.max(1,t*mmPerPx);
 const left=isDiff?310-gapPx/2-traceWidth:310-traceWidth/2;
 const right=isDiff?310+gapPx/2:left;
 let traceTop,lower,upper=null;
 if(isStrip){
  if(schematic){traceTop=135;upper=55;lower=249;}
  else{upper=38;traceTop=upper+topRefMM*mmPerPx;lower=traceTop+thickness+bottomRefMM*mmPerPx;}
 }else{
  traceTop=schematic?92:75;
  lower=traceTop+thickness+(schematic?126:h*mmPerPx);
 }
 const bg='var(--sl-bg-2, #ece8dd)',diel=dk?'#245c68':'#6d9ba6',copper='#d9a262';
 const stripBar=(x,y,width,height=8)=>`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="1.5" fill="${copper}" stroke="#eec798" stroke-width=".7"/>`;
 let out=`<defs><pattern id="impgrid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" stroke="var(--sl-line, #d6dacf)" stroke-width=".65" fill="none"/></pattern></defs><rect width="620" height="310" fill="${bg}"/><rect width="620" height="310" fill="url(#impgrid)"/>`;
 const fillTop=isStrip?upper+9:traceTop+thickness;
 out+=`<rect x="38" y="${fillTop}" width="544" height="${Math.max(2,lower-fillTop)}" fill="${diel}" opacity=".88"/>`;
 if(isStrip)out+=stripBar(38,upper,544,9);
 out+=stripBar(38,lower,544,9);
 if(project().maskEnabled!==false&&!isStrip)out+=`<rect x="38" y="${traceTop+thickness}" width="544" height="3" fill="#48997b" opacity=".44"/>`;
 if(embedded){out+=`<rect x="38" y="${Math.max(40,traceTop-36)}" width="544" height="${Math.min(36,traceTop-40)}" fill="${diel}" opacity=".4"/>`;}
 out+=`<text x="49" y="${Math.min(lower-11,fillTop+19)}" font-size="12" fill="#f2fffc">εr ${fmt(result.ok?result.epsilonR:4.2,2)}</text>`;
 if(isCoplanar){const islandGap=schematic?29:Math.max(4,sGap*mmPerPx);const lWidth=Math.max(3,left-islandGap-38),rStart=right+traceWidth+islandGap;
  if(lWidth>4)out+=stripBar(38,traceTop,lWidth,thickness);
  if(rStart<575)out+=stripBar(rStart,traceTop,582-rStart,thickness);
 }
 // Filled copper trace, deliberately enlarged in schematic mode. Click the trace to edit W.
 const trace=(x)=>`<g data-edit="impWidth" tabindex="0" role="button" aria-label="${de()?'Breite ändern':'Edit width'}"><title>${de()?'Leiterbahnbreite W bearbeiten':'Edit trace width W'}</title>${stripBar(x,traceTop,traceWidth,thickness)}</g>`;
 out+=trace(left);if(isDiff)out+=trace(right);
 const label=(value,x,y,field)=>`<g data-edit="${field}" role="button" tabindex="0" class="imp-label-action" aria-label="${field}"><rect x="${x-77}" y="${y-18}" width="154" height="27" rx="6" fill="${dk?'#1c3848':'#e1eef3'}" stroke="${dk?'#355b69':'#d4e5ec'}" stroke-width=".7"/><text x="${x}" y="${y}" font-size="14" font-weight="760" fill="${ink}" text-anchor="middle">${value} <tspan fill="${muted}">✎</tspan></text></g>`;
 out+=`<path d="M${left} ${traceTop-10}v-8h${traceWidth}v8" stroke="${ink}" stroke-width="1.2" fill="none"/>`;
 out+=label('W = '+fmt(w,3)+' mm',left+traceWidth/2,traceTop-28,'impWidth');
 if(isDiff){out+=`<path d="M${left+traceWidth} ${traceTop+thickness/2}H${right}" stroke="${ink}" stroke-dasharray="4 3" stroke-width="1.5"/>`;
  out+=label('S = '+fmt(sGap,3)+' mm',310,Math.min(lower-25,traceTop+thickness+52),'impGap');
 }
 const hY=Math.min(277,lower+25),hLabel=isStrip?`${fmt(topRefMM,3)} + ${fmt(bottomRefMM,3)}`:fmt(h,3);
 out+=`<path d="M595 ${traceTop+thickness}V${lower}" stroke="${muted}" stroke-dasharray="4 4" stroke-width="1.4"/>`;
 out+=label('H ≈ '+hLabel+' mm',503,hY,'impH');
 if(showVia){
  // Reduced schematic pad/barrel depiction, intentionally NOT proportional to pad/trace sizes.
  // Full via count, drill/pad ratio and placements are found in the Via Fence top-view below.
  const viaPad=clip(16*Math.sqrt(state.via.padMM/.6),13,23),viaDrill=clip(viaPad*state.via.drillMM/state.via.padMM,3,viaPad*.72);
  const positions=[];
  if(['left','both'].includes(state.via.placement))positions.push(left-64);
  if(['right','both'].includes(state.via.placement))positions.push(right+traceWidth+64);
  for(const cx of positions){
   const bx=clip(cx,55,565),y0=traceTop+thickness,y1=lower;
   // Narrow copper barrel walls and pale dielectric bore; no giant donuts through the signal traces.
   out+=`<g class="via-cross-symbol" aria-label="GND plated via (schematic)"><rect x="${bx-viaDrill/2-2.4}" y="${y0}" width="2.4" height="${Math.max(4,y1-y0)}" fill="#eab674"/><rect x="${bx+viaDrill/2}" y="${y0}" width="2.4" height="${Math.max(4,y1-y0)}" fill="#eab674"/>`;
   out+=stripBar(bx-viaPad/2,traceTop,viaPad,thickness)+stripBar(bx-viaPad/2,lower,viaPad,8);
   out+=`<rect x="${bx-viaDrill/2}" y="${traceTop+2}" width="${viaDrill}" height="${Math.max(4,lower-traceTop-2)}" fill="${bg}" opacity=".95"/><text x="${bx}" y="${traceTop-12}" fill="${muted}" text-anchor="middle" font-size="10">GND</text></g>`;
  }
 }
 const legend=schematic?(de()?'SCHEMATISCH · W / S VERGRÖSSERT':'SCHEMATIC · W / S ENLARGED'):'XY EINHEITLICHER MASSSTAB · AUTO-ZOOM';
 out+=`<text x="38" y="24" font-size="10" letter-spacing=".8" fill="${muted}">${legend}</text>`;
 out+=`<text x="38" y="297" font-size="10" fill="${muted}">${showVia?(de()?'GND-Vias verkleinert dargestellt · Details im Via Fence':'GND vias reduced for clarity · see Via Fence'):(isStrip?(de()?'Referenzflächen ober- und unterhalb':'Reference planes above and below'):(de()?'Signalleitung und Referenzfläche':'Signal trace and reference plane'))}</text>`;
 svg.innerHTML=out;
}
// Top view of the fence: trace runs horizontally, drawn to true scale (X = Y) as a cut-out, with dimensions.
function drawVia(v){
 const svg=$('viaSvg');if(!svg)return;
 const W=620,H=260,ink='var(--sl-text, #24302e)',muted='var(--sl-muted, #56645e)',grid='var(--sl-line, #d6dacf)',accent='var(--sl-accent-text, #a3432a)';
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 let out=`<rect width="${W}" height="${H}" rx="8" fill="var(--sl-bg-2, #ece8dd)"/><defs><pattern id="viaGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${grid}" stroke-width=".6"/></pattern><marker id="vArr" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="${ink}"/></marker><marker id="vArrA" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="${accent}"/></marker></defs><rect width="${W}" height="${H}" fill="url(#viaGrid)"/>`;
 const placement=state.via.placement,w=state.widthMM,sp=paired()?state.spacingMM:0,span=paired()?2*w+sp:w;
 if(!v?.ok){out+=`<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="${ink}" font-size="13">${de()?'Via Fence ausgeschaltet':'Via fence disabled'}</text>`;svg.innerHTML=out;return;}
 const pad=v.padMM,drill=v.drillMM,edge=v.edgeClearanceMM,pitch=v.actualPitchMM;
 const sides=placement==='both'?['t','b']:placement==='left'?['t']:['b'];
 const halfT=span/2+edge+pad;                                   // mm from trace centre to outer pad edge
 const usableW=W-190,usableH=H-96;
 const scT=usableH/(2*halfT);
 const shown=Math.max(4,Math.min(12,Math.floor(usableW/(pitch*scT))+1));
 const lenMM=(shown-1)*pitch+pad;
 const sc=Math.min(scT,usableW/lenMM);                           // px per mm, identical in X and Y
 const cy=(H-30)/2+4,Y=mm=>cy+mm*sc,x0=40+pad*sc/2+(usableW-lenMM*sc)/2;
 const traceL=24,traceR=W-150;
 const traces=paired()?[[-span/2,-span/2+w],[span/2-w,span/2]]:[[-w/2,w/2]];
 for(const [a,b] of traces)out+=`<rect x="${traceL}" y="${Y(a).toFixed(1)}" width="${traceR-traceL}" height="${Math.max(1.5,(b-a)*sc).toFixed(1)}" rx="2" fill="#dba365"/>`;
 const rowY={t:-(span/2+edge+pad/2),b:span/2+edge+pad/2};
 for(const side of sides){const y=Y(rowY[side]);
  out+=`<rect x="${traceL}" y="${(y-pad*sc/2-3).toFixed(1)}" width="${traceR-traceL}" height="${(pad*sc+6).toFixed(1)}" fill="#4c9a89" opacity=".16" rx="3"/>`;
  for(let i=0;i<shown;i++){const x=x0+i*pitch*sc;out+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(pad*sc/2).toFixed(1)}" fill="#d5a064" stroke="#f0cd91" stroke-width="1"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(drill*sc/2).toFixed(1)}" fill="var(--sl-bg-2, #ece8dd)"/>`;}
 }
 // pitch dimension outside the first row
 const s0=sides[0],ry=Y(rowY[s0]),dir=s0==='t'?-1:1,dimY=ry+dir*(pad*sc/2+18),xa=x0,xb=x0+pitch*sc;
 out+=`<path d="M${xa} ${ry}V${dimY+dir*4}M${xb} ${ry}V${dimY+dir*4}" stroke="${muted}" stroke-width=".8" stroke-dasharray="2 2"/><path d="M${xa} ${dimY}H${xb}" stroke="${ink}" stroke-width="1.2" marker-start="url(#vArr)" marker-end="url(#vArr)"/><text x="${(xa+xb)/2}" y="${dimY+(dir<0?-7:15)}" text-anchor="middle" font-size="12" font-weight="700" fill="${ink}">P = ${fmt(pitch,2)} mm</text>`;
 // clearance dimension (trace edge → pad edge) at the right end
 const sE=sides.at(-1),edgeTrace=sE==='b'?span/2:-span/2,edgePad=sE==='b'?span/2+edge:-(span/2+edge),dx=traceR+16;
 out+=`<path d="M${traceR} ${Y(edgeTrace)}H${dx+5}M${traceR} ${Y(edgePad)}H${dx+5}" stroke="${muted}" stroke-width=".8" stroke-dasharray="2 2"/><path d="M${dx} ${Y(edgeTrace)}V${Y(edgePad)}" stroke="${accent}" stroke-width="1.2" marker-start="url(#vArrA)" marker-end="url(#vArrA)"/><text x="${dx+10}" y="${(Y(edgeTrace)+Y(edgePad))/2+4}" font-size="11.5" font-weight="700" fill="${accent}">${fmt(edge,2)} mm</text>`;
 out+=`<text x="${dx+10}" y="${(Y(edgeTrace)+Y(edgePad))/2+19}" font-size="10.5" fill="${muted}">${de()?'Kante → Pad':'edge → pad'}</text>`;
 out+=`<text x="${W-14}" y="${Y(rowY[sides[0]])+4}" text-anchor="end" font-size="11" fill="${muted}">Ø ${fmt(pad,2)} / ${fmt(drill,2)} mm</text>`;
 out+=`<text x="14" y="${H-12}" font-size="11" fill="${muted}">${de()?'Ausschnitt, maßstäblich (X = Y)':'Cut-out, true scale (X = Y)'}</text><text x="${W-14}" y="${H-12}" text-anchor="end" font-size="11" fill="${ink}">${de()?'Zaun':'Fence'} ${fmt(state.via.lengthMM,1)} mm · ${v.totalVias} Vias</text>`;
 svg.innerHTML=out;
}
const VIA_CHECKS={de:{'annular ring':'Restring','edge clearance':'Abstand Leiterbahn – Pad','via pad separation':'Abstand Pad – Pad','λg/10 pitch':'Pitch ≤ λg/10','λg/20 conservative':'Pitch ≤ λg/20 (konservativ)'},en:{'annular ring':'Annular ring','edge clearance':'Trace-to-pad clearance','via pad separation':'Pad-to-pad gap','λg/10 pitch':'Pitch ≤ λg/10','λg/20 conservative':'Pitch ≤ λg/20 (conservative)'}};
function viaCheck(c){const name=VIA_CHECKS[de()?'de':'en'][c.name]||c.name;const detail=String(c.detail).replace(/(\d+\.\d+)/g,m=>fmt(Number(m),3)).replace(' vs min ',de()?' · Soll ≥ ':' · min ').replace(' vs max ',de()?' · Soll ≤ ':' · max ');
 const soft=!c.pass&&c.name.startsWith('λg/20');return `<span class="${c.pass?'pass':soft?'warn':'fail'}">${c.pass?'✓':soft?'△':'!'} ${safe(name)} <small>${safe(detail)}</small></span>`;}
function viaRender(r){
 const rows=state.via.placement==='both'?2:1;
 if(state.via.placement==='none'){
  lastVia=null;drawVia(null);$('viaResults').innerHTML='';$('viaWarnings').textContent=t('viaDisabled');$('viaAutoPitch').disabled=true;$('viaExport').disabled=true;return;
 }
 const refs=E.findRefs(project(),state.signalId);
 const nearby=[...(refs.top?.dielectrics||[]),...(refs.bottom?.dielectrics||[])].map(x=>Number(x.epsilonR)).filter(Number.isFinite);
 const effective=nearby.length?Math.max(...nearby):4.2;
 // Conservative pitch guideline: local bulk permittivity yields shorter wavelength than the trace εeff.
 lastVia=V.calculate({...state.via,epsilonEff:effective,rows});drawVia(lastVia);
 $('viaAutoPitch').disabled=!lastVia.ok;$('viaExport').disabled=!lastVia.ok;
 if(lastVia.ok){
  const html=[[de()?'Dk Substrat':'Substrate Dk',fmt(effective,2)],['λg',fmt(lastVia.guidedWavelengthMM,2)+' mm'],['λg/10',fmt(lastVia.max10MM,2)+' mm'],['λg/20',fmt(lastVia.max20MM,2)+' mm'],[de()?'Effektiver Pitch':'Actual pitch',fmt(lastVia.actualPitchMM,2)+' mm'],[de()?'Vias gesamt':'Total vias',String(lastVia.totalVias)]];
  $('viaResults').innerHTML=html.map(([a,b])=>`<div><small>${safe(a)}</small><strong>${safe(b)}</strong></div>`).join('');
  $('viaWarnings').innerHTML=`<p>${safe(de()?'Pitch mit größtem benachbartem Substrat-Dk ('+fmt(effective,2)+') berechnet, nicht mit εeff der Leitung.':'Pitch uses largest adjacent substrate Dk ('+fmt(effective,2)+'), not trace εeff.')}</p><div class="via-check-grid">${lastVia.checks.map(viaCheck).join('')}</div><p>${safe(de()?'Keine Impedanzkorrektur durch Vias oder Masseflächen. Geometrieprüfung und Pitch-Richtwert.':'No impedance correction for vias or nearby ground. Geometric checks and pitch guideline only.')}</p>`;
 }else{$('viaResults').innerHTML='';$('viaWarnings').textContent=localError(lastVia.error);}
}
function methodLabel(m){if(!de())return m;return String(m).replace('Hammerstad–Jensen, finite-thickness correction','Hammerstad–Jensen mit Dickenkorrektur').replace(' + empirical IPC-style edge-coupling correction',' + empirische Kopplungskorrektur (IPC-2141A)').replace('Wheeler symmetric stripline incl. finite thickness','Wheeler, symmetrische Stripline mit Dickenkorrektur').replace('Cohn coupled stripline (exact even/odd for t→0) + Wheeler thickness scaling','Cohn, gekoppelte Stripline (exakt für t→0) + Wheeler-Dickenkorrektur');}
function renderHeadline(r,diff){const box=$('impHeadline');if(!box)return;
 if(!r.ok){box.className='imp-headline invalid';box.innerHTML=`<span class="imp-h-kind">${diff?'Zdiff':'Z₀'}</span><strong>—</strong><span class="imp-h-note">${safe(localError(r.error))}</span>`;return;}
 const actual=r.zDiff??r.z0,delta=actual-state.target,ok=Math.abs(delta)<.5,pct=100*delta/state.target;
 const mask=state.mode.includes('microstrip')&&project().maskEnabled;
 const chips=[r.quality==='analytical'?(de()?'analytisch':'analytical'):(de()?'empirisch':'empirical')];
 if(mask)chips.push(de()?'ohne Maskeneinfluss':'mask not included');
 box.className='imp-headline '+(ok?'good':'warn');
 box.innerHTML=`<span class="imp-h-kind">${diff?'Zdiff':'Z₀'}</span><strong>${fmt(actual,1)} Ω</strong><span class="imp-h-target">${de()?'Ziel':'Target'} ${fmt(state.target,0)} Ω · ${delta>=0?'+':''}${fmt(pct,1)} %</span><span class="imp-h-chips">${chips.map(c=>`<i>${safe(c)}</i>`).join('')}</span>`;}
function render(){const signalLayers=syncLayer();
 {const j=document.querySelector('[data-imp-jump="imp"]');if(j)j.textContent=de()?'Impedanz':'Impedance';}
 {const L=de()?{svg:'SVG · Querschnitt',png:'PNG · Querschnitt',csv:'CSV · Lagentabelle',csvde:'CSV · Deutsch (Excel)',bridge:'JSON · Impedanz-Übergabe'}:{svg:'SVG · Cross-section',png:'PNG · Cross-section',csv:'CSV · Layer table',csvde:'CSV · German (Excel)',bridge:'JSON · Impedance handoff'};document.querySelectorAll('#exportMenu [data-export]').forEach(b=>{if(L[b.dataset.export])b.textContent=L[b.dataset.export];});}
 document.querySelectorAll('[data-imp-label]').forEach(el=>el.textContent=t(el.dataset.impLabel));
 $('impMode').innerHTML=Object.entries(modeNames()).map(([k,n])=>`<option value="${safe(k)}" ${k===state.mode?'selected':''}>${safe(n)}</option>`).join('');
 $('impSignal').innerHTML=signalLayers.map(l=>`<option value="${safe(l.id)}" ${l.id===state.signalId?'selected':''}>${safe(l.name)} · ${safe(({signal:'Signal',ground:'GND',power:de()?'Versorgung':'Power',mixed:'Mixed'})[l.role]||l.role)}</option>`).join('');
 setValue('impWidth',state.widthMM);setValue('impGap',state.spacingMM);setValue('impTarget',state.target);
 const diff=paired();$('impGapField').classList.toggle('imp-muted',!diff);$('impGap').disabled=!diff;
 const opts=$('impOptimize');opts.value=state.optimize;if(!diff&&state.optimize!=='width')state.optimize='width';opts.value=state.optimize;
 opts.querySelectorAll('option').forEach(o=>o.disabled=!diff&&o.value!=='width');
 const placementLabels={none:t('viaOff'),left:t('viaOnlyLeft'),right:t('viaOnlyRight'),both:t('viaBoth')};
 for(const opt of $('viaPlacement').options)opt.textContent=placementLabels[opt.value];
 $('viaPlacement').value=state.via.placement;
 $('impShowVias').checked=state.showCrossVias&&state.via.placement!=='none';
 $('impShowVias').disabled=state.view==='metric'||strip()||state.via.placement==='none';
 $('impShowVias').title=state.view==='metric'?(de()?'Vias nur in der schematischen Ansicht':'Vias only available in schematic view'):(strip()?(de()?'Bei Stripline nur in der Draufsicht':'For stripline vias are shown in top view only'):'');
 const viewLabels=de()?{schematic:'Schematisch',metric:'Maßstab 1:1'}:{schematic:'Schematic',metric:'True scale'};
 document.querySelectorAll('[data-imp-view]').forEach(el=>{el.textContent=viewLabels[el.dataset.impView]||el.textContent;});
 const optLabels=de()?{width:'Breite W',spacing:'Abstand S',balanced:'W und S'}:{width:'Width W',spacing:'Gap S',balanced:'W and S'};
 for(const o of $('impOptimize').options)o.textContent=optLabels[o.value]||o.textContent;
 document.querySelectorAll('[data-imp-view]').forEach(el=>{el.classList.toggle('active',el.dataset.impView===state.view);el.setAttribute('aria-pressed',String(el.dataset.impView===state.view));});
 for(const k of ['w','h','t','s','er']){setValue('impTol'+k.toUpperCase(),state.tolerances[k]);if(k!=='er')$('impUnit'+k.toUpperCase()).value=state.toleranceUnits[k];}
 $('impTolSField').classList.toggle('imp-muted',!diff);$('impTolS').disabled=!diff;$('impUnitS').disabled=!diff;
 const i=input();lastInput=i;const r=E.calculate(i);lastResult=r;
 const lim=Object.fromEntries(['w','h','t','s','er'].map(k=>[k,{value:Number(state.tolerances[k]),unit:k==='er'?'percent':state.toleranceUnits[k]}]));
 lastTolerance=r.ok?E.toleranceAnalysis(i,lim):null;
 setText('impKind',diff?'Zdiff':'Z₀');setText('impMainResult',r.ok?fmt(r.zDiff??r.z0,2)+' Ω':'— Ω');
 setText('impSubResult',r.ok?(diff?`Zodd ${fmt(r.zOdd,2)} Ω · Zeven ${r.zEvenApproximate?'≈ ':''}${fmt(r.zEven,2)} Ω`:`εeff ${fmt(r.epsEff,3)}`):t('noValue'));
 renderHeadline(r,diff);
 setText('impEps',r.ok?fmt(r.epsEff,3):'—');setText('impDelay',r.ok?fmt(r.delayPsPerMM,2)+' ps/mm':'—');
 setText('impHeight',r.ok?fmt(r.referenceHeightMM,3)+' mm':'—');setText('impReference',r.ok?r.referenceNames.join(' + '):'—');setText('impMethod',r.ok?methodLabel(r.method):'—');
 // Visible routing reference underneath the stackup cross-section (not an additional solver).
 const selectedCopper=project().layers.find(l=>l.id===state.signalId);
 const routeData=$('stackContextData');
 if(routeData){
  const labels=de()?['Leiterlage','Referenzfläche','Dielektrischer Abstand','Material / Dk']:['Signal layer','Reference plane','Dielectric distance','Material / Dk'];
  const adjacent=E.findRefs(project(),state.signalId);
  const nearDiel=[...(adjacent.top?.dielectrics||[]),...(adjacent.bottom?.dielectrics||[])].find(l=>l?.material||l?.epsilonR);
  const materials=nearDiel?`${nearDiel.material||'—'} · εr ${fmt(Number(nearDiel.epsilonR)||4.2,2)}`:'—';
  const values=[selectedCopper?.name||'—',r.ok?r.referenceNames.join(' + '):'—',r.ok?fmt(r.referenceHeightMM,3)+' mm':'—',materials];
  $('stackContextTitle').textContent=de()?'Signalreferenz':'Signal reference';
  $('stackContextHint').textContent=de()?'Aus dem Leiterplattenaufbau':'Taken from the board stackup';
  $('stackContextFoot').textContent=de()?'Hinweis: Nur Lagenabstände. Tatsächliche Masseflächen-Abdeckung im PCB-Layout prüfen.':'Layer distances only. Verify actual reference-plane coverage in the PCB layout.';
  routeData.innerHTML=labels.map((label,index)=>`<div><span>${safe(label)}</span><strong class="${values[index]==='—'?'unavailable':''}">${safe(values[index])}</strong></div>`).join('');
 }
 $('impResultCard').classList.toggle('imp-invalid',!r.ok);
 const qualityDe={'analytical':'analytisch','empirical differential estimate':'empirische Differenzschätzung'};
 const errorText=r.ok?(de()?'Rechenmodell: '+(qualityDe[r.quality]||r.quality)+' · ohne 2D/3D-Feldlösung.':'Model: '+r.quality+' · No 2D/3D field solution.'):localError(r.error);
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
function exportResult(){if(!lastResult?.ok)return;download({schema:'com.simonlation.impedance-result',version:2,appVersion:'0.4.2-beta',units:{length:'mm',impedance:'ohm'},geometry:{signalId:state.signalId,mode:state.mode,widthMM:state.widthMM,spacingMM:paired()?state.spacingMM:null},result:lastResult,tolerances:lastTolerance,viaFence:lastVia,stackup:project(),disclaimer:'Models not validated as fabrication impedance or via-induced Z correction.'},'simonlation-impedance.json')}
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
$('viaExport').addEventListener('click',()=>{if(!lastVia?.ok)return;download({schema:'com.simonlation.via-fence',version:1,appVersion:'0.4.2-beta',layout:state.via,transmissionLine:{mode:state.mode,widthMM:state.widthMM,spacingMM:state.spacingMM},result:lastVia,stackup:project()},'simonlation-via-fence.json')});
document.querySelectorAll('[data-imp-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.impView;render()}));
 $('impShowVias').addEventListener('change',e=>{state.showCrossVias=e.target.checked;if(state.showCrossVias&&state.via.placement==='none')state.via.placement='both';render()});
 $('viaPlacement').addEventListener('change',()=>{state.via.placement=$('viaPlacement').value;if(state.via.placement==='none')state.showCrossVias=false;render()});
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
