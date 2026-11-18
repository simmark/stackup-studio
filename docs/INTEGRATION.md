# Integration blueprint · SIMONLATION Engineering Platform

## Audited reference apps (public GitHub state, 18 Nov 2026)

- CADVIEW Studio: https://github.com/simmark/cadview-studio / https://simmark.github.io/cadview-studio/ — three-column dark navy/cyan workspace, object tree, viewport, context inspector, Light/Dark, independent PWA. README describes beta 1.2.1. Its current `index.html` uses a Three.js import map referring to a public CDN; do **not** assume fully offline CAD functionality before bundling the dependencies.
- S-Parameter Analyzer: https://github.com/simmark/s-parameter-plotter / https://simmark.github.io/s-parameter-plotter/ — standalone installable Touchstone analysis/PWA with multiport, mixed-mode, impedance, portable local file workflow and light/dark modes. Compared with CADVIEW its user interface uses a different color system; shared navigation/design tokens are a **future harmonization task**.
- FluxForge ESB, Gerber/PCB Viewer and Impedance Studio are part of the larger concept per earlier conversations; their live repository/deployment states were **not** verified during this build.

## Product architecture: distinct apps + shared data contract

Keep each tool as a standalone web app/PWA to avoid regressions and installation collisions. Link them on a common Simonlation Tools homepage. Avoid embedding entire apps in one monolithic script or frame. Common components later: brand/header, themes, local project manager, file import, keyboard shortcuts, safety/accuracy labels, privacy/legal footer.

Suggested working flow:

1. **PCB / Gerber Viewer**: open `.kicad_pcb` or CAM files; for KiCad, extract physical stackup when defined. A plain Gerber layer image is not enough to infer materials or stack heights reliably.
2. **Stackup Studio (this project)**: review/adjust layer order, materials, Dk/Df, thickness, conductor/reference roles and nominal board thickness. Export `.stackup.json` (complete editable project) or `.impedance-handoff.json` (snapshot plus selected copper layer/reference geometry).
3. **PCB Impedance Studio**: import the shared stackup JSON and **explicitly** select microstrip/stripline/coplanar/differential geometry, width, spacing, etch profile, frequency, copper surface roughness and relevant adjacent reference planes. First implement validated analytical methods with clear validity domains; add a 2D quasi-static solver only as a separate, testable calculation engine.
4. **Via & Interconnect Studio**: reuse actual stackup thicknesses for via span, dielectric rings and reference plane transitions. Signal-integrity accuracy requires a separate 3D solver or qualified approximations; do not label a simple parasitic estimate as a full-wave result.
5. **S-Parameter Analyzer / Network Studio**: use results from properly validated transmission-line or 3D models (e.g. generated Touchstone), not arbitrary impedance values guessed from stackup alone.
6. **Report Studio**: trace sources, units, models, warnings, geometry, version and exported figures.

## Data contract v1

### Full project JSON

`schema: "com.simonlation.stackup"`, `version: 1`

Fields:
- `projectName` (UTF-8 string)
- `targetThicknessMM` (positive, `0.1 ... 15`)
- `maskEnabled`, `watermarkEnabled` (booleans)
- `layers[]` ordered **top to bottom**. Each layer has `id`, `name`, `type` (`soldermask|copper|core|prepreg`), `thicknessMM`, `material`, `epsilonR`, `lossTangent`, `role` and `locked`.
- `role` on copper: `signal`, `ground`, `power`, `mixed` (**user description only**). A signal layer may also contain ground pours; stackup labels do not represent actual layout net connectivity.

Example:

```json
{
  "schema":"com.simonlation.stackup",
  "version":1,
  "projectName":"My 4L board",
  "targetThicknessMM":1.6,
  "maskEnabled":true,
  "watermarkEnabled":true,
  "layers":[
    {"id":"m1","type":"soldermask","name":"F.Mask","thicknessMM":0.01,"material":"Solder resist","epsilonR":3.3,"lossTangent":0.02,"role":"","locked":false},
    {"id":"cu1","type":"copper","name":"F.Cu","thicknessMM":0.035,"material":"Copper","epsilonR":1,"lossTangent":0,"role":"signal","locked":false},
    {"id":"d1","type":"core","name":"Dielectric 1","thicknessMM":1.53,"material":"FR-4","epsilonR":4.2,"lossTangent":0.02,"role":"","locked":false},
    {"id":"cu2","type":"copper","name":"B.Cu","thicknessMM":0.035,"material":"Copper","epsilonR":1,"lossTangent":0,"role":"ground","locked":false},
    {"id":"m2","type":"soldermask","name":"B.Mask","thicknessMM":0.01,"material":"Solder resist","epsilonR":3.3,"lossTangent":0.02,"role":"","locked":false}
  ]
}
```

