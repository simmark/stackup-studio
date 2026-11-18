from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
import os,json,time,sys
root=Path(__file__).resolve().parent.parent
os.chdir(root)
server=ThreadingHTTPServer(('127.0.0.1',8763),SimpleHTTPRequestHandler)
Thread(target=server.serve_forever,daemon=True).start()
errors=[]
try:
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(1613,1000),(1440,900),(1280,900),(820,1024),(390,844)]:
   c=b.new_context(viewport={'width':width,'height':height},service_workers='allow')
   page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   html=(root/'index.html').read_text();html=html.replace('<script src="./impedance-engine.js" defer></script><script src="./via-fence-engine.js" defer></script><script src="./app.js" defer></script><script src="./impedance-ui.js" defer></script>','')
   page.set_content(html)
   page.add_style_tag(content=(root/'styles.css').read_text())
   for asset in ['impedance-engine.js','via-fence-engine.js','app.js','impedance-ui.js']:
    page.add_script_tag(content=(root/asset).read_text())
   page.wait_for_timeout(250)
   print('VIEW',width,'title',page.title(),'W',page.locator('#impWidth').input_value(),'layout',page.locator('.design-workbench').evaluate('(x)=>getComputedStyle(x).gridTemplateColumns'),'pageerr',errors)
   print('SIZES',page.evaluate('({width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,via:document.querySelector("#viaResults").textContent.slice(0,120),imp:document.querySelector("#impMainResult").textContent})'))
   assert page.locator('#viaSvg circle').count()>0
   assert page.locator('#impSensitivity .sensitivity-row').count()>=4
   assert page.locator('#viaResults div').count()==6
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+3')
   if width==1613:
    page.screenshot(path=str(root/'preview-v04-desktop.png'),full_page=True)
    page.locator('#impMode').select_option('diff-microstrip');page.locator('#impTarget').fill('100');page.locator('#impOptimize').select_option('balanced');page.locator('#impSolveBtn').click();page.wait_for_timeout(200)
    print('OPT',page.locator('#impMainResult').inner_text(),'TARGET',page.locator('#impTargetDelta').inner_text(),'warnings',page.locator('#impIssue').inner_text()[:130]);assert '100' in page.locator('#impMainResult').inner_text()
    page.locator('#impUnitW').select_option('um');page.locator('#impTolW').fill('10');page.locator('#viaFrequency').fill('5');page.screenshot(path=str(root/'preview-v04-differential.png'),full_page=True)
    page.locator('[data-imp-view=metric]').click();assert page.locator('[data-imp-view=metric]').get_attribute('class').find('active')>=0
    page.locator('#impSvg [data-edit=impWidth]').click();assert page.locator('#impFloatingEditor input').count()==1;page.locator('#impFloatingEditor input').fill('0.19');page.locator('#impFloatingEditor button').click();assert abs(float(page.locator('#impWidth').input_value())-0.19)<.00001
    page.locator('#impSvg [data-edit=impH]').click();assert page.evaluate('document.activeElement.id')=='inspThickness'
   if width==390:page.screenshot(path=str(root/'preview-v04-mobile.png'),full_page=True)
   c.close()
  b.close()
finally:server.shutdown()
if errors: print('ERRORS',errors);sys.exit(1)
print('PASS browser test')
