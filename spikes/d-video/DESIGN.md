# Spike D composition design

This is a deliberately small proof composition, not the final WorkshopLM video
template. It renders three approved storyboard panels at 1920×1080, with a
single visual system: ink background, paper surface, coral action accent, and a
plain-language source/approval strip. Each panel visibly states that narration
is AI-generated. The audio clips are deterministic local sine-wave fixtures so
the renderer seam can be verified without a provider call.

The production implementation must preserve this contract while replacing the
fixture narration with disclosed `gpt-4o-mini-tts` segments and the cards with
actual claim/source content.
