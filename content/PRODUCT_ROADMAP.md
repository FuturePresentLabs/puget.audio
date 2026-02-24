# Puget Audio — Product Roadmap

## Overview
Comprehensive VST3 plugin lineup built on the Wave Digital Filter (WDF) engine. Spanning guitar pedals and studio processors, each product demonstrates the mathematical rigor of circuit-accurate modeling.

---

## Phase 1: Puget Classics Bundle (Pedals)
**Price:** $49–$79 (bundle) | **Individual:** $19–$29

### 1. Tube Screamer (TS-808 / TS9)
**The most iconic overdrive ever built.**

**Circuit Details:**
- Op-amp clipping stage with asymmetric diodes
- Tone stack with signature mid-hump
- Input/output buffers

**WDF Advantage:**
Captures the interaction between the op-amp feedback network and the clipping diodes. The mid-hump and compression emerge naturally from component interactions, not EQ curves.

**Variants:**
- TS-808: Warmer, more compressed
- TS9: Slightly brighter, more aggressive

---

### 2. Boss CE-2 Chorus
**BBD-based analog chorus.**

**Circuit Details:**
- Bucket-brigade delay line
- LFO-modulated clock
- Analog signal path artifacts

**WDF Advantage:**
Models the subtle timing imperfections and clock feedthrough that make analog chorus sound alive compared to pristine digital implementations.

---

### 3. Electro-Harmonix Big Muff Pi
**Four-stage transistor clipping.**

**Circuit Details:**
- Cascaded gain stages (4x transistor)
- Distinctive tone stack
- High-impedance input stage

**WDF Advantage:**
Each stage's output impedance loads the next stage's input — the model captures this loading naturally. The "Muff" sound emerges from component interaction, not preset gain curves.

---

### 4. ProCo RAT
**Op-amp distortion with unique filter network.**

**Circuit Details:**
- LM308 op-amp with slew-rate limiting
- Distinctive filter network
- Variable distortion control

**WDF Advantage:**
The LM308's slew-rate limiting is part of the RAT's character. WDF models this accurately, capturing the "spit" and "bite" that other emulations miss.

---

### 5. Univibe
**Photocell-based modulation.**

**Circuit Details:**
- Light-dependent resistors (LDRs)
- Complex LFO behavior
- Throb characteristic

**WDF Advantage:**
The photocell response (not a perfect sine wave) creates the distinctive pulse. WDF captures the nonlinear LDR behavior and lamp filament thermal dynamics.

---

### 6. Dallas Rangemaster Treble Booster
**Single germanium transistor.**

**Circuit Details:**
- One germanium transistor
- Simple high-pass filter
- Historically significant circuit

**WDF Advantage:**
Demonstrates how WDF handles simple circuits with extreme accuracy. The germanium transistor's temperature-dependent leakage and gain are modeled precisely.

**Historical Note:** Used by Brian May, Tony Iommi, and countless others.

---

## Phase 2: Studio Processors

### Puget Passive EQ ($59–$99)
**Pultec EQP-1A Program Equalizer**

**Why This First:**
The Pultec is the textbook WDF use case. The passive LC equalizer network is literally an inductor-capacitor ladder — exactly what WDFs were designed to model mathematically.

**Circuit Details:**
- Passive LC ladder network (inductors + capacitors)
- Tube makeup gain (12AX7 triode)
- Transformer I/O

**The Famous Trick:**
"Boost and cut at the same frequency" emerges naturally from the passive network topology. No artificial programming required — it just falls out of an accurate circuit model. This is the ultimate WDF demonstration.

**Competitive Positioning:**
- UA: $149+
- Waves: $29 (emulation)
- **Puget:** $59–$99 (circuit-accurate)

---

### Puget Opto Compressor ($79–$119)
**Teletronix LA-2A Leveling Amplifier**

**Circuit Details:**
- Tube gain stages with passive interstage networks
- T4B electro-optical attenuator
- EL panel + CdS photoresistor

**WDF Advantage:**
The T4B's program-dependent attack/release can be modeled as a nonlinear one-port WDF element with physically derived characteristics. The "compression curve" emerges from photocell physics, not lookup tables.

**Bundle Opportunity:**
"Puget Studio Essentials" — Passive EQ + Opto Compressor at $149

---

### Puget FET Limiter ($89–$129)
**1176 Peak Limiter**

