# OpenAI API capability roadmap for WorkshopLM

Date: 2026-07-15

## Product decision

WorkshopLM is the professional evolution of NotebookLM: preserve its proven `Sources | Conversation | Studio` information architecture, express the professional right rail as `Production`, then deepen it with OpenAI-native reasoning, live voice, typed tools, editable production objects, consequential approvals, and exact source trace.

This roadmap is based on current official OpenAI documentation. It is an implementation filter, not a promise to expose every API merely because it exists.

## Recommended foundation

| WorkshopLM capability | OpenAI surface | User value | Priority |
| --- | --- | --- | --- |
| Durable browser Conversation | Responses API + Conversations API | One connected text history across sessions and jobs; messages, tool calls, and tool outputs share one conversation object | P0 |
| Structured Map/Brief/Storyboard operations | Responses function calling + Structured Outputs | Model actions conform to typed schemas instead of fragile prose or loosely shaped JSON | P0 |
| Live collaborative voice | Realtime API `gpt-realtime-2.1` over browser WebRTC | Natural speech-to-speech, low latency, barge-in, turn taking, text/audio generation, image input, and function calling | P0 |
| Canvas/tool control by voice | Realtime function tools or Agents SDK voice agent | “Add this source,” “group these claims,” “show the evidence,” and “create the deck” become real typed operations with visible results | P0 |
| Streaming live transcript | `gpt-realtime-whisper` or Realtime conversation transcript events | Makes spoken thinking visible, correctable, persistent, and source-grounded | P0 |
| Audio Overview | Responses-generated grounded script + Audio Speech endpoint using `gpt-4o-mini-tts` | A versioned executive briefing or deeper overview users can edit, listen to, download, and trace to Sources | P0 |
| Uploaded meeting transcription | Audio transcriptions with `gpt-4o-transcribe` | Converts recorded meetings into Workshop Sources | P1 |
| Speaker-aware meeting ingestion | `gpt-4o-transcribe-diarize` | Preserves who said what in multi-person workshops and supports speaker-attributed evidence | P1 |
| Local grounding | Existing deterministic chunks, exact search, FTS5/BM25, and typed `search`/`fetch` functions | Keeps the demo private, inspectable, deterministic, and free of a hidden hosted dependency | P0 |
| Optional hosted grounding | Responses `file_search` + vector stores | Faster ingestion/search for larger optional corpora, with file citations, result limits, and metadata filtering | P2 adapter |
| Current external research | Responses `web_search` tool | Adds explicitly selected current public evidence without confusing it with private Sources | P2 |
| Professional diagrams and art | GPT Image 2 generation/editing | Produces coherent deck imagery, diagrams, section art, thumbnails, and selective revisions | P0, already planned |
| Long-running reasoning | Responses background mode | Lets deeper research or production plans continue through disconnects with polling, cancellation, and resumable streaming | P1 |
| Agent orchestration and traces | Agents SDK sessions, tools, guardrails, handoffs, tracing | Provides a higher-level loop for text/voice tools and inspectable execution traces if direct Responses/Realtime becomes cumbersome | P1 evaluation |
| Reusable prompts | Stored prompts referenced by ID/version | Keeps text and Realtime behavior versioned and consistent across sessions | P1 |
| Safety and moderation | Safety identifiers, guardrails, Moderation API | Supports safer shared use and targeted enforcement without exposing personal identity | P1 before external users |
| Cost and latency control | Prompt caching, usage fields, bounded tools, request budgets | Makes weekly professional use predictable and keeps live demos from silently overspending | P0 |
| Bulk offline jobs | Batch API | Useful later for large ingestion, evaluation, or regeneration workloads; not useful for the interactive judge path | P3 |
| Model adaptation | Evals and fine-tuning APIs | Useful only after real usage produces a stable task and measurable failure set | P3 |

## Experience architecture

### Text path

1. The user writes in the center composer.
2. The server sends a Responses request attached to the Workshop's durable Conversation.
3. The model receives active-source retrieval results plus typed Workshop tools.
4. Text streams into the center; tool calls render visible progress and update the same Workshop state.
5. The complete turn, retrieval edges, tool calls, and tool results persist locally. OpenAI conversation identifiers are references, not the sole source of truth.

