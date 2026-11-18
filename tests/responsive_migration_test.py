"""Regression test: 2-column desktop, stacked mobile, layout toggle, no horizontal overflow."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
async def main():
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
   for width,height in ((1613,1000),(1440,900),(1280,900),(820,900),(390,844)):
    context=await browser.new_context(viewport={'width':width,'height':height},accept_downloads=True,service_workers='allow')
    page=await context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(ROOT/'index.html').read_text()
    import re
    html=re.sub(r'<script src="\./[^"]+" defer></script>','',html)
    await page.set_content(html)
    await page.add_style_tag(content=(ROOT/'styles.css').read_text())
    for script in ('impedance-engine.js','app.js','impedance-ui.js'):
     await page.add_script_tag(content=(ROOT/script).read_text())
    await page.wait_for_function('!!window.SimonlationImpedanceUI && !!window.SimonlationStackup')
    dat=await page.evaluate('''() => {const r=e=>{const x=document.querySelector(e).getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height}};
     return {editor:r('.editor-panel'),imp:r('.imp-panel'),table:r('.table-panel'),workbench:r('.design-workbench'),docWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,project:SimonlationStackup.getSnapshot().projectName,errors:[]}}''')
    print(width,dat)
    assert dat['docWidth']<=width+1,(width,'horizontal overflow',dat['docWidth'])
    if width>1340:
     assert dat['imp']['x']>dat['editor']['x']+dat['editor']['w']-2,(width,'side by side',dat)
     await page.locator('#layoutStackBtn').click()
     assert await page.locator('#layoutStackBtn').get_attribute('aria-pressed')=='true'
     assert await page.evaluate("document.querySelector('.design-workbench').classList.contains('is-stacked')")
     await page.locator('#layoutSplitBtn').click()
    else:
     assert dat['imp']['y']>=dat['editor']['y']+dat['editor']['h']-2,(width,'stacked',dat)
    assert dat['table']['y']>=dat['imp']['y']+dat['imp']['h']-2,(width,'table below',dat)
    assert not errors,(width,errors)
    if width==1613:
     await page.screenshot(path=str(ROOT/'preview-desktop-v0.3.png'),full_page=False)
    if width==390:
     await page.screenshot(path=str(ROOT/'preview-mobile-v0.3.png'),full_page=True)
    await context.close()
   await browser.close()
   print('PASS responsive 1613/1440/1280/820/390; side-by-side toggle; no page errors')
 finally:pass
if __name__=='__main__':asyncio.run(main())
