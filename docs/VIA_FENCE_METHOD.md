# Via Fence Layout Advisor · Methodology v0.4-beta

**Status:** Geometric pre-check and guided-wavelength pitch recommendation. **Not a 2D/3D electromagnetic solver, not a predicted shielding attenuation, and not an impedance correction.**

## Intended use

Design a left/right GND-via fence near a PCB single-ended or differential route. The PCB cross-section depicts a ground via on either side of the line; the top view depicts the two rows along the route. Ground stitching is valuable only if the pad and via barrels are electrically connected to the intended GND/reference copper. No connection/clearance check against an actual Gerber layout is performed.

## Formula and units

- Frequency `f` is the **highest relevant** RF frequency or relevant edge spectrum upper bound, in **GHz**.
- Dk is a **bulk substrate estimate**, selected conservatively as the largest defined relative permittivity of the dielectrics adjacent to the signal layer. It is **not** the effective dielectric constant used to compute the isolated microstrip impedance. Check it against material data at the target frequency. Using the largest local substrate Dk yields a shorter wavelength within the simple nondispersive model.
- `λg [mm] = 299.792458 / (f [GHz] × √Dk)`.
- Guidance: `pitch ≤ λg / 10` (common RF stitching rule), or `pitch ≤ λg / 20` (more conservative). Both **heuristics**, not a guaranteed isolation level. For f=5 GHz and Dk=4.2, λg≈29.26 mm, λg/10≈2.93 mm, λg/20≈1.46 mm.
- The user-defined requested via pitch is an **upper bound** on realized pitch. With two endpoints included, `N_per_row = ceil(length / requestedPitch)+1` and `realPitch = length/(N_per_row-1)`.
- Two rows: `N_total = 2 × N_per_row`.
- Via pad-to-trace gap is measured **edge to edge**. Pad center distance to trace edge is `offset + padDiameter/2`.
- Annular ring radial width is `(padDiameter – finishedDrillDiameter)/2`; this is a nominal 2D geometry check, **not** guaranteed plating, registration or manufacturing allowance.
- Nearest pad-to-pad clearance **along the row** is `realPitch - padDiameter`. This is not a DRC check of every copper object or adjacent fence row.

## Explicitly NOT calculated

- Isolation in dB, effective cutoff, crosstalk, or reflection/insertion loss.
- Via barrel inductance, spreading impedance, plane cavity modes, stitching connection, thermal rise, impedance perturbation, shield effectiveness.
- Change in characteristic impedance due to **nearby grounded copper or vias**. For this use a proper GCPW/coupled structure solver and validate the real layout.
- Dielectric or conductor loss dispersion, soldermask, via stub resonance, antipad capacitance, plating/aspect-ratio constraints.
- Fab-specific drill/pad registration tolerances or solder mask defined openings.

## Reference reading

- STMicroelectronics, *AN5407: Optimized RF board layout for STM32WL series*, RF ground stitching pitch λg/10 and physical layout guidance: https://www.st.com/resource/en/application_note/an5407-optimized-rf-board-layout-for-stm32wl-series-stmicroelectronics.pdf
- Cadence, *RF Via Transitions in High-Speed Designs*, trace return current and via ground stitching discussion: https://resources.academic.cadence.com/pcb-design-and-analysis-resources/2024-rf-via-transitions-in-high-speed-designs
- JLCPCB, *Via Stitching in PCB Design*, conservative λ/20 initial guidance: https://jlcpcb.com/blog/via-stitching-in-pcb-design

Third-party rules can vary with frequency, materials, geometry and isolation goals. A fabrication sign-off must check the actual board file with the fabricator.
