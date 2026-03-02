---
title: "Germanium vs Silicon: What Your Diodes Actually Do to Your Signal"
date: 2026-02-28T10:00:00Z
draft: false
description: "The physics behind diode clipping: forward voltage, I-V curves, temperature sensitivity, and why germanium 'feels' different than silicon."
---

Every guitarist has an opinion about germanium versus silicon. Germanium is "warm" and "organic." Silicon is "bright" and "aggressive." But what are these diodes actually doing to your signal, and why does the material matter so much?

It comes down to a single number, a curve, and the weather.

## What a clipping diode does

When your guitar signal is quiet, the diodes in your pedal aren't doing anything. They're just sitting there. A diode only starts conducting — letting current flow through it — when the voltage across it exceeds its forward voltage threshold. Below that threshold, it's basically invisible to your signal.

As your signal gets louder and the voltage peaks start hitting that threshold, the diode begins to conduct. It shunts the excess voltage to ground (in a shunt clipper like the Klon) or limits the feedback voltage (in a feedback clipper like a Tube Screamer). Either way, the tops of the waveform get rounded off. That's clipping, and clipping is what creates harmonic distortion — the overtones that make a driven guitar sound like a driven guitar rather than just a louder guitar.

The shape of that clipping — how sharply or softly the waveform gets rounded — determines the character of the distortion.

## The forward voltage difference

Here's where germanium and silicon diverge. A silicon diode starts conducting at about 0.6 to 0.7 volts. A germanium diode starts conducting at about 0.25 to 0.35 volts.

That's it. That's the fundamental difference. Everything else flows from this.

Because germanium's threshold is lower, it starts clipping your signal sooner — at a quieter input level. This means more of your signal gets affected by the diode. Soft pick strokes that would pass through a silicon clipper completely clean will already be getting gently rounded by a germanium clipper.

Silicon, with its higher threshold, leaves more of the signal untouched. Quiet playing stays clean. You have to dig in harder before the clipping kicks in. When it does kick in, the transition from clean to clipped is more abrupt because silicon's conduction curve is steeper — it goes from "not conducting" to "fully conducting" over a narrower voltage range.

This is why germanium feels "softer" and silicon feels "harder." It's not magic. It's the I-V curve.

## Soft knee vs hard knee

If you plot how much current flows through a diode at different voltages, you get its I-V curve. For silicon, that curve has a relatively sharp bend — the "knee" — right around 0.6V. Below the knee, almost nothing. Above the knee, current increases rapidly.

Germanium's knee is rounder and more gradual. Current starts flowing earlier and increases more slowly. The transition from "not clipping" to "clipping" is spread over a wider voltage range.

In audio terms, a sharp knee means the waveform hits a wall. The peaks get sliced off relatively cleanly, producing stronger odd-order harmonics — the kind that sound buzzy and aggressive. A soft knee means the peaks get gently compressed before they clip, producing a more complex mix of harmonics with a smoother envelope. The ear hears this as warmth.

This is also why germanium distortion tends to feel more compressed. Those low-level signal peaks that silicon would ignore are getting gently squeezed by the germanium's early conduction, adding a subtle dynamic compression across the whole signal.

## Headroom and the volume knob

The forward voltage difference has a direct impact on headroom — how loud your signal can be before clipping starts. With silicon diodes at 0.7V forward voltage, you have about 1.4V peak-to-peak of clean headroom (since you have a diode in each direction for symmetric clipping). With germanium at 0.3V, you only get about 0.6V peak-to-peak before clipping begins.

This matters most when you interact with your guitar's volume knob. Roll the volume down on a silicon-clipped pedal and the signal drops below the clipping threshold pretty quickly — you get a clean sound with the pedal's EQ coloration, but no real distortion. Do the same with a germanium-clipped pedal and you'll still hear some soft clipping even at lower volume settings, because the threshold is so much lower. The germanium pedal holds onto its character longer as you roll back.

