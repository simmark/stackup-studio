# Quality report · Preview 0.2 · 2026-11-18

## Verified in the current sandbox

- Node.js syntax checks: `app.js`, `impedance-engine.js`, `impedance-ui.js` — passed.
- Deterministic `tests/impedance_engine_test.js`: passed. Tests representative H–J numeric value, monotonic Z0-vs-width, odd/even algebra, tighter-gap Zdiff trend, both stripline models and inverse target searches, 32-corner tolerance bounds, invalid geometry and dielectric mismatches.
- `tests/browser_smoke.py`: passed with Chromium. Covers presets 2/4/6/8, target thickness adjustment, undo/redo, DE/EN, light/dark, project export, SVG/PNG/CSV, KiCad stackup import, dielectric split/merge, integrated impedances, 100 Ω width inverse search, JSON result export, responsive mobile page, and no uncaught JavaScript errors.
- Screenshot review: preview-stackup-dark, preview-impedance-dark, preview-differential-dark/light.
- Confirmed that PWA service worker lists `impedance-engine.js` and `impedance-ui.js` and that activation cleanup only matches `simonlation-stackup-` cache entries.

## Not verified and must be performed before public release

- **Actual PWA service-worker install and offline reload under GitHub Pages:** local HTTP navigation was blocked by the sandbox administrator (`ERR_BLOCKED_BY_ADMINISTRATOR`); `tests/live_offline_test.py` is included for a normal development machine.
- External field-solver benchmark over multiple realistic stackups; no model accuracy qualification or acceptance tolerance is claimed.
- Hardware measurements / PCB fabricator validation for high-frequency target impedance.
- Production browser matrix (desktop/mobile, iOS/Safari) and real KiCad board files with complex multi-layer stackups.
- Product-specific legal/license page and landing-page integration on a live site.

No remote GitHub repository has been modified.
