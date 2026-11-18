# Changelog

## 0.3.0 (2026-11-18)

- Dedicated `simmark/stackup-studio` deployment and independent installable PWA with correct ID and scope.
- Responsive two-column desktop workbench and stacked mobile layout.
- Optional desktop layout toggle with DE/EN localization and saved preference.
- Project and impedance settings moved to namespaced keys with fallback import of v0.2 data.
- Isolated offline-cache cleanup so previously deployed apps remain unaffected.

# Change log · SIMONLATION Stackup Studio

## Preview 0.2 · 2026-11-18

- Added integrated PCB Impedance Lab with four analytical geometry choices (microstrip, differential microstrip, symmetric stripline, differential stripline).
- Implemented standalone pure-JS engine with Hammerstad–Jensen, Cohn/Wadell wide-strip, empirical differential-coupling corrections and explicit validity gates.
- Added dynamic schematic line cross-section, Z0/Zdiff/odd/even/common, baseline εeff and ps/mm, target-width inversion and 32-corner manufacturing-variable **input** tolerance exploration (W/H/T/S/Dk).
- Added DE/EN explanations of model warnings, JSON result export with full stackup snapshot and model attribution.
- Added publicly documented read-only in-page API and stackup-change event for downstream components.
- Fixed service worker activation to delete **only** caches belonging to Stackup Studio, preserving the other Simonlation apps when hosted at a shared origin.
- Added numerical/unit tests, integrated browser tests and separately documented real-HTTP offline test (not runnable in restricted sandbox).

## Preview 0.1 · 2026-11-18

- Initial stackup model, physical layer editor, 2-/4-/6-/8-layer presets, targeted thickness fit, KiCad stackup import, local persistence, Undo/Redo, project/handoff/CSV/SVG/PNG exports, DE/EN and dual themes.
