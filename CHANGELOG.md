# SIMONLATION Stackup Studio · Changelog

## 0.4.3-beta (2026-11-19)

- **Readable stackup cross-section:** the layer diagram is now drawn in the pixel size of its container instead of a fixed 880 × 430 graphic that was scaled down to 5–6 px text in the side-by-side layout. Labels stay 11–12 px on desktop and phone; thin layers get enough height so names no longer overlap. Image export (SVG/PNG) uses its own fixed 1100 px layout.
- **Default layout "stacked":** full-width stackup on top, Impedance Lab below (as in the earlier 0.2 preview). Side by side remains selectable; an older stored side-by-side preference is reset once.
- **Impedance Lab:** inputs on the left, trace cross-section and model readouts on the right; the duplicate result card is removed (the headline shows Z₀ / Zdiff). Larger readout text, German model names, shorter optimiser labels.
- **Via fence top view:** drawn to true scale (X = Y) as a cut-out along the trace with dimensioned pitch, trace-to-pad clearance and pad/drill; check names in German, λg/20 shown as a guideline warning instead of an error.
- German labels for layer types, roles, export menu and quick navigation; minimum UI text size raised to 10–11 px.

## 0.4.2-beta (2026-11-19)

- **Fix · stripline impedance:** The previous Cohn wide-strip expression used a wrong fringing term and overestimated symmetric stripline Z0 by roughly 24–39 % (e.g. W=0.15 mm, b=0.418 mm, εr 4.2: 73.7 Ω instead of ≈53 Ω). Replaced by Wheeler's symmetric stripline formula with finite-thickness correction (valid 0.05 ≤ W/B ≤ 10), so typical narrow 100 Ω pairs are no longer rejected.
- **Differential stripline:** now uses Cohn's exact even/odd solution for thin strips, scaled with the Wheeler thickness ratio, instead of the IPC exponential fit. Zeven is therefore a model value, not a mirrored estimate.
- **Independent reference test:** `tests/stripline_reference_test.js` checks against the exact conformal-mapping solution (t→0, < 1 %) and an independent 2D finite-difference Laplace solve (± 3 %).
- Validation against the 2D field solve (εr 4.2): microstrip −0.4 … +1.0 %, differential microstrip −1.2 … +2.7 %, stripline −2.1 … −1.7 %, differential stripline +0.4 … +3.4 %.
- **UI:** result headline (Z₀ / Zdiff, target deviation, model class, solder-mask notice) directly under the Impedance Lab title, visible without scrolling. German UI now consistently German (view switch, optimizer options, all model warnings). Zeven for differential microstrip marked as approximate (≈).
- Cache version `simonlation-stackup-v0.4.2`.

## 0.4.1-beta (2026-11-18)

- Improved responsive desktop workbench: side-by-side Stackup / Impedance with similar card heights, selected signal/reference context and full-width engineering sections below.
- Revised line cross-section: W and S are visually enlarged in schematic mode, numeric dimensions remain exact, and equal-XY-scale remains optional.
- Removed oversized default GND via pad rings. Sectional vias are now a small **optional** schematic-only preview; the independent Via Fence top view is retained below.
- Added `Off / Left / Right / Both` Via Fence placement. Placement changes row counts, top view and exports, but never pretends to correct impedance.
- Cache version bump to `simonlation-stackup-v0.4.1`, language and footer-version cleanup, regression tests including preview toggle, placement, target solver, mobile widths and JSON roundtrip.
- Caution: stackup materials and differential coupling remain estimates, not validated field-solver output.

## 0.4.0-beta (2026-11-18)

- **W / S inverse design:** optimize width with fixed gap, gap with fixed width, or find an achievable W+S pair using a documented minimum-change preference around the current geometry. Impossible geometries return a clear error.
- **Tolerance Inspector:** single-ended 16 and differential 32 deterministic parameter corners; width, height, copper thickness and gap tolerances as percent or µm; Dk percent; ranked one-at-a-time sensitivities. Strict bounds and full-corner validity checks.
- **Direct edits:** clickable precise W/S editor over the line cross-section, H navigates to dielectric layer; schematic vs equal-XY-scale mode.
- **Via Fence Layout Advisor:** configurable frequency, requested via pitch, length, pad/drill, nominal trace-edge clearance, min annular ring, min pad-to-pad clearance, both GND rows, top-view and side-view illustrations. λg/10 and λg/20 substrate-Dk heuristics, DRC-like geometric flags, JSON export. No fictitious impedance adjustment.
- **Additional preview geometries:** grounded coplanar, differential grounded coplanar, embedded microstrip and asymmetric stripline are visually selectable but explicitly marked *no analytical impedance result* pending a validated 2D solver.
- **UI:** mobile jump navigation; desktop split workspace retained. Extended explanatory notices and quality designations.
- **Offline:** cache version 0.4, locally hosted new engine, scoped same-origin fetch/cache logic. Service-worker shell unit test added. **No real PWA offline install test has been completed in this environment.**
- **Tests:** inverse target, tolerances/µm, via checks, project JSON export/import round trip, 5 viewports, deterministic SW shell simulation. Engineering models still require independent external validation.

## 0.3.0 (2026-11-18)

- Moved to `simmark/stackup-studio` with independent PWA identity.
- Responsive side-by-side desktop split workspace / mobile stacking, optional layout toggle.
- Storage keys isolated from prior CADVIEW preview.

## 0.2.0 (2026-11-18)

- Microstrip, diff microstrip, symmetric stripline, diff stripline analytic estimator.
- Empirical coupling, 1D width solve, nominal tolerance corners and local JSON export.

## 0.1.0 (2026-11-18)

- Initial stackup physical layer editor, presets, KiCad import, file exports.
