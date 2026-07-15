# Submission Checklist

## Project

- [ ] Working project built with Codex and GPT-5.6
- [ ] Category selected as **Work & Productivity**
- [x] Product runs consistently on its intended platform
- [ ] Live/testable experience matches the submitted description and video
- [ ] Third-party SDKs, APIs, data, fonts, images, music, and integrations are licensed or authorized
- [x] Sample data and a privacy-safe, repeatable demo fixture are available

## Devpost entry

- [ ] Clear project description explaining features and functionality
- [x] Evidence-gated draft copy maps current claims to direct proof and bounded fallback wording
- [ ] Submitter type selected: Individual, Team of Individuals, or Organization
- [ ] Country of residence selected
- [ ] Public or private code-repository URL supplied
- [ ] Optional live-project URL and judge instructions supplied
- [ ] Core Codex `/feedback` Session ID supplied
- [ ] Primary Session ID and the reason it represents the core implementation recorded in `log.md`
- [ ] If no eligible surface produces a Session ID, organizer support contacted before form-filling and correspondence retained
- [ ] All team members added and invitations accepted
- [ ] Submission is submitted, not left as a draft

## Repository

- [x] Public repository has an appropriate license, or private repository is shared with `testing@devpost.com` and `build-week-event@openai.com`
- [x] README contains installation and run instructions
- [x] README contains sample-data instructions when needed
- [x] README explains how we collaborated with Codex
- [x] README highlights where Codex accelerated the workflow
- [x] README identifies important human product, engineering, and design decisions
- [x] README explains how GPT-5.6 contributed to the result
- [x] Dated commits and session evidence distinguish hackathon work from any pre-existing work

## Demo video

- [ ] Under three minutes
- [ ] Publicly visible on YouTube, not unlisted
- [ ] Shows the working project clearly
- [ ] Includes understandable audio or voiceover
- [ ] Explains what was built
- [ ] Explains how Codex was used
- [ ] Explains how GPT-5.6 was used
- [ ] Shows one Codex-side WorkshopLM widget moment opening the local Workshop
- [ ] If a live GPT-5.6 result is claimed, the result appears on screen during source-to-Map extraction
- [ ] If no live GPT-5.6 result exists, narration uses only the truthful Codex-on-GPT-5.6 build-and-verification story
- [ ] Includes the timestamped raw founder-brainstorm → finished submission reveal without calling it pre-code evidence
- [ ] Contains no unlicensed copyrighted music, trademarks, or third-party media
- [ ] YouTube title, thumbnail, and Devpost project name contain no Google or NotebookLM marks
- [ ] Loading screens, typing delays, silence, and filler have been removed

## Judge access

- [ ] Free and unrestricted through the end of judging
- [ ] Judge-facing release commit tagged and fixture/README/plugin snapshot pinned to that stable version
- [ ] Stable judge path retained through the August 12, 2026 winner announcement
- [ ] Public video makes the full value and working flow understandable without local setup
- [x] Sanitized recorded fixture supports repeatable capture and optional inspection without paid calls
- [x] Isolated Codex profile activates `$workshoplm` and retrieves an exact grounded source excerpt through bundled read tools
- [ ] Login credentials included only if a later verified judge path requires them
- [x] Supported browser/platform documented
- [ ] A judge can understand the value even if they never run the app

## Plugin/developer-tool requirements

WorkshopLM is a local plugin/developer-tool experience. Keep these concise and secondary to the public demo video:

- [x] Installation instructions
- [x] Supported platforms
- [x] Test path that does not require rebuilding from scratch
- [x] Sanitized fixture or inspection path
- [x] Public-claim ledger identifies Codex desktop/CLI as the verified host and keeps ChatGPT Work out of current product claims

## Final live verification

- [ ] Re-check https://openai.devpost.com/rules
- [ ] Re-check the submission deadline and latest announcements
- [ ] Verify every submitted link in a logged-out/private browser session
- [ ] Confirm the YouTube video is public
- [ ] Confirm the repository permissions work for judges
- [ ] Confirm the Devpost entry is not a draft
- [ ] Confirm the tagged judge release reproduces the submitted fixture commands after `main` moves
