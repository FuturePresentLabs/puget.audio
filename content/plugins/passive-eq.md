---
title: "Puget Passive EQ"
description: "Pultec EQP-1A circuit-modeled equalizer plugin (VST3/AU/AAX)"
subtitle: "Pultec EQP-1A Program Equalizer"
date: 2026-02-24
slug: "passive-eq"
price: 199.00
sku: "puget-passive-eq"
product_type: "plugin"
plugin_type: "Equalizer"
category: "plugins"
status: "available"
short_name: "Passive EQ"
icon: "EQ"
wdf_components: "Inductors, capacitors, 12AX7 tube"
og_image: "/images/puget-og.jpg"
weight: 1
specs:
  - label: "Circuit Origin"
    value: "Pultec EQP-1A"
  - label: "Topology"
    value: "Passive LC EQ + tube makeup gain"
  - label: "Tube Stage"
    value: "12AX7 triode"
  - label: "EQ Bands"
    value: "Low shelf, high shelf, HF attenuator"
  - label: "Formats"
    value: "VST3, AU, AAX"
  - label: "Platform"
    value: "macOS 10.15+, Windows 10+"
  - label: "License"
    value: "Perpetual — no iLok, no dongle"
---

The Pultec is the textbook case for why WDF modeling matters. It's a passive LC equalizer — literally inductors and capacitors in a ladder network — followed by a single 12AX7 tube makeup gain stage. This is the exact circuit topology Wave Digital Filters were invented to model with mathematical precision.

## The boost-and-cut trick

The famous "boost and cut at the same frequency" move? It's not programmed. It's not a DSP hack. It falls out of the circuit topology naturally — because we modeled the actual passive network, and that's what passive networks do.

Hear the real interaction between the boost and cut coils, the way the tube stage warms and compresses the peaks, the subtle resonance of the inductors.

## What's under the hood

- **Passive LC EQ network** into tube makeup gain (12AX7 triode)
- **Boost/cut interaction** emerges from circuit topology, not curve fitting
- **Low shelf, high shelf, high-frequency attenuation** — three tools in one
- **Every inductor, capacitor, and the tube stage** modeled as WDF elements with real physical parameters

<!-- audio-demo: passive-eq -->

## Use it on

Vocals. Mix bus. Acoustic instruments. Anywhere you need to shape tone without fighting the source material. The Pultec adds body and air simultaneously — because the circuit lets you.

**$199 — Perpetual license. No iLok. No dongle.**