### Impedance handoff JSON

`schema: "com.simonlation.impedance-handoff"`, `version: 1`

Includes `source`, `generatedAt`, units metadata, `projectName`, `boardBodyThicknessMM`, `selectedConductor`, `referencePlanes` (nearest **role-designated** GND/Power above/below with summed dielectric thickness in mm), `assumptions`, and the entire `stackup` project snapshot.

This format is deliberately not a solved transmission line: it lacks width `w`, separation `s`, etch, frequency, and geometry type; also reference copper coverage is not verified. A recipient must not assume that a `ground` label guarantees a real plane, nor automatically infer effective permittivity from the material alone.

## Suggested landing-page listing

Title: **Stackup Studio**
Category: **PCB Design & Signal Integrity**
Badge: **Preview** (until external QA/real project tests are complete)
Description: **Build and review PCB layer stacks with a live cross-section, material definitions and KiCad import. Export the stackup for impedance and via workflows.**
Primary link: `/stackup-studio/` if hosted at the same root domain, or the GitHub Pages tool subpath once deployed.

Use a **proper link**, not a fake application card to an unreleased URL. The reusable accessible HTML snippet is in `integration/landing-card.html`; replace the placeholder `href` according to actual deployment.

## Compatibility and upgrades

- Never change the current CADVIEW or S-Parameter Analyzer PWA `id`/scope to `/stackup-studio/`.
- A change to the JSON schema must bump `version` and ship a migration. Do not silently reinterpret thickness units.
- Keep all libraries local to preserve offline mode.
- Resolve licenses, privacy/imprint and product version wording separately for this tool before publishing.
- Define a future shared project archive (e.g. `.simonlation-project.zip`) only after an explicit integration design. This app currently exports plain transparent JSON instead of prematurely inventing a ZIP project format.
- Verify portable desktop packaging only after the stable browser app is complete.

---

## Implemented in Preview 0.2: integrated PCB Impedance Lab

The preview now implements the first **analytical quick-calculation** step, without waiting for a separate full Impedance Studio. It uses the actual stackup `layers[]` (including conductor roles, copper and dielectric thickness, εr) and collects the trace width/spacing separately. No guessed value is written into the stackup JSON.

### Stable read-only in-page access

```
window.SimonlationStackup.getSnapshot()    // deep-copied project JSON (schema v1)
window.SimonlationStackup.getSelectedId()  // currently selected navigator layer id
window.SimonlationStackup.getBridge()      // full impedance handoff data
window.SimonlationStackup.schema           // "com.simonlation.stackup"
window.SimonlationStackup.version          // 1
```

The Stackup app dispatches `window` event `simonlation:stackup-change` after a render/update. The integrated `impedance-ui.js` listens to it and recalculates from a copied stackup. The calculation engine, `window.SimonlationImpedance`, is an independent pure JavaScript implementation with `calculate()`, `solveWidth()`, `toleranceCorners()`, `findRefs()`. This does **not** provide a cross-tab/cross-origin event; future standalone tools can exchange exported JSON files instead of trusting storage from another app.

### New export format · Impedance result v1

`schema: "com.simonlation.impedance-result"`, `version: 1`.

Carries `software`, `createdAt`, `units`, `geometry` (selected layer ID, mode, W, optional S), `model` (method name), `results` (including warnings/quality), `toleranceCorners` and a complete `stackup` v1 snapshot plus assumptions. This **does not** constitute a qualified S-parameter transmission-line model; neither a Touchstone file nor a SPICE network is generated. The original `com.simonlation.impedance-handoff` v1 export remains available and is not changed.

### Reference plane rule / fail closed

The quick calculator checks immediately adjacent copper layers for a GND/Power label, not a more distant plane behind another signal layer. It rejects heterogeneous Dk paths and unsupported stripline symmetry. Roles are not verified against actual copper polygons: this remains the Gerber/PCB Viewer's future responsibility.

### Co-hosting safety

The service worker now removes outdated caches matching `simonlation-stackup-` only, not all caches belonging to `simmark.github.io`. Do not change `manifest.webmanifest` to a generic `/` origin identity. It remains a separately installable `/stackup-studio/` app.
