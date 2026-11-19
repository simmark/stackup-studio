/* SIMONLATION Stackup Studio · 0.2 preview · independent engineering project
   Local-only PCB stackup editor. No external libraries, tracking, or network APIs. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const STORAGE = 'simonlation-stackup-studio-project-v1';
const LEGACY_STORAGE = 'simonlation-stackup-project-v1';
const PREF = 'simonlation-stackup-studio-preferences-v1';
const LEGACY_PREF = 'simonlation-stackup-preferences-v1';
const SCHEMA = 'com.simonlation.stackup';
const VERSION = 1;
const PALETTE = { copper:'#dca76b', core:'#356f79', prepreg:'#5a877c', soldermask:'#348269' };
const NAMES = { en:{ copper:'Copper',core:'Core',prepreg:'Prepreg',soldermask:'Solder mask' }, de:{ copper:'Kupfer',core:'Core',prepreg:'Prepreg',soldermask:'Lötstoppmaske' } };
const names = new Proxy({}, { get:(_,k)=>(NAMES[(typeof state!=='undefined'&&state.lang==='en')?'en':'de'][k]||k) });
const I18N = {
 en:{ open:'Open',save:'Export project',export:'Export ▾',setupTag:'PROJECT SETUP',boardSetup:'Board setup',projectName:'Project name',presets:'STARTING CONFIGURATION',presetsNote:'replaces layers',layers:'layers',targetThickness:'Target board body thickness',fitTarget:'Fit',targetNote:'Board body = copper + dielectric. Solder mask is shown separately.',options:'OPTIONS',mask:'Top & bottom solder mask',watermark:'Branding on image export',layersList:'LAYER NAVIGATOR',privacyTitle:'Local by design',privacy:'No sign-in, no upload. Project data stays in this browser until exported or deleted.',workspaceTag:'PCB ENGINEERING / MATERIAL SYSTEM',workspaceTitle:'Layer stackup',sideBySide:'Side by side',stackedView:'Stacked',resetSample:'Reset example',install:'Install app',boardBody:'BOARD BODY',totalIncludingMask:'WITH SOLDER MASK',copperLayers:'COPPER LAYERS',dielectricLayers:'DIELECTRICS',fromTop:'Top to bottom',allLayers:'All physical layers',corePrepreg:'Core / prepreg',geometry:'LIVE GEOMETRY',crossSection:'Cross-section',readable:'Readable',trueScale:'True ratio',clickLayer:'Select any layer in the diagram or table to inspect and edit.',diagramNotice:'Schematic preview · dimensions are numerical',copper:'Copper',maskShort:'Mask',specification:'DESIGN DATA',layerSpecification:'Layer specification',splitSelected:'Split dielectric',mergeSelected:'Merge dielectric',layer:'Layer',kind:'Type',thickness:'Thickness',material:'Material',role:'Role',lock:'Lock',editableTable:'Select a row; edit precise values in the inspector.',propertiesTag:'CONTEXT INSPECTOR',properties:'Properties',localReady:'Local engine ready',noCloud:'No cloud connection required',version:'v0.4.3 beta',helpTitle:'Stackup Studio · Help',onTarget:'On target',offTarget:'Target delta',enhanced:'Enhanced layer visibility',trueRatio:'Layer thicknesses shown proportionally',layerName:'Layer name',layerType:'Layer type',propertiesMaterial:'MATERIAL PARAMETERS',geometryGroup:'LAYER GEOMETRY',electrical:'ELECTRICAL CONTEXT',conductivity:'Conductor role',locked:'Exclude from auto-fit',eps:'Relative permittivity εr',tan:'Loss tangent tan δ',layerPosition:'Layer position',referenceUp:'Reference above',referenceDown:'Reference below',none:'None found',unknown:'Not defined',totalCopper:'Total copper',totalDiel:'Total dielectric',validation:'STACKUP CHECKS',valid:'No structural errors',errors:'Validation issues',bridge:'IMPEDANCE HANDOFF',bridgeInfo:'Export selected copper layer, materials and nominal reference-plane distances as JSON. The handoff itself does not contain a solved impedance; see the separate quick calculation below.',bridgeBtn:'Export impedance handoff',copyBridge:'Copy handoff JSON',maskInfo:'Mask is outside the specified board-body thickness.',planarInfo:'Reference-layer roles are assumptions, not verified plane copper. The PCB layout must confirm real return paths.',selectDiel:'Select a dielectric layer to split or merge.',invalidValue:'Please enter a valid value.',saved:'Project exported as JSON.',imported:'Project imported locally.',preset:'Preset loaded.',fitted:'Unlocked dielectrics adjusted to target.',noFit:'Target cannot be met with unlocked dielectrics.',noFile:'Unsupported file format.',badFile:'Import failed: ',undo:'Undone.',redo:'Redone.',nothing:'Nothing to change.',split:'Dielectric layer split.',merge:'Adjacent matching dielectrics merged.',notMatching:'Merge requires adjacent layers with identical material properties.',copied:'Handoff copied.',copyFailed:'Clipboard unavailable; use JSON export.',downloaded:'Export created.',confirmPreset:'Replace the current layer arrangement with this preset?',confirmReset:'Reset this project to the 4-layer example?',lockedHint:'Locked layers are ignored only by target auto-fit. They remain manually editable.',units:'Physical values use millimetres (mm).',checkLayers:'No copper layers detected.',checkOrder:'Copper layers must be separated by at least one dielectric.',checkThickness:'All physical layer thicknesses must be positive.',checkOdd:'Odd number of copper layers; many PCB fabrication workflows require even counts.',checkMaterials:'Check dielectric εr (1–30) and loss tangent (0–1).',checkTarget:'Nominal board body deviates from target by',checkRoles:'Assign GND/Power roles to candidate reference planes if known.',checkSmall:'Very thin dielectric: confirm manufacturability with fabricator.',layerCountText:'physical layers',helpBody:'' },
 de:{ open:'Öffnen',save:'Projekt exportieren',export:'Export ▾',setupTag:'PROJEKTDATEN',boardSetup:'Leiterplattenaufbau',projectName:'Projektname',presets:'STARTKONFIGURATION',presetsNote:'ersetzt Lagen',layers:'Lagen',targetThickness:'Ziel-Platinendicke (ohne Maske)',fitTarget:'Anpassen',targetNote:'Platinendicke = Kupfer + Dielektrika. Lötstoppmaske wird separat erfasst.',options:'OPTIONEN',mask:'Lötstoppmaske oben & unten',watermark:'Branding im Bildexport',layersList:'LAGEN-NAVIGATOR',privacyTitle:'Lokal verarbeitet',privacy:'Keine Anmeldung, kein Upload. Die Projektdaten verbleiben lokal im Browser, bis du sie exportierst oder löschst.',workspaceTag:'PCB-ENGINEERING / MATERIALSYSTEM',workspaceTitle:'Lagenaufbau',sideBySide:'Nebeneinander',stackedView:'Untereinander',resetSample:'Beispiel zurücksetzen',install:'App installieren',boardBody:'PLATINENKÖRPER',totalIncludingMask:'MIT LÖTSTOPPMASKE',copperLayers:'KUPFERLAGEN',dielectricLayers:'DIELEKTRIKA',fromTop:'Oben nach unten',allLayers:'Alle physikalischen Lagen',corePrepreg:'Core / Prepreg',geometry:'LIVE-GEOMETRIE',crossSection:'Querschnitt',readable:'Lesbar',trueScale:'Maßverhältnis',clickLayer:'Eine Lage in Grafik oder Tabelle auswählen, um sie zu bearbeiten.',diagramNotice:'Schematische Vorschau · Maßangaben sind numerisch',copper:'Kupfer',maskShort:'Maske',specification:'KONSTRUKTIONSDATEN',layerSpecification:'Lagendefinition',splitSelected:'Dielektrikum teilen',mergeSelected:'Dielektrika verbinden',layer:'Lage',kind:'Typ',thickness:'Dicke',material:'Material',role:'Funktion',lock:'Sperre',editableTable:'Zeile wählen; exakte Werte rechts im Inspektor ändern.',propertiesTag:'KONTEXT-INSPEKTOR',properties:'Eigenschaften',localReady:'Lokale Berechnung bereit',noCloud:'Keine Cloud-Verbindung nötig',version:'v0.4.3 Beta',helpTitle:'Stackup Studio · Hilfe',onTarget:'Im Ziel',offTarget:'Abweichung',enhanced:'Dünne Lagen für die Darstellung vergrößert',trueRatio:'Lagendicken proportional dargestellt',layerName:'Lagenname',layerType:'Lagentyp',propertiesMaterial:'MATERIALPARAMETER',geometryGroup:'LAGENGEOMETRIE',electrical:'ELEKTRISCHER KONTEXT',conductivity:'Leiterlagenfunktion',locked:'Bei Zielanpassung nicht ändern',eps:'Relative Permittivität εr',tan:'Verlustfaktor tan δ',layerPosition:'Lage im Aufbau',referenceUp:'Referenz oben',referenceDown:'Referenz unten',none:'Keine gefunden',unknown:'Nicht definiert',totalCopper:'Kupfer gesamt',totalDiel:'Dielektrikum gesamt',validation:'STACKUP-PRÜFUNGEN',valid:'Keine Strukturfehler',errors:'Prüfhinweise',bridge:'ÜBERGABE AN IMPEDANZRECHNER',bridgeInfo:'Gewählte Kupferlage, Materialien und nominelle Abstände zu Referenzlagen als JSON exportieren. Der JSON-Handoff enthält keine Impedanz. Die separate Schnellberechnung im PCB Impedance Lab nutzt eigene Geometriedaten.',bridgeBtn:'Impedanz-Übergabe exportieren',copyBridge:'Übergabe-JSON kopieren',maskInfo:'Die Lötstoppmaske liegt außerhalb der definierten Körperdicke.',planarInfo:'Referenzlagen sind Annahmen anhand der Rollen. Echte zusammenhängende Masseflächen müssen im PCB-Layout geprüft werden.',selectDiel:'Zum Teilen oder Verbinden ein Dielektrikum auswählen.',invalidValue:'Bitte einen gültigen Wert eingeben.',saved:'Projekt als JSON exportiert.',imported:'Projekt lokal importiert.',preset:'Vorlage geladen.',fitted:'Nicht gesperrte Dielektrika an Ziel angepasst.',noFit:'Zieldicke mit den freien Dielektrika nicht erreichbar.',noFile:'Dateiformat nicht unterstützt.',badFile:'Import fehlgeschlagen: ',undo:'Rückgängig gemacht.',redo:'Wiederhergestellt.',nothing:'Keine weitere Änderung.',split:'Dielektrikum aufgeteilt.',merge:'Gleiche benachbarte Dielektrika verbunden.',notMatching:'Verbinden nur bei benachbarten Lagen mit gleichen Materialeigenschaften.',copied:'Übergabe kopiert.',copyFailed:'Zwischenablage nicht verfügbar; bitte JSON exportieren.',downloaded:'Export erstellt.',confirmPreset:'Den aktuellen Lagenaufbau durch diese Vorlage ersetzen?',confirmReset:'Dieses Projekt auf das 4-Lagen-Beispiel zurücksetzen?',lockedHint:'Die Sperre gilt nur für die automatische Zielanpassung. Manuelles Editieren bleibt möglich.',units:'Physikalische Werte werden in Millimetern (mm) gespeichert.',checkLayers:'Keine Kupferlagen vorhanden.',checkOrder:'Zwischen Kupferlagen muss mindestens ein Dielektrikum liegen.',checkThickness:'Alle physikalischen Lagendicken müssen positiv sein.',checkOdd:'Ungerade Anzahl von Kupferlagen: Viele PCB-Fertigungsprozesse erfordern gerade Lagenzahlen.',checkMaterials:'Dielektrisches εr (1–30) und tan δ (0–1) prüfen.',checkTarget:'Nominelle Platinendicke weicht vom Zielwert ab um',checkRoles:'GND/Power als Referenzflächen zuordnen, soweit bekannt.',checkSmall:'Sehr dünnes Dielektrikum: Herstellbarkeit mit Fertiger klären.',layerCountText:'physikalische Lagen' }
};
const t = k => (I18N[state.lang]||I18N.de)[k]||k;
const safe = value => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = (n,d=3) => Number(n).toLocaleString(state.lang==='de'?'de-DE':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fixed = n=>Number(n).toFixed(5).replace(/0+$/,'').replace(/\.$/,'');
const deep = o => JSON.parse(JSON.stringify(o));
let uid=0;const newId=()=>`sl-${Date.now().toString(36)}-${(++uid).toString(36)}`;
const baseLayer=(type, name, mm, material, eps, df, role='')=>({id:newId(),type,name,thicknessMM:mm,material,epsilonR:eps,lossTangent:df,role,locked:false});
function generatePreset(count=4){
 const dist={2:[1.53],4:[.18,1.10,.18],6:[.16,.18,.71,.18,.16],8:[.12,.14,.15,.50,.15,.14,.12]}[count];
 if(!dist)throw Error('Unsupported preset');
 const layers=[baseLayer('soldermask','F.Mask',.01,'Solder resist',3.3,.02)];
 for(let i=0;i<count;i++){
  const name=i===0?'F.Cu':i===count-1?'B.Cu':`In${i}.Cu`;
  const role=(i===0||i===count-1)?'signal':i===1?'ground':(count===4&&i===2)?'power':i===count-2?'ground':'signal';
  layers.push(baseLayer('copper',name,.035,'Copper',1,0,role));
  if(i<count-1){const type=count===2?'core':(i===Math.floor((count-2)/2)?'core':'prepreg');layers.push(baseLayer(type,`Dielectric ${i+1}`,dist[i],'FR-4',4.2,.02));}
 }
 layers.push(baseLayer('soldermask','B.Mask',.01,'Solder resist',3.3,.02));
 return {schema:SCHEMA,version:VERSION,projectName:count+'-layer signal board',targetThicknessMM:1.6,maskEnabled:true,watermarkEnabled:true,layers};
}
function validProject(o){
 if(!o||typeof o!=='object'||o.schema!==SCHEMA||o.version!==VERSION||!Array.isArray(o.layers)||o.layers.length<3||o.layers.length>70)throw Error('Invalid/unsupported SIMONLATION Stackup Studio schema');
 if(typeof o.projectName!=='string'||o.projectName.length>100)throw Error('Invalid project name');
 if(!Number.isFinite(o.targetThicknessMM)||o.targetThicknessMM<.1||o.targetThicknessMM>15)throw Error('Target thickness out of bounds');
 const ids=new Set();for(const l of o.layers){if(!l||!['soldermask','copper','core','prepreg'].includes(l.type)||typeof l.name!=='string'||l.name.length>120||!Number.isFinite(l.thicknessMM)||l.thicknessMM<=0||l.thicknessMM>15||!Number.isFinite(l.epsilonR)||l.epsilonR<1||l.epsilonR>30||!Number.isFinite(l.lossTangent)||l.lossTangent<0||l.lossTangent>1||typeof l.material!=='string'||l.material.length>100||typeof l.id!=='string'||ids.has(l.id))throw Error('Invalid layer values');ids.add(l.id);if(typeof l.role!=='string'||l.role.length>24)throw Error('Invalid conductor role');}
 return {schema:SCHEMA,version:VERSION,projectName:o.projectName,targetThicknessMM:o.targetThicknessMM,maskEnabled:o.maskEnabled!==false,watermarkEnabled:o.watermarkEnabled!==false,layers:o.layers.map(l=>({...l,locked:!!l.locked}))};
}
function getPrefs(){try{return JSON.parse(localStorage.getItem(PREF)||localStorage.getItem(LEGACY_PREF)||'{}')}catch{return {}}}
const prefs=getPrefs();
let stored=null;try{stored=validProject(JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem(LEGACY_STORAGE)||'null'))}catch{}
const state={project:stored||generatePreset(4),selected:null,lang:prefs.lang==='en'?'en':'de',theme:prefs.theme==='light'?'light':'dark',view:prefs.view==='scale'?'scale':'readable',layout:(prefs.layoutV===2&&prefs.layout==='split')?'split':'stacked',history:[],future:[],installEvent:null};
state.selected=state.project.layers.find(l=>l.type==='core')?.id||state.project.layers[1].id;
const selection=()=>state.project.layers.find(l=>l.id===state.selected)||state.project.layers[0];
const visibleLayers=()=>state.project.layers.filter(l=>l.type!=='soldermask'||state.project.maskEnabled);
const copperCount=()=>state.project.layers.filter(l=>l.type==='copper').length;
const isDiel=l=>l.type==='core'||l.type==='prepreg';
const isMask=l=>l.type==='soldermask';
const bodyThickness=()=>state.project.layers.filter(l=>!isMask(l)).reduce((s,l)=>s+l.thicknessMM,0);
const maskThickness=()=>state.project.maskEnabled?state.project.layers.filter(isMask).reduce((s,l)=>s+l.thicknessMM,0):0;
const dielectricThickness=()=>state.project.layers.filter(isDiel).reduce((s,l)=>s+l.thicknessMM,0);
const copperThickness=()=>state.project.layers.filter(l=>l.type==='copper').reduce((s,l)=>s+l.thicknessMM,0);
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state.project));localStorage.setItem(PREF,JSON.stringify({lang:state.lang,theme:state.theme,view:state.view,layout:state.layout,layoutV:2}));}catch{}}
function update(modifier,{history=true}={}){
 const before=JSON.stringify(state.project);const oldId=state.selected;
 try{modifier();validProject(state.project)}catch(e){state.project=JSON.parse(before);state.selected=oldId;toast(e.message,true);return false;}
 if(JSON.stringify(state.project)===before){render();return false;}
 if(history){state.history.push({data:before,selected:oldId});if(state.history.length>60)state.history.shift();state.future=[];}
 if(!state.project.layers.some(l=>l.id===state.selected))state.selected=state.project.layers[0].id;
 persist();render();return true;
}
function historyMove(direction){const from=direction==='undo'?state.history:state.future, to=direction==='undo'?state.future:state.history;if(!from.length)return toast(t('nothing'));to.push({data:JSON.stringify(state.project),selected:state.selected});const prev=from.pop();state.project=JSON.parse(prev.data);state.selected=prev.selected;persist();render();toast(t(direction));}
let toastTimer;function toast(msg,error=false){$('toast').textContent=msg;$('toast').style.borderColor=error?'#c86f60':'#408a90';$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),3100);}
function select(id){if(!state.project.layers.some(l=>l.id===id))return;state.selected=id;render();}
function escSVG(value){return safe(value)}
function analysisFor(id){const arr=state.project.layers, index=arr.findIndex(l=>l.id===id);if(index<0||arr[index].type!=='copper')return null;
 function findReference(step){let distance=0;for(let i=index+step;i>=0&&i<arr.length;i+=step){const l=arr[i];if(isDiel(l))distance+=l.thicknessMM;else if(l.type==='copper' && ['ground','power'].includes(l.role))return {layer:l.name,distanceMM:distance,role:l.role};}return null;}
 return {top:findReference(-1),bottom:findReference(1)};
}
function issues(){const arr=state.project.layers.filter(l=>!isMask(l));const errors=[],warnings=[];
 if(!copperCount())errors.push(t('checkLayers'));
 if(arr.some(l=>!Number.isFinite(l.thicknessMM)||l.thicknessMM<=0))errors.push(t('checkThickness'));
 let lastCu=-1;arr.forEach((l,i)=>{if(l.type==='copper'){if(lastCu>=0&&!arr.slice(lastCu+1,i).some(isDiel))errors.push(t('checkOrder'));lastCu=i;}});
 if(copperCount()%2)warnings.push(t('checkOdd'));
 if(arr.filter(isDiel).some(l=>l.epsilonR<1||l.epsilonR>30||l.lossTangent<0||l.lossTangent>1))warnings.push(t('checkMaterials'));
 if(Math.abs(bodyThickness()-state.project.targetThicknessMM)>.01)warnings.push(`${t('checkTarget')} ${fmt(bodyThickness()-state.project.targetThicknessMM)} mm.`);
 if(arr.some(l=>isDiel(l)&&l.thicknessMM<.05))warnings.push(t('checkSmall'));
 if(!arr.some(l=>l.type==='copper'&&['ground','power'].includes(l.role)))warnings.push(t('checkRoles'));
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
function renderStatic(){document.documentElement.lang=state.lang;document.documentElement.dataset.theme=state.theme;document.querySelectorAll('[data-i18n]').forEach(node=>node.textContent=t(node.dataset.i18n));$('themeMeta').setAttribute('content',state.theme==='light'?'#eef2f4':'#0b121e');$('langBtn').textContent=state.lang==='de'?'EN':'DE';$('themeBtn').textContent=state.theme==='dark'?'☀':'☾';
 $('themeBtn').title=state.theme==='dark'?'Light mode':'Dark mode';$('projectName').value=state.project.projectName;$('targetThickness').value=fixed(state.project.targetThicknessMM);$('maskEnabled').checked=state.project.maskEnabled;$('watermarkEnabled').checked=state.project.watermarkEnabled;
 $('undoBtn').disabled=state.history.length===0;$('redoBtn').disabled=state.future.length===0;
 const count=copperCount();document.querySelectorAll('[data-preset]').forEach(btn=>btn.classList.toggle('active',+btn.dataset.preset===count));document.querySelectorAll('[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===state.view));
 $('scaleNote').textContent=t(state.view==='scale'?'trueRatio':'enhanced');
}
function renderMetrics(){const b=bodyThickness(),total=b+maskThickness(),delta=b-state.project.targetThicknessMM;const el=$('targetDelta');
 $('bodyMetric').innerHTML=fmt(b)+ ' <small>mm</small>';$('totalMetric').innerHTML=fmt(total)+' <small>mm</small>';
 $('copperMetric').textContent=copperCount();$('dielMetric').textContent=state.project.layers.filter(isDiel).length;
 el.textContent=Math.abs(delta)<=.01?t('onTarget'):`${t('offTarget')}: ${delta>0?'+':''}${fmt(delta)} mm`;el.className=Math.abs(delta)<=.01?'good':'bad';
 $('layerCount').textContent=copperCount()+' Cu';
}
function colorFor(l){return PALETTE[l.type]||'#567';}
function renderNavigator(){const visible=visibleLayers();$('layerNav').innerHTML=visible.map((l,i)=>`<button class="nav-item ${l.id===state.selected?'selected':''}" data-layer="${safe(l.id)}" title="${safe(l.name)}"><span class="nav-color" style="background:${colorFor(l)}"></span><span class="nav-main"><b>${safe(l.name)}</b><small>${safe(l.material||names[l.type])}</small></span><span class="nav-thick">${fmt(l.thicknessMM)} mm</span></button>`).join('');
 $('layerNav').querySelectorAll('[data-layer]').forEach(node=>node.addEventListener('click',()=>select(node.dataset.layer)));
}
function renderTable(){const visible=visibleLayers();$('layerTable').innerHTML=visible.map((l,i)=>`<tr data-layer="${safe(l.id)}" class="${l.id===state.selected?'selected':''}" tabindex="0"><td>${String(i+1).padStart(2,'0')}</td><td><i class="row-dot" style="background:${colorFor(l)}"></i><span class="layer-name">${safe(l.name)}</span></td><td>${safe(names[l.type])}</td><td>${fmt(l.thicknessMM)} <span class="subtext">mm</span></td><td>${safe(l.material)}</td><td>${l.type==='copper'?'—':fmt(l.epsilonR,2)}</td><td>${l.type==='copper'?'—':fmt(l.lossTangent,3)}</td><td>${l.type==='copper'?`<span class="role-pill">${safe(l.role)}</span>`:'—'}</td><td class="lock-icon">${l.locked?'🔒':'—'}</td></tr>`).join('');
 $('layerTable').querySelectorAll('tr').forEach(tr=>{tr.addEventListener('click',()=>select(tr.dataset.layer));tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){select(tr.dataset.layer);e.preventDefault();}})});
 $('tableCount').textContent=visible.length+' '+t('layerCountText');$('addDielectricBtn').disabled=!isDiel(selection());$('removeDielBtn').disabled=!canMerge(selection());
}
// Stack cross-section. Drawn in CSS pixels of the actual container so labels stay 11–12 px at any width.
function diagramSvg(W,H,forExport=false){
 const layers=visibleLayers(),narrow=W<520;
 const left=narrow?Math.round(W*.2):Math.min(190,Math.round(W*.2)),dimW=narrow?30:58,valW=narrow?62:84;
 const right=W-dimW-valW,top=narrow?40:50,bottom=H-(narrow?40:48),available=bottom-top,fs=narrow?10.5:12;
 const thickness=layers.map(l=>l.thicknessMM),total=thickness.reduce((a,b)=>a+b,0);
 let sizes=thickness.map(v=>available*(v/total));
 if(state.view==='readable'){
  const minH=l=>l.type==='copper'?(narrow?16:20):l.type==='soldermask'?(narrow?13:15):(narrow?22:28);
  sizes=sizes.map((v,i)=>Math.max(v,minH(layers[i])));
  const sum=sizes.reduce((a,b)=>a+b,0);sizes=sizes.map(v=>v*available/sum);
 }
 const dark=state.theme==='dark',muted=dark?'#91a7b5':'#5f7888';
 let svg=`<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="${dark?'#2d4757':'#bdd0da'}" stroke-width="0.6" opacity=".5"/></pattern><pattern id="cu" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M 0 9L9 0" stroke="#fff" stroke-width="1" opacity=".16" /></pattern></defs>`;
 svg+=`<rect width="${W}" height="${H}" fill="${dark?'#0e1a28':'#edf3f6'}"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`;
 svg+=`<text x="${left}" y="${top-14}" font-size="${fs-1}" font-weight="750" letter-spacing="1.4" fill="${muted}">${state.lang==='de'?'OBERSEITE':'TOP SIDE'}</text><text x="${left}" y="${bottom+24}" font-size="${fs-1}" font-weight="750" letter-spacing="1.4" fill="${muted}">${state.lang==='de'?'UNTERSEITE':'BOTTOM SIDE'}</text>`;
 let y=top;
 layers.forEach((l,i)=>{
  const h=sizes[i],mid=y+h/2,fill=colorFor(l),selected=!forExport&&l.id===state.selected;
  const text=l.type==='copper'?'#2e2418':'#e7fff9';
  svg+=`<g class="svg-layer ${selected?'selected':''}" data-layer="${escSVG(l.id)}"><title>${escSVG(l.name)} · ${escSVG(l.material)} · ${fmt(l.thicknessMM)} mm</title><rect class="rect-fill" x="${left}" y="${y.toFixed(2)}" width="${right-left}" height="${h.toFixed(2)}" fill="${fill}" stroke="#092333" stroke-width=".6"/>`;
  if(l.type==='copper')svg+=`<rect pointer-events="none" x="${left}" y="${y.toFixed(2)}" width="${right-left}" height="${h.toFixed(2)}" fill="url(#cu)"/>`;
  if(selected)svg+=`<rect class="selected-outline" x="${left-2}" y="${(y-1).toFixed(2)}" width="${right-left+4}" height="${(h+2).toFixed(2)}"/>`;
  const inner=l.type==='copper'?`${l.name} · ${roleLabel(l.role)}`:`${l.type==='core'?'Core':l.type==='prepreg'?'Prepreg':(state.lang==='de'?'Lötstoppmaske':'Solder mask')} · ${l.material}`;
  if(h>=13&&(right-left)>140)svg+=`<text pointer-events="none" x="${left+12}" y="${(mid+fs*.36).toFixed(2)}" font-size="${Math.min(fs,h-3).toFixed(1)}" font-weight="700" fill="${text}">${escSVG(inner)}</text>`;
  svg+=`<text pointer-events="none" x="${left-10}" y="${(mid+fs*.36).toFixed(2)}" text-anchor="end" font-size="${fs}" fill="${selected?'#52dcd5':dark?'#a9bfcc':'#3f6476'}" font-weight="${selected?700:500}">${escSVG(l.name)}</text>`;
  svg+=`<text pointer-events="none" x="${right+10}" y="${(mid+fs*.36).toFixed(2)}" text-anchor="start" font-size="${fs}" fill="${selected?'#52dcd5':dark?'#b3c8d4':'#3f6476'}" font-variant-numeric="tabular-nums">${fmt(l.thicknessMM)}</text>`;
  y+=h;
  svg+=`</g>`;
 });
 const dimX=W-dimW/2;
 svg+=`<path d="M ${dimX-9} ${top}h18 M${dimX-9} ${bottom}h18 M${dimX} ${top}V${bottom}" fill="none" stroke="${dark?'#6ea8b6':'#5d8393'}" stroke-width="1"/>`;
 svg+=`<text transform="translate(${dimX+(narrow?4:14)} ${top+available/2}) rotate(90)" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${dark?'#c4dbe5':'#335566'}">${fmt(bodyThickness()+maskThickness())} mm${narrow?'':' · '+(state.lang==='de'?'GESAMT':'TOTAL')}</text>`;
 svg+=`<text x="${right+10}" y="${top-14}" font-size="${fs-1}" font-weight="750" letter-spacing="1.2" fill="${muted}">mm</text>`;
 return svg;
}
function roleLabel(role){const de=state.lang==='de';return ({signal:'Signal',ground:'GND',power:de?'Versorgung':'Power',mixed:'Mixed'})[role]||String(role||'').toUpperCase();}
let diagramSize={w:880,h:430};
function renderDiagram(){
 const box=$('stackSvg').parentElement,w=Math.max(300,Math.round(box.clientWidth||880));
 const n=visibleLayers().length,h=Math.round(Math.min(640,Math.max(w<520?300:360,n*(w<520?24:30)+120)));
 diagramSize={w,h};
 const svgEl=$('stackSvg');svgEl.setAttribute('viewBox',`0 0 ${w} ${h}`);svgEl.style.height=h+'px';
 svgEl.innerHTML=diagramSvg(w,h);
 svgEl.querySelectorAll('[data-layer]').forEach(el=>el.addEventListener('click',()=>select(el.dataset.layer)));
}
if(typeof ResizeObserver!=='undefined'){let rzT;new ResizeObserver(()=>{clearTimeout(rzT);rzT=setTimeout(()=>{const box=document.getElementById('stackSvg')?.parentElement;if(box&&Math.abs(box.clientWidth-diagramSize.w)>4)renderDiagram();},60)}).observe(document.getElementById('stackSvg').parentElement);}
function selectInput(field,raw){const l=selection();if(!l)return;
 if(field==='name'||field==='material'){
  const v=raw.trim();if(!v)return toast(t('invalidValue'),true);update(()=>{l[field]=v;});return;
 }
 if(field==='type'){if(!isDiel(l)||!['core','prepreg'].includes(raw))return;update(()=>{l.type=raw;});return;}
 if(field==='role'){if(l.type!=='copper'||!['signal','ground','power','mixed'].includes(raw))return;update(()=>{l.role=raw;});return;}
 if(field==='locked'){update(()=>{l.locked=raw;});return;}
 if(['thicknessMM','epsilonR','lossTangent'].includes(field)){
  if(String(raw).trim()==='')return toast(t('invalidValue'),true);const n=Number(String(raw).replace(',','.'));
  if(!Number.isFinite(n)||field==='thicknessMM'&&(n<=0||n>15)||field==='epsilonR'&&(n<1||n>30)||field==='lossTangent'&&(n<0||n>1))return toast(t('invalidValue'),true);
  update(()=>{l[field]=n;});
 }
}
function renderInspector(){const l=selection(),pos=state.project.layers.indexOf(l)+1,refs=analysisFor(l.id),issuesNow=issues();let html=`<div class="inspector-card"><div class="inspector-swatch" style="background:${colorFor(l)}"></div><div><strong>${safe(l.name)}</strong><small>${safe(names[l.type])} · ${fmt(l.thicknessMM)} mm</small></div></div>`;
 html+=`<div class="inspector-block"><div class="group-label">${t('geometryGroup')}</div><div class="inspector-field"><label for="inspName">${t('layerName')}</label><input id="inspName" data-field="name" maxlength="120" value="${safe(l.name)}"></div>`;
 if(isDiel(l))html+=`<div class="inspector-field"><label for="inspType">${t('layerType')}</label><select id="inspType" data-field="type"><option value="core" ${l.type==='core'?'selected':''}>Core</option><option value="prepreg" ${l.type==='prepreg'?'selected':''}>Prepreg</option></select></div>`;
 html+=`<div class="inspector-field"><label for="inspThickness">${t('thickness')}</label><div class="inline-value"><input id="inspThickness" type="number" data-field="thicknessMM" step="0.005" min="0.001" max="15" value="${fixed(l.thicknessMM)}"><span>mm</span></div></div>`;
 html+=`<label class="check-line"><input type="checkbox" data-field="locked" ${l.locked?'checked':''}><span>${t('locked')}</span></label><p class="small-hint">${t('lockedHint')}</p></div>`;
 html+=`<div class="section-break"></div><div class="inspector-block"><div class="group-label">${t('propertiesMaterial')}</div><div class="inspector-field"><label for="inspMaterial">${t('material')}</label><input id="inspMaterial" data-field="material" maxlength="100" value="${safe(l.material)}" list="materialsList"><datalist id="materialsList"><option value="FR-4"><option value="Rogers RO4350B"><option value="Rogers RO4003C"><option value="Megtron 6"><option value="Polyimide"><option value="Solder resist"><option value="Copper"></datalist></div>`;
 if(l.type!=='copper')html+=`<div class="inspector-two"><div class="inspector-field"><label for="inspEps">${t('eps')}</label><input id="inspEps" type="number" min="1" max="30" step="0.05" data-field="epsilonR" value="${fixed(l.epsilonR)}"></div><div class="inspector-field"><label for="inspTan">${t('tan')}</label><input id="inspTan" type="number" min="0" max="1" step="0.001" data-field="lossTangent" value="${fixed(l.lossTangent)}"></div></div>`;
 else html+=`<div class="inspector-field"><label for="inspRole">${t('conductivity')}</label><select id="inspRole" data-field="role">${['signal','ground','power','mixed'].map(role=>`<option value="${role}" ${l.role===role?'selected':''}>${role.toUpperCase()}</option>`).join('')}</select></div>`;
 html+=`</div><div class="section-break"></div><div class="inspector-block"><div class="group-label">${t('electrical')}</div><div class="inspector-summary"><div class="summary-item"><span>${t('layerPosition')}</span><b>${pos} / ${state.project.layers.length}</b></div>`;
 if(refs){const refString=x=>x?`${safe(x.layer)} · ${fmt(x.distanceMM)} mm`:`${t('none')}`;html+=`<div class="summary-item"><span>${t('referenceUp')}</span><b>${refString(refs.top)}</b></div><div class="summary-item"><span>${t('referenceDown')}</span><b>${refString(refs.bottom)}</b></div>`;}
 else html+=`<div class="summary-item"><span>εr</span><b>${fmt(l.epsilonR,2)}</b></div><div class="summary-item"><span>tan δ</span><b>${fmt(l.lossTangent,3)}</b></div>`;
 html+=`<div class="summary-item"><span>${t('totalCopper')}</span><b>${fmt(copperThickness())} mm</b></div><div class="summary-item"><span>${t('totalDiel')}</span><b>${fmt(dielectricThickness())} mm</b></div></div><p class="small-hint">${refs?t('planarInfo'):t('maskInfo')}</p></div>`;
 html+=`<div class="section-break"></div><div class="inspector-block"><div class="group-label">${t('validation')}</div><ul class="validation-list">`;
 if(!issuesNow.errors.length&&!issuesNow.warnings.length)html+=`<li class="ok">✓ ${t('valid')}</li>`;
 for(const issue of issuesNow.errors)html+=`<li class="alert">✕ ${safe(issue)}</li>`;
 for(const issue of issuesNow.warnings)html+=`<li class="alert">! ${safe(issue)}</li>`;
 if(!issuesNow.errors.length&&issuesNow.warnings.length)html+=`<li class="info">${t('valid')}</li>`;
 html+=`</ul></div><div class="section-break"></div><div class="bridge-panel"><div class="group-label">${t('bridge')}</div><p class="small-hint">${t('bridgeInfo')}</p><button class="panel-action" id="exportBridge">↧ &nbsp; ${t('bridgeBtn')}</button><button class="panel-action" id="copyBridge">⧉ &nbsp; ${t('copyBridge')}</button></div>`;
 $('inspector').innerHTML=html;
 $('inspector').querySelectorAll('[data-field]').forEach(input=>{
  const f=input.dataset.field;input.addEventListener('change',()=>selectInput(f,input.type==='checkbox'?input.checked:input.value));
  if(input.tagName==='INPUT'&&input.type!=='checkbox')input.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();input.blur();}});
 });
 $('exportBridge').addEventListener('click',()=>downloadBridge());$('copyBridge').addEventListener('click',()=>copyBridge());
 const n=issuesNow.errors.length,w=issuesNow.warnings.length;$('validationStatus').textContent=n?`${n} ${t('errors')}`:w?`${w} ${t('errors')}`:'✓ '+t('valid');
}
function render(){renderStatic();renderMetrics();renderNavigator();renderTable();renderDiagram();renderInspector();window.dispatchEvent(new Event('simonlation:stackup-change'));}
function fitTarget(){const p=state.project,dielectrics=p.layers.filter(isDiel),unlocked=dielectrics.filter(l=>!l.locked);const fixedParts=p.layers.filter(l=>l.type==='copper'||isDiel(l)&&l.locked).reduce((s,l)=>s+l.thicknessMM,0);
 const rest=p.targetThicknessMM-fixedParts; if(!unlocked.length||rest<=0||unlocked.some(l=>rest*l.thicknessMM/unlocked.reduce((s,x)=>s+x.thicknessMM,0)<.001))return toast(t('noFit'),true);
 const prevTotal=unlocked.reduce((s,l)=>s+l.thicknessMM,0);if(update(()=>{for(const l of unlocked)l.thicknessMM=rest*l.thicknessMM/prevTotal;}))toast(t('fitted'));
}
function canMerge(l){if(!isDiel(l))return false;const list=state.project.layers;return isDiel(list[list.indexOf(l)+1]||{});}
function splitSelected(){const l=selection();if(!isDiel(l))return toast(t('selectDiel'));const i=state.project.layers.indexOf(l);if(l.thicknessMM<.002)return toast(t('invalidValue'),true);
 const a=l.thicknessMM/2;const other={...deep(l),id:newId(),name:l.name+' B',thicknessMM:a};
 if(update(()=>{l.name=l.name+' A';l.thicknessMM=a;state.project.layers.splice(i+1,0,other);}))toast(t('split'));
}
function mergeSelected(){const l=selection();if(!canMerge(l))return toast(t('selectDiel'));const arr=state.project.layers,i=arr.indexOf(l),next=arr[i+1];if(l.material!==next.material||l.type!==next.type||l.epsilonR!==next.epsilonR||l.lossTangent!==next.lossTangent||l.locked!==next.locked)return toast(t('notMatching'),true);
 if(update(()=>{l.thicknessMM+=next.thicknessMM;arr.splice(i+1,1);}))toast(t('merge'));
}
function collectBridge(){const l=selection();const project=state.project;return {schema:'com.simonlation.impedance-handoff',version:1,source:'SIMONLATION Stackup Studio',generatedAt:new Date().toISOString(),units:{length:'mm',relativePermittivity:'1',lossTangent:'1'},projectName:project.projectName,boardBodyThicknessMM:bodyThickness(),selectedConductor:l.type==='copper'?{id:l.id,name:l.name,role:l.role,thicknessMM:l.thicknessMM}:null,referencePlanes:l.type==='copper'?analysisFor(l.id):null,assumptions:['Conductor roles are user labels; actual plane coverage is not verified.','Separation values are sums of dielectric layer thicknesses only.','No characteristic impedance, differential impedance or RF loss has been calculated.'],stackup:deep(project)};}
function sanitizeFilename(name){return String(name||'stackup').toLowerCase().replace(/[^a-z0-9äöüß-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'stackup';}
function downloadBlob(data,file,mime){const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function exportProject(){downloadBlob(JSON.stringify(state.project,null,2),sanitizeFilename(state.project.projectName)+'.stackup.json','application/json');toast(t('saved'));}
function downloadBridge(){downloadBlob(JSON.stringify(collectBridge(),null,2),sanitizeFilename(state.project.projectName)+'.impedance-handoff.json','application/json');toast(t('downloaded'));}
async function copyBridge(){try{await navigator.clipboard.writeText(JSON.stringify(collectBridge(),null,2));toast(t('copied'));}catch{toast(t('copyFailed'),true)}}
function downloadCsv(german=false){const sep=german?';':',';const vals=[['index','name','type','thickness_mm','material','relative_permittivity','loss_tangent','role','locked'],...visibleLayers().map((l,i)=>[i+1,l.name,l.type,l.thicknessMM,l.material,l.type==='copper'?'':l.epsilonR,l.type==='copper'?'':l.lossTangent,l.role,l.locked])];const csv='\ufeff'+vals.map(row=>row.map(v=>'"'+(german&&typeof v==='number'?String(v).replace('.',','):String(v)).replaceAll('"','""')+'"').join(sep)).join('\r\n');downloadBlob(csv,sanitizeFilename(state.project.projectName)+(german?'.layers-de.csv':'.layers.csv'),'text/csv;charset=utf-8');toast(t('downloaded'));}
function exportSvgString(){const W=1100,H=Math.round(Math.min(700,Math.max(430,visibleLayers().length*36+130)));
 const ns='http://www.w3.org/2000/svg',holder=document.createElementNS(ns,'svg');holder.setAttribute('xmlns',ns);holder.setAttribute('viewBox',`0 0 ${W} ${H}`);holder.setAttribute('width',String(W*2));holder.setAttribute('height',String(H*2));holder.setAttribute('font-family','Segoe UI, Inter, Arial, sans-serif');
 holder.innerHTML=diagramSvg(W,H,true);holder.querySelectorAll('title').forEach(t=>t.remove());holder.querySelectorAll('g.svg-layer').forEach(g=>{g.removeAttribute('class');g.removeAttribute('data-layer');});holder.querySelectorAll('.rect-fill').forEach(el=>el.removeAttribute('class'));
 if(state.project.watermarkEnabled){const p=document.createElementNS(ns,'text');p.setAttribute('x',String(W/2));p.setAttribute('y',String(H-10));p.setAttribute('text-anchor','middle');p.setAttribute('font-size','11');p.setAttribute('letter-spacing','1.4');p.setAttribute('fill',state.theme==='dark'?'#86a9b6':'#647a87');p.textContent='SIMONLATION  ·  STACKUP STUDIO';holder.appendChild(p);}
 exportSvgString.size={w:W*2,h:H*2};return new XMLSerializer().serializeToString(holder);
}
async function downloadGraphic(format){const svg=exportSvgString(),filename=sanitizeFilename(state.project.projectName)+'.cross-section.'+format;
 if(format==='svg'){downloadBlob(svg,filename,'image/svg+xml;charset=utf-8');return toast(t('downloaded'));}
 try{const blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('SVG rendering failed'));image.src=url;});const {w:cw,h:ch}=exportSvgString.size;const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;canvas.getContext('2d').drawImage(image,0,0,cw,ch);URL.revokeObjectURL(url);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw Error('PNG export failed');downloadBlob(png,filename,'image/png');toast(t('downloaded'));}catch(e){toast(e.message,true);}
}
function extractBalanced(source,needle){const start=source.search(needle);if(start<0)return null;let depth=0,quoted=false,escaped=false,comment=false;for(let i=start;i<source.length;i++){const c=source[i];if(comment){if(c==='\n')comment=false;continue;}if(quoted){if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c==='"')quoted=false;continue;}if(c===';'){comment=true;continue;}if(c==='"'){quoted=true;continue;}if(c==='(')depth++;if(c===')'){depth--;if(depth===0)return source.slice(start,i+1);}}return null;}
function parseSExpr(src){const tokens=[];let i=0;while(i<src.length){const c=src[i];if(/\s/.test(c)){i++;continue;}if(c===';'){while(i<src.length&&src[i]!='\n')i++;continue;}if(c==='('||c===')'){tokens.push(c);i++;continue;}if(c==='"'){i++;let value='';let closed=false;while(i<src.length){const x=src[i++];if(x==='\\'&&i<src.length){value+=src[i++];continue;}if(x==='"'){closed=true;break;}value+=x;}if(!closed)throw Error('Unterminated KiCad string');tokens.push(value);continue;}const start=i;while(i<src.length&&!/[\s();]/.test(src[i]))i++;tokens.push(src.slice(start,i));}
 let n=0;function node(){if(tokens[n++]!=='(')throw Error('Malformed KiCad S-expression');const out=[];while(n<tokens.length&&tokens[n]!==')'){if(tokens[n]==='(')out.push(node());else out.push(tokens[n++]);}if(tokens[n++]!==')')throw Error('Unbalanced KiCad S-expression');return out;}
 const result=node();if(n!==tokens.length)throw Error('Trailing KiCad tokens');return result;
}
function parseKiCad(content){if(!content.includes('(kicad_pcb'))throw Error('Not a KiCad PCB document');const block=extractBalanced(content,/\(stackup(?=[\s()])/);if(!block)throw Error('KiCad stackup not found in Board Setup > Physical Stackup');const ast=parseSExpr(block), nodes=ast.filter(x=>Array.isArray(x)&&x[0]==='layer');if(nodes.length<3)throw Error('KiCad stackup contains too few physical layers');const layers=[];
 for(const node of nodes){const name=String(node[1]||''),field=k=>node.find(x=>Array.isArray(x)&&x[0]===k),rawType=String(field('type')?.[1]||'').toLowerCase();let type='';
  if(name==='F.Mask'||name==='B.Mask'||rawType.includes('mask'))type='soldermask';else if(name.endsWith('.Cu')||rawType==='copper')type='copper';else if(rawType.includes('core'))type='core';else if(rawType.includes('prepreg')||rawType.includes('dielectric'))type='prepreg';else continue;
  const thickness=Number(field('thickness')?.[1]);const epsilon=Number(field('epsilon_r')?.[1]);const loss=Number(field('loss_tangent')?.[1]);const material=String(field('material')?.[1]||(type==='copper'?'Copper':type==='soldermask'?'Solder resist':'Unspecified'));
  if(!Number.isFinite(thickness)||thickness<=0)throw Error('Missing/invalid layer thickness: '+name);
  const l=baseLayer(type,name,thickness,material,Number.isFinite(epsilon)&&epsilon>0?epsilon:(type==='copper'?1:type==='soldermask'?3.3:4.2),Number.isFinite(loss)&&loss>=0?loss:(type==='copper'?0:.02),type==='copper'?'mixed':'');layers.push(l);
 }
 if(layers.filter(l=>l.type==='copper').length<2)throw Error('KiCad stackup must contain at least two copper layers');
 const body=layers.filter(l=>l.type!=='soldermask').reduce((s,l)=>s+l.thicknessMM,0);
 return validProject({schema:SCHEMA,version:VERSION,projectName:'Imported KiCad stackup',targetThicknessMM:+body.toFixed(6),maskEnabled:layers.some(isMask),watermarkEnabled:true,layers});
}
async function importFile(file){if(!file||file.size>6e6)return toast('File too large (> 6 MB)',true);try{const str=await file.text();let project;if(file.name.toLowerCase().endsWith('.kicad_pcb'))project=parseKiCad(str);else if(file.name.toLowerCase().endsWith('.json'))project=validProject(JSON.parse(str));else throw Error(t('noFile'));
 update(()=>{state.project=project;state.selected=project.layers.find(isDiel)?.id||project.layers[0].id;});toast(t('imported'));
 }catch(e){toast(t('badFile')+e.message,true);}}
function updateProjectInput(id,cb){const input=$(id);input.addEventListener('change',()=>{const raw=input.value;cb(raw);});input.addEventListener('keydown',ev=>{if(ev.key==='Enter')input.blur();});}
function showHelp(){const de=state.lang==='de';$('helpContent').innerHTML=de?`
 <p><b>SIMONLATION Stackup Studio</b> ist ein lokal nutzbarer Editor für den physikalischen Lagenaufbau einer Leiterplatte. Die linke Seite verwaltet das Projekt, der mittlere Bereich zeigt Querschnitt und Lagendaten, rechts stehen die präzisen Materialeigenschaften.</p>
 <h3>Bedienung</h3><p>Eine Lage im Querschnitt, Navigator oder in der Tabelle auswählen. Anschließend den Namen, Typ, die Dicke, das Material, εr, tan δ oder die Kupferlagenfunktion im Inspektor ändern. Die Ansicht wird sofort aktualisiert. Die Zielanpassung verteilt die verbleibende Körperdicke proportional auf <b>nicht gesperrte Dielektrika</b>.</p>
 <h3>Import und Datensicherheit</h3><p><b>Öffnen</b> liest eigene <code>.stackup.json</code> oder KiCad-<code>.kicad_pcb</code>-Dateien mit definiertem <code>(stackup ...)</code>-Abschnitt. Unbekannte KiCad-Materialangaben werden als Vorgaben markiert und müssen geprüft werden. Browser-Lokalspeicherung ist keine verlässliche Sicherung; bitte Projekte als JSON exportieren. Keine Dateien werden hochgeladen.</p>
 <h3>Technische Grenzen</h3><p>Die Grafik ist eine <b>schematische</b> Darstellung. „Lesbar“ vergrößert dünne Lagen; „Maßverhältnis“ zeigt die relativen Dicken. Die angezeigten Referenzabstände sind Summen der Dielektrikumsdicken und nur eine geometrische Näherung. Das integrierte <b>PCB Impedance Lab</b> liefert nur analytische quasi-statische Näherungen für ausgewählte einfache Leitungsgeometrien. <b>Keine</b> 2D/3D-Feldberechnung, hochfrequente Dämpfung oder thermische Simulation. εr, tan δ und Lötstoppmaskenwerte sind konfigurierbare Eingaben und keine verifizierten Herstellerdaten.</p>
 <h3>Shortcuts</h3><p><kbd>Strg+O</kbd> Öffnen · <kbd>Strg+S</kbd> JSON exportieren · <kbd>Strg+Z</kbd> Rückgängig · <kbd>Strg+Umschalt+Z</kbd> Wiederholen · <kbd>?</kbd> Hilfe · <kbd>Esc</kbd> Schließen</p>
 <p>© 2026 Simon Mark · SIMONLATION. Preview-Prototyp v0.2.</p>`:`
 <p><b>SIMONLATION Stackup Studio</b> is a local-first editor for physical PCB layer stacks. The project is managed on the left, the center provides the live cross-section and layer table, and the right inspector holds exact physical and material parameters.</p>
 <h3>Workflow</h3><p>Select a layer in the diagram, navigator or table. Edit name, layer type, thickness, material, εr, tan δ or conductor role in the inspector. The target fit redistributes the remaining body thickness proportionally across <b>unlocked dielectric layers</b>.</p>
 <h3>Import & data safety</h3><p><b>Open</b> accepts own <code>.stackup.json</code> files or KiCad <code>.kicad_pcb</code> documents containing a <code>(stackup ...)</code> section. Defaulted material parameters must be verified. Browser storage is not a backup; export your project JSON. No files are uploaded.</p>
 <h3>Engineering limitations</h3><p>The diagram is <b>schematic</b>. Readable mode magnifies thin films while True ratio preserves thickness proportions. Reported reference separations are sums of dielectric thicknesses, not verified electrical reference-plane distances. The integrated <b>PCB Impedance Lab</b> provides quasi-static analytical estimates for selected simple geometries. <b>No</b> 2D/3D field solve, frequency-dependent loss or thermal simulation is performed. Material and solder-mask inputs are not verified manufacturer data.</p>
 <h3>Shortcuts</h3><p><kbd>Ctrl+O</kbd> Open · <kbd>Ctrl+S</kbd> Export JSON · <kbd>Ctrl+Z</kbd> Undo · <kbd>Ctrl+Shift+Z</kbd> Redo · <kbd>?</kbd> Help · <kbd>Esc</kbd> Close</p>
 <p>© 2026 Simon Mark · SIMONLATION. Preview prototype v0.2.</p>`;
 $('helpDialog').showModal();}

function renderWorkbench(){
 const wb=$('designWorkbench');if(!wb)return;
 wb.classList.toggle('is-stacked',state.layout==='stacked');
 document.querySelectorAll('[data-layout]').forEach(btn=>{
  const active=btn.dataset.layout===state.layout;
  btn.classList.toggle('active',active);
  btn.setAttribute('aria-pressed',String(active));
 });
}

function bind(){
 $('openBtn').addEventListener('click',()=>$('fileInput').click());$('fileInput').addEventListener('change',e=>{const f=e.target.files[0];if(f)importFile(f);e.target.value='';});
 $('saveBtn').addEventListener('click',exportProject);$('undoBtn').addEventListener('click',()=>historyMove('undo'));$('redoBtn').addEventListener('click',()=>historyMove('redo'));
 $('exportBtn').addEventListener('click',e=>{const menu=$('exportMenu');menu.classList.toggle('hidden');$('exportBtn').setAttribute('aria-expanded',String(!menu.classList.contains('hidden')));});
 $('exportMenu').addEventListener('click',ev=>{const btn=ev.target.closest('button[data-export]');if(!btn)return;$('exportMenu').classList.add('hidden');$('exportBtn').setAttribute('aria-expanded','false');switch(btn.dataset.export){case'svg':downloadGraphic('svg');break;case'png':downloadGraphic('png');break;case'csv':downloadCsv();break;case'csvde':downloadCsv(true);break;case'bridge':downloadBridge();break;}});
 document.addEventListener('pointerdown',ev=>{if(!ev.target.closest('.menu-anchor'))$('exportMenu').classList.add('hidden');});
 $('langBtn').addEventListener('click',()=>{state.lang=state.lang==='de'?'en':'de';persist();render()});
 $('themeBtn').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';persist();render()});
 document.querySelectorAll('[data-layout]').forEach(btn=>btn.addEventListener('click',()=>{state.layout=btn.dataset.layout;persist();renderWorkbench();}));
 $('helpBtn').addEventListener('click',showHelp);$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
 $('presetGrid').querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{const c=+btn.dataset.preset;if(c===copperCount()&&state.history.length===0)return;if(!confirm(t('confirmPreset')))return;if(update(()=>{state.project=generatePreset(c);state.selected=state.project.layers.find(isDiel).id;}))toast(t('preset'));}));
 $('sampleBtn').addEventListener('click',()=>{if(!confirm(t('confirmReset')))return;update(()=>{state.project=generatePreset(4);state.selected=state.project.layers.find(isDiel).id;});});
 updateProjectInput('projectName',raw=>{const v=raw.trim();if(!v)return toast(t('invalidValue'),true);update(()=>{state.project.projectName=v})});
 updateProjectInput('targetThickness',raw=>{const v=Number(raw);if(!Number.isFinite(v)||v<.1||v>15)return toast(t('invalidValue'),true);update(()=>{state.project.targetThicknessMM=v;})});
 $('fitTargetBtn').addEventListener('click',fitTarget);
 $('maskEnabled').addEventListener('change',e=>update(()=>{state.project.maskEnabled=e.target.checked;if(!e.target.checked&&selection().type==='soldermask')state.selected=state.project.layers.find(l=>l.type==='copper').id;}));
 $('watermarkEnabled').addEventListener('change',e=>update(()=>{state.project.watermarkEnabled=e.target.checked;}));
 $('addDielectricBtn').addEventListener('click',splitSelected);$('removeDielBtn').addEventListener('click',mergeSelected);
 document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{state.view=btn.dataset.view;persist();render()}));
 document.addEventListener('keydown',e=>{const edit=e.target.matches('input,textarea,select')||e.target.isContentEditable;const mod=e.ctrlKey||e.metaKey;
 if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();exportProject();}else if(mod&&e.key.toLowerCase()==='o'){e.preventDefault();$('fileInput').click();}else if(mod&&e.key.toLowerCase()==='z'&&e.shiftKey){e.preventDefault();historyMove('redo');}else if(mod&&e.key.toLowerCase()==='z'&&!edit){e.preventDefault();historyMove('undo');}else if(!edit&&e.key==='?'){e.preventDefault();showHelp();}});
 document.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault();});document.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length){e.preventDefault();importFile(e.dataTransfer.files[0]);}});
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installEvent=e;$('installBtn').hidden=false;});
 $('installBtn').addEventListener('click',async()=>{if(!state.installEvent)return;const e=state.installEvent;state.installEvent=null;$('installBtn').hidden=true;await e.prompt();});
}
bind();renderWorkbench();render();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
// Expose only read-only test hooks, not a production integration API.
window.SimonlationStackup=Object.freeze({getSnapshot:()=>deep(state.project),getSelectedId:()=>state.selected,selectLayer:(id)=>select(id),getBridge:()=>collectBridge(),schema:SCHEMA,version:VERSION});
window.__stackupDebug={snapshot:()=>deep(state.project),selected:()=>state.selected,validate:()=>issues(),parseKiCad,bodyThickness,collectBridge};
})();
