# SIMONLATION Stackup Studio · Preview 0.3

**18 November 2026 · © 2026 Simon Mark**

Professional, standalone, local-first PCB stackup editor, now including an integrated **PCB Impedance Lab** for clearly labelled **quasi-static analytical estimates**. Designed to share physical stackup data with Simonlation's future Gerber/PCB Viewer, Impedance Studio, Via Studio and Report workflow. The user interface follows the engineering workspace used by CADVIEW Studio: left-side setup/navigator, central live technical visualization, right-side precision inspector, dark/light modes and DE/EN.

## Start

1. Extract the ZIP, open `index.html` in Chrome/Edge/Firefox. No build, server, login, account, CDN or API key is required to use the static editor.
2. Choose a 2-/4-/6-/8-layer example or open a `.stackup.json` / KiCad `.kicad_pcb` file that contains a physical `(stackup ...)` section. **The bundled examples contain illustrative, not factory-certified, material values.**
3. Click layers in the cross-section, table or left navigator. Define copper as signal, ground, power or mixed; adjust dielectric/Core/Prepreg thickness and Dk in the inspector.
4. View **PCB Impedance Lab** beside the stackup on desktop, or directly below it on mobile. Pick the routing layer and select microstrip, differential microstrip, symmetric stripline or differential stripline. Enter the width W and differential spacing S; the interface shows the result, reference-plane geometry, assumptions and model restrictions.
5. Optional: enter a target Z0/Zdiff and choose **Solve width / Breite berechnen**; evaluate user-defined corner tolerances for W/H/T/S/Dk. Export either the full project, the lossless analytical result, or a data handoff JSON.

### v0.2 features

| Area | Implemented |
| --- | --- |
| Stackup editor | 2-/4-/6-/8-layer examples, schematic and true thickness-ratio cross-sections, layer inspector, Core/Prepreg split/merge, locked layers, board body auto-fit |
| Materials and copper roles | Name, thickness, dielectric material, Dk, tan δ, signal/GND/Power/mixed labels; editable locally |
| Import/export | KiCad physical stackup when present; project JSON v1, handoff JSON v1, standalone impedance-result JSON v1, CSV (EN/DE Excel), SVG and PNG diagrams |
| Impedance Lab | Quasi-static Hammerstad–Jensen microstrip incl. copper thickness correction; symmetric Cohn/Wadell stripline (wide-strip validity); approximate edge-coupled diff microstrip and diff stripline |
| Results | Z0, Zodd/Zeven, Zdiff, Zcommon, reference-plane distance(s), baseline effective Dk, baseline delay in ps/mm |
| Inverse design | Solve W for selected target 10–250 Ω in the model's permitted width range; report when target cannot be reached |
| Tolerance Explorer | 32 deterministic corner evaluations varying W, H, T, S, Dk (each 0–30%); show nominal, minimum and maximum; no statistical yield model |
| UX | Responsive desktop/mobile, language DE/EN, light/dark, undo/redo stackup changes, local browser persistence |
| Platform | Local assets and scripts, dedicated `/stackup-studio/` PWA identity, isolated SW cache namespace, public read-only in-page integration API |

## Technical accuracy and limits

**This is a preview, not a production impedance solver.** The quick results use published closed-form models, not 2D Poisson or 3D Maxwell/FEM. The differential coupling model is empirical. The UI explicitly refuses unsupported cases rather than inventing an averaged Dk, such as nonhomogeneous dielectric materials between line and return plane, asymmetrical stripline, no adjacent designated plane, and model-invalid widths.

- Only homogeneous dielectric regions are supported per calculated path (same Dk across Core/Prepreg in that path). For symmetric stripline, the paths must be nearly symmetric and have matching Dk.
- Stackup **role labels are not proof of plane coverage**. A GND role alone does not mean there is a continuous ground polygon under the trace. Check the real Gerber/KiCad layout.
- Solder mask loading, conductor etch profile, trapezoidal trace sidewalls, roughness, copper plating variations, dispersion, radiation, discontinuities, frequency-dependent loss, group delay and full-wave effects are **not** calculated. The shown delay for differential geometries is a **single-line baseline**, not separate odd/even propagation delay.
- The tolerance tool varies five geometry/material inputs independently. Its resulting interval is a deterministic parameter-corner sweep, **not a statistical manufacturing confidence interval or predicted fab tolerance**. It does not simulate dielectric pressing/flow, material correlation or copper thickness variation by plating process.
- The app does not generate a qualified controlled-impedance fabrication stackup, assert manufacturer viability, or guarantee a target in an actual board. Manufacturer material values may depend on frequency and process.

