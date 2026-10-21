const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:1300},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.DF_PREVIEW_URL||pathToFileURL(path.join(__dirname,'index.html')).href;
 const external=[];page.on('request',request=>{const address=new URL(request.url());if(address.protocol.startsWith('http')&&address.hostname!=='127.0.0.1')external.push(request.url());});
 const nav=async v=>page.locator(`.bottom-nav [data-go="${v}"]`).click();
 const step=()=>page.locator('.ob-view').getAttribute('data-ob-step');
 const next=()=>page.locator('#ob-next').click();
 const choose=(key,value)=>page.locator(`[data-ob-field="${key}"][value="${value}"]`).check();
 const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 const goReview=async()=>{for(let n=0;n<12&&await step()!=='review';n++)await next();assert.equal(await step(),'review');};
 await page.goto(url+'?preview=onboarding');
 assert.equal(await step(),'intro');assert.equal(await page.locator('.bottom-nav').isVisible(),false);
 await page.locator('#phone').screenshot({path:path.join(__dirname,'onboarding-welcome.png')});
 await page.locator('#ob-locale').selectOption('si');assert.match(await page.locator('#ob-title').textContent(),/ඔබට/);
 await page.locator('#ob-reduced').check();await page.locator('#ob-defaults').click();
 assert.equal(await page.locator('.ob-home').getAttribute('lang'),'si');
 assert.match(await page.locator('#phone').getAttribute('class'),/reduced/);
 await nav('focus');assert.equal(await page.locator('#timer').textContent(),'25:00');
 await nav('profile');await page.locator('[data-onboarding]').click();assert.equal(await page.locator('#ob-locale').inputValue(),'si');
 await page.locator('#ob-locale').selectOption('en');await page.locator('#ob-begin').click();
 assert.match(await page.locator('.ob-progress-label').textContent(),/1 of 9/);
 await choose('roles','student');await choose('roles','educator');assert.match(await page.locator('.ob-progress-label').textContent(),/1 of 10/);
 await page.locator('#phone').screenshot({path:path.join(__dirname,'onboarding-roles.png')});
 await next();await choose('intent','organise');await next();await choose('friction','interruptions');
 await page.locator('#ob-back').click();assert.equal(await page.locator('[value="organise"]').isChecked(),true);await next();assert.equal(await page.locator('[value="interruptions"]').isChecked(),true);
 await page.locator('#ob-skip').click(); // skipped friction must not enter review
 await choose('availability','sixty');await next();await choose('preferred_windows','morning');await next();await choose('focus_preference','45');await next();await choose('experience_density','detailed');await next();
 assert.equal(await step(),'learning_context');await page.locator('#ob-learning_context').selectOption('lk');await page.locator('#ob-study_level').selectOption('al');await page.locator('#ob-medium').selectOption('ta');
 await page.locator('#phone').screenshot({path:path.join(__dirname,'onboarding-education.png')});
 await next();await choose('accountability','explore');await next();
 assert.equal(await page.locator('[data-ob-review="friction"]').count(),0);
 assert.equal(await page.locator('[data-ob-review="locale"]').isChecked(),false); // explicit Sinhala retained until selected
 await page.locator('[data-ob-review="locale"]').check();
 await page.locator('[data-ob-review="accountability"]').uncheck();
 await page.locator('#phone').screenshot({path:path.join(__dirname,'onboarding-review.png')});
 await page.locator('#ob-apply').click();assert.match(await page.locator('.ob-home').textContent(),/Sri Lanka/);assert.match(await page.locator('.ob-home').textContent(),/Student/);
 await nav('focus');assert.equal(await page.locator('#timer').textContent(),'45:00');await page.locator('[data-minutes="60"]').click();
 await nav('plan');assert.equal(await page.locator('.task-row').count(),3);await page.locator('[data-check="1"]').click();
 await nav('profile');await page.locator('[data-onboarding]').click();await page.locator('#ob-begin').click();
 for(let n=0;n<5;n++)await next();assert.equal(await step(),'focus_preference');await choose('focus_preference','25');await goReview();
 assert.equal(await page.locator('[data-ob-review="focus_preference"]').isChecked(),false);await page.locator('#ob-apply').click();await nav('focus');assert.equal(await page.locator('#timer').textContent(),'60:00');
 await page.locator('#start-pause').click();await page.locator('#try-onboarding').click();assert.equal(await page.locator('.ob-view').count(),0);assert.equal(await page.locator('#timer-state').textContent(),'Focusing');
 await page.locator('#start-pause').click();await page.locator('#try-onboarding').click();assert.equal(await page.locator('#timer-state').textContent(),'Paused');
 await page.locator('#end-session').click();await page.locator('#confirm-end').click();
 await nav('profile');await page.locator('[data-onboarding]').click();await page.locator('#ob-begin').click();await next();await choose('intent','startEasy');await page.locator('#ob-later').click();await page.locator('#ob-keep').click();
 assert.match(await page.locator('.ob-home').textContent(),/Bring your next task/); // unapplied draft not leaked
 await page.locator('.ob-home [data-onboarding]').click();assert.equal(await step(),'intent');assert.equal(await page.locator('[value="startEasy"]').isChecked(),true);
 await page.locator('#ob-later').click();await page.locator('#ob-discard').click();await nav('plan');assert.equal(await page.locator('[data-check="1"]').getAttribute('aria-pressed'),'true');
 await nav('progress');assert.equal(await page.locator('.task-row').count(),1);
 // Fresh draft: conditional answers cleared when roles are deselected.
 await page.goto(url+'?preview=onboarding');await page.locator('#ob-begin').click();await choose('roles','student');for(let n=0;n<7;n++)await next();
 await page.locator('#ob-learning_context').selectOption('lk');for(let n=0;n<7;n++)await page.locator('#ob-back').click();await page.locator('[data-ob-field="roles"][value="student"]').uncheck();await goReview();
 assert.equal(await page.locator('[data-ob-review="learning_context"]').count(),0);await page.locator('#ob-apply').click();assert.match(await page.locator('.ob-home').textContent(),/General/);
 // Three locales, both themes, narrow widths, keyboard focus, no external requests.
 for(const width of [320,390])for(const lang of ['en','si','ta']){
  await page.setViewportSize({width,height:1100});await page.goto(url+'?preview=onboarding');await page.locator('#ob-locale').selectOption(lang);
  if(width===320)await page.locator('#theme').click();assert.equal(await overflow(),false);
  await page.locator('#ob-begin').click();assert.equal(await page.locator('#ob-title').evaluate(el=>el===document.activeElement),true);
  await choose('roles','student');
  for(let n=0;n<10;n++){assert.equal(await overflow(),false,`${width}/${lang}/${await step()}`);if(await step()==='review')break;await next();}
  await page.locator('#ob-apply').click();assert.equal(await overflow(),false);
 }
 await page.goto(url+'?preview=onboarding');await page.locator('#ob-locale').selectOption('ta');await page.locator('#ob-begin').click();
 await page.locator('#phone').screenshot({path:path.join(__dirname,'onboarding-tamil.png')});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS O1–O8 browser subset: defaults/locales/reduced motion; conditional steps; back/skip; selected review; explicit override; keep/resume/discard; no task/history loss; active/paused entry guard; 320/390px all steps in en/si/ta; keyboard heading; screenshots. Native/qualified-language QA NOT RUN.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
