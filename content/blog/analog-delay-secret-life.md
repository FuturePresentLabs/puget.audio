---
title: "The Secret Life of Your Delay Pedal"
date: 2026-02-27T10:00:00Z
draft: false
description: "Why analog delays sound darker and more organic than digital — the hidden role of the compander and BBD charge transfer physics."
---

If you've ever compared a Boss DM-2 or Electro-Harmonix Memory Man to a clean digital delay, you already know they don't sound the same. The analog delay is darker, warmer, and slightly unstable — the repeats decay into a murky wash that sits behind your dry signal instead of competing with it.

Most people chalk this up to "analog magic" and leave it at that. But the real story is more interesting. The character of an analog delay comes from a chip you've probably never thought about: the compander.

## The BBD: a bucket brigade of imperfect handoffs

The heart of an analog delay is the bucket-brigade device — a chip like the MN3005, MN3007, or SAD1024. Inside are hundreds or thousands of tiny capacitor cells arranged in a line. Your audio signal enters the first cell as a voltage, and a clock signal shifts that voltage from cell to cell down the line, like a bucket brigade passing water.

The delay time depends on how fast the clock runs. Slow clock, long delay. Fast clock, short delay. Simple enough.

The problem is that each handoff between cells is imperfect. A tiny amount of charge leaks or fails to transfer at every step. After passing through 1024 or 4096 stages, those tiny losses add up. High-frequency content — which requires the most precise voltage representation — suffers the most. The result is a natural low-pass filter effect that gets stronger with longer delay times.

This is why analog delay repeats get darker as they recirculate. Each trip through the BBD strips away more highs. It's not a filter someone designed — it's a side effect of the charge transfer physics. And it's a big part of why analog delays sit so well in a mix. The repeats naturally move out of the way of your dry signal.

## The compander: the part nobody talks about

Here's what most people don't realize: your guitar signal never hits the BBD directly. BBD chips have terrible dynamic range. The MN3005, one of the best BBDs ever made, manages about 60-65 dB of usable dynamic range. For context, a CD has 96 dB. Your guitar signal, especially with a hot pickup or a drive pedal in front, can easily exceed what the BBD can handle cleanly.

The solution is a compander — a compressor on the input side and an expander on the output side, usually built from a single NE570 or NE571 chip. Before your signal enters the BBD, the compressor squeezes it down by a 2:1 ratio. This fits the signal into the BBD's limited dynamic range. After the signal exits the BBD, the expander reverses the process at 1:2, restoring the original dynamic range.

In theory, this is transparent. Compress, delay, expand — you get back what you put in. In practice, it's anything but transparent. And that's where the magic lives.

## Tracking error: the source of analog delay character

The compressor and expander each have their own envelope detector — a circuit that measures the signal level and adjusts the gain accordingly. These envelope detectors use "syllabic" time constants (typically 5-50 milliseconds) to track the overall energy of the signal rather than individual waveform cycles.

Here's the problem: the expander doesn't know what the compressor did. It can only measure the signal coming out of the BBD and try to undo the compression based on what it sees right now. But the signal it's seeing was compressed milliseconds or hundreds of milliseconds ago, based on the envelope at the time of compression.

If the signal's envelope was changing — a pick attack, a volume swell, the start of a chord — then the compression applied at the input no longer matches what the expander calculates at the output. The expander under-corrects or over-corrects, and the result is a subtle amplitude modulation of the delayed signal.

This is **tracking error**, and it produces the characteristic "pumping" and "breathing" of analog delays. Hit a hard note and the repeat comes back with a slightly different dynamic envelope than what you played. The attack is softened, the sustain blooms a little differently. It's not drastic — maybe a dB or two — but your ear picks up on it immediately. It's a big part of why analog delay repeats feel "alive" compared to the static, perfect repeats of a digital delay.

## Why longer delays pump more

The tracking error gets worse with longer delay times, and the reason is straightforward. When the delay time is long, the signal that reaches the expander was compressed based on the envelope from a long time ago. The longer the gap, the more the envelope has had time to change, and the bigger the mismatch between what the compressor did and what the expander expects.

At short delay times (chorus and flanger territory, 5-30ms), the compressor and expander stay nearly in sync because not much changes in 5 milliseconds. The companding is close to transparent.

At long delay times (300ms+), the envelopes can be wildly different. Fast pick attacks that were compressed on the way in get expanded based on a completely different envelope on the way out. The pumping becomes audible and contributes to that "wash" quality of long analog delays.

This also explains why the character of an analog delay changes depending on what you play into it. Sustained notes with stable envelopes track well — the compander stays synchronized and the repeats are relatively clean. Fast staccato playing or dramatic volume swells create rapid envelope changes that the compander can't track, producing more artifacts. The delay responds to your playing style, not just your notes.

## Clock noise: the hiss that isn't random

There's another sound baked into every analog delay: clock feedthrough. The BBD needs a clock signal to shift charges between cells, and that clock signal inevitably leaks into the audio path. It shows up as a high-pitched whine or hiss whose frequency is directly related to the clock rate.

At short delay times (fast clock), the clock noise is ultrasonic and inaudible. At long delay times (slow clock), it drops into the audible range. This is why turning up the delay time on a DM-2 or Memory Man gradually introduces a background hiss that wasn't there at shorter settings.

It's not random noise — it's the clock signal bleeding through. Most analog delays have a low-pass filter after the BBD to suppress clock noise, but there's a tradeoff. Filter too aggressively and you kill the highs in your repeats. Filter too little and you hear the clock. Every analog delay is a compromise between these two, and that compromise is part of its character.

## Putting it all together

The sound of an analog delay is the sum of all these imperfections working together. The BBD's charge transfer loss darkens the repeats progressively. The compander's tracking error adds dynamic pumping that responds to your playing. The clock feedthrough adds delay-time-dependent noise. And all of these interact with the feedback path — each repeat goes through the entire chain again, compounding the effects.

By the third or fourth repeat, your signal has been compressed, charge-transferred, expanded, filtered, compressed again, charge-transferred again, expanded again — each pass adding a little more darkness, a little more envelope modulation, a little more noise. The repeat doesn't just get quieter; it gets *different*. It evolves into something that's clearly derived from what you played but no longer the same. That decay into murk is the analog delay sound.

## Why most digital emulations miss this

A lot of "analog delay" plugins model the BBD and maybe add a low-pass filter on the feedback path to darken the repeats. That gets you some of the character but misses the compander entirely.

Without compander modeling, you lose the tracking error — the dynamic pumping that makes each repeat respond differently to transients versus sustained notes. You lose the way long delay settings pump more than short ones. You lose the interaction between your playing dynamics and the delay's character.

You're left with a dark delay that sounds okay but doesn't *feel* like an analog delay.

At [Puget Audio](https://puget.audio), our BBD models include the full compander chain — independent compression and expansion stages with separate envelope detectors, tracking error computation based on envelope dynamics and clock rate, and clock feedthrough modeling. The [WDF engine](/blog/what-is-wdf/) runs the NE571 compander model the same way it runs every other part of the circuit: from the component level, letting the artifacts emerge from the physics rather than being faked with post-processing.

The result is a delay that pumps on hard transients, breathes on volume swells, darkens progressively with longer delay times, and decays into that analog wash — not because we programmed those behaviors in, but because that's what the circuit does.

You can explore the open-source engine behind our plugins at [github.com/ajmwagar/pedalkernel](https://github.com/ajmwagar/pedalkernel), including BBD models with full compander emulation.
