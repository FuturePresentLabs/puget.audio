---
title: "Amp Sag: Why Your Tube Amp Breathes"
date: 2026-02-27T10:00:00Z
draft: false
description: "Understanding voltage sag in tube amplifiers — why some amps compress and bloom when you dig in, and how circuit modeling captures it."
---

If you've ever played through a vintage Fender Deluxe or an old Marshall and felt like the amp was *pushing back* against you — compressing when you dig in, opening up when you ease off — that's not your imagination. That's voltage sag, and it's one of the biggest reasons tube amps feel alive in a way that solid-state amps and most digital models don't.

## What's actually happening inside the amp

Your tube amp runs on a high-voltage power supply — typically 300 to 500 volts DC, generated from wall power by a transformer and a rectifier. This voltage (called B+) feeds the plates of every tube in the amp. The tubes need this voltage to amplify your signal.

Here's the key: that power supply isn't perfect. It has internal resistance — from the transformer windings, the rectifier, and the filter capacitors. When the tubes draw more current (because you're playing loud), the voltage drops. When you play quietly, the current draw is low and the voltage recovers.

That's sag.

Loud signal goes in, plate voltage drops, the tubes have less headroom, gain decreases slightly, and the signal gets naturally compressed. Then you stop playing, the voltage recovers, and the amp opens back up. The whole cycle happens over tens of milliseconds — slow enough that you feel it as a dynamic response, not as distortion.

This is what players mean when they say an amp "breathes."

## Tube rectifiers vs solid-state rectifiers

Not all amps sag the same amount, and the rectifier is the biggest variable.

A **tube rectifier** (like a GZ34 or 5Y3) has significant internal resistance — anywhere from 50 to 200 ohms depending on the tube type. This resistance is in series with the entire power supply, so every amp of current the tubes draw causes a noticeable voltage drop. A Fender Tweed Deluxe with a 5Y3 rectifier sags heavily. Hit a big chord and you can feel the amp compress, then bloom as the filter caps recharge.

A **solid-state rectifier** (silicon diodes) has almost zero internal resistance — typically under 10 ohms. The power supply stays stiff regardless of how hard you play. This is why a Fender Twin Reverb (solid-state rectified) feels tight and punchy compared to a Tweed Deluxe. Same company, completely different feel.

Neither is better — it's a design choice. Blues and classic rock players tend to love sag because it adds natural compression and forgiveness. Metal and country players often prefer a stiff supply for tight, articulate response.

## The filter caps matter too

After the rectifier, the B+ voltage passes through filter capacitors that smooth out the ripple from the AC-to-DC conversion. These caps also act as a temporary energy reservoir. When you hit a loud note, the tubes pull current faster than the rectifier can supply it. The filter caps discharge to make up the difference, and the voltage drops. When you stop playing, the rectifier slowly recharges the caps and the voltage comes back up.

The size of these caps determines how fast the voltage recovers. Vintage amps used relatively small filter caps (20-40 µF) because large electrolytics were expensive in the 1950s and 60s. This means the voltage drops quickly and recovers slowly — more sag, more "bloom." Modern amps often use larger filter caps (100-220 µF), which resist voltage changes better and produce a tighter, less saggy feel.

Some boutique amp builders deliberately use smaller filter caps to chase that vintage sag. Others put the rectifier type on a switch so you can go from tight to saggy depending on the gig.

## What sag sounds like

Sag doesn't sound like a compressor pedal. A compressor pedal reacts to the signal level and turns down the volume. Sag reacts to the *power demand* of the entire amp and changes the character of the amplification itself.

When B+ drops, several things happen at once. The tubes' operating point shifts — they have less plate voltage, so the gain decreases and the headroom shrinks. The signal clips sooner and softer. The frequency response changes slightly because the tubes' internal impedances shift. And the power supply ripple (residual 120Hz hum from the rectifier) interacts differently with the signal.

The cumulative effect is a dynamic, organic compression that responds to your playing intensity. Strum lightly and the amp is clean and open. Dig in and it compresses, thickens, and starts to break up. Sustain a note and you hear it bloom as the initial transient sag gives way to the power supply recovering.

It's happening at the power supply level, affecting every stage of the amp simultaneously, which is why it feels so connected to your playing in a way that a compressor pedal stuck in front of the amp doesn't.

## Why most amp sims miss this

Most amp modeling plugins simulate the preamp and power amp tubes but treat the power supply as an ideal voltage source — a perfect, unwavering 350 volts. This gets the tone roughly right at any single static setting, but it completely misses the dynamic interaction between your playing and the power supply.

Some higher-end modelers add a "sag" knob that artificially compresses the signal based on level detection. This is better than nothing, but it's backward — real sag isn't a signal-level effect, it's a power-supply effect. The compression happens because the voltage changes, which changes everything about how the tubes operate. Approximating this with a simple compressor doesn't capture the way the frequency response shifts, the way the clipping character softens, or the way the recovery time depends on the filter cap values.

## How WDF handles sag

In a [Wave Digital Filter](/blog/what-is-wdf/) model, the power supply isn't an ideal voltage source. It's modeled as what it actually is: a voltage source with series impedance (the transformer and rectifier resistance) feeding filter capacitors. When the tube models draw current during a loud passage, the current flows through the supply impedance and the voltage drops — because that's what the physics dictates.

The filter caps discharge and recharge according to their capacitance values. The plate voltage feeding every tube model in the circuit fluctuates in real time, and every tube's operating point shifts accordingly.

No "sag knob." No compressor approximation. The amp breathes because the power supply model has the right impedance and the right filter cap values, and the math takes care of the rest.

At [Puget Audio](https://puget.audio), we specify the supply impedance, filter capacitance, and rectifier type directly in our circuit definitions. A Tweed Deluxe model with a tube rectifier and 40 µF filter cap sags differently than a Twin Reverb model with solid-state rectification and 200 µF caps — not because we tuned a parameter to sound different, but because the circuits are different.

That's the difference between modeling what an amp sounds like and modeling what an amp *is*.
