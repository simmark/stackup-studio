from pathlib import Path
from playwright.sync_api import sync_playwright
import json,tempfile
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(accept_downloads=True)
 page=c.new_page()
 html=(root/'index.html').read_text();start=html.index('<script src="./impedance-engine.js"')
 page.set_content(html[:start]+'</body></html>')
 page.add_style_tag(content=(root/'styles.css').read_text())
 for f in ['impedance-engine.js','via-fence-engine.js','app.js','impedance-ui.js']:page.add_script_tag(content=(root/f).read_text())
 page.locator('#projectName').fill('Regression stackup project')
 page.locator('#projectName').dispatch_event('change')
 before=page.evaluate('window.SimonlationStackup.getSnapshot()')
 with page.expect_download() as download_info:page.locator('#saveBtn').click()
 download=download_info.value;target=root/'tests'/'roundtrip_export.stackup.json';download.save_as(target)
 actual=json.loads(target.read_text());assert actual==before,(actual,before)
 page.locator('#projectName').fill('Modified')
 page.locator('#projectName').dispatch_event('change')
 assert page.evaluate('window.SimonlationStackup.getSnapshot().projectName')=='Modified'
 page.locator('#fileInput').set_input_files(str(target));page.wait_for_timeout(150)
 after=page.evaluate('window.SimonlationStackup.getSnapshot()')
 assert after==before,(after,before)
 target.unlink();print('PASS project JSON export/import round-trip, layer order, thickness, εr and metadata retained')
 b.close()
