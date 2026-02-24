---
title: "Building a VST3 Plugin From Circuit Diagrams"
date: 2026-02-24
draft: true
tags: ["vst3", "plugin-development", "wdf"]
---

## Most Plugin Development Starts With Listening

Traditional plugin development:
1. Acquire vintage hardware
2. Record test signals through it
3. Analyze frequency response and harmonic content
4. Code an algorithm that approximates the behavior
5. Tune by ear until it sounds "close enough"

This works. It's how most of the plugins you use were made. But it has limitations.

---

## Our Approach: Start With the Schematic

At Puget Audio, we do something different. We start with the circuit diagram.

### Step 1: Circuit Analysis

For a Tube Screamer, that means:
- JRC4558D dual op-amp (or equivalent)
- Two silicon diodes for asymmetric clipping
- RC network defining the tone stack
- Input/output buffers

We identify every node, every current path, every component value.

### Step 2: WDF Component Modeling

Each component becomes a WDF element:
- **Resistors:** Simple reflection coefficients
- **Capacitors:** First-order reactive elements with discrete-time equivalents
- **Op-amps:** Modeled as dependent sources with finite gain-bandwidth
- **Diodes:** Nonlinear elements using Lambert W-function or iterative solvers

### Step 3: Topology Assembly

The schematic's connectivity becomes a directed graph of WDF adaptors. Series connections use series adaptors. Parallel connections use parallel adaptors. The root of the tree is the input/output port.

This isn't abstract — it's a direct mapping from schematic to code.

### Step 4: Real-Time Implementation

WDFs are inherently recursive and sample-rate independent. We implement:
- **Oversampling** for nonlinear elements to prevent aliasing
- **Newton-Raphson iteration** for diodes and transistors (typically converges in 2-3 iterations)
- **Block processing** for efficiency in DAW contexts

---

## The Verification Process

### Step 5: Compare to Hardware

Here's where we validate. We build the physical circuit on a breadboard and record:
- Frequency sweeps at various gain settings
- Transient response to impulses
- Harmonic distortion spectra
- Dynamic response to varying input levels

Then we run the same signals through the WDF model and compare.

### When They Don't Match

If the model diverges from hardware, we don't tweak coefficients. We debug the physics:
- Did we miss parasitic capacitance in the PCB layout?
- Is the op-amp's slew rate limiting in the real circuit?
- Are power supply interactions affecting the behavior?

The WDF model is only "correct" when it matches for the right reasons — because it's simulating the same physics.

---

## Why This Matters for You

### Preset Compatibility

Because our Tube Screamer model follows the same circuit topology as the hardware, settings translate directly. If you know the real pedal, you know our plugin.

### Modification Culture

Open-source WDF models mean you can modify circuits. Want to try germanium diodes instead of silicon? Change the forward voltage parameter. Want a different tone cap? Swap the value. The model responds like the hardware would.

### Educational Value

Every plugin ships with its circuit diagram and WDF implementation. Learn analog electronics by experimenting with validated models before touching a soldering iron.

---

## The VST3 Specifics

### Why VST3?

- **Native sample rate support:** No SRC artifacts
- **Low latency:** Critical for monitoring while tracking
- **Industry standard:** Works in every major DAW

### Our Architecture

```
VST3 Host
    ↓
Audio Processor (real-time thread)
    ↓
WDF Engine (circuit simulation)
    ↓
Component Models (resistors, caps, op-amps, diodes)
```

The UI runs on a separate thread, communicating parameter changes via lock-free queues. The DSP thread never blocks.

### Parameter Mapping

Physical knobs map to circuit parameters:
- **Drive:** Varies diode clipping threshold
- **Tone:** Switches capacitor values in the RC network
- **Level:** Adjusts output buffer gain

No hidden processing. What you see in the schematic is what you hear.

---

## From Days to Hours

Traditional plugin development: weeks of tuning by ear.

WDF development: once the circuit model is validated, it sounds right immediately. The engineering effort shifts from "making it sound good" to "making it efficient and stable."

This is how we can offer circuit-accurate models at prices below the competition. The hard work is in the math, not the tuning.

---

*Interested in building your own? The [PedalKernel SDK](https://pedalkernel.dev/sdk) includes templates for VST3 plugins with WDF integration.*
