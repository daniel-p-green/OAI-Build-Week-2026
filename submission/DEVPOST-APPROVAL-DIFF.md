# WorkshopLM — Devpost approval diff

Prepared July 21, 2026. This file records proposed changes only; the live submission has not been edited.

## Verified live state

- Project: `WorkshopLM` (`1356586`)
- Devpost state: `published`
- OpenAI Build Week submission: submitted July 20, 2026
- Category: Work & Productivity
- Repository: public, MIT licensed, default branch `main`
- Current video: `https://youtu.be/gwi_q6X1i5g` (playable but owner-rejected)
- Submission deadline: July 21, 2026 at 5:00 PM PT

## Proposed public changes

### Tagline

Current:

> Turn one conversation into source-linked slides, graphics, audio, storyboards, and video.

Proposed:

> Turn one conversation into finished work—without losing the source.

Why: the proposal leads with the outcome and the product's real difference. It is 67 characters, within Devpost's 200-character limit.

### Description

- Current: 935 words, eight sections
- Proposed: 696 words, six sections
- Exact replacement: [`DEVPOST-HUMAN-VOICE-REVIEW.md`](DEVPOST-HUMAN-VOICE-REVIEW.md)

The proposed version keeps the verified source trail, approval gates, local architecture, Codex correction story, GPT-5.6 Terra benchmark, and no-credential judge path. It removes output inventory, repeated proof language, and internal submission mechanics.

### Thumbnail

Current live thumbnail: 333×222 Devpost derivative with text cropped at the left edge.

Proposed upload:

`outputs/demo-film-highres/workshoplm-cover-devpost-3x2.png`

- 3000×2000 PNG
- 3.2 MB, under Devpost's 5 MB limit
- exact approved OpenAI-inspired gradient background
- same approved text hierarchy
- repositioned only to fit Devpost's 3:2 crop

The approved 16:9 cover remains the YouTube/video title-card source:

`outputs/demo-film-highres/workshoplm-cover-native-4k-v3.png`

### Judge instructions

Use the exact **Judge access and testing instructions** section in [`DEVPOST-HUMAN-VOICE-REVIEW.md`](DEVPOST-HUMAN-VOICE-REVIEW.md). It preserves the no-credential fixture and verified macOS Codex plugin path without making judges rebuild the provider-backed run.

### Video

Do not change the live URL until Daniel watches and approves the complete replacement export and publishes it to public YouTube. The approved final URL then replaces `https://youtu.be/gwi_q6X1i5g` in Devpost.

## Required approval sequence

1. Daniel approves or edits the proposed tagline and description.
2. Daniel approves the crop-safe Devpost thumbnail.
3. Daniel watches and approves the complete replacement video and audio mix.
4. Publish the replacement video to public YouTube.
5. Show Daniel the final Devpost field set, including the new URL.
6. Update Devpost, re-submit if required, and verify the project still reports `Submitted` before 5:00 PM PT.

No YouTube, Devpost, X, GitHub push, release, or tag change is authorized by this document.

## Automated owner gate

[`FINAL-HUMAN-REVIEW.json`](FINAL-HUMAN-REVIEW.json) records the exact hashes Daniel reviewed. `pnpm submission:fixture:verify` now fails closed until that record marks the replacement Video, Devpost copy, and thumbnail approved and `publicationAuthorized` is true. Technical validity alone cannot label an owner-rejected film publication-ready.
