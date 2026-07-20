# Submission Checklist

## Project

- [x] Working project built with Codex and GPT-5.6
- [x] Category selected as **Work & Productivity**
- [x] Product runs consistently on its intended platform
- [x] Live/testable experience matches the submitted description and video
- [x] Third-party SDKs, APIs, data, fonts, images, music, and integrations are licensed or authorized
  - [x] Current runtime dependencies and design references are inventoried in `THIRD_PARTY_NOTICES.md`; direct production licenses and the installed dependency distribution were reviewed.
  - [x] The sanitized judge fixture uses locally authored or sanitized Sources, GPT Image 2 visuals, disclosed Cedar speech, system fonts, and no music.
  - [x] Exact ready package and final Video are hash-bound and visually inventoried; the final film contains no music, research screenshots, external logos, or unlicensed fonts.
- [x] Sample data and a privacy-safe, repeatable demo fixture are available

## Devpost entry

- [x] Clear project description explaining features and functionality
- [x] Evidence-gated draft copy maps current claims to direct proof and bounded fallback wording
- [ ] Submitter type selected: Individual, Team of Individuals, or Organization
- [ ] Country of residence selected
- [ ] Public or private code-repository URL supplied
- [ ] Optional live-project URL and judge instructions supplied
- [x] Core Codex `/feedback` Session ID supplied: `019f5eb9-d996-7f42-ac5a-d4ed2cc8a324`
- [x] Primary Session ID and the reason it represents the majority-core full-implementation task recorded in `log.md`
- [x] Devpost project created and populated at `https://devpost.com/software/workshoplm`; verified live as an author-owned draft with the final project thumbnail
- [x] All team members added and invitations accepted (individual submission; authenticated author is the sole project member)
- [ ] Submission is submitted, not left as a draft

## Repository

- [x] Public repository has an appropriate license, or private repository is shared with `testing@devpost.com` and `build-week-event@openai.com`
- [x] Anonymous cache-busted GitHub and raw-file reads expose current `main`, the README, MIT license, and third-party notice without authentication
- [x] Public GitHub About description uses the locked `Capture → Map → Brief → Create` model and broad created-work family; anonymous API verification passed
- [x] README contains installation and run instructions
- [x] README contains sample-data instructions when needed
- [x] README explains how we collaborated with Codex
- [x] README highlights where Codex accelerated the workflow
- [x] README identifies important human product, engineering, and design decisions
- [x] README explains how GPT-5.6 contributed to the result
- [x] Dated commits and session evidence distinguish hackathon work from any pre-existing work

## Demo video

- [x] Under three minutes
- [ ] Publicly visible on YouTube, not unlisted
- [x] Shows the working project clearly
- [x] Includes understandable audio or voiceover
- [x] Explains what was built
- [x] Explains how Codex was used
- [x] Explains how GPT-5.6 was used
- [x] Shows one Codex-side WorkshopLM widget moment opening the local Workshop
- [x] Live GPT-5.6 result appears during source-to-Map extraction
- [x] Includes the authorized project-brainstorm → finished submission reveal without calling it pre-code evidence or founder voice
- [x] Contains no unlicensed copyrighted music, trademarks, or third-party media
- [x] YouTube title, thumbnail, and Devpost project name contain no Google or NotebookLM marks
- [x] Loading screens, typing delays, silence, and filler have been removed

## Judge access

- [ ] Free and unrestricted through the end of judging
- [x] Judge-facing release commit `857cee4f8420a09ddca2acbac92886bf00c93b4c` tagged as `build-week-submission-2026-07-20`; fixture/README/plugin snapshot is pinned and the tagged manifest was fetched anonymously
- [ ] Stable judge path retained through the August 12, 2026 winner announcement
- [x] Public video master makes the full value and working flow understandable without local setup
- [x] Sanitized recorded fixture supports repeatable capture and optional inspection without paid calls
- [x] Isolated Codex profile activates `$workshoplm` and retrieves an exact grounded source excerpt through bundled read tools
- [ ] Login credentials included only if a later verified judge path requires them
- [x] Supported browser/platform documented
- [x] A judge can understand the value even if they never run the app

## Plugin/developer-tool requirements

WorkshopLM is a local plugin/developer-tool experience. Keep these concise and secondary to the public demo video:

- [x] Installation instructions
- [x] Supported platforms
- [x] Test path that does not require rebuilding from scratch
- [x] Sanitized fixture or inspection path
- [x] Public-claim ledger identifies Codex desktop/CLI as the verified host and keeps ChatGPT Work out of current product claims

## Final live verification

- [x] Re-check https://openai.devpost.com/rules
- [x] Re-check the submission deadline and latest announcements
  - [x] Interim July 17 refresh confirmed the Tuesday, July 21, 2026 at 5:00 PM Pacific deadline, two host announcements, and unchanged submission requirements; repeat at final submission.
  - [x] July 20 final rules refresh reconfirmed the July 21, 2026 at 5:00 PM Pacific deadline, public YouTube video under three minutes with audio covering the build/Codex/GPT-5.6, README requirements, and the `/feedback` task where the majority of core functionality was built.
- [ ] Verify every submitted link in a logged-out/private browser session
- [ ] Confirm the YouTube video is public
- [x] Confirm the repository permissions work for judges
- [ ] Confirm the Devpost entry is not a draft
- [ ] Confirm the tagged judge release reproduces the submitted fixture commands after `main` moves
