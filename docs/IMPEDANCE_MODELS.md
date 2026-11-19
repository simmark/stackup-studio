# PCB Impedance Lab · Analytical model specification · v0.4

This file is an **engineering model description**, not a manufacturer/measurement validation report.

## Calculation scope and units

- Inputs from Stackup: selected copper layer, copper **T**, homogeneous dielectric height **H**, Dk **εr**, declared GND/PWR reference roles. User enters track **W** and edge spacing **S** (all mm). No direct extraction of actual copper polygons is implemented.
- Output: characteristic impedance Z0 [Ω], optional odd/even modal estimates Zodd/Zeven and Zdiff=2·Zodd, Zcommon=Zeven/2, quasi-static effective permittivity, and baseline delay √εeff/c [ps/mm].
- All formulas are quasi-static; frequency is intentionally not presented as an input because frequency-dependent dispersion, conductor loss and dielectric loss are not calculated. tan δ remains a stackup property for subsequent solvers.

## Single-ended microstrip

Uses Hammerstad–Jensen's closed-form homogeneous air impedance and substrate filling factor with the conductor-thickness correction from the Qucs microstrip technical description. Compute normalized width u=W/H, thickness ratio tn=T/H, corrected air width u1 and dielectric width ur. Then:

- `Z0 = Zair(ur) / √εeff0(ur)`
- `εeff = εeff0(ur) · [Zair(u1)/Zair(ur)]²`

Implementation includes the complete Hammerstad–Jensen a(u), b(εr) filling factor, not the simpler IPC-2141 logarithm alone. It checks 0.01 ≤ W/H ≤ 100 and 1 ≤ εr ≤ 30; warning when T/H > 0.2 or T/W > 0.5. Solder mask and dispersion excluded.

