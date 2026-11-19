# SIMONLATION Stackup & Impedance Studio · 0.4.3 beta

**Engineering preview · 19 November 2026 · © Simon Mark**

**App:** https://simmark.github.io/stackup-studio/  
**Repository:** https://github.com/simmark/stackup-studio

Local-first, browser-installable PCB stackup editor with an integrated analytical **PCB Impedance Lab** and **Via Fence Layout Advisor**. Intended to work with the future Simonlation Gerber/PCB Viewer, Via Studio and S-Parameter Analyzer. No file upload, login or runtime cloud calculation is required.

## Quick start

1. Open the app, choose a 2/4/6/8 copper-layer preset or import `.stackup.json` / KiCad `.kicad_pcb` with a defined physical `(stackup ...)` section.
2. Click a layer in the stackup diagram, layer tree or layer table, then edit thickness, copper role, material εr and tanδ in the right-hand inspector. Project JSON export is an independent offline backup.
3. In PCB Impedance Lab, choose routing layer, geometry and W, S. Results include Z0, Zdiff, Zodd/Zeven, effective Dk and isolated-line delay where the approximation is supported. W/S in the drawing can be clicked for numeric editing. H jumps to the real dielectric thickness in the layer inspector.
4. Choose **Solve W (S fixed)**, **Solve S (W fixed)**, or **W+S minimum-change geometry**. With a single Zdiff target infinitely many geometries can meet the target; the "both" mode selects the closest candidate in relative logarithmic parameter space to the user's initial values.
5. Set ± W/H/T/S in percent or µm and Dk in percent. Inspect 16 or 32 deterministic corner extremes and the ranked sensitivity bars; these are **not statistical production distributions**.
6. Configure GND via fences on either side of a single-ended or differential pair. Provide maximum relevant frequency, pad/drill/offset/pitch/length and limits. The tool shows λg/10 and λg/20 layout pitch rules, total vias, top and sectional views and nominal clearances. Export the estimate as JSON.

## New in 0.4.3 — readable layout

- Stackup cross-section drawn at container resolution (readable labels at every width), stacked layout as default, Impedance Lab with inputs left and cross-section/readouts right, via fence top view to true scale with dimensions. See CHANGELOG.

## New in 0.4.2 — corrected stripline model

- Symmetric stripline now uses Wheeler's formula with finite-thickness correction; the former expression overestimated Z0 by 24–39 %. Differential stripline uses Cohn's exact even/odd solution (thickness-scaled).
- Checked against an independent 2D finite-difference field solve: all supported modes within about ±3.5 % for typical FR-4 geometries (see CHANGELOG).
- Result headline directly under the Impedance Lab title; consistent German interface.

## New in 0.4.1 — visual workbench and via placement

- **Clear desktop layout:** stackup cross-section and impedance workspace share a common top row and approximately matching panel heights; the stackup card now includes the active signal/reference-layer context rather than wasting its lower area. On smaller screens the sections stack vertically.
- **Useful schematic view:** coupled signal traces and gap are enlarged for clarity, with numeric W/S/H labels remaining authoritative. `Schematic` is the default; `1:1 XY` provides common X/Y scaling with adaptive zoom (not a literal physical size on a screen).
- **Vias optional in the cross-section:** `Show GND vias` is off by default and available in supported microstrip schematic views. Small, simplified plated barrels replace the large, dominant circular rings. The sketch is deliberately not a physical pad-to-trace scale drawing.
- **Via Fence placement:** `Off / Left / Right / Both sides` changes the top-view layout, row count and via totals. The full via dimensions, spacing rules and frequency-dependent pitch remain in the separate Via Fence section. None of these visualization choices artificially adjusts the calculated line impedance.
- **Engineering detail panels:** tolerance ranges and model limits are moved below the main workbench for better focus; Via Fence sits in its own two-column area on sufficiently wide displays.

## What is calculated, and what isn't

- **Analytical:** Hammerstad–Jensen microstrip (including thickness correction), Wheeler symmetric stripline (including thickness correction) and Cohn coupled stripline (even/odd).
- **Empirical:** differential microstrip coupled impedance correction (IPC-2141A style, not a full odd/even modal solver). For strong coupling, complex material stacks or tight via-to-line placement, results can be unreliable.
- **Preview only:** GCPW, differential GCPW, embedded microstrip and asymmetric stripline — the app shows the geometry option but does **not** return invented impedance numbers for structures requiring a validated field solver.
- **Via fence:** guided-wavelength pitch heuristics and geometric clearance/annular estimates, **no prediction of the fence's effect on Z0, radiation, isolation dB or crosstalk**. GND connectivity and actual copper shapes must be checked in the PCB layout.
- **No frequency-dependent impedance/loss solver:** material frequency behavior, tanδ loss, copper loss/roughness, mask corrections, plating and etch shapes, transitions and manufacturing suitability are not simulated.

**Do not use beta results as controlled-impedance fabrication specifications without verifying with independent field simulation and your PCB manufacturer.** Preset FR-4 properties are illustrative, not manufacturer-certified.

## Offline and privacy

The HTML, CSS, JS and icons are bundled locally; no CDN, tracking, remote solver, user login or file upload. A unique `/stackup-studio/` PWA manifest and service worker precache the app shell after an initial HTTPS visit. PWA install and full offline **browser restart are not yet verified on all operating systems**: the headless test environment blocks navigation; the deterministic service-worker shell test checks logic only. Export your project JSON before changing browser storage or reinstalling.

## Tests

```bash
node tests/impedance_engine_test.js
node tests/engineering_regression.js
node tests/stripline_reference_test.js
node tests/service_worker_v04.js
python tests/browser_v04.py
python tests/roundtrip_v04.py
```

The current test suite checks numerical regression and invariants, W/S target solves, tolerance cases and µm units, via-fence geometric checks, response at five CSS screen widths, click-to-edit, and a real download/reimport project JSON round-trip in an injected Chromium document.

**Independent field solver/measurement benchmarks are still missing.** See [release criteria](docs/V1_READINESS.md), [impedance models](docs/IMPEDANCE_MODELS.md) and [via methodology](docs/VIA_FENCE_METHOD.md). A code test passing is not the same as validating physical model accuracy.

## Architecture

- `app.js` · board project schema/validation, KiCad parser, state, layer editor and layer export.
- `impedance-engine.js` · standalone pure-JS analytical models, W/S inverse design, tolerance analysis.
- `via-fence-engine.js` · standalone pure-JS wavelength/clearance advisor.
- `impedance-ui.js` · shared workbench, cross-sectional SVG, optimization controls, tolerances, via-fence top view.
- `sw.js` and `manifest.webmanifest` · offline shell, separate PWA install path and cache namespace.
- `docs/` · engineering assumptions, error gates, future integration.

The publicly hosted web app does **not** hide client-side source code. Keeping the private local engineering input files off the server is a separate guarantee from protecting proprietary code.

## v1.0 status

This build is intentionally labeled **0.4.3 beta**, not 1.0. Before 1.0, independent field-model validation, manufacturer representative data, legal review and actual online-install/offline-restart testing are mandatory. See `docs/V1_READINESS.md`.
