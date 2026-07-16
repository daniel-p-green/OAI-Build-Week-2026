# AI Collective chapter launch brief

WorkshopLM rendered this external-use candidate from a reviewable, source-grounded brief. The first generated draft was visually credible but too thin to send; dogfood converted that failure into new execution-plan and decision layouts and a decision-ready narrative grounded in four shareable sources:

- `GenAI Collective Chapter Startup FAQ.pdf`, ingested as a local PDF;
- [The AI Collective Newsletter](https://newsletter.aicollective.com/), ingested as a current public webpage.
- [The AI Collective Code of Conduct](https://www.aicollective.com/files/Code%20of%20Conduct.pdf);
- [The AI Collective Data Privacy and Use Policy](https://www.aicollective.com/files/Data%20Privacy%20and%20Use%20Policy%20~%20The%20AI%20Collective.pdf).

Factual claims retain source labels. The 30-day sequence, launch decisions, and final recommendation are visibly labeled as derived work requiring confirmation with AI Collective HQ.

The active Style used the official AI Collective mark supplied by Daniel, exact orange `#FF640D`, ink `#171717`, paper `#FAF8F3`, and the `Client pitch` Intent Profile.

## Rebuild

`deck-input.json` is the internal, reviewable source brief used by the current Slides renderer. `ai-collective-logo.png` is the authorized mark already supplied for this project. From the repository root, rebuild the HTML, editable PowerPoint, PDF round trip, and slide previews with:

```sh
pnpm dogfood:deck:build
```

## Review files

- `chapter-launch-brief.pptx` — editable PowerPoint handoff with claim IDs and exact locators in speaker notes.
- `chapter-launch-brief.pdf` — nine-slide 16:9 review export produced by LibreOffice from the PowerPoint file.
- `chapter-launch-brief.html` — responsive in-product preview with exact source locators embedded in the citation elements.
- `preview-01.png` through `preview-09.png` — rendered review images from the PowerPoint round trip.
- `contact-sheet.png` — the nine-slide cold-review sequence on one page.

## Cold review question

Would you send this organizer brief to a prospective chapter collaborator under your own name?

Choose one:

- **Send** — the narrative and visual quality are already credible.
- **Revise** — name the first slide or sentence that prevents sending it.

This package is ready for that review. It has not yet received an external send-or-revise judgment and must not be described as externally approved.

## Share the cold-review packet

Build the privacy-safe reviewer bundle from the current Slides candidate with:

```sh
pnpm dogfood:review:build
```

Send `workshoplm-ai-collective-cold-review.zip`. Its `START-HERE.html` shows the complete Slides artifact, links the PDF and editable PowerPoint, and asks for exactly one decision: `Send` or the first blocking `Revise`. Feedback downloads locally as a text file; the page has no analytics, account requirement, form endpoint, or network submission. `FEEDBACK.txt` is included as a no-JavaScript fallback.

The bundle is a review instrument, not review evidence. Do not close the professional gate until a real intended-audience reviewer returns the completed feedback.

When that text file returns, validate and preserve it against the exact Slides version with:

```sh
pnpm dogfood:review:ingest -- /path/to/workshoplm-cold-review.txt
```

The command rejects an untouched template, a missing reviewer role, an unexplained `Revise`, and feedback for an older Review ID. A valid response is preserved under `artifacts/dogfood/reviews/` with the reviewed PDF/PowerPoint hashes and an explicit identity-verification boundary. It does not automatically close the product gate or claim external approval.
