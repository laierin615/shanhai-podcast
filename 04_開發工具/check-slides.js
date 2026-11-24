const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const dir = process.argv[2];
  const body = fs.readFileSync(path.join(dir, 'shanhai-podcast.html'), 'utf8');
  fs.writeFileSync(path.join(dir, '_preview.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>');
  const shotDir = path.join(__dirname, 'screens'); fs.mkdirSync(shotDir, { recursive: true });
  const browser = await chromium.launch(); const errors = [];
  const shots = [['d3-tool', {width:1280,height:860}, 'light', '#slides-d3-3'], ['guide', {width:1280,height:900}, 'light', '#guide-tool-gbNew'], ['phone-sheet', {width:390,height:844}, 'dark', '#sheets-ws2'], ['phone-overview', {width:390,height:844}, 'light', '#overview'], ['d1-radio', {width:1280,height:860}, 'light', '#slides-d1-2'], ['phone-guide', {width:390,height:844}, 'light', '#guide-what']];
  for (const [name, vp, scheme, hash] of shots) {
    const page = await browser.newPage({ viewport: vp, colorScheme: scheme, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(name + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(name + ' console: ' + m.text()); });
    if (name === 'phone-sheet') await page.addInitScript(() => { try { localStorage.setItem('p303:examples', 'true'); } catch (e) {} });
    await page.goto('file://' + path.join(dir, '_preview.html') + hash); await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    console.log(name, 'pageOverflowX=', overflow);
    await page.screenshot({ path: path.join(shotDir, name + '.png') }); await page.close();
  }
  const page = await browser.newPage({ viewport: {width:1280,height:900} });
  page.on('pageerror', e => errors.push('slides: ' + e.message));
  await page.goto('file://' + path.join(dir, '_preview.html') + '#slides');
  const report = await page.evaluate(async () => {
    const out = []; let count = 0;
    for (const deck of window.DECKS) for (let i = 0; i < deck.slides.length; i++) {
      location.hash = `slides-${deck.id}-${i+1}`; await new Promise(r => setTimeout(r, 25)); count++;
      const s = document.querySelector('#slide-canvas .s'); const r = s.getBoundingClientRect(); const scale = r.width / 1280;
      const worst = Math.max(...Array.from(s.querySelectorAll('*')).filter(k => !k.closest('svg') || k.tagName === 'svg').map(k => (k.getBoundingClientRect().bottom - r.top) / scale));
      const wide = Math.max(...Array.from(s.querySelectorAll('*')).filter(k => !k.closest('svg') || k.tagName === 'svg').map(k => (k.getBoundingClientRect().right - r.left) / scale));
      if (worst > 705 || wide > 1282) out.push(`${deck.id}-${i+1}: bottom ${Math.round(worst)} right ${Math.round(wide)}`);
    }
    return { out, count };
  });
  console.log('slides checked:', report.count); console.log('overflow:', report.out.length ? report.out.join('\n') : 'none');
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
