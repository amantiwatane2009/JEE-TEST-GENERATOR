const app=document.getElementById('app');
const KEY='jeePhysicsMockHistoryV1';
const ACTIVE_TEST_KEY='jeeSimulatorActiveTestV1';
let state=null;
let timerHandle=null;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const questionIdentity=q=>String(q.image||`${q.sourceId||q.source_name||q.source_id||q.subject||'question'}:${q.id}`);
const uniqueQuestions=questions=>[...new Map(questions.map(q=>[questionIdentity(q),q])).values()];
let allQuestions=[];
let selectedClass='11th';
let selectedSubject='Physics';
let activePreset=null;
let presetSetupState=null;
let historyReturn='custom';
const NEET_PYQ_NOTICE='Physics and Chemistry questions in this NEET test are JEE PYQs. NEET PYQs for these subjects will be added later. Biology uses NEET PYQs.';
const EXAM_PRESETS={
 jee:{label:'JEE Main',formatLabel:'JEE Main',subjects:[{key:'Physics',label:'Physics',count:25},{key:'Chemistry',label:'Chemistry',count:25},{key:'Maths',label:'Mathematics',count:25}],timeLimitSeconds:10800},
 neet:{label:'NEET',formatLabel:'NEET 2026 format',subjects:[{key:'Physics',label:'Physics',count:45},{key:'Chemistry',label:'Chemistry',count:45},{key:'Biology',label:'Biology',count:90}],timeLimitSeconds:10800}
};
const subjectMembers={
 Physics:['Physics'],Chemistry:['Chemistry'],Maths:['Maths','Mathematics'],Biology:['Biology'],
 'Physics + Chemistry':['Physics','Chemistry'],'Chemistry + Maths':['Chemistry','Maths','Mathematics'],
 'Physics + Maths':['Physics','Maths','Mathematics'],'Physics + Biology':['Physics','Biology'],
 'Chemistry + Biology':['Chemistry','Biology'],'Maths + Biology':['Maths','Mathematics','Biology'],
 all:['Physics','Chemistry','Maths','Mathematics','Biology']
};
const subjectAllowed=q=>(subjectMembers[selectedSubject]||[]).includes(q.subject);
const questionInClass=(q,classSelection)=>{
 const classes=Array.isArray(q.classes)?q.classes.map(Number):[Number(q.class)];
 if(!classes.some(c=>c===11||c===12))return false;
 return classSelection==='11th'?classes.includes(11):classSelection==='12th'?classes.includes(12):true;
};
const classAllowed=q=>questionInClass(q,selectedClass);
let sourceFilter='all';
let clean=[];
let preferredQuestionCount=80;
let testSetupState=null;
const chapterAliases={
 "Mechanical Properties of Solids":"Properties of Solids",
 "Properties of Solids":"Properties of Solids",
 "Oscillations":"Simple Harmonic Motion",
 "Simple Harmonic Motion":"Simple Harmonic Motion",
 "Thermal Properties of Matter":"Thermal Properties & Heat Transfer",
 "Thermal Properties & Heat Transfer":"Thermal Properties & Heat Transfer",
 "Waves":"Wave Motion",
 "Wave Motion":"Wave Motion"
};
const chapterName=q=>chapterAliases[q.chapter]||q.chapter;
let chapters=[];
function setSource(v){
 sourceFilter=v;
 clean=uniqueQuestions(allQuestions.filter(q=>subjectAllowed(q)&&classAllowed(q)&&(sourceFilter==='all'||(sourceFilter==='unknown'?!q.year:String(q.year)===sourceFilter))));
 chapters=[...new Set(clean.map(chapterName))];
}
const fmt=n=>String(Math.max(0,n)).padStart(2,'0');
function readTestHistory(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function saveHistory(x){const h=readTestHistory();h.unshift(x);localStorage.setItem(KEY,JSON.stringify(h.slice(0,10)))}
function updateSaveStatus(saved){const el=document.getElementById('saveStatus');if(!el)return;el.textContent=saved?'Saved on this device':'Could not save progress — keep this tab open';el.classList.toggle('save-warning',!saved)}
function persistActiveTest(){if(!state||state.submitted)return true;try{localStorage.setItem(ACTIVE_TEST_KEY,JSON.stringify({version:1,selectedClass,selectedSubject,sourceFilter,activePreset:state.examPreset||null,state}));updateSaveStatus(true);return true}catch{updateSaveStatus(false);return false}}
function restoreActiveTest(){
 try{
  const raw=localStorage.getItem(ACTIVE_TEST_KEY);if(!raw)return false;
  const record=JSON.parse(raw),saved=record?.state;
  if(record?.version!==1||!saved||!Array.isArray(saved.qs)||!saved.qs.length||saved.qs.some(q=>!q||typeof q!=='object')||!Array.isArray(saved.answers)||saved.answers.length!==saved.qs.length||!Array.isArray(saved.review)||saved.review.length!==saved.qs.length||!Array.isArray(saved.spent)||saved.spent.length!==saved.qs.length||!Number.isInteger(saved.index)||saved.index<0||saved.index>=saved.qs.length||!Number.isFinite(saved.last)||saved.submitted)throw new Error('Invalid saved test');
  if(saved.limitSeconds&&!Number.isFinite(saved.deadline))throw new Error('Invalid saved timer');
  selectedClass=['11th','12th','both'].includes(record.selectedClass)?record.selectedClass:'11th';
  selectedSubject=Object.hasOwn(subjectMembers,record.selectedSubject)?record.selectedSubject:'Physics';
  activePreset=Object.hasOwn(EXAM_PRESETS,saved.examPreset)?saved.examPreset:Object.hasOwn(EXAM_PRESETS,record.activePreset)?record.activePreset:null;
  saved.examPreset=activePreset;
  setSource(typeof record.sourceFilter==='string'?record.sourceFilter:'all');
  state=saved;
  const now=Date.now(),elapsed=Math.max(0,Math.floor((now-state.last)/1000));
  state.spent[state.index]=(Number(state.spent[state.index])||0)+elapsed;
  state.last=now;
  if(state.limitSeconds&&now>=state.deadline){submitTest(true);return true}
  renderTest();return true;
 }catch{
  try{localStorage.removeItem(ACTIVE_TEST_KEY)}catch{}
  return false;
 }
}
function subjectDisplayName(subject){return subject==='Maths'?'Mathematics':subject==='all'?'All Subjects':subject;}
function selectedExamLabel(){return activePreset?EXAM_PRESETS[activePreset].label:selectedSubject==='Biology'?'NEET':selectedSubject==='Physics'||selectedSubject==='Chemistry'||selectedSubject==='Maths'?'JEE Main':'JEE/NEET';}
function norm(s){return String(s??'').trim().replace(/\s+/g,'').replace(/,/g,'').toLowerCase()}
function sameAns(a,b){const x=norm(a),raw=String(b??'').trim();if(x===' '||x===''||raw==='')return false;if(x===norm(raw))return true;const alternatives=raw.split(/\s+or\s+/i);if(alternatives.length>1)return alternatives.some(answer=>sameAns(a,answer));const range=raw.match(/^\s*(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)\s*$/i);const nx=Number(x);if(range&&Number.isFinite(nx)){const lo=Number(range[1]),hi=Number(range[2]);return nx>=Math.min(lo,hi)-1e-9&&nx<=Math.max(lo,hi)+1e-9}const ny=Number(norm(raw));return Number.isFinite(nx)&&Number.isFinite(ny)&&Math.abs(nx-ny)<1e-9}
function isMcq(q){return q.type==='mcq'||q.type==='multi'}
function isMultiSelect(q){return q.type==='multi'}
function isIntegerQuestion(q){return q.type==='integer'}
function optionIndex(v){const s=norm(v);if(/^[a-d]$/.test(s))return s.charCodeAt(0)-97;if(/^[1-4]$/.test(s))return Number(s)-1;return null}
function optionLabels(q){return /^[1-4]$/.test(norm(q.answer))?['1','2','3','4']:['A','B','C','D']}
function answerParts(v){return (Array.isArray(v)?v:String(v??'').split(',')).map(x=>String(x).trim().toUpperCase()).filter(Boolean).sort()}
function sameQuestionAnswer(user,q){if(q.bonus)return answerParts(user).length>0;if(isMultiSelect(q)){const a=answerParts(user),b=answerParts(q.answer);return a.length===b.length&&a.every((x,i)=>x===b[i])}if(isMcq(q)){const a=optionIndex(user),b=optionIndex(q.answer);if(a!==null&&b!==null)return a===b;return false}return sameAns(user,q.answer)}
function answerLabel(q){return isMultiSelect(q)?'Select all correct options':isMcq(q)?'Select one option':'Enter your numerical answer'}
function isUnscored(q){const answer=String(q.answer??'').trim();if(!answer||answer.toLowerCase()==='scan qr')return true;return !!q.flagged&&!q.out_of_syllabus}

function selectQuestions(n=80,chapterScope=chapters){
 const eligibleChapters=[...new Set(chapterScope)].filter(ch=>chapters.includes(ch));
 if(!eligibleChapters.length)return [];
 const previous=readTestHistory()[0]||{};
 const used=new Set([...(previous.ids||[]).map(String),...(previous.questionKeys||[])]);
 const pools=eligibleChapters.map(ch=>({ch,pool:clean.filter(q=>chapterName(q)===ch&&!used.has(String(q.id))&&!used.has(questionIdentity(q)))}));
 // Fall back to the full chapter pool when avoiding the previous paper would leave too few questions.
 pools.forEach(x=>{if(x.pool.length===0)x.pool=clean.filter(q=>chapterName(q)===x.ch)});
 const totalPool=pools.reduce((a,x)=>a+x.pool.length,0);
 n=Math.max(1,Math.min(n,totalPool));
 const counts=Object.fromEntries(eligibleChapters.map(c=>[c,0]));
 const exact=pools.map(x=>({ch:x.ch,raw:n*x.pool.length/totalPool,base:Math.floor(n*x.pool.length/totalPool),frac:(n*x.pool.length/totalPool)%1}));
 exact.forEach(x=>counts[x.ch]=x.base);
 let left=n-exact.reduce((a,x)=>a+x.base,0);
 exact.sort((a,b)=>b.frac-a.frac);
 for(let i=0;i<left;i++)counts[exact[i%exact.length].ch]++;
 let out=[];
 for(const x of pools){let pool=x.pool;const take=Math.min(counts[x.ch],pool.length);out.push(...shuffle(pool).slice(0,take));}
 // If rounding/caps left us short, fill from remaining unique questions.
 if(out.length<n){const selected=new Set(out.map(questionIdentity));const rest=shuffle(clean.filter(q=>eligibleChapters.includes(chapterName(q))&&!selected.has(questionIdentity(q))&&!used.has(String(q.id))&&!used.has(questionIdentity(q))));out.push(...rest.slice(0,n-out.length));}
 return shuffle(out.slice(0,n));
}
function getPresetQuestionPool(subject,classSelection=selectedClass,chapterScope=null,exam=activePreset){
 const members=subjectMembers[subject]||[subject],allowedChapters=Array.isArray(chapterScope)?new Set(chapterScope):null;
 return uniqueQuestions(allQuestions.filter(q=>members.includes(q.subject)&&questionInClass(q,classSelection)&&(!allowedChapters||allowedChapters.has(chapterName(q)))&&(exam!=='neet'||q.type==='mcq')));
}
function neetQuestionSourceNotice(){
 const physicsChemistry=['Physics','Chemistry'].flatMap(subject=>getPresetQuestionPool(subject,selectedClass,presetScopeFor(subject),'neet'));
 const sources=physicsChemistry.map(q=>{
  const label=[q.sourceId,q.source_id,q.sourceName,q.source_name,q.sourceFile,q.source_file,q.sourceFilename,q.source_filename,q.exam,q.examName,q.exam_name,q.attempt].filter(Boolean).join(' ').toLowerCase();
  if(/\bneet\b|neet[-_]/.test(label))return 'neet';
  if(/\bjee\b|jee[-_]/.test(label))return 'jee';
  return 'unknown';
 });
 const hasJee=sources.includes('jee'),hasNeet=sources.includes('neet'),hasUnknown=sources.includes('unknown');
 if(hasNeet&&!hasJee&&!hasUnknown)return 'Physics, Chemistry, and Biology questions in this NEET test are NEET PYQs.';
 if(hasNeet&&hasJee)return 'Physics and Chemistry in this NEET test include JEE PYQs and NEET PYQs. Biology uses NEET PYQs.';
 if(hasNeet&&hasUnknown)return 'Physics and Chemistry include NEET PYQs, but some question sources are not labeled clearly. Check the source before starting. Biology uses NEET PYQs.';
 if(hasJee&&hasUnknown)return 'Physics and Chemistry include JEE PYQs, but some question sources are not labeled clearly. NEET PYQs for those subjects will be added later. Biology uses NEET PYQs.';
 if(hasJee)return NEET_PYQ_NOTICE;
 return 'Physics and Chemistry question sources are not labeled clearly. The current question bank is intended to use JEE PYQs; NEET PYQs for those subjects will be added later. Biology uses NEET PYQs.';
}
function selectPresetQuestions(count,pool){
 const previous=readTestHistory()[0]||{},used=new Set([...(previous.ids||[]).map(String),...(previous.questionKeys||[])]);
 const unused=pool.filter(q=>!used.has(String(q.id))&&!used.has(questionIdentity(q)));
 const source=unused.length>=count?unused:pool;
 if(source.length<count)return [];
 const grouped=new Map();source.forEach(q=>{const chapter=chapterName(q);if(!grouped.has(chapter))grouped.set(chapter,[]);grouped.get(chapter).push(q)});
 const groups=[...grouped].map(([chapter,questions])=>({chapter,questions,raw:count*questions.length/source.length}));
 groups.forEach(group=>group.take=Math.floor(group.raw));
 let left=count-groups.reduce((total,group)=>total+group.take,0);
 groups.sort((a,b)=>(b.raw-Math.floor(b.raw))-(a.raw-Math.floor(a.raw)));
 for(let i=0;left>0&&i<groups.length;i++){if(groups[i].take<groups[i].questions.length){groups[i].take++;left--}}
 let selected=[];groups.forEach(group=>selected.push(...shuffle(group.questions).slice(0,group.take)));
 if(selected.length<count){const selectedKeys=new Set(selected.map(questionIdentity));selected.push(...shuffle(source.filter(q=>!selectedKeys.has(questionIdentity(q)))).slice(0,count-selected.length))}
 return shuffle(selected.slice(0,count));
}
/* Entry flow: choose class, then a preset or custom practice. */
let selectedPair='';
function renderSelection(step){
 step=step||'class';
 const classes=[['11th','Class 11','JEE and NEET practice'],['12th','Class 12','JEE and NEET practice'],['both','Both classes','Practice across Class 11 and Class 12']];
 const testTypes=[['jee','JEE Main pattern','25 each in Physics, Chemistry, and Mathematics · 3 hours'],['neet','NEET (2026 format)','45 Physics · 45 Chemistry · 90 Biology · 3 hours'],['custom','Custom practice','Choose your subjects and test length']];
 const subjects=[['Physics','Physics','P'],['Chemistry','Chemistry','C'],['Maths','Mathematics','M'],['Biology','Biology','B'],['any2','Any 2 subjects','+'],['all','All subjects','4']];
 const pairs=[['physics-chemistry','Physics + Chemistry','Physics + Chemistry'],['chemistry-maths','Chemistry + Mathematics','Chemistry + Maths'],['physics-maths','Physics + Mathematics','Physics + Maths'],['physics-biology','Physics + Biology','Physics + Biology'],['chemistry-biology','Chemistry + Biology','Chemistry + Biology'],['maths-biology','Mathematics + Biology','Maths + Biology']];
 let body='';
 if(step==='class') body=classes.map(x=>'<button class="choice-card" data-class="'+x[0]+'"><span class="choice-title">'+x[1]+'</span><span class="choice-desc">'+x[2]+'</span><span class="choice-arrow">Continue &rarr;</span></button>').join('');
 if(step==='test-type') body=testTypes.map(x=>'<button class="choice-card" data-test-type="'+x[0]+'"><span class="choice-title">'+x[1]+'</span><span class="choice-desc">'+x[2]+'</span><span class="choice-arrow">Continue &rarr;</span></button>').join('');
 if(step==='subject') body=subjects.map(x=>'<button class="choice-card" data-subject="'+x[0]+'"><span class="choice-symbol">'+x[2]+'</span><span class="choice-title">'+x[1]+'</span><span class="choice-arrow">Select &rarr;</span></button>').join('');
 if(step==='pair') body=pairs.map(x=>'<button class="choice-card" data-pair="'+x[0]+'"><span class="choice-title">'+x[1]+'</span><span class="choice-arrow">Continue &rarr;</span></button>').join('');
 const heading=step==='class'?'Choose your class':step==='test-type'?'Choose a test type':step==='subject'?'Choose your subjects':'Choose your subject combination';
 const sub=step==='class'?'Start by selecting the syllabus you want to practise':step==='test-type'?'Start a ready-made exam pattern or build your own practice test':step==='subject'?'Choose a subject to practise, including NEET Biology':'Select the two subjects you want to practise together';
 const back=step==='class'?'':'<button class="btn secondary" id="selectionBack">Back</button>';
 const stepIndex=step==='class'?'1':step==='test-type'?'2':step==='subject'?'3':'4';
 const stepLabel=step==='class'?'Step 1 of 2':step==='test-type'?'Step 2 of 2':step==='subject'?'Custom practice':'Subject combination';
 app.innerHTML='<div class="wrap selection-wrap"><header class="selection-header"><div class="brand"><h1>Build a JEE or NEET mock test</h1><p>Choose your class, then start an exam-pattern test or custom practice</p></div><div class="selection-step" data-step="'+stepIndex+'">'+stepLabel+'</div></header><section class="card selection-card"><div class="selection-heading"><div><h2>'+heading+'</h2><p class="muted">'+sub+'</p></div>'+back+'</div><div class="choice-grid '+(['subject','test-type'].includes(step)?'subject-grid':'')+'">'+body+'</div><p class="selection-footnote">Your selection only changes this practice session</p></section></div>';
 document.getElementById('selectionBack')?.addEventListener('click',()=>renderSelection(step==='test-type'?'class':step==='pair'?'subject':'test-type'));
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{selectedClass=b.dataset.class;renderSelection('test-type')});
 document.querySelectorAll('[data-test-type]').forEach(b=>b.onclick=()=>{
  const type=b.dataset.testType;
  if(type==='custom'){activePreset=null;presetSetupState=null;renderSelection('subject');return}
  activePreset=type;selectedSubject='all';sourceFilter='all';presetSetupState=null;setSource('all');renderPresetSetup();
 });
 document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{activePreset=null;presetSetupState=null;selectedSubject=b.dataset.subject;if(selectedSubject==='any2'){renderSelection('pair');return}setSource('all');renderStart()});
 document.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{const pair=pairs.find(x=>x[0]===b.dataset.pair);if(!pair)return;selectedSubject=pair[2];setSource('all');renderStart()});
}
function presetChaptersFor(subject){return [...new Set(getPresetQuestionPool(subject,selectedClass,null,activePreset).map(chapterName))].sort((a,b)=>a.localeCompare(b))}
function presetScopeFor(subject){const selection=presetSetupState?.subjects?.[subject];return selection?.mode==='selected'?selection.selectedChapters:null}
function preparePresetSetup(){
 const context=`${activePreset}|${selectedClass}`;
 if(!presetSetupState||presetSetupState.context!==context){
  presetSetupState={context,step:1,subjects:Object.fromEntries(EXAM_PRESETS[activePreset].subjects.map(subject=>[subject.key,{mode:'all',selectedChapters:[]}]))};
 }
 for(const subject of EXAM_PRESETS[activePreset].subjects){
  const selection=presetSetupState.subjects[subject.key],chapters=presetChaptersFor(subject.key);
  selection.selectedChapters=selection.selectedChapters.filter(chapter=>chapters.includes(chapter));
 }
}
function renderPresetSetup(){
 if(!activePreset||!EXAM_PRESETS[activePreset])return;
 preparePresetSetup();
 const preset=EXAM_PRESETS[activePreset],classLabel=selectedClass==='both'?'Class 11 + 12':`Class ${selectedClass}`;
 const subjectStats=Object.fromEntries(preset.subjects.map(subject=>{
  const fullPool=getPresetQuestionPool(subject.key,selectedClass,null,activePreset),chapters=[...new Set(fullPool.map(chapterName))].sort((a,b)=>a.localeCompare(b)),scope=presetScopeFor(subject.key);
  return [subject.key,{chapters,fullPool,available:scope?fullPool.filter(q=>scope.includes(chapterName(q))).length:fullPool.length}];
 }));
 const subjects=preset.subjects.map(subject=>{
  const {chapters,fullPool,available}=subjectStats[subject.key],selection=presetSetupState.subjects[subject.key];
  const chapterOptions=chapters.map((chapter,index)=>{
   const total=fullPool.filter(q=>chapterName(q)===chapter).length,checked=selection.selectedChapters.includes(chapter);
   return `<label class="preset-chapter-option" for="preset-${subject.key}-${index}"><input id="preset-${subject.key}-${index}" type="checkbox" data-preset-chapter-subject="${subject.key}" data-preset-chapter-index="${index}" ${checked?'checked':''}><span>${chapter}</span><small>${total} available</small></label>`;
  }).join('');
  const insufficient=available<subject.count;
  const shortage=selection.mode==='all'?`Only ${available} ${subject.label} questions are available for this class. Choose Both classes or another class.`:`Select more ${subject.label} chapters or choose FST. This test needs ${subject.count}; your selection has ${available}.`;
  return `<section class="preset-subject-card" aria-labelledby="preset-${subject.key}-heading"><div class="preset-subject-heading"><div><h3 id="preset-${subject.key}-heading">${subject.label}</h3><p class="muted">${subject.count} questions required · ${available} available</p></div><span class="badge">${selection.mode==='all'?'FST':'Chapters selected'}</span></div><div class="preset-scope-actions"><button type="button" class="btn ${selection.mode==='all'?'':'secondary'}" data-preset-mode-subject="${subject.key}" data-preset-mode="all" aria-pressed="${selection.mode==='all'}">Full syllabus (FST)</button><button type="button" class="btn ${selection.mode==='selected'?'':'secondary'}" data-preset-mode-subject="${subject.key}" data-preset-mode="selected" aria-pressed="${selection.mode==='selected'}">Choose chapters</button></div>${selection.mode==='selected'?`<div class="preset-chapter-toolbar"><span class="small muted">Choose chapters for ${subject.label}</span><div class="row"><button type="button" class="btn secondary" data-preset-select-all="${subject.key}">Select all</button><button type="button" class="btn secondary" data-preset-clear="${subject.key}">Clear</button></div></div><div class="preset-chapter-list" aria-label="${subject.label} chapters">${chapterOptions||'<p class="muted">No questions are available for this subject and class.</p>'}</div>`:''}${insufficient?`<p class="preset-validation" role="status">${shortage}</p>`:''}</section>`;
 }).join('');
 const insufficient=preset.subjects.some(subject=>subjectStats[subject.key].available<subject.count);
 let content='';
 if(presetSetupState.step===1){
  content=`<h2 id="presetHeading" tabindex="-1">Choose chapters or use FST</h2><p class="muted setup-description">Each subject keeps its exam question count. Full syllabus is selected by default.</p><div class="preset-subject-list">${subjects}</div>`;
 }else{
  const summary=preset.subjects.map(subject=>{
   const selection=presetSetupState.subjects[subject.key],scope=presetScopeFor(subject.key);
   return `<div><span>${subject.label}</span><strong>${subject.count} questions</strong><small>${scope?scope.join(', '):'Full syllabus'}</small></div>`;
  }).join('');
  content=`<h2 id="presetHeading" tabindex="-1">Ready to start ${preset.formatLabel||preset.label}?</h2><p class="muted setup-description">This test has a fixed three-hour timer. The timer starts only after you confirm.</p>${activePreset==='neet'?`<div class="preset-notice" role="note"><strong>Question source notice</strong><p>${neetQuestionSourceNotice()}</p><p class="small"><strong>Format note:</strong> This preset follows NEET 2026 (180 questions in 180 minutes). <a href="https://www.nta.gov.in/exams/neet/" target="_blank" rel="noopener">NTA currently lists NEET 2027 as 200 questions, with 180 to answer in 200 minutes</a>; check its 2027 information bulletin when released.</p></div>`:''}<div class="preset-review" aria-label="Test summary">${summary}<div><span>Time limit</span><strong>3 hours</strong><small>180 minutes total</small></div></div><p class="small muted">You can leave this screen without starting the timer.</p>`;
 }
 const disabled=presetSetupState.step===1&&insufficient;
 const actionLabel=presetSetupState.step===1?'Review test':'Confirm and start 3-hour test';
 app.innerHTML=`<div class="wrap selection-wrap test-setup-wrap"><header class="selection-header test-setup-header"><div class="brand"><p class="setup-eyebrow">${preset.formatLabel||preset.label} · ${classLabel}</p><h1>Build your ${preset.formatLabel||preset.label} test</h1><p>${preset.subjects.reduce((sum,subject)=>sum+subject.count,0)} questions · 3 hours</p></div><div class="row test-setup-actions"><button class="btn secondary" id="presetHistory">History</button></div></header><section class="card selection-card preset-setup-card" aria-labelledby="presetHeading">${content}<div class="setup-navigation"><button type="button" class="btn secondary" id="presetBack">${presetSetupState.step===1?'Change test':'Back to chapters'}</button><button type="button" class="btn" id="presetContinue" ${disabled?'disabled':''}>${actionLabel}</button></div></section></div>`;
 document.getElementById('presetHistory').onclick=()=>{historyReturn='preset';showHistory()};
 document.getElementById('presetBack').onclick=()=>{
  if(presetSetupState.step===2){presetSetupState.step=1;renderPresetSetup();document.getElementById('presetHeading')?.focus();return}
  activePreset=null;presetSetupState=null;renderSelection('test-type');
 };
 document.getElementById('presetContinue').onclick=()=>{
  if(presetSetupState.step===1){if(insufficient)return;presetSetupState.step=2;renderPresetSetup();document.getElementById('presetHeading')?.focus();return}
  startPresetTest();
 };
 document.querySelectorAll('[data-preset-mode-subject]').forEach(button=>button.onclick=()=>{
  const subject=button.dataset.presetModeSubject,selection=presetSetupState.subjects[subject];
  if(selection.mode===button.dataset.presetMode)return;
  selection.mode=button.dataset.presetMode;
  renderPresetSetup();document.querySelector(`[data-preset-mode-subject="${subject}"][data-preset-mode="${selection.mode}"]`)?.focus();
 });
 document.querySelectorAll('[data-preset-chapter-subject]').forEach(input=>input.onchange=()=>{
  const subject=input.dataset.presetChapterSubject,index=Number(input.dataset.presetChapterIndex),chapter=presetChaptersFor(subject)[index],selection=presetSetupState.subjects[subject],chosen=new Set(selection.selectedChapters);
  if(input.checked)chosen.add(chapter);else chosen.delete(chapter);
  selection.selectedChapters=[...chosen];renderPresetSetup();document.querySelector(`[data-preset-chapter-subject="${subject}"][data-preset-chapter-index="${index}"]`)?.focus();
 });
 document.querySelectorAll('[data-preset-select-all]').forEach(button=>button.onclick=()=>{
  const subject=button.dataset.presetSelectAll;presetSetupState.subjects[subject].selectedChapters=presetChaptersFor(subject);renderPresetSetup();document.querySelector(`[data-preset-select-all="${subject}"]`)?.focus();
 });
 document.querySelectorAll('[data-preset-clear]').forEach(button=>button.onclick=()=>{
  const subject=button.dataset.presetClear;presetSetupState.subjects[subject].selectedChapters=[];renderPresetSetup();document.querySelector(`[data-preset-clear="${subject}"]`)?.focus();
 });
 document.getElementById('presetHeading')?.focus();
}
function startPresetTest(){
 const preset=EXAM_PRESETS[activePreset];if(!preset)return;
 const sections=preset.subjects.map(subject=>{
  const pool=getPresetQuestionPool(subject.key,selectedClass,presetScopeFor(subject.key),activePreset);
  return {subject,questions:selectPresetQuestions(subject.count,pool)};
 });
 const incomplete=sections.find(section=>section.questions.length!==section.subject.count);
 if(incomplete){presetSetupState.step=1;renderPresetSetup();document.getElementById('presetHeading')?.focus();return}
 selectedSubject='all';
 const questions=sections.flatMap(section=>section.questions);
 startTest(questions,preset.timeLimitSeconds/60/questions.length);
}
function renderComingSoon(title,message){
 app.innerHTML='<div class="wrap selection-wrap"><header class="selection-header"><div class="brand"><h1>'+title+'</h1><p>'+(selectedClass==='both'?'Class 11 + Class 12':'Class '+selectedClass)+' · '+title+'</p></div></header><section class="card coming-card"><h2>Under maintenance.</h2><p class="muted">'+message+'</p><p class="coming-note">We’re working on this section. Please check back soon.</p><div class="row coming-actions"><button class="btn" id="chooseAgain">Choose another option</button><button class="btn secondary" id="backHome">Back to home</button></div></section></div>';
 document.getElementById('chooseAgain').onclick=()=>renderSelection('class');
 document.getElementById('backHome').onclick=()=>{selectedClass='11th';selectedSubject='Physics';setSource('all');renderSelection('class')};
}

