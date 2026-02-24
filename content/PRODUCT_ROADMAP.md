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

## Phase 3: Hardware Pedals (Physical)

**Manufactured in-house at Future Present Labs in Seattle.**

All hardware pedals use circuits composed entirely of validated WDF-modeled components from the PedalKernel engine. Hardware and software share identical circuit DNA — the same resistors, capacitors, op-amps, and photocouplers exist as validated models in both domains.

---

### Phase Lock — Frequency-Aware Parallel Signal Processor
**Price:** $200–$260

**The Problem:**
Every bass player with a dirt pedal knows it: blend clean signal with distorted signal, and the low end disappears. The result is hollow, phasey, and thin. Simple parallel mixing ignores phase relationships, frequency overlap, and dynamics mismatch.

**The Engineering Fix:**
Phase Lock splits the input through a 4th-order Linkwitz-Riley active crossover, sends only the highs through an effects loop (where the player patches their dirt/fuzz/synth pedals), and recombines processed highs with untouched clean lows.

**Technical Details:**
- **Crossover:** 4th-order Linkwitz-Riley (LR4), 80–500Hz adjustable
- **Summation:** Flat magnitude + phase coherence at crossover point
- **Dynamics Matcher:** Dual-envelope compressor driven by VTL5C3 photocoupler
- **Purpose:** Matches clean path dynamic range to dirty path for consistent blend
- **Power:** Internal charge pump (9V → 18V) for headroom
- **Enclosure:** 1590BB, four jacks (INPUT, OUTPUT, SEND, RETURN)

**Controls:**
- CROSSOVER: 80–500Hz
- BLEND: Clean/dirty ratio
- DYNAMICS: Matching intensity
- VOLUME: Output level

**Why Phase Lock First:**
1. Addresses universal, well-understood bass player pain point
2. Uses only validated WDF components: TL072, JFET buffers, photocouplers, envelope followers
3. Positions Puget Audio as engineering-first problem solvers, not vintage cloners
4. Establishes hardware build quality standard for the line
5. Strong margins: BOM $35–55, retail $200–260

**Competitive Landscape:**
| Product | Price | Approach |
|---------|-------|----------|
| Boss LS-2 | $100 | Simple A+B mixer, no crossover, no phase alignment |
| Darkglass (blend knobs) | $200–$300 | Full-range mixing, no frequency separation |
| **Phase Lock** | **$200–$260** | **Crossover + phase alignment + dynamics matching** |

---

### String Time — Analog String-Age Simulator
**Price:** $160–$200

**The Concept:**
Spectral reshaping pedal that simulates bass string tonal character at every stage of life — from zingy new roundwounds to dead, woody thump of six-month-old flatwounds.

**One Knob (AGE):** Sweeps continuously through entire string-aging spectrum.

**Not a Tone Knob:**
String aging is complex, multi-dimensional spectral transformation:
- Higher harmonics die first
- Transient brightness fades
- Inharmonicity increases
- Fundamental-to-harmonic ratio shifts

A tone knob addresses ~10% of this. String Time models the full phenomenon through dual-path analog processing.

**Circuit Architecture:**

**Fresh Side (AGE fully CCW):**
- Harmonic enhancer based on simplified Aphex Aural Exciter topology
- HPF isolation of upper harmonics
- Asymmetric soft clipping (germanium + silicon diodes) generates 2nd and 3rd order harmonics
- Filtered and mixed back at low level
- Adds "zing" and "sparkle" of new roundwounds to any string

**Dead Side (AGE fully CW):**
- Progressive harmonic suppressor
- Cascaded multi-stage LPFs: 1st-order at 4kHz, 2nd-order Sallen-Key at 2kHz
- Resonant notch at 800Hz for characteristic "scooped" quality of dead strings
- Envelope-driven transient softener (VTL5C1 fast photocoupler) attenuates initial pick attack's high-frequency content
- Dead strings don't "zing" on the attack — they "thud"

**Noon Position:**
Neither path active. Signal passes flat. Represents strings at 3–4 weeks — the "broken in" sweet spot most players prefer.

**AGE Pot Taper:**
Dual-gang pot with shaped taper mapping musically to string-aging timeline:
- 7:00–10:00: Very fresh
- 10:00–12:00: Subtle enhancement
- 12:00: Flat (broken in)
- 12:00–2:00: Subtle aging
- 2:00–5:00: Dead flatwound territory

