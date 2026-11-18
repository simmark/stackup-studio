# Stackup & Impedance Studio · v1.0 release criteria (tracked as of v0.4-beta)

## Implemented and automatically checked in beta 0.4

- Existing layer editor and project JSON export/import (round-trip tested with actual Chromium download and file upload).
- Analytic microstrip and **wide symmetric** stripline models; empirical differential model clearly labeled.
- 1D inverse width design, differential inverse gap design, joint W/S geometry choice with a defined objective (minimum squared log-change relative to input geometry).
- Invalid/out-of-range inverse results return an error instead of numeric guesses.
- Differential 32-corner and single-ended 16-corner deterministic tolerance sweep with user-defined µm or percent, sorted one-at-a-time sensitivities.
- W/S click-to-edit **on the cross-section**; H links to the authoritative stackup thickness inspector.
- Via fence estimator: two rows, frequency, substrate Dk, drill/pad, annular, pad gaps, length, actual pitch, total number of vias, lambda rules; SVG top and cross-section views.
- Dedicated `simmark/stackup-studio` PWA manifest and same-scope-only cache + service worker shell test.
- Automated Node tests, Chromium DOM UI smoke tests at 390/820/1280/1440/1613 CSS px without horizontal overflow.

## Still required before calling this engineering tool "v1.0"

**STOP / critical:**
- Independently validate **reference vectors** for microstrip, stripline and differential modes against trusted numerical field tools; record model error vs geometry, material, stackup and frequency. Existing numeric regression and invariant tests are **not** independent external validation.
- Run an actual browser online install → offline restart → real import/export → app upgrade on Windows/Android/iOS. The current sandbox blocks `http://`, `https://` and `file://` in headless browser navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). The service-worker unit test proves basic cache logic but does not prove a real offline installation.
- Review legal EULA, imprint, privacy, proprietary licensing and disclaimers.

**Further high-priority work:**
- Validated numerical multilayer 2D FEM/capacitance solver for GCPW, embedded microstrip, offset/asymmetric stripline, complex dielectric layers and closely spaced via-to-trace structures. Beta 0.4 shows preview-only geometry options for these and explicitly refuses unvalidated impedance.
- Manufacturer-specific material databases with frequency-specific εr/tanδ and trace etch shape/tolerance correlations.
- Loss, roughness, modal delay and via-induced signal integrity effects require advanced models; the current calculator is quasi-static only.
- KiCad/Gerber real polygon-plane coverage and clearance checking (current input only contains user-defined copper layer roles).
- Advanced field plots and draggable W/S edges with numerical snapping beyond click-to-edit.

A 1.0 label must not be used until the critical items are actually completed.