### Live voice path

1. The server creates an ephemeral Realtime client secret; the standard API key never reaches the browser.
2. The browser connects over WebRTC to a voice-agent session.
3. Semantic VAD supports natural turns; the user can interrupt spoken output.
4. Realtime tools call the same server-side Workshop commands as text.
5. The UI shows the transcript, proposed action, execution state, and concrete result.
6. Consequential actions use the same approval rules as clicking: voice cannot bypass Brief or Storyboard approval.
7. Final user and assistant transcripts, tool events, and provider IDs persist into the Workshop Conversation and provenance record.

### Audio Overview path

1. Choose `Create Audio Overview` in Production or ask for it in Conversation.
2. Responses produces a structured, source-grounded script from the approved Brief and active Sources.
3. Review or edit the script and choose briefing posture and voice.
4. The Speech endpoint streams and stores the generated audio.
5. The Output includes playback, download, duration, AI-voice disclosure, source coverage, and version history.

Audio Overview and live voice solve different jobs: Realtime is collaborative control; Audio Overview is a durable finished Output.

## P0 typed Workshop tools

- `source_add`
- `source_scope_set`
- `source_search`
- `source_fetch`
- `map_extract_candidates`
- `map_apply_operation`
- `map_undo`
- `evidence_show`
- `brief_prepare`
- `brief_approve` with visible confirmation
- `style_open` and `style_apply`
- `outputs_create`
- `output_open`
- `image_replace_request`
- `storyboard_update_panel`
- `storyboard_approve` with visible confirmation
- `audio_overview_prepare`
- `audio_overview_generate`
- `video_create`

All tools return typed, user-visible results and durable provenance. The model may suggest an approval, but it may not silently cross either blocking approval.

## Do now

1. Reconcile the existing UI with one three-column WorkshopLM browser surface.
2. Add a local durable Conversation schema and center composer using Responses streaming.
3. Expose the existing Workshop commands as one shared typed tool registry for text and Realtime.
4. Upgrade the current capture-only WebRTC path to a speech-to-speech voice-agent session with barge-in and tool use.
5. Add the grounded, editable, single-voice Audio Overview Output using `gpt-4o-mini-tts` and explicit disclosure.
6. Preserve the local retrieval system as the primary truth path; evaluate hosted File Search only as an optional adapter.
7. Add direct evidence for latency, cost, tool success, transcript durability, and voice interruption before making public claims.

## Defer

- Custom voices: restricted to eligible customers and requires consent/sample workflows.
- Two-host “podcast” simulation: useful only after the one-voice grounded overview is excellent.
- Realtime translation: valuable for multilingual workshops but not part of the demo-critical seam.
- SIP/telephony: outside the browser-first product.
- Hosted File Search as a required dependency: conflicts with the local/private demo contract.
- Web search by default: would blur private source scope and current external research.
- Multi-agent handoffs: add only when one agent plus typed tools becomes observably insufficient.
- Fine-tuning: premature without a stable evaluation set from real users.

## Safety, privacy, and cost boundaries

- Standard API keys stay server-side; Realtime clients receive ephemeral credentials.
- Realtime sessions have a documented maximum duration of 60 minutes; WorkshopLM persists durable state outside the session.
- TTS output clearly discloses that the voice is AI-generated.
- Conversation persistence states whether OpenAI `store` is enabled. Conversation objects persist beyond the default Response retention window, so local state and deletion behavior must be explicit.
- Voice tool calls inherit the same confirmation, approval, privacy, and stale-state rules as UI actions.
- Provider tests use bounded request counts and record model, usage, latency, result, and failure evidence.

## Official sources

- [Realtime and audio](https://developers.openai.com/api/docs/guides/realtime)
- [Realtime conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents)
- [Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text)
- [Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [Using tools](https://developers.openai.com/api/docs/guides/tools)
- [File search](https://developers.openai.com/api/docs/guides/tools-file-search)
- [Image generation](https://developers.openai.com/api/docs/guides/image-generation)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Background mode](https://developers.openai.com/api/docs/guides/background)