**Controls:**
- AGE (one knob — that's it)

**Why String Time Second:**
1. Creates new product category — no pedal/plugin/outboard marketed as string-age simulator
2. Zero direct competitors
3. Addressable market: entire bass-playing population (not just dirt pedal users)
4. Single-knob interface infinitely shareable — 5 seconds of video communicates value
5. Low BOM ($26–40), excellent margins at $160–200
6. Compact enclosure (1590B or 125B)
7. All components exist in PedalKernel WDF library

**Critical Success Factor:**
Voicing must NOT sound like "just a tone knob." The transient softener and harmonic enhancer are the differentiators and must be validated through blind listening tests with real bass players before production.

---

## Hardware Differentiation

**Software→Hardware Pipeline:**
1. Circuit designed in PedalKernel WDF environment
2. Component models validated against real parts
3. PCB layout optimized for audio performance
4. CNC-machined enclosures in-house (Seattle)
5. Hand-assembled and tested

**WDF-First Design:**
Every resistor, capacitor, and semiconductor exists as a validated WDF model before the hardware is built. The plugin and hardware versions are mathematically identical.

**Open Technology:**
Circuit topology documented, WDF models open-source in PedalKernel. Buy the hardware for the craftsmanship and convenience — the knowledge is free.

---

## Complete Product Matrix

| Category | Product | Price | Status |
|----------|---------|-------|--------|
| **Pedals (Plugins)** | Tube Screamer | $19–$29 | Q1 2026 |
| | CE-2 Chorus | $19–$29 | Q1 2026 |
| | Big Muff Pi | $19–$29 | Q1 2026 |
| | ProCo RAT | $19–$29 | Q1 2026 |
| | Univibe | $19–$29 | Q2 2026 |
| | Rangemaster | $19–$29 | Q2 2026 |
| **Studio (Plugins)** | Passive EQ | $59–$99 | Q2 2026 |
| | Opto Compressor | $79–$119 | Q3 2026 |
| | FET Limiter | $89–$129 | Q4 2026 |
| | Channel Strip | $99–$149 | Q4 2026 |
| | Variable-Mu | $129–$179 | Q4 2026 |
| **Hardware** | Phase Lock | $200–$260 | TBD |
| | String Time | $160–$200 | TBD |

---

## The Narrative

**"We don't approximate analog. We simulate it."**

Every product — free or premium, software or hardware — is built on the same WDF engine that models actual circuits at the component level. When you turn the tone knob on a Puget Tube Screamer plugin, you're not moving a parameter on a curve-fit approximation. You're changing the value of a capacitor in a simulated RC network that interacts with every other component in the circuit, just like the real thing.

The PedalKernel engine is open source, so the approach is verifiable. The Puget Audio products are where that technology gets packaged into polished, professional tools — both in software and in hardware that you can bolt to your pedalboard.

**Built in Seattle. Modeled from the circuit up.**

---

## Competitive Positioning Matrix

| | PedalKernel Free | Puget Audio Plugins | Puget Audio Hardware |
|---|---|---|---|
| **Price** | $0–$19 | $49–$179 | $160–$260 |
| **Audience** | Developers, DIY, budget | Professionals, enthusiasts | Bass players, gigging musicians, gear collectors |
| **Competitors** | Analog modeling OSS (e.g., guitarix, CAPS) | UAD, Waves, Neural DSP, Arturia | Boss LS-2, Xotic X-Blender (Phase Lock); no competitors (String Time) |
| **Differentiator** | Open-source WDF, inspectable models | Circuit-accurate WDF at lower prices than UA | Original designs solving real problems; WDF-modeled components; machined in-house in Seattle |

---

## Long-Term Vision

**The Ecosystem Endgame:**

PedalKernel is the open engine that proves the technology. Puget Audio is the product brand that monetizes it. The hardware pedals create a physical platform that generates recurring revenue through downloadable models.

**The Model Marketplace:**
Third-party developers can sell their own WDF circuit models for Puget hardware — turning the platform into something self-sustaining.

**The Flywheel:**
- Machine shop manufactures the hardware
- WDF engine powers the software
- Open-source community validates the science
- Every product feeds every other product

Everything feeds everything else.

---

*Document Version: 1.2*
*Last Updated: 2026-02-24*
*Status: Planning Phase — Hardware Specs Complete*
