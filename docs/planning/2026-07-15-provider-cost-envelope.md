# Provider cost envelope

Status: pricing snapshot captured 2026-07-15; no paid provider call has run.

This document converts WorkshopLM's enforced request ceilings into a reviewable spend envelope. It is an estimate, not an invoice and not a replacement for checking the OpenAI usage dashboard after each authorized run. Prices can change, so recheck the linked official pages before a later run.

## Recommended authorization

Set a **$5 project budget or alert**, then explicitly authorize:

- exactly nine benchmark requests;
- exactly twelve initial thought-to-delivery requests;
- one capture-only Realtime transcription turn of at most 60 seconds;
- no automatic retry allowance. A retry receives its own request ceiling after the zero-spend retry preflight reports the missing panels.

The application request ceilings and GPT-5.6 `max_output_tokens` values are enforced boundaries. The $5 project setting is treated as an operating alert/envelope, not as proof of a hard per-command cutoff.

Suggested authorization statement:

> Authorize the nine-request GPT-5.6 benchmark, the twelve-request WorkshopLM live operator, and one capture-only Realtime turn up to 60 seconds, under a $5 OpenAI project budget or alert. Do not run retries without a new explicit request ceiling.

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
| Capture-only Realtime | 1 bounded transcription turn; no assistant Response | **$0.017 per minute**: $0.0085 for 30 seconds or $0.017 for 60 seconds. |

The known-priced portion of the initial benchmark, Map, image batch, and one 60-second capture remains comfortably below $1. The recommended $5 envelope leaves room for the currently unpublished TTS charge and one or more separately authorized selective retries without pretending the unknown rate is zero.

## Hard boundaries versus estimates

Hard in WorkshopLM:

- benchmark refuses a ceiling below nine;
- live operator refuses a ceiling below twelve;
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

No command in this document authorizes spend by itself. The run remains blocked until Daniel supplies explicit authorization matching the statement above.
