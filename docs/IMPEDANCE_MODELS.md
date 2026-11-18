# PCB Impedance Lab · Analytical model specification · v0.2

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

## Symmetric stripline

Uses Cohn / Wadell symmetric **wide-strip** expression with plane-to-plane spacing B=Htop+Hbottom+T. Preconditions:

- A real interior copper conductor with the next copper layer above and below designated GND/PWR.
- |Htop−Hbottom|/mean(Htop,Hbottom) ≤ 10%, with warning if >2%.
- εr homogeneous on both sides and matching within 0.01 Dk.
- W/(B−T) > 0.35 and T/B ≤ 0.25.

Outside this range the calculator stops; it does not silently switch to an unvalidated narrow-strip interpolation. The interface describes the resulting scalar impedance as an analytic estimate. More complex offset/asymmetric cases belong in the future 2D solver.

Method reference: [Cohn/Wadell analytic overview](https://github.com/RFingAdam/lineforge/blob/main/docs/theory/analytical.md), [Polar stripline geometry explanation](https://www.polarinstruments.com/support/cits/AP123.html).

## Differential microstrip and differential stripline

Treat edge-coupled lines as an empirical correction applied to the calculated single-ended Z0:

- Differential microstrip: `k = 0.48 · exp(−0.96·S/H)`.
- Differential stripline: `k = 0.347 · exp(−2.9·S/B)`.
- `Zodd = Z0·(1−k)`, `Zeven = Z0·(1+k)`.
- `Zdiff = 2·Zodd`, `Zcommon = Zeven/2`.

These coefficients are an IPC-2141A-style fit, not full modal capacitance/field calculation. At tight coupling (S/H < 0.5) a warning indicates greater uncertainty. Likewise, displayed delay is the isolated-trace baseline, **not independent odd/even propagation velocities**.

References: [Coupled microstrip modelling in Qucs](https://qucs.github.io/tech/node77.html), [Analytic line models and differential coupling notes](https://github.com/RFingAdam/lineforge/blob/main/docs/theory/analytical.md). Never infer the actual characteristic impedance of a routed pair without verifying the reference copper coverage and geometry.

## Inverse width design

For a user-selected 10–250 Ω target, sample logarithmically in 0.025–5 mm track width, searching for a valid model range and a bracket that crosses the target. Then bisection determines W. If no valid bracket exists, report an unreachable target; **no made-up output**. Gap S stays fixed during width inversion. No optimizer for gap or dielectric height is present yet.

## Tolerance Explorer

A deterministic full factorial corner sweep over **five independent variables** W, H, T, S and εr gives 2⁵=**32 corner evaluations**. The sweep changes selected signal copper T, the dielectric height(s) between signal layer and adjacent reference copper, and those dielectric εr values; width and gap are perturbed in the geometry inputs. It uses user-supplied ± ranges from 0 to 30%. For single-ended modes S is an unused factor; duplicate corners still evaluate consistently.

Displays nominal, min and max, not percentage yield. Copper thickness variation here is an input perturbation, **not a simulation of electroless/electrolytic deposition or lamination**. Other manufacturing variables, correlation and temperature are not modelled.

## Explicit future upgrades (not in 0.2)

- 2D electrostatic field solve with adaptive meshing and convergence tests for arbitrary multi-dielectric microstrip/stripline and CPWG; calculate capacitances with and without material to derive Z0 and effective Dk.
- Differential mode solver separately evaluating odd/even capacitances, propagation velocities and modal asymmetry.
- Metal edge/etch trapezoids, LPI solder mask, surface roughness and dispersion/loss vs frequency, qualified reference material libraries with provenance and measurement benchmarks.
- CPWG grounded/unbacked, embedded/offset/broadside coupling, via 3D transition and return path checks from real layout.
- Independent comparison against a field solver and physical PCB measurement before declaring accuracy suitable for controlled impedance production.