Sources: [Qucs: Single microstrip line](https://qucs.github.io/tech/node75.html), [scikit-rf microstrip numerical implementation](https://scikit-rf.readthedocs.io/en/v1.13.0/_modules/skrf/media/mline.html).

## Symmetric stripline (since 0.4.2)

Uses Wheeler's symmetric stripline expression with finite-thickness width correction (Wadell, *Transmission Line Design Handbook*, §3.5.1), plane-to-plane spacing B = Htop + Hbottom + T:

- x = T/B, m = 2 / (1 + 2x / (3(1−x)))
- ΔW/(B−T) = x / (π(1−x)) · [1 − ½ ln((x/(2−x))² + (0.0796x / (W/B + 1.1x))^m)]
- W' = W/(B−T) + ΔW/(B−T)
- Z0 = 30/√εr · ln{1 + 4/(πW') · [8/(πW') + √((8/(πW'))² + 6.27)]}

Preconditions: real interior conductor with GND/PWR copper directly above and below, |Htop−Hbottom|/mean ≤ 10 % (warning above 2 %), equal Dk on both sides, 0.05 ≤ W/B ≤ 10, T/B ≤ 0.25.

**Correction note:** 0.4.1 and earlier used a Cohn wide-strip variant with a wrong fringing-capacitance term (`m = 2b/d`, extra division by π). It overestimated Z0 by roughly 24–39 % for common geometries and rejected W/(B−T) ≤ 0.35. Results for stripline from those versions should be recalculated.

Validation: exact conformal-mapping solution for t→0 (Z0·√εr = 30π·K(k)/K(k′), k = sech(πW/2B)) within 1 %; independent 2D finite-difference Laplace solve within about 2 % for T = 18 µm.

## Differential stripline (since 0.4.2)

Cohn's exact zero-thickness even/odd solution for edge-coupled symmetric stripline:

- ke = tanh(πW/2B)·tanh(π(W+S)/2B), ko = tanh(πW/2B)·coth(π(W+S)/2B)
- Z(e,o)·√εr = 30π · K(k′)/K(k)
- Thickness: both modes scaled by the Wheeler single-line ratio Z0(T)/Z0(T→0).
- Zdiff = 2·Zodd, Zcommon = Zeven/2.

Against the 2D finite-difference reference: +0.4 … +3.4 % in Zdiff for S/B between 0.19 and 0.72.

## Differential microstrip

Treat edge-coupled lines as an empirical correction applied to the calculated single-ended Z0:

- Differential microstrip: `k = 0.48 · exp(−0.96·S/H)`.
- `Zodd = Z0·(1−k)`, `Zeven = Z0·(1+k)`.
- `Zdiff = 2·Zodd`, `Zcommon = Zeven/2`.

These coefficients are an IPC-2141A-style fit, not full modal capacitance/field calculation. At tight coupling (S/H < 0.5) a warning indicates greater uncertainty. Likewise, displayed delay is the isolated-trace baseline, **not independent odd/even propagation velocities**.

References: [Coupled microstrip modelling in Qucs](https://qucs.github.io/tech/node77.html), [Analytic line models and differential coupling notes](https://github.com/RFingAdam/lineforge/blob/main/docs/theory/analytical.md). Never infer the actual characteristic impedance of a routed pair without verifying the reference copper coverage and geometry.

## Inverse width design

For a user-selected 10–250 Ω target, sample logarithmically in 0.025–5 mm track width, searching for a valid model range and a bracket that crosses the target. Then bisection determines W. If no valid bracket exists, report an unreachable target; **no made-up output**. Gap S stays fixed during width inversion. Gap-only and joint W/S optimization have been added in v0.4; see below. A dielectric-height optimizer is not provided.

## Tolerance Explorer

A deterministic full factorial corner sweep over **five independent variables** W, H, T, S and εr gives 2⁵=**32 corner evaluations**. The sweep changes selected signal copper T, the dielectric height(s) between signal layer and adjacent reference copper, and those dielectric εr values; width and gap are perturbed in the geometry inputs. It uses user-supplied ± ranges from 0 to 30%. Single-ended modes have 2⁴ = 16 unique corners; differential modes have 2⁵ = 32.

Displays nominal, min and max, not percentage yield. Copper thickness variation here is an input perturbation, **not a simulation of electroless/electrolytic deposition or lamination**. Other manufacturing variables, correlation and temperature are not modelled.

## Explicit future upgrades (not in 0.4)

- 2D electrostatic field solve with adaptive meshing and convergence tests for arbitrary multi-dielectric microstrip/stripline and CPWG; calculate capacitances with and without material to derive Z0 and effective Dk.
- Differential mode solver separately evaluating odd/even capacitances, propagation velocities and modal asymmetry.
- Metal edge/etch trapezoids, LPI solder mask, surface roughness and dispersion/loss vs frequency, qualified reference material libraries with provenance and measurement benchmarks.
- CPWG grounded/unbacked, embedded/offset/broadside coupling, via 3D transition and return path checks from real layout.
- Independent comparison against a field solver and physical PCB measurement before declaring accuracy suitable for controlled impedance production.

## Beta 0.4 additions: gap inverse, joint geometry and tolerance sensitivities

For differential modes, a reverse gap solve holds W fixed, samples S logarithmically (0.025–5 mm), brackets Zdiff and uses bisection; unreachable targets are explicitly rejected. Joint W/S design is **not mathematically unique** for one impedance target. The default selection rule minimizes `ln(W/Winitial)^2 + ln(S/Sinitial)^2` among candidates meeting Zdiff in the model's supported region. It does not minimize fabrication cost/yield, and no discrete fab grid is enforced.

The new manufacturing tolerance inspector accepts W/H/T/S as percentages or **absolute µm** (converted exactly to mm), Dk as a percentage. It evaluates all 2⁴=16 single-ended or 2⁵=32 differential deterministic corner combinations and separately sweeps each parameter upward/downward with other parameters fixed, ranking the maximum absolute one-at-a-time impedance change. It rejects the entire interval if **any corner** is unsupported; ignoring invalid corners would understate the risk. The results inherit all inaccuracies of the chosen analytic/empirical model.

Other geometries (GCPW, differential GCPW, embedded microstrip, asymmetric stripline) are **visual preview only** in beta 0.4. The calculator refuses a numeric Z result for these until a validated multilayer/CPW field model is available.

For via fence wavelength, clearances, pad/drill and limitations see [Via Fence Method](VIA_FENCE_METHOD.md).
