# SIMONLATION Stackup Studio · Changelog

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
