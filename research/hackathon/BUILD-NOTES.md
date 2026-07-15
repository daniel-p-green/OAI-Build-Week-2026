# Build Notes for This Week

These are working implications derived from the current rules and judging criteria. They are strategy notes, not additional rules.

## Evidence discipline

- Keep meaningful work in dated commits beginning during the submission period.
- Preserve the Codex task where most core functionality is built and retrieve its `/feedback` Session ID.
- Maintain a small decision log covering important product, engineering, and design choices made by humans.
- Record which capabilities use GPT-5.6 and what would not work equivalently without them.

## Build for the judging surface

- A judge may never run the project, so the video, screenshots, README, and Devpost description must prove the complete flow.
- Also provide a fast live path using sanitized sample data so a judge can test without connecting a private account.
- Avoid making setup dependent on local machine state, private connectors, or secrets that a judge cannot obtain.

## Demo production

- Capture successful product moments throughout the week rather than waiting until the final day.
- Keep the final video under three minutes and narrate the Codex and GPT-5.6 contribution explicitly.
- Prefer a clear working demo to decorative montage footage.
- Avoid third-party logos, copyrighted music, and brand assets unless permission is documented.

## Work & Productivity story

- Name one primary user and one repeated work problem.
- Demonstrate an end-to-end outcome, not a collection of disconnected model features.
- Include a concrete before/after measure such as elapsed time, number of manual handoffs, or number of reusable outputs.
- Keep the product coherent enough that the design criterion is obvious from the first minute.

## Final-week hygiene

- Re-read announcements and rules daily for changes.
- Monitor API and Codex credit use.
- Keep setup instructions tested from a clean environment.
- Verify both public and private repository access before submission.

## 2026-07-15 — Build Week Office Hours with VB

These are working notes from the OpenAI Build Week Office Hours session. They are useful guidance, not additional rules; the official Devpost rules remain authoritative.

### Build Week reminders

- Build Week runs through **July 21, 2026** at [openai.devpost.com](https://openai.devpost.com/).
- The project must use **GPT-5.6 and/or Codex**. Credits may be available through the form on the Devpost challenge page.
- Confirm registration and submission details directly on the Devpost challenge page before submitting.

### Daniel's workflow lessons

- Use GPT-5.6 Sol for orchestration and spawn implementation Codex tasks with Terra when appropriate; this can reduce credit burn versus running high-reasoning Sol for every implementation task.
- A Figma library connector helps preserve a consistent component language and avoid one-off UI generation.
- GPT-5.6 is particularly useful for long-running work when a durable `GOAL.md` is maintained and updated continuously.
- AI duration estimates are not reliable schedule estimates: a task estimated at six days completed in roughly two hours. Translate “AI time” into observed project throughput before planning.

### Submission and demo guidance

- Prepare the submission-answer Markdown early. Fill in the category, GPT-5.6 usage, and other required fields before the deadline, then update it as the project evolves.
- Structure the demo with a Simon Sinek “Start With Why” arc: first 30 seconds explain why the project matters; the next 30–60 seconds show how it answers that need; the final minute shows what was built.
- Judges review the complete submitted package, so prioritize a coherent, high-quality story over a long feature list.
- Focus the submission on the problem solved and the resulting value, not on the number of technologies or features used.

### GPT-5.6 themes discussed

- High agency and intent inference from minimal prompts.
- Long-running persistent Codex threads and autonomous assistants for practical workflows.
- Content workflows such as drafting social posts, finding partners, and preparing newsletter drafts.
- The “Goblins” behavior was described as a post-training pipeline issue fixed in a recent GPT-5.6 release; it can still be prompted intentionally. Treat this as session context, not a product claim.

### Source boundary

- The office-hours notes above were supplied in the project conversation on July 15, 2026.
- The linked X post was checked at [Reagan Hsu's post](https://x.com/reagan_hsu/status/2027917087264674168), but the available page returned no readable post text. No additional claims from that post are recorded until its contents are available.
