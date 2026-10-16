const app=document.getElementById('app');
const KEY='jeePhysicsMockHistoryV1';
let state=null;
let timerHandle=null;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const allQuestions=QUESTIONS;
let selectedClass='11th';
let selectedSubject='Physics';
const subjectAllowed=q=>(q.subject||'Physics')===selectedSubject;
const classAllowed=q=>selectedClass==='11th' ? (q.class||11)===11 : selectedClass==='12th' ? q.class===12 : true;
const allClean=allQuestions.filter(q=>subjectAllowed(q)&&classAllowed(q)&&(!q.flagged||q.class===12));
let sourceFilter='all';
let clean=allClean;
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
let chapters=[...new Set(clean.map(chapterName))];
function setSource(v){
 sourceFilter=v;
 clean=allQuestions.filter(q=>subjectAllowed(q)&&classAllowed(q)&&(!q.flagged||q.class===12)&&(sourceFilter==='all'||String(q.year||2025)===sourceFilter));
 chapters=[...new Set(clean.map(chapterName))];
}
const fmt=n=>String(Math.max(0,n)).padStart(2,'0');
function history(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function saveHistory(x){const h=history();h.unshift(x);localStorage.setItem(KEY,JSON.stringify(h.slice(0,10)))}
function norm(s){return String(s??'').trim().replace(/\s+/g,'').replace(/,/g,'').toLowerCase()}
function sameAns(a,b){const x=norm(a),y=norm(b);if(x===y)return true;const nx=Number(x),ny=Number(y);return Number.isFinite(nx)&&Number.isFinite(ny)&&Math.abs(nx-ny)<1e-9}
function isMcq(q){return q.type==='mcq'}
function isIntegerQuestion(q){return q.type==='integer'}
function optionIndex(v){const s=norm(v);if(/^[a-d]$/.test(s))return s.charCodeAt(0)-97;if(/^[1-4]$/.test(s))return Number(s)-1;return null}
function optionLabels(q){return /^[1-4]$/.test(norm(q.answer))?['1','2','3','4']:['A','B','C','D']}
function sameQuestionAnswer(user,q){if(isMcq(q)){const a=optionIndex(user),b=optionIndex(q.answer);if(a!==null&&b!==null)return a===b;return false}return sameAns(user,q.answer)}
function answerLabel(q){return isMcq(q)?'Select one option':'Enter your numerical answer'}

function selectQuestions(n=80){
 const used=new Set((history()[0]?.ids)||[]);
 const pools=chapters.map(ch=>({ch,pool:clean.filter(q=>chapterName(q)===ch&&!used.has(q.id))}));
 // Fall back to the full chapter pool when avoiding the previous paper would leave too few questions.
 pools.forEach(x=>{if(x.pool.length===0)x.pool=clean.filter(q=>chapterName(q)===x.ch)});
 const totalPool=pools.reduce((a,x)=>a+x.pool.length,0);
 n=Math.max(1,Math.min(n,totalPool));
 const counts=Object.fromEntries(chapters.map(c=>[c,0]));
 const exact=pools.map(x=>({ch:x.ch,raw:n*x.pool.length/totalPool,base:Math.floor(n*x.pool.length/totalPool),frac:(n*x.pool.length/totalPool)%1}));
 exact.forEach(x=>counts[x.ch]=x.base);
 let left=n-exact.reduce((a,x)=>a+x.base,0);
 exact.sort((a,b)=>b.frac-a.frac);
 for(let i=0;i<left;i++)counts[exact[i%exact.length].ch]++;
 let out=[];
 for(const x of pools){let pool=x.pool;const take=Math.min(counts[x.ch],pool.length);out.push(...shuffle(pool).slice(0,take));}
 // If rounding/caps left us short, fill from remaining unique questions.
 if(out.length<n){const ids=new Set(out.map(q=>q.id));const rest=shuffle(clean.filter(q=>!ids.has(q.id)&&!used.has(q.id)));out.push(...rest.slice(0,n-out.length));}
 return shuffle(out.slice(0,n));
}
/* Entry flow: choose class, then subject. */
let selectedPair='';
function renderSelection(step){
 step=step||'class';
 const classes=[['11th','Class 11','Build your Class 11 JEE practice'],['12th','Class 12','Practice Class 12 Physics PYQs'],['both','Both classes','Practice across Class 11 and Class 12']];
 const subjects=[['Physics','Physics','⚛'],['Chemistry','Chemistry','◈'],['Maths','Mathematics','∑'],['any2','Any 2 subjects','＋'],['all','All subjects','✦']];
 const pairs=[['physics-chemistry','Physics + Chemistry'],['chemistry-maths','Chemistry + Maths'],['physics-maths','Physics + Maths']];
 let body='';
 if(step==='class') body=classes.map(x=>'<button class="choice-card" data-class="'+x[0]+'"><span class="choice-title">'+x[1]+'</span><span class="choice-desc">'+x[2]+'</span><span class="choice-arrow">Continue →</span></button>').join('');
 if(step==='subject') body=subjects.map(x=>'<button class="choice-card" data-subject="'+x[0]+'"><span class="choice-symbol">'+x[2]+'</span><span class="choice-title">'+x[1]+'</span><span class="choice-arrow">Select →</span></button>').join('');
 if(step==='pair') body=pairs.map(x=>'<button class="choice-card" data-pair="'+x[0]+'"><span class="choice-title">'+x[1]+'</span><span class="choice-arrow">Continue →</span></button>').join('');
 const heading=step==='class'?'Choose your class':step==='subject'?'Choose your subjects':'Choose your subject combination';
 const sub=step==='class'?'Start by selecting the syllabus you want to practise.':step==='subject'?'You can change this later and return to this menu.':'Select the two subjects you want to practise together.';
 const back=step==='class'?'':'<button class="btn secondary" id="selectionBack">Back</button>';
 app.innerHTML='<div class="wrap selection-wrap"><header class="selection-header"><div class="brand"><p class="eyebrow">JEE TEST GENERATOR</p><h1>Your practice. Your way.</h1><p>Personalize your question practice before you begin.</p></div><div class="selection-step">'+(step==='class'?'STEP 1 OF 2':step==='subject'?'STEP 2 OF 2':'SUBJECT COMBINATION')+'</div></header><section class="card selection-card"><div class="selection-heading"><div><p class="eyebrow">SET UP YOUR SESSION</p><h2>'+heading+'</h2><p class="muted">'+sub+'</p></div>'+back+'</div><div class="choice-grid '+(step==='subject'?'subject-grid':'')+'">'+body+'</div><p class="selection-footnote">Your selection only changes this practice session.</p></section></div>';
 if(step!=='class')document.getElementById('selectionBack').onclick=()=>renderSelection(step==='pair'?'subject':'class');
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{selectedClass=b.dataset.class;setSource(sourceFilter);renderSelection('subject')});
 document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{
  selectedSubject=b.dataset.subject;
  if(selectedSubject==='any2'){renderSelection('pair');return}
  if(selectedSubject==='Physics'||selectedSubject==='Chemistry'){if(selectedSubject==='Chemistry'&&selectedClass==='11th'){renderComingSoon('Chemistry','The Chemical Kinetics question bank is Class 12. Choose Class 12 or Both classes to practise it.');return;}setSource('all');renderStart();return;}
  renderComingSoon(selectedSubject==='all'?'All Subjects':selectedSubject==='Maths'?'Mathematics':'Chemistry','This section is under maintenance and will be available soon.');
 });
 document.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{selectedPair=b.dataset.pair;renderComingSoon(b.querySelector('.choice-title').textContent,'This subject combination is under maintenance and will be available soon.')});
}
function renderComingSoon(title,message){
 app.innerHTML='<div class="wrap selection-wrap"><header class="selection-header"><div class="brand"><p class="eyebrow">JEE TEST GENERATOR</p><h1>'+title+'</h1><p>'+(selectedClass==='both'?'Class 11 + Class 12':'Class '+selectedClass)+' · '+title+'</p></div></header><section class="card coming-card"><div class="coming-mark">✦</div><p class="eyebrow">IN DEVELOPMENT</p><h2>Under maintenance.</h2><p class="muted">'+message+'</p><p class="coming-note">We’re working on this section. Please check back soon.</p><div class="row coming-actions"><button class="btn" id="chooseAgain">Choose another option</button><button class="btn secondary" id="backHome">Back to home</button></div></section></div>';
 document.getElementById('chooseAgain').onclick=()=>renderSelection('class');
 document.getElementById('backHome').onclick=()=>{selectedClass='11th';selectedSubject='Physics';setSource('all');renderSelection('class')};
}

