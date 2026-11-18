"""PWA/offline test using local HTTP subpath matching GitHub Pages + clean screenshots."""
import asyncio, contextlib, http.server, threading, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
APP_DIR=ROOT.parent
LINK=APP_DIR/'stackup-studio'
if not LINK.exists():LINK.symlink_to(ROOT, target_is_directory=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 os.chdir(APP_DIR)
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet)
 thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
 try:
  with contextlib.ExitStack():
   async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx=await browser.new_context(viewport={'width':1536,'height':1080},accept_downloads=True,service_workers='allow')
    page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    url=f'http://127.0.0.1:{server.server_address[1]}/stackup-studio/'
    await page.goto(url,wait_until='networkidle')
    await page.wait_for_function('!!window.SimonlationImpedanceUI && !!window.SimonlationStackup')
    assert await page.evaluate('SimonlationImpedanceUI.result().ok')
    assert await page.locator('#impMainResult').inner_text()!='— Ω'
    await page.screenshot(path=str(ROOT/'preview-stackup-dark.png'))
    await page.locator('#impPanel').screenshot(path=str(ROOT/'preview-impedance-dark.png'))
    await page.evaluate('document.querySelector(".main").scrollTop=0')
    await page.locator('#themeBtn').click()
    await page.locator('#impPanel').screenshot(path=str(ROOT/'preview-impedance-light.png'))
    await page.locator('#themeBtn').click()
    await page.evaluate('navigator.serviceWorker.ready')
    await page.wait_for_function('navigator.serviceWorker.controller!==null',timeout=20000)
    assert await page.evaluate('caches.has("simonlation-stackup-standalone-v0.3.0")')
    cached=await page.evaluate('caches.open("simonlation-stackup-standalone-v0.3.0").then(c=>c.keys().then(a=>a.map(x=>new URL(x.url).pathname)))')
    assert '/stackup-studio/impedance-engine.js' in cached
    assert '/stackup-studio/impedance-ui.js' in cached
    await ctx.set_offline(True)
    await page.reload(wait_until='domcontentloaded')
    await page.wait_for_function('!!window.SimonlationImpedanceUI && !!window.SimonlationStackup')
    assert await page.evaluate('SimonlationImpedanceUI.result().ok')
    assert not errors,errors
    print('PASS v0.3 PWA: manifest subpath, service-worker cache, offline reload and impedance calculation; screenshot exports')
    await browser.close()
 finally:
  server.shutdown()
if __name__=='__main__':asyncio.run(main())
