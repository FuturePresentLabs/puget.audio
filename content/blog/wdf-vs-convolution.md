---
title: "WDF vs. Convolution: Two Approaches to Amp Modeling"
date: 2026-03-19T16:00:00Z
draft: false
description: "Why Wave Digital Filters capture the dynamic feel of real amps while convolution and neural approaches hit fundamental limits."
---

There are two fundamentally different philosophies behind modern amp and pedal simulation. They can produce results that sound similar on a spec sheet. They behave completely differently under your hands.

Understanding the difference will change how you evaluate every plugin you buy.

---

## The snapshot approach: convolution and IRs

Convolution reverb came out of a simple insight: if you can capture a room's impulse response — the way it responds to a sharp transient — you can mathematically convolve any audio signal with that response and hear what it would have sounded like in that room. The math is well-understood, the results are excellent, and it scales beautifully to modern hardware.

People applied the same logic to guitar gear. Capture a cabinet's frequency response with a measurement microphone, load it into a DAW as an IR, done. Cabinet IRs are genuinely great. A static cabinet with no moving parts responds the same way to every transient, so a snapshot of its frequency behavior is a faithful representation of what it does.

The problem is when people tried to apply this to the *rest* of the signal chain — preamps, power stages, pedals. Here, the snapshot assumption collapses.

A 1959 Plexi doesn't have a static frequency response. It has a *dynamic* one. The power supply sags when you hit a loud chord, so the next note has less headroom and more compression. The output transformer saturates differently depending on how much current the power tubes are pulling. The power supply voltage sags under load, changing how hard the tubes are being driven. The output transformer saturates differently at different current levels.

None of this is captured in a convolution measurement. An IR of a cranked Marshall is a picture of that Marshall at one moment, at one volume, with one guitar, at one pick velocity. Move any of those variables and the snapshot is wrong.

## The neural approach: learning to mimic

Neural network amp modeling — the technology behind a number of popular hardware and software products — takes a different tack. Instead of capturing a single snapshot, you run a device through thousands of test signals, record the output, and train a network to map inputs to outputs. Done well, this produces models that generalize reasonably well across settings and playing dynamics.

It sounds better than static convolution. And for players who want a black-box "sounds like a Marshall" solution, it often delivers.

But there's a fundamental ceiling on what mimicry can achieve.

A neural model doesn't know that the voltage sag at high SPL comes from the power supply's capacitance being overwhelmed by transient current draw. It doesn't know that the particular breakup character of a cathode-biased EL84 comes from the way cathode current affects the tube's operating point. It has learned a very sophisticated pattern that correlates inputs to outputs — but it has no model of *why*.

This shows up in several ways. Neural models can hallucinate — produce plausible-sounding but physically impossible behavior at settings that weren't well-represented in training data. They can't be modified at the component level; there's no way to ask what the amp would sound like with a different output transformer. And they can't model gear that no one has captured — obscure prototypes, custom shop builds, historical circuits where the original hardware no longer exists.

## WDF: build the circuit, let the physics compute the sound

Wave Digital Filters start from the schematic.

The core idea, formalized by Alfred Fettweis in 1986, is that any analog circuit can be represented as a network of digital elements that obey the same energy-flow relationships as their physical counterparts. A capacitor stores energy over time. A resistor dissipates it as heat. A diode passes current asymmetrically based on a nonlinear voltage-current relationship. An inductor resists changes in current.

Connect these digital elements in the same topology as the original schematic, drive the network with your guitar signal, and read the output. The sound isn't programmed in — it emerges from the same physics that produces the sound in the physical device.

This is what makes WDF models behave differently in practice. When you dig in with your pick and the supply voltage momentarily drops under the current load, the diode clipping threshold shifts — because the circuit's operating point shifts. Roll back your guitar's volume and the plugin responds to the lower signal level the same way the hardware does — the input stage's operating point changes, headroom opens up, the character shifts.

The honest limit is everything *upstream* of your audio interface. A real pickup is an inductor that resonates with whatever it's plugged into, and by the time the signal reaches a plugin the interface has already flattened that interaction. No plugin can fully recover it — ours included. What WDF does get right is everything downstream of the ADC, and that's most of the circuit. None of it is programmed. It's just the physics.

## The practical tradeoffs

This isn't an argument that WDF is easy or that other approaches have no merit.

Convolution IRs are genuinely excellent for static linear components — cabinets, acoustic spaces, plate reverbs. Use them for that. The problem is pretending they model the dynamic parts of the signal chain.

Neural modeling is improving rapidly. For players who want a good-sounding "this amp at this setting" model and aren't interested in component-level accuracy, it's a legitimate choice.

WDF has its own costs. Modeling complex circuits with multiple interacting nonlinear elements — tubes, transistors, diodes all in the same network — requires careful solver design to stay stable and real-time. Getting the Gummel-Poon parameters right for a specific transistor requires either measurement of physical units or careful extraction from datasheets. It takes more engineering work per model.

But the result is a plugin that ages well. As you discover new settings, new guitars, new playing styles, the model keeps responding correctly — because it's not guessing from a learned pattern. It's running the circuit.

## Why it matters for how you play

The practical difference shows up in two places.

**Dynamics.** WDF models respond to pick attack, volume knob position, and output level the way hardware does — because the same physics governs both. Neural and IR-based models can approximate this, but they're approximating. The WDF model is computing it.

**Exploration.** When a circuit-accurate model behaves unexpectedly, it's usually telling you something true about the original circuit. That happy accident with the volume rolled off and the gain maxed? That's a real behavior of the physical circuit, not a training artifact. You can trust it.

---

Every Puget Audio plugin is built on [PedalKernel](https://pedalkernel.com), an open-source WDF engine. We write a netlist — the actual component values from the original schematic — and the engine compiles it into a real-time audio processor. No curve fitting. No training data. Just the circuit, running as math.

[Browse the Legends collection →](https://puget.audio/plugins/legends/)