function setupChapterScope(){return testSetupState?.chapterMode==='selected'?testSetupState.selectedChapters:chapters}
function setupPoolSize(){const scope=setupChapterScope();return clean.filter(q=>scope.includes(chapterName(q))).length}
function clampSetupQuestionCount(max){if(max<1)return;const next=Math.max(1,Math.min(max,Math.floor(Number(testSetupState.questionCount)||1)));if(next!==testSetupState.questionCount){testSetupState.questionCount=next;testSetupState.questionChoice=[20,40,80].includes(next)?String(next):'custom';preferredQuestionCount=next}}
function prepareTestSetup(total){
 const context=`${selectedClass}|${selectedSubject}`;
 if(!testSetupState||testSetupState.context!==context){
  const questionCount=Math.max(1,Math.min(total,Math.floor(Number(preferredQuestionCount)||80)));
  testSetupState={context,step:1,questionCount,questionChoice:[20,40,80].includes(questionCount)?String(questionCount):'custom',chapterMode:'all',selectedChapters:[],timeMode:'untimed'};
 }
 testSetupState.selectedChapters=testSetupState.selectedChapters.filter(ch=>chapters.includes(ch));
 if(testSetupState.chapterMode==='selected'&&!testSetupState.selectedChapters.length)testSetupState.chapterMode='all';
 clampSetupQuestionCount(setupPoolSize());
}
function renderStart(){
 setSource(sourceFilter);
 const total=clean.length;
 if(total===0){app.innerHTML='<div class="wrap selection-wrap"><section class="card coming-card"><h2>No questions found for this selection</h2><p class="muted">This class and subject combination has no questions yet. Try another selection.</p><button class="btn" id="retrySelection">Change selection</button></section></div>';document.getElementById('retrySelection').onclick=()=>renderSelection('class');return;}
 prepareTestSetup(total);
 testSetupState.step=1;
 const classLabel=selectedClass==='both'?'Class 11 + 12':'Class '+selectedClass;
 app.innerHTML=`<div class="wrap selection-wrap test-setup-wrap"><header class="selection-header test-setup-header"><div class="brand"><p class="setup-eyebrow">${selectedExamLabel()} · ${subjectDisplayName(selectedSubject)} · ${classLabel}</p><h1>Build your test</h1><p>${total} usable previous-year questions available</p></div><div class="row test-setup-actions"><label class="small">Source <select id="sourceFilter"><option value="all">All years</option>${[...new Set(clean.filter(q=>q.year!==undefined&&q.year!==null&&q.year!=='').map(q=>String(q.year)))].sort((a,b)=>Number(b)-Number(a)).map(y=>'<option value="'+y+'">'+y+' only</option>').join('')+(clean.some(q=>q.year===undefined||q.year===null||q.year==='')?'<option value="unknown">Year not tagged</option>':'')}</select></label><button class="btn secondary" id="changeSelection">Change selection</button><button class="btn secondary" id="hist">History</button></div></header><div id="testSetupStep"></div></div>`;
 document.getElementById('sourceFilter').value=sourceFilter;
 document.getElementById('sourceFilter').onchange=e=>{setSource(e.target.value);renderStart()};
 document.getElementById('hist').onclick=()=>{historyReturn='custom';showHistory()};
 document.getElementById('changeSelection').onclick=()=>renderSelection('class');
 renderTestSetupStep();
 document.getElementById('setupHeading')?.focus();
}
function renderTestSetupStep(){
 if(!testSetupState)return;
 clampSetupQuestionCount(setupPoolSize());
 const total=clean.length,chapterPool=setupPoolSize(),questionPool=chapterPool||total,count=testSetupState.questionCount,step=testSetupState.step;
 const steps=['Questions','Chapters','Timing'];
 const progress=steps.map((name,index)=>`<div class="setup-progress-step ${index+1===step?'current':index+1<step?'complete':''}" role="listitem" ${index+1===step?'aria-current="step"':''}><span class="setup-step-number">${index+1}</span><span>${name}</span></div>`).join('');
 let content='';
 if(step===1){
  const presets=[['20','Quick practice'],['40','Focused practice'],['80','Full practice set']];
  const countHint=chapterPool?`${chapterPool} questions available in this chapter scope`:`Up to ${total} questions; choose chapters in the next step`;
  const countDescription=chapterPool?`Choose a test length between 1 and ${questionPool} questions.`:`Choose a test length, then select chapters on the next step. Up to ${questionPool} questions are available.`;
  content=`<h2 id="setupHeading" tabindex="-1">How many questions?</h2><p class="muted setup-description">${countDescription}</p><div class="setup-option-grid" role="group" aria-label="Question count presets">${presets.map(([value,description])=>`<button type="button" class="setup-choice ${testSetupState.questionChoice===value?'is-selected':''}" data-question-choice="${value}" aria-pressed="${testSetupState.questionChoice===value}" ${Number(value)>questionPool?'disabled':''}><span class="setup-choice-mark" aria-hidden="true"></span><span class="setup-choice-copy"><strong>${value} questions</strong><small>${description}</small></span></button>`).join('')}<button type="button" class="setup-choice ${testSetupState.questionChoice==='custom'?'is-selected':''}" data-question-choice="custom" aria-pressed="${testSetupState.questionChoice==='custom'}"><span class="setup-choice-mark" aria-hidden="true"></span><span class="setup-choice-copy"><strong>Custom length</strong><small>Choose your own</small></span></button></div><div class="setup-count-field"><label for="setupQuestionCount">Question count</label><input id="setupQuestionCount" type="number" min="1" max="${questionPool}" step="1" value="${count}" aria-describedby="setupCountHelp"><span id="setupCountHelp" class="small muted">${countHint}</span></div>`;
 }
 if(step===2){
  const chapterOptions=chapters.map((chapter,index)=>{const available=clean.filter(q=>chapterName(q)===chapter).length,selected=testSetupState.selectedChapters.includes(chapter);return `<label class="setup-chapter-option" for="setupChapter${index}"><input id="setupChapter${index}" type="checkbox" data-chapter-index="${index}" ${selected?'checked':''}><span class="setup-chapter-name">${chapter}</span><span class="setup-chapter-count">${available} available</span></label>`}).join('');
  const summary=testSetupState.chapterMode==='all'?`${count} questions · all ${chapters.length} chapters · ${total} available`:`${count} questions · ${testSetupState.selectedChapters.length} chapters selected · ${chapterPool} available`;
  content=`<h2 id="setupHeading" tabindex="-1">Which chapters?</h2><p class="muted setup-description">Use all chapters for a balanced mix, or choose only the ones you want to practise.</p><div class="setup-option-grid setup-chapter-modes" role="group" aria-label="Chapter scope"><button type="button" class="setup-choice ${testSetupState.chapterMode==='all'?'is-selected':''}" data-chapter-mode="all" aria-pressed="${testSetupState.chapterMode==='all'}"><span class="setup-choice-mark" aria-hidden="true"></span><span class="setup-choice-copy"><strong>All chapters</strong><small>Balanced across the available questions</small></span></button><button type="button" class="setup-choice ${testSetupState.chapterMode==='selected'?'is-selected':''}" data-chapter-mode="selected" aria-pressed="${testSetupState.chapterMode==='selected'}"><span class="setup-choice-mark" aria-hidden="true"></span><span class="setup-choice-copy"><strong>Choose chapters</strong><small>Focus on selected topics</small></span></button></div>${testSetupState.chapterMode==='selected'?`<div class="setup-chapter-toolbar"><span class="small muted">Select one or more chapters</span><div class="row"><button type="button" class="btn secondary" id="selectAllChapters">Select all</button><button type="button" class="btn secondary" id="clearChapters">Clear</button></div></div><div class="setup-chapter-list" aria-label="Available chapters">${chapterOptions}</div>`:''}<div class="setup-summary-note">${summary}</div>`;
 }
 if(step===3){
  const modes=[['untimed','Untimed','No countdown'],['1','1 min / question',`About ${count} minutes total`],['1.5','1.5 min / question',`About ${minutesForSetup(count,1.5)} minutes total`],['2','2 min / question',`About ${minutesForSetup(count,2)} minutes total`],['2.5','2.5 min / question',`About ${minutesForSetup(count,2.5)} minutes total`]];
  const duration=testSetupState.timeMode==='untimed'?'Untimed':`${minutesForSetup(count,Number(testSetupState.timeMode))} minutes`;
  const chapterSummary=testSetupState.chapterMode==='all'?'All chapters':testSetupState.selectedChapters.join(', ');
  content=`<h2 id="setupHeading" tabindex="-1">How much time?</h2><p class="muted setup-description">Choose a pace per question, or practise without a timer.</p><div class="setup-option-grid setup-time-options" role="group" aria-label="Time limit">${modes.map(([value,title,description])=>`<button type="button" class="setup-choice ${testSetupState.timeMode===value?'is-selected':''}" data-setup-time="${value}" aria-pressed="${testSetupState.timeMode===value}"><span class="setup-choice-mark" aria-hidden="true"></span><span class="setup-choice-copy"><strong>${title}</strong><small>${description}</small></span></button>`).join('')}</div><div class="setup-review" aria-label="Test summary"><div><span>Questions</span><strong>${count}</strong></div><div><span>Chapters</span><strong>${chapterSummary}</strong></div><div><span>Time limit</span><strong>${duration}</strong></div></div><p class="small muted setup-timer-note">Timed tests submit automatically when time runs out.</p>`;
 }
 const continueDisabled=step===2&&testSetupState.chapterMode==='selected'&&!testSetupState.selectedChapters.length;
 document.getElementById('testSetupStep').innerHTML=`<section class="card selection-card test-setup-card" aria-labelledby="setupHeading"><div class="setup-progress" role="list" aria-label="Test setup progress">${progress}</div><p class="small muted setup-step-label">Step ${step} of 3</p>${content}<div class="setup-navigation"><button type="button" class="btn secondary" id="setupBack" ${step===1?'disabled':''}>Back</button><button type="button" class="btn" id="setupContinue" ${continueDisabled?'disabled':''}>${step===3?'Start test':'Continue'}</button></div>${continueDisabled?'<p class="small muted setup-validation">Select at least one chapter to continue.</p>':''}</section>`;
 document.getElementById('setupBack').onclick=()=>{if(testSetupState.step>1){testSetupState.step--;renderTestSetupStep();document.getElementById('setupHeading')?.focus()}};
 document.getElementById('setupContinue').onclick=()=>{
  if(testSetupState.step===1){const input=document.getElementById('setupQuestionCount');if(!input.checkValidity()){input.reportValidity();return}testSetupState.questionCount=Math.max(1,Math.min(questionPool,Math.floor(Number(input.value)||1)));preferredQuestionCount=testSetupState.questionCount}
  if(testSetupState.step===2&&testSetupState.chapterMode==='selected'&&!testSetupState.selectedChapters.length)return;
  if(testSetupState.step<3){testSetupState.step++;renderTestSetupStep();document.getElementById('setupHeading')?.focus();return}
  const selectedPool=setupPoolSize();if(!selectedPool)return;
  clampSetupQuestionCount(selectedPool);
  const questions=selectQuestions(testSetupState.questionCount,setupChapterScope());
  if(!questions.length){alert('No questions are available for this selection.');return}
  startTest(questions,testSetupState.timeMode==='untimed'?null:Number(testSetupState.timeMode));
 };
 document.querySelectorAll('[data-question-choice]').forEach(button=>button.onclick=()=>{
  if(button.dataset.questionChoice==='custom'){testSetupState.questionChoice='custom';document.querySelectorAll('[data-question-choice]').forEach(x=>{const active=x.dataset.questionChoice==='custom';x.classList.toggle('is-selected',active);x.setAttribute('aria-pressed',String(active))});document.getElementById('setupQuestionCount').focus();return}
  testSetupState.questionCount=Math.min(questionPool,Number(button.dataset.questionChoice));testSetupState.questionChoice=button.dataset.questionChoice;preferredQuestionCount=testSetupState.questionCount;renderTestSetupStep();document.querySelector(`[data-question-choice="${testSetupState.questionChoice}"]`)?.focus();
 });
 const countInput=document.getElementById('setupQuestionCount');
 if(countInput)countInput.oninput=()=>{
  const value=Number(countInput.value);if(!countInput.checkValidity()||!Number.isInteger(value))return;
  testSetupState.questionCount=value;testSetupState.questionChoice=[20,40,80].includes(value)?String(value):'custom';preferredQuestionCount=value;
  document.querySelectorAll('[data-question-choice]').forEach(button=>{const active=button.dataset.questionChoice===testSetupState.questionChoice;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active))});
 };
 document.querySelectorAll('[data-chapter-mode]').forEach(button=>button.onclick=()=>{testSetupState.chapterMode=button.dataset.chapterMode;clampSetupQuestionCount(setupPoolSize());renderTestSetupStep();document.querySelector(`[data-chapter-mode="${testSetupState.chapterMode}"]`)?.focus()});
 document.querySelectorAll('[data-chapter-index]').forEach(input=>input.onchange=()=>{const index=Number(input.dataset.chapterIndex),chapter=chapters[index],selected=new Set(testSetupState.selectedChapters);if(input.checked)selected.add(chapter);else selected.delete(chapter);testSetupState.selectedChapters=[...selected];clampSetupQuestionCount(setupPoolSize());renderTestSetupStep();document.querySelector(`[data-chapter-index="${index}"]`)?.focus()});
 const setChapterSelection=selected=>{testSetupState.selectedChapters=selected;clampSetupQuestionCount(setupPoolSize());renderTestSetupStep()};
 document.getElementById('selectAllChapters')?.addEventListener('click',()=>{setChapterSelection([...chapters]);document.getElementById('selectAllChapters')?.focus()});
 document.getElementById('clearChapters')?.addEventListener('click',()=>{setChapterSelection([]);document.getElementById('clearChapters')?.focus()});
 document.querySelectorAll('[data-setup-time]').forEach(button=>button.onclick=()=>{testSetupState.timeMode=button.dataset.setupTime;renderTestSetupStep();document.querySelector(`[data-setup-time="${testSetupState.timeMode}"]`)?.focus()});
}
function minutesForSetup(count,minutesPerQuestion){const minutes=count*minutesPerQuestion;return Number.isInteger(minutes)?String(minutes):String(Number(minutes.toFixed(1)))}
function startTest(qs,minutesPerQuestion=null){if(timerHandle){clearInterval(timerHandle);timerHandle=null}const limitSeconds=minutesPerQuestion?Math.round(qs.length*minutesPerQuestion*60):null;state={qs,index:0,answers:Array(qs.length).fill(''),review:Array(qs.length).fill(false),spent:Array(qs.length).fill(0),last:Date.now(),started:Date.now(),submitted:false,minutesPerQuestion,limitSeconds,deadline:limitSeconds?Date.now()+limitSeconds*1000:null,examPreset:activePreset};persistActiveTest();renderTest()}
function startNewTestFlow(){state=null;activePreset=null;presetSetupState=null;testSetupState=null;selectedSubject='Physics';selectedPair='';sourceFilter='all';setSource('all');renderSelection('class')}
function addSpent(){if(!state)return;const now=Date.now();state.spent[state.index]+=Math.max(0,Math.round((now-state.last)/1000));state.last=now}
window.addEventListener('pagehide',()=>{if(!state||state.submitted)return;addSpent();persistActiveTest()});
function renderTest(focusId=''){const q=state.qs[state.index];app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>${state.examPreset?`${EXAM_PRESETS[state.examPreset].formatLabel||EXAM_PRESETS[state.examPreset].label} Full-Length Test`:`${selectedExamLabel()} ${subjectDisplayName(selectedSubject)} | ${selectedClass==='both'?'Class 11 + 12':'Class '+selectedClass} Mock`}</h1><p>Question ${state.index+1} of ${state.qs.length} · ${subjectDisplayName(q.subject)} · PYQ ${q.year||'Year not tagged'} · ${q.chapter}</p></div><div class="badge" id="timerBadge">${state.limitSeconds?'Time left: '+fmt(Math.floor(Math.max(0,state.deadline-Date.now())/60000))+':'+String(Math.floor(Math.max(0,state.deadline-Date.now())/1000)%60).padStart(2,'0'):'UNTIMED'}</div></div><div class="test-progress" role="progressbar" aria-label="Test progress" aria-valuemin="1" aria-valuemax="${state.qs.length}" aria-valuenow="${state.index+1}" aria-valuetext="Question ${state.index+1} of ${state.qs.length}"><span style="width:${((state.index+1)/state.qs.length)*100}%"></span></div><div class="test"><main class="card"><div class="qmeta"><div><span class="badge">${subjectDisplayName(q.subject)}</span> <span class="badge">${q.chapter}</span> <span class="badge">${q.year||'Year not tagged'} PYQ · Q${q.question_no}</span>${q.out_of_syllabus?'<span class="badge">Out of syllabus</span>':''}</div><span class="muted small">Source PDF page ${q.source_page}</span><span id="saveStatus" class="save-status" role="status">Saving progress…</span></div><img class="qimg" src="${q.image}" alt="Question ${state.index+1}"><div class="answerbox"><label class="small muted">${answerLabel(q)}</label>${isMcq(q)?`<div class="option-buttons" role="group" aria-label="Answer options">${optionLabels(q).map((label,i)=>{const selected=isMultiSelect(q)?answerParts(state.answers[state.index]).includes(label):optionIndex(state.answers[state.index])===i;return `<button type="button" id="option-${label}" class="option-btn ${selected?'selected':''}" data-option="${label}" aria-pressed="${selected}">${label}</button>`}).join('')}</div>${isMultiSelect(q)?'<p class="small muted">Multiple answers may be selected.</p>':''}`:`<input id="ans" type="number" ${isIntegerQuestion(q)?'step="1"':'step="any"'} inputmode="decimal" autocomplete="off" value="${state.answers[state.index]||''}" placeholder="Enter number">`}</div><div class="row section"><button class="btn secondary" id="prev" ${state.index===0?'disabled':''}>Previous</button><button class="btn secondary" id="clear">Clear</button><button class="btn secondary" id="review">${state.review[state.index]?'Unmark review':'Mark for review'}</button><button class="btn" id="next">${state.index===state.qs.length-1?'Finish':'Next'}</button></div></main><aside class="card"><h3>Question palette</h3><div class="palette">${state.qs.map((x,i)=>`<button class="pbtn ${i===state.index?'current':''} ${state.answers[i]!==''?'answered':''} ${state.review[i]?'review':''}" data-i="${i}" aria-label="Question ${i+1}" aria-current="${i===state.index}">${i+1}</button>`).join('')}</div><div class="legend"><span><i class="dot" style="background:#1a5a42"></i>Answered</span><span><i class="dot" style="background:#ffc857"></i>Review</span></div><hr style="border-color:var(--border);border-width:1px 0 0;margin:16px 0"><button class="btn danger" id="submit">Submit test</button><p class="muted small">Do not submit until you are ready. Answers are hidden until submission.</p></aside></div></div>`;
 persistActiveTest();
 if(timerHandle){clearInterval(timerHandle);timerHandle=null}if(state.limitSeconds&&!state.submitted){timerHandle=setInterval(()=>{if(!state||state.submitted){clearInterval(timerHandle);timerHandle=null;return}const left=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));const el=document.getElementById('timerBadge');if(el)el.textContent='Time left: '+fmt(Math.floor(left/60))+':'+String(left%60).padStart(2,'0');if(left<=0){clearInterval(timerHandle);timerHandle=null;submitTest(true)}},250)}const inp=document.getElementById('ans');if(inp){(document.getElementById(focusId)||inp).focus();inp.oninput=e=>{state.answers[state.index]=e.target.value;persistActiveTest()}}else{const focusTarget=document.getElementById(focusId)||document.querySelector('.option-btn');if(focusTarget)focusTarget.focus()}document.querySelectorAll('.option-btn').forEach(b=>b.onclick=()=>{const q=state.qs[state.index],label=b.dataset.option;if(isMultiSelect(q)){const selected=answerParts(state.answers[state.index]);state.answers[state.index]=selected.includes(label)?selected.filter(x=>x!==label).sort().join(','):[...selected,label].sort().join(',')}else{state.answers[state.index]=label}renderTest('option-'+label)});
 document.getElementById('prev').onclick=()=>{addSpent();if(state.index>0){state.index--;state.last=Date.now();renderTest()}};
 document.getElementById('next').onclick=()=>{addSpent();if(state.index===state.qs.length-1)submitTest(false);else{state.index++;state.last=Date.now();renderTest()}};
 document.getElementById('clear').onclick=()=>{state.answers[state.index]='';renderTest()};
 document.getElementById('review').onclick=()=>{state.review[state.index]=!state.review[state.index];renderTest('review')};
 document.querySelectorAll('.pbtn').forEach(b=>b.onclick=()=>{addSpent();state.index=+b.dataset.i;state.last=Date.now();renderTest()});
 document.getElementById('submit').onclick=()=>{if(confirm('Submit the test now? You will see the answer key and analysis after submission.'))submitTest(false)};
}
function submitTest(auto){if(state.submitted)return;if(timerHandle){clearInterval(timerHandle);timerHandle=null}addSpent();state.submitted=true;const rows=state.qs.map((q,i)=>{const unscored=isUnscored(q),ok=!unscored&&sameQuestionAnswer(state.answers[i],q);return {...q,user:Array.isArray(state.answers[i])?state.answers[i].join(','):state.answers[i],ok,unscored,spent:state.spent[i]}});const scored=rows.filter(x=>!x.unscored),correct=scored.filter(x=>x.ok).length,attempted=scored.filter(x=>norm(x.user)!=='').length,wrong=attempted-correct,score=correct*4-wrong;const result={date:new Date().toISOString(),examPreset:state.examPreset??null,examLabel:state.examPreset?(EXAM_PRESETS[state.examPreset].formatLabel||EXAM_PRESETS[state.examPreset].label):null,score,correct,wrong,unattempted:scored.length-attempted,accuracy:attempted?correct/attempted:0,attemptRate:scored.length?attempted/scored.length:0,minutesPerQuestion:state.minutesPerQuestion??null,timeLimitSeconds:state.limitSeconds??null,timeExpired:!!auto,ids:rows.map(x=>x.id),questionKeys:rows.map(questionIdentity),rows};saveHistory(result);try{localStorage.removeItem(ACTIVE_TEST_KEY)}catch{}renderResults(result,auto)}
function renderResults(r,auto,reviewAll=false,fromHistory=false){const by={};r.rows.forEach(x=>{by[x.chapter]??={a:0,c:0,w:0,u:0,s:0,unscored:0};if(x.unscored){by[x.chapter].unscored++;return}by[x.chapter].a++;if(x.user==='')by[x.chapter].u++;else if(x.ok)by[x.chapter].c++;else by[x.chapter].w++;by[x.chapter].s+=x.ok?4:(x.user===''?0:-1)});const mistakes=r.rows.filter(x=>!x.ok&&!x.unscored);const unscored=r.rows.filter(x=>x.unscored);const reviewRows=reviewAll?r.rows:mistakes;app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>Test Analysis</h1><p>${r.examLabel?`${r.examLabel} preset · 3-hour timer${r.timeExpired?' · Time expired':''}`:r.minutesPerQuestion?`Timed test · ${r.minutesPerQuestion} min/question${r.timeExpired?' · Time expired':''}`:'Untimed test'} · ${new Date(r.date).toLocaleString()}</p></div>${fromHistory?'<button class="btn secondary" onclick="showHistory()">Back to history</button>':'<button class="btn" onclick="startNewTestFlow()">New test</button>'}</div><div class="card"><div class="resultgrid"><div class="stat"><span class="muted">Score</span><b>${r.score}</b><span class="muted">/ ${r.rows.filter(x=>!x.unscored).length*4}</span></div><div class="stat"><span class="muted">Correct</span><b class="good">${r.correct}</b></div><div class="stat"><span class="muted">Wrong</span><b class="bad">${r.wrong}</b></div><div class="stat"><span class="muted">Unattempted</span><b>${r.unattempted}</b></div></div><p class="small muted">Unscored: ${unscored.length} question(s) had missing or uncertain answer keys.</p><div class="stats section"><div class="stat"><span class="muted">Accuracy</span><b>${(r.accuracy*100).toFixed(1)}%</b></div><div class="stat"><span class="muted">Attempt rate</span><b>${(r.attemptRate*100).toFixed(1)}%</b></div><div class="stat"><span class="muted">Avg time/Q</span><b>${Math.round(r.rows.reduce((a,x)=>a+x.spent,0)/r.rows.length)}s</b></div><div class="stat"><span class="muted">Time used</span><b>${Math.floor(r.rows.reduce((a,x)=>a+x.spent,0)/60)}m</b></div></div></div><div class="card section"><h2>Chapter performance</h2><table class="table"><tr><th>Chapter</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Score</th></tr>${Object.entries(by).map(([c,v])=>`<tr><td>${c}</td><td>${v.a-v.u}</td><td class="good">${v.c}</td><td class="bad">${v.w}</td><td>${v.a-v.u?((v.c/(v.a-v.u))*100).toFixed(1):'0.0'}%</td><td>${v.s}</td></tr>`).join('')}</table></div><div class="card section"><h2>${reviewAll?'Answer Review — All Questions':`Incorrect & skipped questions (${mistakes.length})`}</h2>${reviewRows.length?reviewRows.map((x)=>`<div class="mistake"><div class="row" style="justify-content:space-between"><b>Q${r.rows.indexOf(x)+1} · ${x.chapter}</b><span class="badge">${x.unscored?'Not scored':x.user===''?'Unattempted':x.ok?'Correct':'Incorrect'}${x.out_of_syllabus?' · Out of syllabus':''} · ${x.year||'Year not tagged'} PYQ · source p.${x.source_page}</span></div><p class="small"><b>Your answer:</b> ${x.user||'Not attempted'} · <b>Correct:</b> ${x.answer??'Not scored — source key says no option match'}</p><p class="small muted">Time: ${x.spent}s · Original PYQ image for reviewing the question and diagram.</p><img src="${x.image}"></div>`).join(''):'<p class="muted">Perfect attempt — nothing to review here.</p>'}</div><div class="card section"><h2>Quick diagnosis</h2><p>${diagnosis(by,r)}</p></div></div>`}
function diagnosis(by,r){const arr=Object.entries(by).map(([c,v])=>({c,acc:(v.a-v.u)?v.c/(v.a-v.u):1,wrong:v.w})).sort((a,b)=>a.acc-b.acc);const slow=[...r.rows].sort((a,b)=>b.spent-a.spent).slice(0,3);let s=`You attempted ${r.correct+r.wrong}/${r.rows.length} questions. `;if(arr.length)s+=`Lowest chapter accuracy: <b>${arr[0].c}</b> (${(arr[0].acc*100).toFixed(1)}%). `;if(slow[0])s+=`Longest individual time: <b>Q${r.rows.indexOf(slow[0])+1}</b> at ${slow[0].spent}s (${slow[0].chapter}).`;return s}
function returnFromHistory(){if(historyReturn==='preset'&&activePreset){renderPresetSetup();return}if(historyReturn==='selection'){renderSelection('class');return}activePreset=null;renderStart()}
function openHistoryResult(index,mode){const r=readTestHistory()[index];if(!r)return;renderResults(r,false,mode==='review',true)} function showHistory(){const h=readTestHistory();app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>Mock History</h1><p>Stored locally in this browser.</p></div><button class="btn secondary" onclick="returnFromHistory()">Back</button></div><div class="card">${h.length?h.map((r,i)=>`<div class="history-item">${r.examLabel?`<b>${r.examLabel}</b> · `:''}<b>Test ${h.length-i}</b> · ${new Date(r.date).toLocaleString()}<br><span class="muted">Score ${r.score}/${r.rows.filter(x=>!x.unscored).length*4} · Accuracy ${(r.accuracy*100).toFixed(1)}% · ${r.correct} correct · ${r.wrong} wrong · ${r.unattempted} unattempted</span><div class="row history-actions"><button class="btn secondary" data-history-index="${i}" data-history-mode="analysis">View analysis</button><button class="btn" data-history-index="${i}" data-history-mode="review">Review answers</button></div></div>`).join(''):'<p class="muted">No tests yet.</p>'}</div></div>`;document.querySelectorAll('[data-history-index]').forEach(b=>b.onclick=()=>openHistoryResult(Number(b.dataset.historyIndex),b.dataset.historyMode))}
const restoredActiveTest=restoreActiveTest();
if(!restoredActiveTest)app.innerHTML='<div class="wrap selection-wrap"><section class="card coming-card" role="status"><h2>Loading question bank</h2><p class="muted">Connecting to the question database...</p></section></div>';
window.JEE_BANK_READY.then(questions=>{
 allQuestions=uniqueQuestions(questions);
 if(!allQuestions.length)throw new Error('The question database returned no records.');
 if(restoredActiveTest)setSource(sourceFilter);
 else{setSource('all');renderSelection('class')}
}).catch(error=>{
 console.error('Unable to load the Supabase question bank:',error);
 if(restoredActiveTest)return;
 app.innerHTML='<div class="wrap selection-wrap"><section class="card coming-card"><h2>Question bank unavailable</h2><p class="muted">The app could not load questions from Supabase. Check your connection and try again.</p><button class="btn" id="retryBank">Retry</button></section></div>';
 document.getElementById('retryBank').onclick=()=>location.reload();
});


/* Persistent user-selectable color themes */
const THEME_KEY='jeeSimulatorTheme';
const THEMES=[
 {value:'light',label:'Light'},
 {value:'paper',label:'Warm Paper'},
 {value:'dark',label:'Charcoal Dark'},
 {value:'black',label:'Pure Black'},
 {value:'midnight',label:'Midnight Blue'},
 {value:'evergreen',label:'Forest Dark'}
];
function applyTheme(theme){
 const valid=THEMES.some(t=>t.value===theme)?theme:'paper';
 document.documentElement.dataset.theme=valid;
 const picker=document.getElementById('themePicker');
 if(picker)picker.value=valid;
}
function initThemePicker(){
 const saved=localStorage.getItem(THEME_KEY)||'paper';
 applyTheme(saved);
 if(document.getElementById('themePicker'))return;
 const wrap=document.createElement('div');
 wrap.className='theme-picker';
 wrap.innerHTML='<label for="themePicker">Theme</label><select id="themePicker" aria-label="Choose color scheme">'+
  '<optgroup label="Light themes">'+THEMES.filter(t=>t.value==='light'||t.value==='paper').map(t=>'<option value="'+t.value+'">'+t.label+'</option>').join('')+'</optgroup>'+
  '<optgroup label="Dark themes">'+THEMES.filter(t=>!['light','paper'].includes(t.value)).map(t=>'<option value="'+t.value+'">'+t.label+'</option>').join('')+'</optgroup>'+
  '</select>';
 document.body.appendChild(wrap);
 const picker=wrap.querySelector('select');
 picker.value=document.documentElement.dataset.theme||'paper';
 picker.onchange=()=>{
  const next=picker.value;
  localStorage.setItem(THEME_KEY,next);
  applyTheme(next);
 };
}
initThemePicker();
