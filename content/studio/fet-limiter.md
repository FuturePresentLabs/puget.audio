---
title: "Puget FET Limiter"
description: "UREI 1176LN circuit-modeled limiting amplifier plugin (VST3)"
subtitle: "UREI 1176LN Limiting Amplifier"
date: 2026-02-24
slug: "fet-limiter"
price: 199.00
sku: "puget-fet-limiter"
product_type: "plugin"
plugin_type: "Limiter"
category: "plugins"
status: "available"
short_name: "FET Limiter"
icon: "FET"
wdf_components: "JFET, Class A transistor stages, transformers"
og_image: "/images/puget-og.jpg"
weight: 3
usage:
  - "Drums"
  - "Room mics"
  - "Anything that needs to hit hard"
  - "Fast transients"
specs:
  - label: "Circuit Origin"
    value: "UREI 1176LN"
  - label: "Topology"
    value: "JFET gain reduction + Class A transistor amplifier"
  - label: "Gain Reduction"
    value: "JFET voltage-variable resistor"
  - label: "Ratios"
    value: "4:1, 8:1, 12:1, 20:1 + All Buttons In"
  - label: "Attack"
    value: "20μs – 800μs"
  - label: "Release"
    value: "50ms – 1.1s"
  - label: "I/O"
    value: "Transformer-coupled input and output"
  - label: "Formats"
    value: "VST3"
  - label: "Platform"
    value: "macOS 10.15+, Windows 10+"
  - label: "License"
    value: "Perpetual — no iLok, no dongle"
---

The fastest compressor in the room. The 1176's gain reduction element is a single JFET used as a voltage-variable resistor — which maps naturally to a nonlinear one-port in our WDF tree. The rest is discrete Class A transistor amplifier stages, transformer I/O, and the four ratio settings that change the feedback topology.

## All Buttons In

The "All Buttons In" mode — where all four ratio buttons are pressed simultaneously — isn't a preset. It's what happens when you wire all four feedback paths in parallel.

We modeled the actual feedback network, so ABM behaves exactly the way it does on hardware: fast, aggressive, and harmonically rich. No shortcuts. No "approximate ABM" mode.

## Built for speed

- **JFET gain reduction** as a nonlinear WDF element — the fastest attack in the compressor world
- **Class A transistor amplifier stages** — discrete, not op-amp
- **Transformer-coupled input and output** — modeled as WDF two-ports with frequency-dependent saturation
- **Four ratios** (4:1, 8:1, 12:1, 20:1) + All Buttons In

<!-- audio-demo: fet-limiter -->

## Use it on

Drums. Room mics. Anything that needs to hit hard. The 1176 on drums is one of recording's most documented moves — now with the actual circuit behavior, not a cleaned-up approximation.

Attack: 20μs – 800μs. Release: 50ms – 1.1s.

**$199 — Perpetual license. No iLok. No dongle.**
