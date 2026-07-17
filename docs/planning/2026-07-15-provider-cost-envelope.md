# Provider cost envelope

Status: historical pricing snapshot captured 2026-07-15; operational request counts updated 2026-07-16. Authorized sample provider calls have since run, while exact account debit remains unavailable.

This document converts WorkshopLM's enforced request ceilings into a reviewable spend envelope. It is an estimate, not an invoice and not a replacement for checking the OpenAI usage dashboard after each authorized run. Prices can change, so recheck the linked official pages before a later run.

## Current authorization

Daniel has authorized a **$50 OpenAI API envelope** for WorkshopLM. Within that envelope, the executable requires an explicit command-level ceiling for:

- exactly nine benchmark requests;
- exactly thirteen initial thought-to-delivery requests;
- one capture-only Realtime transcription turn of at most 60 seconds;
- no automatic retry allowance. A retry receives its own request ceiling after the zero-spend retry preflight reports the missing panels.

The application request ceilings and GPT-5.6 `max_output_tokens` values are enforced boundaries. The $5 project setting is treated as an operating alert/envelope, not as proof of a hard per-command cutoff.

Suggested authorization statement:

> Run the reviewed founder Workshop with an explicit thirteen-request ceiling under the already authorized $50 project envelope. Do not run retries until the zero-spend retry preflight reports the exact missing requests.

## Current official rates used

Standard short-context prices per 1M tokens:

| Model | Input | Cached input | Output |
| --- | ---: | ---: | ---: |
| `gpt-5.6-sol` | $5.00 | $0.50 | $30.00 |
| `gpt-5.6-terra` | $2.50 | $0.25 | $15.00 |
| `gpt-5.6-luna` | $1.00 | $0.10 | $6.00 |

Additional relevant rates:

- `gpt-image-2`: $5.00 per 1M text-input tokens, $8.00 per 1M image-input tokens, and $30.00 per 1M image-output tokens. The image calculator lists a medium 1024×1024 image at $0.053 in output cost.
- `gpt-realtime-whisper`: $0.017 per audio minute.
- `gpt-realtime-2.1` conversational audio: $32.00 per 1M input tokens and $64.00 per 1M output tokens. WorkshopLM does not create an assistant Response during capture, so this conversational output rate is not part of the bounded capture path.
- The current pricing page does not list a dollar rate for `gpt-4o-mini-tts`. The current model page documents a 2,000-token model input maximum, and the Speech API reference documents a 4,096-character request maximum. WorkshopLM now rejects narration above the API character limit before dispatch.

Official sources:

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Image-generation cost calculator](https://developers.openai.com/api/docs/guides/image-generation#calculating-costs)
- [`gpt-4o-mini-tts` model page](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)
- [Create speech API reference](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create/)
- [Realtime cost guide](https://developers.openai.com/api/docs/guides/realtime-costs)

## Run-by-run envelope

| Run | Enforced usage boundary | Known or estimated cost |
| --- | --- | ---: |
| GPT-5.6 routing benchmark | 9 requests; 620 maximum output tokens per model across three cases | **Under $0.04 estimated.** The hard maximum output portion is $0.03162. Treating every one of the 747 prompt characters per model as an input token adds a conservative $0.00635. |
| GPT-5.6 grounded Map | 1 request; `max_output_tokens: 2200` | **At most $0.066 of Sol output.** Input depends on the current selected claims; the fixture is compact, but input dollars are estimated rather than hard-capped. |
| GPT Image 2 batch | 6 requests; one medium 1024×1024 image each | **$0.318 image-output estimate**, plus small prompt-input charges. |
| Narration | 5 requests; one Storyboard panel each; 4,096 characters maximum per request | **Dollar rate not published on the current pricing page.** Usage is bounded by request count and input length, but the dollar component remains an explicit uncertainty until the live account reports usage or OpenAI publishes the rate. |
| Audio Overview | 1 request; one grounded reviewed script; 4,096 characters maximum | **Dollar rate not published on the captured pricing page.** The request is bounded and recorded separately from Storyboard narration. |
| Capture-only Realtime | 1 bounded transcription turn; no assistant Response | **$0.017 per minute**: $0.0085 for 30 seconds or $0.017 for 60 seconds. |

The known-priced portion of the initial benchmark, Map, image batch, and one 60-second capture remained comfortably below $1 under this dated pricing snapshot. The authorized $50 envelope leaves ample room for the unpublished TTS component and separately bounded founder run without pretending the unknown rate is zero; exact account debit still requires the provider usage surface.

## Hard boundaries versus estimates

Hard in WorkshopLM:

- benchmark refuses a ceiling below nine;
- live operator refuses a ceiling below thirteen for a clean founder run;
- every attempted provider request consumes the shared counter, including failed requests;
- retries select only missing media and require a fresh exact ceiling;
- GPT-5.6 output tokens are capped in each request;
- narration exceeding 4,096 characters is rejected before any speech request is sent.

Estimated or externally observed:

- tokenized GPT-5.6 input cost;
- GPT Image 2 prompt-input cost;
- the actual billed usage and latency returned by each provider;
- whether a project budget or alert stops traffic immediately.

Unknown from the current public pricing page:

- the dollar rate for `gpt-4o-mini-tts`.

No command in this document authorizes spend by itself. The founder run remains gated on reviewed founder evidence, explicit Source-sharing intent, the existing $50 envelope, and the exact command-level request ceiling printed by the current preflight.