This is a big part of why Fuzz Face players are so particular about their germanium transistors. The Fuzz Face doesn't use clipping diodes — it uses the transistors themselves as the nonlinear elements — but the same principle applies. Germanium transistors have lower junction voltages and softer saturation curves than silicon, so the fuzz character interacts with your volume knob in that gradual, expressive way.

## Temperature: germanium's dirty secret

Here's something silicon players never have to think about: germanium is temperature-sensitive. A germanium diode's forward voltage drops by about 2 millivolts for every degree Celsius the temperature rises. That might sound small, but over a 20°C range — say, from a cold rehearsal space to a hot stage under lights — that's a 40mV shift. On a device with a 300mV forward voltage, that's a 13% change in your clipping threshold.

In practice, this means a germanium Fuzz Face literally sounds different at the beginning of a gig versus the end. As the pedal warms up from its own power dissipation and the ambient heat of the stage, the forward voltages drop, the clipping threshold lowers, and the circuit gets a little more compressed and saturated.

Players call this "the pedal warming up," and they're not wrong — it's real, measurable physics.

Germanium transistors are even more dramatic. The collector leakage current (a parasitic effect where current flows even when the transistor should be "off") roughly doubles for every 10°C increase. In a Fuzz Face, this shifts the entire bias point of the circuit, changing the gain, the symmetry of the clipping, and the frequency response. A germanium Fuzz Face that sounds perfect at room temperature might be a sputtering mess on a summer outdoor stage.

Silicon is largely immune to this. Its forward voltage is more stable with temperature, and its leakage currents are orders of magnitude lower. A silicon Fuzz Face sounds essentially the same whether it's 60°F or 100°F outside. That's boring, but it's reliable.

## Asymmetric clipping: mixing the two

Some pedals use one germanium diode and one silicon diode in the clipping pair. The Fulltone OCD and certain Marshall Bluesbreaker clones do this. Because the two diodes have different forward voltages, the positive and negative halves of the waveform get clipped at different levels.

The result is asymmetric clipping — the waveform isn't squashed equally on both sides.

Asymmetric clipping produces even-order harmonics (second, fourth, sixth) in addition to the odd-order harmonics that symmetric clipping generates. Even-order harmonics are what make tube amps sound "musical" — it's the same physics behind second-harmonic distortion in a Class A tube stage. Mixing germanium and silicon is a way to get some of that tube-like harmonic character from a solid-state circuit.

## LEDs: the third option

You'll also see LEDs used as clipping diodes in some pedals (the Klon Centaur's treble boost stage, some modded Tube Screamers). LEDs have a forward voltage of about 1.7 to 2.0V — much higher than either germanium or silicon.

This means LED clipping has significantly more headroom. The signal can get much louder before any clipping occurs, and when it does clip, it's a very hard clip because the LED's I-V curve has an extremely sharp knee. The result is a more open, dynamic sound at moderate gain settings — the diodes only engage on the loudest peaks — with a harsh, gritty clip at extreme settings.

## Why this matters for plugin modeling

If a guitar plugin models clipping diodes as a simple "hard clip at threshold X" — which many do — you lose all of this nuance. The soft knee, the temperature sensitivity, the asymmetric harmonic content, the way germanium holds onto its character when you back off the volume.

At [Puget Audio](https://puget.audio), our plugins model each diode using the actual Shockley diode equation — the same exponential I-V relationship that governs real semiconductor junctions. Our [WDF engine](/blog/what-is-wdf/) solves this equation at the circuit level, so the soft knee of a germanium diode pair emerges from the math the same way it emerges from the physics.

When we say the [PedalKernel](https://github.com/ajmwagar/pedalkernel) Klon model uses germanium diodes, we don't mean we've approximated the sound of germanium clipping. We mean the model contains two 1N34A-type junctions with a ~0.3V forward voltage and their full nonlinear I-V curves, wired as shunt clippers to ground after the gain stage — because that's what the real circuit has, and the math handles the rest.
