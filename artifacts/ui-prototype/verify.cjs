const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 try {
 const page = await browser.newPage({viewport:{width:1280,height:1100},reducedMotion:'reduce'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 const nav=async name=>page.locator(`.bottom-nav [data-go="${name}"]`).click();
 await page.locator('#phone').screenshot({path:path.join(__dirname,'home-light.png')});
 await nav('plan'); await page.locator('[data-add]').first().click();
 await page.locator('#task-title').fill('<b>My next step</b>');
 await page.locator('#add-form button[type=submit]').click();
 assert(await page.getByText('<b>My next step</b>',{exact:true}).isVisible());
 assert.equal(await page.locator('.task-name b').count(),0);
 await page.locator('[data-check="5"]').click();
 assert.equal(await page.locator('[data-check="5"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-filter="upcoming"]').click();
 assert.equal(await page.locator('.task-row').count(),1);
 await page.locator('[data-filter="today"]').click();
 await page.locator('#phone').screenshot({path:path.join(__dirname,'plan-light.png')});
 await page.locator('[data-task="1"]').click();
 await page.locator('#start-pause').click(); await page.waitForTimeout(1250);
 assert.notEqual(await page.locator('#timer').textContent(),'25:00');
 await page.locator('#start-pause').click();
 const paused=await page.locator('#timer').textContent(); await page.waitForTimeout(1100);
 assert.equal(await page.locator('#timer').textContent(),paused);
 await page.locator('#start-pause').click();
 await nav('home'); await nav('focus');
 assert.equal(await page.locator('#timer-state').textContent(),'Focusing');
 await page.locator('#theme').click();
 await page.locator('#phone').screenshot({path:path.join(__dirname,'focus-dark.png')});
 await page.locator('#end-session').click(); await page.locator('[data-close="end-dialog"]').click();
 assert(await page.locator('#start-pause').isVisible());
 await page.locator('#end-session').click(); await page.locator('#confirm-end').click();
 assert(await page.getByText('A moment well spent.',{exact:true}).isVisible());
 await nav('progress'); assert(await page.getByText(/Ended early/).isVisible());
 await nav('profile'); await page.locator('#motivation-mode').selectOption('personal');
 await page.locator('#custom-quote').fill('x'.repeat(241)); await page.locator('#save-quote').click();
 assert(await page.locator('#quote-error').textContent());
 await page.locator('#custom-quote').fill('මගේ පුංචි පියවර.'); await page.locator('#save-quote').click();
 await nav('home'); assert.match(await page.locator('.quote-button').textContent(),/මගේ පුංචි පියවර\./);
 await nav('profile'); await page.locator('#motivation-mode').selectOption('off');
 await page.locator('#motion-setting').check();
 assert.match(await page.locator('#phone').getAttribute('class'),/reduced/);
 await nav('home'); assert.equal(await page.locator('.quote-button').count(),0);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:1000});
  for(const screen of ['home','plan','focus','progress','profile']){
   await nav(screen);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${screen} overflow`);
  }
 }
 await page.reload(); await nav('plan'); assert.equal(await page.locator('.task-row').count(),3);
 assert.deepEqual(errors,[]);
 console.log('PASS: navigation, add/plain-text/complete/filter, timer pause/resume/navigation/end, theme, custom quote limit/off, reduced-motion, 320/390px overflow, reset, no page errors. Three screenshots saved.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