Analytical-method description, ranges and sources: [`docs/IMPEDANCE_MODELS.md`](docs/IMPEDANCE_MODELS.md). Platform handoff formats: [`docs/INTEGRATION.md`](docs/INTEGRATION.md).

## Technical packaging

Static files, no external runtime dependencies:

```
index.html
styles.css
app.js                      Stackup model, validation, KiCad parser, export
impedance-engine.js         Deterministic quasi-static computation, testable in Node
impedance-ui.js             Mode selection, cross-section, target inversion, tolerances
manifest.webmanifest        Unique relative install ID/start/scope for this GitHub Pages subpath
sw.js                       Cache isolation and offline app shell
icons/
docs/INTEGRATION.md
docs/IMPEDANCE_MODELS.md
integration/landing-card.html
CHANGELOG.md
tests/impedance_engine_test.js
tests/browser_smoke.py
tests/create_previews.py
tests/live_offline_test.py
```

The installer works on secure HTTPS hosts or localhost **after an initial online load** where PWA policies allow it; `file://` can load the app but cannot register a service worker. GitHub Pages preview location: `https://simmark.github.io/cadview-studio/stackup-studio/`. The manifest uses relative ID/start/scope and remains valid if moved to its own repository. Export projects as JSON backups: browser storage is not reliable long-term storage.

**No repository was created or modified** to produce this package, and there is no hidden transmission of local design files. All required scripts and fonts are local; no third-party requests are needed by the app.

## Tests (automated)

- `node tests/impedance_engine_test.js` — numeric H–J reference, monotonic width response, differential relations, 50/100 Ω inverse width search, stripline and invalid material geometry gates, 32-corner bounds.
- `python tests/browser_smoke.py` — Chromium tests: preset dimensions, fit/undo/redo, language/theme, KiCad, split/merge, all exports, integrated analytical calculations, 100 Ω inverse design, mobile rendering, no uncaught JS errors. This test injects static HTML/JS into an isolated browser page and cannot validate service-worker installation.
- `python tests/create_previews.py` — creates preview screenshots without any network access.
- `python tests/live_offline_test.py` — opt-in real-HTTP PWA/offline scenario under `/stackup-studio/`. **The sandbox running this preview blocks local HTTP browser navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), so real HTTP/SW offline reload is not yet verified.** Run it on a regular development machine or on the deployed GitHub Pages app before release.

## Publish checklist

1. Verify 2/4/6/8 copper variants with **real fabricator stackup data** and check actual KiCad exports.
2. Compare calculated structures with a trusted field solver/reference or controlled impedance measurements across W/H/T/εr; validate inverse search and bounded-difference modes.
3. Verify actual PWA installation/HTTP offline reload and file export on Windows, Android and iOS browsers.
4. Add product-specific license, terms, disclaimer, legal imprint and privacy links before release. **Do not assume the S-Parameter Analyzer's proprietary license applies automatically.**
5. Host on its own repo/PWA path; add the supplied link card to the Simonlation landing page only after the URL is live.

## Deutsch · Kurzfassung

Stackup Studio 0.2 enthält den PCB-Lageneditor aus Version 0.1 und neu das integrierte **PCB Impedance Lab**. Es berechnet Microstrip, Differential Microstrip, symmetrische Stripline und Differential Stripline als **analytische Vorabschätzung**, bestimmt die Leiterbahnbreite für eine Zielimpedanz und untersucht Worst-Case-Eingabetoleranzen einschließlich der Kupferdicke. Für nicht unterstützte Geometrien wird bewusst keine Zahl ausgegeben. Es gibt **noch keinen echten 2D/3D-Feldsolver**, keine Hochfrequenz-Dämpfungsberechnung und keine geprüften Hersteller-Stackups. Bitte vor Fertigung mit einem qualifizierten Solver und dem Leiterplattenfertiger validieren.


## Deployment & responsive workspace · v0.3

Published from its own repository: https://github.com/simmark/stackup-studio

The GitHub Pages URL is `https://simmark.github.io/stackup-studio/` once Pages is active for this repository.

The cross-section and Impedance Lab share a two-column central workbench on desktop viewports >1340 CSS px. Below that, including on smartphones, they are stacked. On wide screens, a **Side by side / Stacked** switch can temporarily give both editors full width. The layer-specification table remains beneath both panels.

Data and preferences are namespaced separately from the previous CADVIEW subdirectory installation. When new-repository keys are absent, the app imports the previous same-origin localStorage project/preferences once; data from a different browser profile cannot be migrated automatically, so use Project Export/Open if needed. The new SW cache namespace only cleans its own caches.

This repository publishes using the existing GitHub Pages branch-based deployment. GitHub Pages only serves public static files. Calculation and project operations run locally in the browser; do not assume public source code is secret.