**Circuit Details:**
- FET as nonlinear variable resistor
- Transistor amplifier stages
- Transformer I/O
- All-buttons-in mode

**WDF Challenge:**
Modeling the FET's voltage-controlled resistance accurately, especially in the "all-buttons" mode where multiple ratio circuits interact.

---

### Puget Variable-Mu ($129–$179)
**Fairchild 660/670**

**The Flagship Product.**

**Circuit Details:**
- Variable-mu tube push-pull gain reduction
- Massive transformer coupling
- Intricate sidechain
- Multiple time constants

**Statement Piece:**
"If we can model this accurately, we can model anything."

**Pricing Justification:**
- Most complex WDF model in the lineup
- UA: $299
- Puget: $129–$179

---

### Puget Channel ($99–$149)
**Neve 1073 Preamp/EQ**

**Circuit Details:**
- Transformer-coupled input (Marinair)
- Inductor-based EQ (St. Ives)
- Class-A amplifier stages
- High-pass filter

**WDF Perfect Match:**
Inductors, transformers, and discrete transistors — all natural WDF elements. The 1073's "sheen" emerges from accurate transformer modeling.

---

## Pricing Strategy

### Pedals (Classics Bundle)
| Tier | Price | Contents |
|------|-------|----------|
| Individual | $19–$29 | Single pedal |
| Bundle (4) | $49 | TS-808, CE-2, Big Muff, RAT |
| Complete (6) | $79 | All Classics + Univibe + Rangemaster |

### Studio Processors
| Product | Price | Positioning |
|---------|-------|-------------|
| Passive EQ | $59–$99 | Entry studio |
| Opto Compressor | $79–$119 | Essential dynamics |
| FET Limiter | $89–$129 | Aggressive limiting |
| Channel | $99–$149 | Complete channel strip |
| Variable-Mu | $129–$179 | Flagship, ultimate character |

### Bundles
| Bundle | Price | Contents |
|--------|-------|----------|
| Studio Essentials | $149 | Passive EQ + Opto Compressor |
| Producer Pack | $299 | All 5 studio processors |
| Everything Bundle | $349 | All pedals + all studio |

---

## Technical Differentiation Summary

**vs Impulse Responses:**
IRs capture a snapshot. WDFs simulate the physics. Dynamics, touch sensitivity, and component interactions are preserved.

**vs Curve Fitting:**
Curve-fitting approximates frequency response. WDFs model the actual circuit. Nonlinear behavior emerges naturally.

**vs Hybrid Methods:**
Hybrids combine modeling with samples, introducing latency and artifacts. WDFs run at native sample rates with minimal latency.

**The WDF Advantage:**
Every resistor, capacitor, inductor, and semiconductor is modeled as it behaves in the real circuit. The sound is not "close to analog" — it *is* analog, transformed into the digital domain through rigorous mathematics.

---

## Release Timeline (Proposed)

**Q1 2026:**
- Tube Screamer (launch product)
- Classics Bundle (4 pedals)

**Q2 2026:**
- Complete Classics (6 pedals)
- Passive EQ

**Q3 2026:**
- Opto Compressor
- Studio Essentials Bundle

**Q4 2026:**
- FET Limiter
- Channel Strip
- Variable-Mu (flagship)
- Producer Pack

---

## Marketing Angles

**For Guitarists:**
"The feel of analog, the convenience of software. Circuit-accurate models that respond to your playing like the real thing."

**For Engineers:**
"Mathematically rigorous circuit modeling. No impulse responses. No curve fitting. Just physics, simulated in real time."

**For Both:**
"Built in Seattle from open technology. Every purchase supports continued development of the PedalKernel WDF engine."

---

## Competitive Landscape

| Competitor | Approach | Price Range | Our Advantage |
|------------|----------|-------------|---------------|
| Universal Audio | Proprietary modeling | $79–$299 | Lower prices, open foundation |
| Waves | IR + hybrid | $29–$79 | True circuit modeling |
| Native Instruments | Black box | $49–$149 | Transparent, rigorous math |
| Plugin Alliance | Various | $49–$199 | PNW heritage, open source backing |
| Softube | Component modeling | $69–$179 | WDF specificity, price |

---

*Document Version: 1.0*
*Last Updated: 2026-02-24*
*Status: Planning Phase*
