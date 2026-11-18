"""Smoke test without network or web server (for sandboxes that block localhost).
Run: python tests/browser_smoke.py
Requires: playwright Python package, Chromium installed.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':1480,'height':940}, accept_downloads=True)
        errors=[]
        page.on('pageerror', lambda ex: errors.append(str(ex)))
        html=(ROOT/'index.html').read_text();import re;html=re.sub(r'<script src="\./[^"]+" defer></script>','',html)
        await page.set_content(html)
        await page.add_style_tag(content=(ROOT/'styles.css').read_text())
        await page.add_script_tag(content=(ROOT/'impedance-engine.js').read_text())
        await page.add_script_tag(content=(ROOT/'app.js').read_text())
        await page.add_script_tag(content=(ROOT/'impedance-ui.js').read_text())
        assert await page.locator('#layerTable tr').count()==9
        assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.6)<1e-9
        assert await page.evaluate('__stackupDebug.snapshot().layers.filter(x=>x.type==="copper").map(x=>x.role)')==['signal','ground','power','signal']
        for n in [2,6,8,4]:
            page.once('dialog',lambda d:asyncio.create_task(d.accept()))
            await page.locator(f'[data-preset="{n}"]').click()
            assert await page.locator('#copperMetric').inner_text()==str(n)
            assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.6)<1e-9
        await page.locator('#targetThickness').fill('1.8')
        await page.locator('#targetThickness').dispatch_event('change')
        await page.locator('#fitTargetBtn').click()
        assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.8)<1e-9
        await page.locator('#undoBtn').click()
        assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.6)<1e-9
        await page.locator('#redoBtn').click()
        assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.8)<1e-9
        await page.locator('#langBtn').click()
        assert await page.locator('h1').inner_text()=='Layer stackup'
        await page.locator('#themeBtn').click()
        assert await page.evaluate('document.documentElement.dataset.theme')=='light'
        await page.locator('[data-layer]').first.click()
        await page.locator('#openBtn').count()
        assert (await page.evaluate('__stackupDebug.collectBridge().schema'))=='com.simonlation.impedance-handoff'
        async with page.expect_download() as dl_info: await page.locator('#saveBtn').click()
        dl=await dl_info.value
        assert dl.suggested_filename.endswith('.stackup.json')
        await page.locator('#exportBtn').click()
        async with page.expect_download() as dl_info:await page.locator('[data-export="svg"]').click()
        assert (await dl_info.value).suggested_filename.endswith('.svg')
        await page.locator('#exportBtn').click()
        async with page.expect_download() as dl_info:await page.locator('[data-export="png"]').click()
        assert (await dl_info.value).suggested_filename.endswith('.png')
        await page.locator('#exportBtn').click()
        async with page.expect_download() as dl_info:await page.locator('[data-export="csv"]').click()
        assert (await dl_info.value).suggested_filename.endswith('.csv')
        # Analytic impedance integration: microstrip, differential mode, geometry, target solve and export.
        assert await page.locator('#impMainResult').inner_text()!='— Ω'
        assert await page.evaluate('SimonlationImpedanceUI.result().ok')
        await page.locator('#impMode').select_option('diff-microstrip')
        assert await page.locator('#impKind').inner_text()=='Zdiff'
        assert await page.evaluate('Math.abs(SimonlationImpedanceUI.result().zDiff-2*SimonlationImpedanceUI.result().zOdd)<1e-8')
        await page.locator('#impTarget').fill('100')
        await page.locator('#impTarget').dispatch_event('change')
        await page.locator('#impSolveBtn').click()
        assert abs(await page.evaluate('SimonlationImpedanceUI.result().zDiff')-100)<.02
        assert await page.evaluate('SimonlationImpedanceUI.tolerance().ok')
        async with page.expect_download() as dl_info:await page.locator('#impExportBtn').click()
        assert (await dl_info.value).suggested_filename.endswith('.impedance-result.json')
        # Differential calculations must decline unknown non-homogeneous dielectric models.
        synthetic=await page.evaluate('''() => {const p=__stackupDebug.snapshot();p.layers.find(l=>l.type==='prepreg').epsilonR=8;
        return SimonlationImpedance.calculate({stackup:p,signalId:p.layers.find(l=>l.type==='copper').id,mode:'microstrip',widthMM:.3});}''')
        # With a single dielectric prepreg between signal and adjacent plane it remains a valid homogeneous case.
        assert synthetic['ok']
        fixture='''(kicad_pcb (version 20240108) (generator "pcbnew")
        (setup (stackup
        (layer "F.Mask" (type "soldermask") (thickness 0.01) (epsilon_r 3.3))
        (layer "F.Cu" (type "copper") (thickness 0.035))
        (layer "dielectric 1" (type "core") (thickness 1.53) (material "FR4") (epsilon_r 4.5) (loss_tangent 0.017))
        (layer "B.Cu" (type "copper") (thickness 0.035))
        (layer "B.Mask" (type "soldermask") (thickness 0.01)))))'''
        await page.locator('#fileInput').set_input_files(files={'name':'board.kicad_pcb','mimeType':'text/plain','buffer':fixture.encode()})
        assert await page.locator('#copperMetric').inner_text()=='2'
        assert abs(await page.evaluate('__stackupDebug.bodyThickness()')-1.6)<1e-9
        assert await page.evaluate('__stackupDebug.snapshot().layers.find(l=>l.type==="core").epsilonR')==4.5
        core_id=await page.evaluate('__stackupDebug.snapshot().layers.find(l=>l.type==="core").id')
        await page.locator(f'.nav-item[data-layer="{core_id}"]').click()
        await page.locator('#addDielectricBtn').click()
        assert await page.locator('#layerTable tr').count()==6
        await page.locator('#removeDielBtn').click()
        assert await page.locator('#layerTable tr').count()==5
        await page.screenshot(path=str(ROOT/'preview-desktop-light.png'),full_page=True)
        mobile=await browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
        await mobile.set_content(html)
        await mobile.add_style_tag(content=(ROOT/'styles.css').read_text())
        await mobile.add_script_tag(content=(ROOT/'impedance-engine.js').read_text())
        await mobile.add_script_tag(content=(ROOT/'app.js').read_text())
        await mobile.add_script_tag(content=(ROOT/'impedance-ui.js').read_text())
        await mobile.screenshot(path=str(ROOT/'preview-mobile.png'),full_page=True)
        assert await mobile.locator('#bodyMetric').inner_text()
        assert not errors,errors
        print('PASS v0.2: presets, stackup edits, import/exports, microstrip/diff, 100 ohm width solve, tolerance, responsive, no JS errors')
        await browser.close()
if __name__=='__main__':asyncio.run(main())
