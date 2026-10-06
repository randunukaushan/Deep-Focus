/* Isolated, in-memory interaction reference. Not production settings storage. */
window.createDFOnboarding = function (ctx) {
 'use strict';
 const esc=ctx.escape;
 const copy=window.DFOnboardingCopy;
 const initial={roles:[],intent:'unsure',friction:[],availability:'daily',preferred_windows:'any',focus_preference:'25',experience_density:'simple',learning_context:'general',study_level:'general',medium:'unspecified',accountability:'solo',locale:'en',reduced:false};
 let prefs=structuredClone(initial), draft=null, stage='intro', index=0, selected=null, completed=false;
 const explicit=new Set();
 const locale=()=>ctx.isOpen()&&draft?draft.locale:prefs.locale;
 const t=(id,args={})=>{
  const message=copy[id]?.[{en:0,si:1,ta:2}[locale()]]||copy[id]?.[0]||id;
  return message.replace(/\{(\w+)\}/g,(_,key)=>String(args[key]??''));
 };
 const options={
  roles:['student','professional','developer','freelancer','creator','founder','educator'],
  intent:['startEasy','attention','priorities','organise','unsure'],
  friction:['interruptions','unclear','overplanned','routine'],
  availability:['daily','thirty','sixty','ninety'],
  preferred_windows:['any','morning','afternoon','evening'],
  focus_preference:['25','45','60'],experience_density:['simple','detailed'],
  learning_context:['general','lk'],study_level:['general','ol','al','higher'],medium:['unspecified','si','ta','en'],
  accountability:['solo','explore'],locale:['en','si','ta']
 };
 const labels={roles:'roles',intent:'intent',friction:'friction',availability:'availability',preferred_windows:'windows',focus_preference:'focus',experience_density:'density',learning_context:'context',study_level:'level',medium:'medium',accountability:'accountability',locale:'language',reduced:'motion'};
 const languageNames={en:'English',si:'සිංහල',ta:'தமிழ்'};
 const educational=answers=>answers.roles.some(r=>r==='student'||r==='educator');
 const steps=()=>['roles','intent','friction','availability','preferred_windows','focus_preference','experience_density',...(educational(draft.answers)?['learning_context']:[]),'accountability','review'];
 function valueLabel(key,value){
  if(Array.isArray(value))return value.length?value.map(v=>t(v)).join(' · '):t('none');
  if(key==='locale'||(key==='medium'&&value!=='unspecified'))return languageNames[value]||value;
  if(key==='focus_preference')return t('m'+value);
  if(key==='reduced')return t(value?'on':'off');
  return t(value);
 }
 function syncExplicit(){prefs.focus_preference=String(ctx.minutes());prefs.reduced=ctx.reduced();}
 function fresh(){syncExplicit();draft={answers:structuredClone(prefs),touched:new Set(),locale:prefs.locale,reduced:prefs.reduced};index=0;selected=null;}
 function refresh(focusHeading=false){ctx.render();if(focusHeading)document.getElementById('ob-title')?.focus({preventScroll:true});}
 function start(){
  if(ctx.hasSession()){ctx.toast('Finish or end your current focus session before changing setup.');return;}
  if(!draft){fresh();stage='intro';}else stage='questions';
  ctx.show();refresh(true);
 }
 function normaliseEducation(){
  if(!educational(draft.answers)){
   for(const key of ['learning_context','study_level','medium']){
    draft.answers[key]=initial[key];draft.touched.delete(key);
    // Role removal does not silently reset an already applied learning context.
   }
  }
 }
 function changes(){
  const keys=[...draft.touched];
  if(draft.locale!==prefs.locale)keys.push('locale');
  if(draft.reduced!==prefs.reduced)keys.push('reduced');
  return [...new Set(keys)].map(key=>({key,from:prefs[key],to:key==='locale'?draft.locale:key==='reduced'?draft.reduced:draft.answers[key]}))
   .filter(row=>JSON.stringify(row.from)!==JSON.stringify(row.to));
 }
 function prepareReview(){selected=new Set(changes().filter(row=>!explicit.has(row.key)).map(row=>row.key));}
 function apply(){
  if(!draft||stage!=='questions'||steps()[index]!=='review')return;
  const next=structuredClone(prefs);
  for(const row of changes())if(selected.has(row.key)){next[row.key]=structuredClone(row.to);explicit.add(row.key);}
  prefs=next;completed=true;draft=null;selected=null;ctx.apply(prefs);ctx.goHome();
 }
 function languagePicker(){return `<label class="ob-field" for="ob-locale">${esc(t('language'))}</label><select id="ob-locale">${['en','si','ta'].map(code=>`<option value="${code}" ${locale()===code?'selected':''}>${languageNames[code]}</option>`).join('')}</select>`;}
 function notice(){return `<p class="ob-notice">${esc(t('temporary'))}</p>`;}
 function choices(key){const multi=key==='roles'||key==='friction';return `<div class="ob-options ${key==='roles'?'ob-role-grid':''}">${options[key].map(value=>{
  const checked=multi?draft.answers[key].includes(value):draft.answers[key]===value;
  return `<label class="ob-option"><input type="${multi?'checkbox':'radio'}" name="ob-${key}" data-ob-field="${key}" value="${value}" ${checked?'checked':''}><span>${esc(valueLabel(key,value))}</span><span class="ob-choice-mark" aria-hidden="true">${checked?'✓':''}</span></label>`;
 }).join('')}</div>`;}
 function selectField(key){return `<label class="ob-field" for="ob-${key}">${esc(t(labels[key]))}</label><select id="ob-${key}" data-ob-field="${key}">${options[key].map(value=>`<option value="${value}" ${draft.answers[key]===value?'selected':''}>${esc(valueLabel(key,value))}</option>`).join('')}</select>`;}
 function review(){if(!selected)prepareReview();const rows=changes();return `<p class="page-subtitle">${esc(t('reviewHelp'))}</p><div class="ob-review">${rows.length?rows.map(row=>`<label class="ob-review-row"><input type="checkbox" data-ob-review="${row.key}" ${selected.has(row.key)?'checked':''}><span><strong>${esc(t(labels[row.key]))}</strong><small>${esc(t('current'))}: ${esc(valueLabel(row.key,row.from))}</small><span class="ob-new">${esc(t('proposed'))}: ${esc(valueLabel(row.key,row.to))}</span>${explicit.has(row.key)?`<small>${esc(t('explicit'))}</small>`:''}</span></label>`).join(''):`<p class="ob-notice">${esc(t('unchanged'))}</p>`}</div><p class="ob-notice">${esc(t('privacy'))}</p><button class="primary" id="ob-apply">${esc(t('apply'))}</button><button class="secondary" id="ob-no-changes">${esc(t('keepCurrent'))}</button><button class="text-btn" id="ob-edit">${esc(t('edit'))}</button>`;}
 function render(){
  if(!draft)fresh();
  const titleId=stage==='intro'?'welcome':stage==='exit'?'exitTitle':steps()[index]==='preferred_windows'?'windows':steps()[index]==='focus_preference'?'focus':steps()[index]==='experience_density'?'density':steps()[index]==='learning_context'?'learning':steps()[index];
  let content='';
  if(stage==='intro'){
   content=`<div class="hero ob-hero">${ctx.scene()}<span class="hero-note">Focus on What Matters.</span></div><p class="ob-kicker">DEEP FOCUS · ${esc(t('optional'))}</p><h1 id="ob-title" class="page-title" tabindex="-1">${esc(t('welcome'))}</h1><p class="page-subtitle">${esc(t('welcomeBody'))}</p>${languagePicker()}<p class="ob-notice">${esc(t('localeNotice'))}</p><label class="ob-motion"><input type="checkbox" id="ob-reduced" ${draft.reduced?'checked':''}><span>${esc(t('reduce'))}<small>${esc(t('systemMotion'))}</small></span></label><button class="primary" id="ob-begin">${esc(t('start'))}</button><button class="secondary" id="ob-defaults">${esc(t('defaults'))}</button><p class="ob-notice">${esc(t('defaultsNote'))}</p>`;
  }else if(stage==='exit'){
   content=`<div class="ob-symbol" aria-hidden="true">↗</div><h1 id="ob-title" class="page-title" tabindex="-1">${esc(t('exitTitle'))}</h1><p class="page-subtitle">${esc(t('exitBody'))}</p><div class="ob-actions"><button class="primary" id="ob-keep">${esc(t('keepDraft'))}</button><button class="secondary" id="ob-discard">${esc(t('discard'))}</button><button class="text-btn" id="ob-return">${esc(t('return'))}</button></div>`;
  }else{
   const list=steps(),key=list[index],isReview=key==='review';
   content=`<div class="ob-toolbar"><button class="text-btn" id="ob-back">← ${esc(t('back'))}</button><button class="text-btn" id="ob-later">${esc(t('later'))}</button></div><div class="ob-progress-label">${esc(t('step',{n:index+1,total:list.length}))}</div><progress class="ob-progress" max="${list.length}" value="${index+1}" aria-label="${esc(t('step',{n:index+1,total:list.length}))}"></progress><p class="ob-kicker">${esc(t('optional'))}</p><h1 id="ob-title" class="page-title" tabindex="-1">${esc(t(titleId))}</h1>`;
   if(isReview)content+=review();
   else{
    content+=`<p class="page-subtitle">${esc(t(titleId+'Help'))}</p><fieldset class="ob-fieldset"><legend class="sr-only">${esc(t(titleId))}</legend>`;
    content+=key==='learning_context'?selectField('learning_context')+selectField('study_level')+selectField('medium')+`<p class="ob-notice">${esc(t('bringOwn'))}</p>`:choices(key);
    content+=`</fieldset><div class="ob-actions"><button class="primary" id="ob-next">${esc(t('next'))} →</button><button class="text-btn" id="ob-skip">${esc(t('skip'))}</button></div>`;
   }
  }
  return `<section class="view ob-view" lang="${locale()}" data-ob-stage="${stage}" data-ob-step="${stage==='questions'?steps()[index]:stage}">${content}${notice()}</section>`;
 }
 function next(){if(index<steps().length-1)index++;selected=null;refresh(true);}
 function click(button){
  if(button.id==='try-onboarding'||button.dataset.onboarding!==undefined){start();return true;}
  if(!button.id.startsWith('ob-'))return false;
  if(!draft)return true;
  switch(button.id){
   case'ob-begin':stage='questions';index=0;refresh(true);break;
   case'ob-defaults':prefs.locale=draft.locale;prefs.reduced=draft.reduced;explicit.add('locale');explicit.add('reduced');completed=true;draft=null;ctx.apply(prefs);ctx.goHome();break;
   case'ob-next':next();break;
   case'ob-skip':{
    const key=steps()[index];draft.answers[key]=structuredClone(prefs[key]);draft.touched.delete(key);
    if(key==='roles')normaliseEducation();
    if(key==='learning_context')for(const field of ['study_level','medium']){draft.answers[field]=prefs[field];draft.touched.delete(field);}
    next();break;
   }
   case'ob-back':if(index===0)stage='intro';else index--;selected=null;refresh(true);break;
   case'ob-later':stage='exit';refresh(true);break;
   case'ob-return':stage='questions';refresh(true);break;
   case'ob-keep':ctx.goHome();break;
   case'ob-discard':draft=null;selected=null;ctx.goHome();break;
   case'ob-edit':index=0;selected=null;refresh(true);break;
   case'ob-apply':apply();break;
   case'ob-no-changes':draft=null;ctx.goHome();break;
  }
  return true;
 }
 function change(input){
  if(!draft)return false;
  if(input.id==='ob-locale'&&options.locale.includes(input.value)){draft.locale=input.value;refresh();return true;}
  if(input.id==='ob-reduced'){draft.reduced=input.checked;refresh();return true;}
  if(input.dataset.obReview){if(!selected)prepareReview();input.checked?selected.add(input.dataset.obReview):selected.delete(input.dataset.obReview);return true;}
  const key=input.dataset.obField;
  if(!key||!options[key]?.includes(input.value))return false;
  if(key==='roles'||key==='friction'){
   const values=new Set(draft.answers[key]);input.checked?values.add(input.value):values.delete(input.value);draft.answers[key]=options[key].filter(value=>values.has(value));
  }else draft.answers[key]=input.value;
  draft.touched.add(key);selected=null;
  if(key==='roles')normaliseEducation();
  // Re-render to refresh selected states/progress; restore the exact input focus.
  refresh();document.querySelector(`[data-ob-field="${key}"][value="${input.value}"]`)?.focus({preventScroll:true});
  return true;
 }
 function profile(){return `<div class="settings-card" lang="${prefs.locale}"><h2>${esc(t('profileTitle'))}</h2><p class="meta">${esc(languageNames[prefs.locale])} · ${esc(valueLabel('focus_preference',prefs.focus_preference))} · ${esc(valueLabel('learning_context',prefs.learning_context))}</p><button class="secondary" data-onboarding>${esc(t(draft?'resume':'redo'))}</button><p class="helper">${esc(t('temporary'))}</p></div>`;}
 function home(){if(!completed&&!draft)return '';
  const homeText={startEasy:'homeStart',attention:'homeAttention',priorities:'homePriorities',organise:'homeOrganise'}[prefs.intent]||'homeDefault';
  return `<div class="ob-home settings-card" lang="${prefs.locale}"><span class="badge">${esc(t('profileTitle'))}</span><h2>${esc(t('homeTitle'))}</h2><p class="meta">${esc(t(homeText))}</p><div class="ob-tags"><span>${esc(valueLabel('focus_preference',prefs.focus_preference))}</span><span>${esc(valueLabel('learning_context',prefs.learning_context))}</span></div>${prefs.experience_density==='detailed'?`<p class="meta">${esc(valueLabel('roles',prefs.roles))}<br>${esc(valueLabel('availability',prefs.availability))} · ${esc(valueLabel('preferred_windows',prefs.preferred_windows))}</p>`:''}<button class="text-btn" data-go="plan">${esc(t('planCta'))} →</button><button class="text-btn" data-onboarding>${esc(t(draft?'resume':'redo'))}</button></div>`;
 }
 return {start,render,click,change,profile,home,
  isReduced:()=>draft?.reduced??prefs.reduced,
  recordExplicit:(key,value)=>{if(Object.hasOwn(prefs,key)){prefs[key]=value;explicit.add(key);}},
  isOpen:()=>ctx.isOpen()
 };
};