function renderStart(){
 setSource(sourceFilter);
 const total=clean.length;
 app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>JEE Main ${selectedSubject} — ${selectedClass==='both'?'Class 11 + 12':'Class '+selectedClass} PYQ Simulator</h1><p>JEE Main ${selectedSubject} PYQ bank · ${total} usable ${selectedClass==='both'?'Class 11 + 12':selectedClass==='12th'?'Class 12':'Class 11'} questions</p></div><div class="row"><label class="small">Source <select id="sourceFilter"><option value="all">All years</option>${[...new Set(clean.map(q=>String(q.year||2025)))].sort((a,b)=>Number(b)-Number(a)).map(y=>'<option value="'+y+'">'+y+' only</option>').join('')}</select></label><button class="btn secondary" id="changeSelection">Change selection</button><button class="btn secondary" id="hist">History</button></div></div>
 <div class="grid"><div class="card"><h2>Build your test</h2><div class="stats"><div class="stat"><span class="muted">Questions</span><b id="previewN">80</b></div><div class="stat"><span class="muted">Time limit</span><b id="timePreview">Untimed</b></div><div class="stat"><span class="muted">Scoring</span><b>+4 / −1</b></div><div class="stat"><span class="muted">Pool</span><b>${total}</b></div></div><p class="muted">Choose your question count and time limit. Timed tests submit automatically when time runs out. The paper remains PYQ-only and is selected proportionally across the available chapters.</p><div class="row"><label>Number of questions <input id="mainQn" type="number" min="1" max="${total}" value="80"></label><button class="btn" id="start">Start test</button><button class="btn secondary" id="custom">Choose chapters</button></div><div class="section"><b>Time limit</b><div class="row time-options" id="timeOptions"><button type="button" class="btn secondary" data-time-mode="untimed">Untimed</button><button type="button" class="btn secondary" data-time-mode="1">1 min/question</button><button type="button" class="btn secondary" data-time-mode="1.5">1.5 min/question</button><button type="button" class="btn secondary" data-time-mode="2">2 min/question</button><button type="button" class="btn secondary" data-time-mode="2.5">2.5 min/question</button></div></div><div class="section"><h3>Current distribution preview</h3><table class="dist"><tr><th>Chapter</th><th>Q</th><th>Pool</th><th></th></tr>${chapters.map(c=>`<tr><td>${c}</td><td><b class="dcount" data-ch="${c}">—</b></td><td>${clean.filter(q=>chapterName(q)===c).length}</td><td><div class="bar"><span></span></div></td></tr>`).join('')}</table></div></div>
 <div class="card"><h2>What you get</h2><ul class="muted"><li>Original PYQ question images — diagrams preserved</li><li>Choose any test length from 1 to ${total}</li><li>Choose untimed or 1, 1.5, 2, or 2.5 minutes per question</li><li>Randomized paper and question order</li><li>Answer + mark-for-review palette</li><li>Post-test chapter analysis</li><li>Incorrect/skipped question review</li><li>Local history for your previous mocks</li></ul><h3>Source flags</h3><p class="small muted">Class 12 questions with an uncertain answer-key entry remain available for practice but are excluded from scoring.</p></div></div></div>`;
 const updatePreview=()=>{const n=Math.max(1,Math.min(total,+document.getElementById('mainQn').value||80));document.getElementById('previewN').textContent=n;const weights=chapters.map(c=>({c,p:clean.filter(q=>chapterName(q)===c).length}));const sum=weights.reduce((a,x)=>a+x.p,0);const counts=Object.fromEntries(weights.map(x=>[x.c,Math.floor(n*x.p/sum)]));let left=n-Object.values(counts).reduce((a,b)=>a+b,0);weights.sort((a,b)=>(n*b.p/sum)%1-(n*a.p/sum)%1);for(let i=0;i<left;i++)counts[weights[i%weights.length].c]++;document.querySelectorAll('.dcount').forEach(e=>e.textContent=counts[e.dataset.ch]||0)};
 document.getElementById('sourceFilter').value=sourceFilter;
 document.getElementById('sourceFilter').onchange=e=>{setSource(e.target.value);renderStart()};
 let selectedTimeMode='untimed';const updateTimePreview=()=>{const n=Math.max(1,+document.getElementById('mainQn').value||80);document.getElementById('timePreview').textContent=selectedTimeMode==='untimed'?'Untimed':(+selectedTimeMode*n).toFixed(selectedTimeMode==='1.5'||selectedTimeMode==='2.5'?1:0)+' min';document.querySelectorAll('[data-time-mode]').forEach(b=>{const active=b.dataset.timeMode===selectedTimeMode;b.className='btn '+(active?'':'secondary')})};document.querySelectorAll('[data-time-mode]').forEach(b=>b.onclick=()=>{selectedTimeMode=b.dataset.timeMode;updateTimePreview()});document.getElementById('mainQn').oninput=()=>{updatePreview();updateTimePreview()};updateTimePreview();updatePreview();
 document.getElementById('start').onclick=()=>{const n=Math.max(1,Math.min(total,+document.getElementById('mainQn').value||80));startTest(selectQuestions(n),selectedTimeMode==='untimed'?null:Number(selectedTimeMode))};
 document.getElementById('custom').onclick=customModal;
 document.getElementById('hist').onclick=showHistory;
 document.getElementById('changeSelection').onclick=()=>renderSelection('class');
}
function customModal(){
 let customTimeMode='untimed';app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>Custom Test</h1><p>Choose chapters, question count, and an optional time limit.</p></div><button class="btn secondary" onclick="renderStart()">Back</button></div><div class="card"><div class="row"><label>Questions <input id="qn" type="number" min="1" max="${clean.length}" value="40"></label><div class="section"><b>Time limit</b><div class="row time-options" id="customTimeOptions"><button type="button" class="btn" data-custom-time="untimed">Untimed</button><button type="button" class="btn secondary" data-custom-time="1">1 min/question</button><button type="button" class="btn secondary" data-custom-time="1.5">1.5 min/question</button><button type="button" class="btn secondary" data-custom-time="2">2 min/question</button><button type="button" class="btn secondary" data-custom-time="2.5">2.5 min/question</button></div></div></div><div class="section">${chapters.map((c,i)=>`<label style="display:block;margin:10px 0"><input type="checkbox" class="ch" value="${i}"> ${c} <span class="muted small">(${clean.filter(q=>chapterName(q)===c).length})</span></label>`).join('')}</div><button class="btn" id="go">Create test</button></div></div>`;
 document.querySelectorAll('[data-custom-time]').forEach(b=>b.onclick=()=>{customTimeMode=b.dataset.customTime;document.querySelectorAll('[data-custom-time]').forEach(x=>x.className='btn '+(x===b?'':'secondary'))});document.getElementById('go').onclick=()=>{const sel=[...document.querySelectorAll('.ch:checked')].map(x=>chapters[+x.value]);if(!sel.length){alert('Select at least one chapter.');return}let pool=clean.filter(q=>sel.includes(chapterName(q)));const n=Math.max(1,Math.min(pool.length,+document.getElementById('qn').value||40));const chosen=shuffle(pool).slice(0,n);startTest(chosen,customTimeMode==='untimed'?null:Number(customTimeMode))};
}
function startTest(qs,minutesPerQuestion=null){if(timerHandle){clearInterval(timerHandle);timerHandle=null}const limitSeconds=minutesPerQuestion?Math.round(qs.length*minutesPerQuestion*60):null;state={qs,index:0,answers:Array(qs.length).fill(''),review:Array(qs.length).fill(false),spent:Array(qs.length).fill(0),last:Date.now(),started:Date.now(),submitted:false,minutesPerQuestion,limitSeconds,deadline:limitSeconds?Date.now()+limitSeconds*1000:null};renderTest()}
function addSpent(){if(!state)return;const now=Date.now();state.spent[state.index]+=Math.max(0,Math.round((now-state.last)/1000));state.last=now}
function renderTest(){const q=state.qs[state.index];app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>${selectedClass==='both'?'Class 11 + 12':'Class '+selectedClass} ${selectedSubject} Mock</h1><p>Question ${state.index+1} of ${state.qs.length} · PYQ ${q.year||2025} · ${q.chapter}</p></div><div class="badge" id="timerBadge">${state.limitSeconds?'Time left: '+fmt(Math.floor(Math.max(0,state.deadline-Date.now())/60000))+':'+String(Math.floor(Math.max(0,state.deadline-Date.now())/1000)%60).padStart(2,'0'):'UNTIMED'}</div></div><div class="test"><main class="card"><div class="qmeta"><div><span class="badge">${q.chapter}</span> <span class="badge">${q.year||2025} PYQ · Q${q.question_no}</span></div><span class="muted small">Source PDF page ${q.source_page}</span></div><img class="qimg" src="${q.image}" alt="Question ${state.index+1}"><div class="answerbox"><label class="small muted">${answerLabel(q)}</label>${isMcq(q)?`<div class="option-buttons" role="group" aria-label="Answer options">${optionLabels(q).map((label,i)=>`<button type="button" class="option-btn ${optionIndex(state.answers[state.index])===i?'selected':''}" data-option="${label}" aria-pressed="${optionIndex(state.answers[state.index])===i}">${label}</button>`).join('')}</div>`:`<input id="ans" type="number" ${isIntegerQuestion(q)?'step="1"':'step="any"'} inputmode="decimal" autocomplete="off" value="${state.answers[state.index]||''}" placeholder="Enter number">`}</div><div class="row section"><button class="btn secondary" id="prev" ${state.index===0?'disabled':''}>Previous</button><button class="btn secondary" id="clear">Clear</button><button class="btn secondary" id="review">${state.review[state.index]?'Unmark review':'Mark for review'}</button><button class="btn" id="next">${state.index===state.qs.length-1?'Finish':'Next'}</button></div></main><aside class="card"><h3>Question palette</h3><div class="palette">${state.qs.map((x,i)=>`<button class="pbtn ${i===state.index?'current':''} ${state.answers[i]!==''?'answered':''} ${state.review[i]?'review':''}" data-i="${i}">${i+1}</button>`).join('')}</div><div class="legend"><span><i class="dot" style="background:#1a5a42"></i>Answered</span><span><i class="dot" style="background:#ffc857"></i>Review</span></div><hr style="border-color:var(--border);border-width:1px 0 0;margin:16px 0"><button class="btn danger" id="submit">Submit test</button><p class="muted small">Do not submit until you are ready. Answers are hidden until submission.</p></aside></div></div>`;
 if(timerHandle){clearInterval(timerHandle);timerHandle=null}if(state.limitSeconds&&!state.submitted){timerHandle=setInterval(()=>{if(!state||state.submitted){clearInterval(timerHandle);timerHandle=null;return}const left=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));const el=document.getElementById('timerBadge');if(el)el.textContent='Time left: '+fmt(Math.floor(left/60))+':'+String(left%60).padStart(2,'0');if(left<=0){clearInterval(timerHandle);timerHandle=null;submitTest(true)}},250)}const inp=document.getElementById('ans');if(inp){inp.focus();inp.oninput=e=>{state.answers[state.index]=e.target.value}}document.querySelectorAll('.option-btn').forEach(b=>b.onclick=()=>{state.answers[state.index]=b.dataset.option;renderTest()});
 document.getElementById('prev').onclick=()=>{addSpent();if(state.index>0){state.index--;state.last=Date.now();renderTest()}};
 document.getElementById('next').onclick=()=>{addSpent();if(state.index===state.qs.length-1)submitTest(false);else{state.index++;state.last=Date.now();renderTest()}};
 document.getElementById('clear').onclick=()=>{state.answers[state.index]='';renderTest()};
 document.getElementById('review').onclick=()=>{state.review[state.index]=!state.review[state.index];renderTest()};
 document.querySelectorAll('.pbtn').forEach(b=>b.onclick=()=>{addSpent();state.index=+b.dataset.i;state.last=Date.now();renderTest()});
 document.getElementById('submit').onclick=()=>{if(confirm('Submit the test now? You will see the answer key and analysis after submission.'))submitTest(false)};
}
function submitTest(auto){if(state.submitted)return;if(timerHandle){clearInterval(timerHandle);timerHandle=null}addSpent();state.submitted=true;const rows=state.qs.map((q,i)=>{const ok=!q.flagged&&sameQuestionAnswer(state.answers[i],q);return {...q,user:state.answers[i],ok,unscored:!!q.flagged,spent:state.spent[i]}});const scored=rows.filter(x=>!x.unscored),correct=scored.filter(x=>x.ok).length,attempted=scored.filter(x=>norm(x.user)!=='').length,wrong=attempted-correct,score=correct*4-wrong;const result={date:new Date().toISOString(),score,correct,wrong,unattempted:scored.length-attempted,accuracy:attempted?correct/attempted:0,attemptRate:scored.length?attempted/scored.length:0,minutesPerQuestion:state.minutesPerQuestion??null,timeLimitSeconds:state.limitSeconds??null,timeExpired:!!auto,ids:rows.map(x=>x.id),rows};saveHistory(result);renderResults(result,auto)}
function renderResults(r,auto,reviewAll=false,fromHistory=false){const by={};r.rows.forEach(x=>{by[x.chapter]??={a:0,c:0,w:0,u:0,s:0,unscored:0};if(x.unscored){by[x.chapter].unscored++;return}by[x.chapter].a++;if(x.user==='')by[x.chapter].u++;else if(x.ok)by[x.chapter].c++;else by[x.chapter].w++;by[x.chapter].s+=x.ok?4:(x.user===''?0:-1)});const mistakes=r.rows.filter(x=>!x.ok&&!x.unscored);const unscored=r.rows.filter(x=>x.unscored);const reviewRows=reviewAll?r.rows:mistakes;app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>Test Analysis</h1><p>${r.minutesPerQuestion?`Timed test · ${r.minutesPerQuestion} min/question${r.timeExpired?' · Time expired':''}`:'Untimed test'} · ${new Date(r.date).toLocaleString()}</p></div>${fromHistory?'<button class="btn secondary" onclick="showHistory()">Back to history</button>':'<button class="btn" onclick="renderStart()">New test</button>'}</div><div class="card"><div class="resultgrid"><div class="stat"><span class="muted">Score</span><b>${r.score}</b><span class="muted">/ ${r.rows.length*4}</span></div><div class="stat"><span class="muted">Correct</span><b class="good">${r.correct}</b></div><div class="stat"><span class="muted">Wrong</span><b class="bad">${r.wrong}</b></div><div class="stat"><span class="muted">Unattempted</span><b>${r.unattempted}</b></div></div><div class="stats section"><div class="stat"><span class="muted">Accuracy</span><b>${(r.accuracy*100).toFixed(1)}%</b></div><div class="stat"><span class="muted">Attempt rate</span><b>${(r.attemptRate*100).toFixed(1)}%</b></div><div class="stat"><span class="muted">Avg time/Q</span><b>${Math.round(r.rows.reduce((a,x)=>a+x.spent,0)/r.rows.length)}s</b></div><div class="stat"><span class="muted">Time used</span><b>${Math.floor(r.rows.reduce((a,x)=>a+x.spent,0)/60)}m</b></div></div></div><div class="card section"><h2>Chapter performance</h2><table class="table"><tr><th>Chapter</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Score</th></tr>${Object.entries(by).map(([c,v])=>`<tr><td>${c}</td><td>${v.a-v.u}</td><td class="good">${v.c}</td><td class="bad">${v.w}</td><td>${v.a-v.u?((v.c/(v.a-v.u))*100).toFixed(1):'0.0'}%</td><td>${v.s}</td></tr>`).join('')}</table></div><div class="card section"><h2>${reviewAll?'Answer Review — All Questions':`Incorrect & skipped questions (${mistakes.length})`}</h2>${reviewRows.length?reviewRows.map((x)=>`<div class="mistake"><div class="row" style="justify-content:space-between"><b>Q${r.rows.indexOf(x)+1} · ${x.chapter}</b><span class="badge">${x.unscored?'Not scored':x.user===''?'Unattempted':x.ok?'Correct':'Incorrect'} · ${x.year||2025} PYQ · source p.${x.source_page}</span></div><p class="small"><b>Your answer:</b> ${x.user||'Not attempted'} · <b>Correct:</b> ${x.answer??'Not scored — source key says no option match'}</p><p class="small muted">Time: ${x.spent}s · Original PYQ image for reviewing the question and diagram.</p><img src="${x.image}"></div>`).join(''):'<p class="muted">Perfect attempt — nothing to review here.</p>'}</div><div class="card section"><h2>Quick diagnosis</h2><p>${diagnosis(by,r)}</p></div></div>`}
function diagnosis(by,r){const arr=Object.entries(by).map(([c,v])=>({c,acc:(v.a-v.u)?v.c/(v.a-v.u):1,wrong:v.w})).sort((a,b)=>a.acc-b.acc);const slow=[...r.rows].sort((a,b)=>b.spent-a.spent).slice(0,3);let s=`You attempted ${r.correct+r.wrong}/${r.rows.length} questions. `;if(arr.length)s+=`Lowest chapter accuracy: <b>${arr[0].c}</b> (${(arr[0].acc*100).toFixed(1)}%). `;if(slow[0])s+=`Longest individual time: <b>Q${r.rows.indexOf(slow[0])+1}</b> at ${slow[0].spent}s (${slow[0].chapter}).`;return s}
function openHistoryResult(index,mode){const r=history()[index];if(!r)return;renderResults(r,false,mode==='review',true)} function showHistory(){const h=history();app.innerHTML=`<div class="wrap"><div class="top"><div class="brand"><h1>Mock History</h1><p>Stored locally in this browser.</p></div><button class="btn secondary" onclick="renderStart()">Back</button></div><div class="card">${h.length?h.map((r,i)=>`<div class="history-item"><b>Test ${h.length-i}</b> · ${new Date(r.date).toLocaleString()}<br><span class="muted">Score ${r.score}/${r.rows.length*4} · Accuracy ${(r.accuracy*100).toFixed(1)}% · ${r.correct} correct · ${r.wrong} wrong · ${r.unattempted} unattempted</span><div class="row history-actions"><button class="btn secondary" data-history-index="${i}" data-history-mode="analysis">View analysis</button><button class="btn" data-history-index="${i}" data-history-mode="review">Review answers</button></div></div>`).join(''):'<p class="muted">No tests yet.</p>'}</div></div>`;document.querySelectorAll('[data-history-index]').forEach(b=>b.onclick=()=>openHistoryResult(Number(b.dataset.historyIndex),b.dataset.historyMode))}
renderSelection();


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
 const valid=THEMES.some(t=>t.value===theme)?theme:'black';
 document.documentElement.dataset.theme=valid;
 const picker=document.getElementById('themePicker');
 if(picker)picker.value=valid;
}
function initThemePicker(){
 const saved=localStorage.getItem(THEME_KEY)||'black';
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
 picker.value=document.documentElement.dataset.theme||'black';
 picker.onchange=()=>{
  const next=picker.value;
  localStorage.setItem(THEME_KEY,next);
  applyTheme(next);
 };
}
initThemePicker();
