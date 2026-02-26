---
title: "Puget Variable-Mu"
description: "Fairchild 670 circuit-modeled stereo limiter plugin (VST3/AU/AAX)"
subtitle: "Fairchild 670 Stereo Limiter"
date: 2026-02-24
slug: "variable-mu"
price: 199.00
sku: "puget-variable-mu"
product_type: "plugin"
plugin_type: "Compressor/Limiter"
category: "plugins"
status: "available"
short_name: "Variable-Mu"
icon: "Mu"
wdf_components: "6386 triodes, transformers, push-pull amplifier"
og_image: "/images/puget-og.jpg"
weight: 4
specs:
  - label: "Circuit Origin"
    value: "Fairchild 670"
  - label: "Topology"
    value: "Push-pull Class A with variable-mu gain reduction"
  - label: "Gain Reduction"
    value: "6386 remote-cutoff triode"
  - label: "Signal Amplifier"
    value: "4× parallel 6386 per channel half"
  - label: "Time Constants"
    value: "6 settings, program-dependent release"
  - label: "Stereo Modes"
    value: "Stereo, lateral/vertical (mid-side)"
  - label: "I/O"
    value: "Transformer-coupled (WDF two-ports)"
  - label: "Formats"
    value: "VST3, AU, AAX"
  - label: "Platform"
    value: "macOS 10.15+, Windows 10+"
  - label: "License"
    value: "Perpetual — no iLok, no dongle"
---

The holy grail. Original 670s sell for $40,000+ when they surface. Twenty tubes, eleven transformers, and the 6386 remote-cutoff triode that makes variable-mu compression possible.

## How variable-mu works

The gain reduction happens by biasing push-pull tube stages — as the control voltage changes, the tube's amplification factor (μ) changes with it. Smooth, musical, and harmonically complex in a way that VCA and FET designs can't replicate.

We modeled the 6386 with a novel WDF triode model fitted to the original GE datasheet curves. Every tube has its own operating point. Every stage interacts.

## Where WDFs really shine

The transformer coupling between stages is where WDFs excel. Transformers map naturally to WDF two-port elements, capturing the frequency-dependent saturation and phase behavior that gives the 670 its legendary "glue."

- **6386 remote-cutoff triode** — variable-mu compression from the actual tube model
- **Push-pull Class A signal amplifier** (4× parallel 6386 per channel half)
- **Transformer-coupled input and output** modeled as WDF two-ports
- **Six time constant settings** with program-dependent release
- **Stereo with lateral/vertical (mid-side) operation**

<!-- audio-demo: variable-mu -->

## Use it on

The mix bus. The stereo bus. Master chain. The 670 is the reason engineers describe compression as "glue." It ties a mix together without crushing it — the program-dependent release and tube harmonics do the work.

**$199 — Perpetual license. No iLok. No dongle.**
