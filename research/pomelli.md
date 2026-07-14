# Pomelli research

Observed and checked: 2026-07-13

## What Pomelli gets right

### Verified — live

- The product asks for a business identity before asking for a campaign.
- Its **Business DNA** is explicit and editable: colors, font, logo, tagline, brand values, visual aesthetic, tone of voice, business overview, and business details.
- Campaign generation starts with a brief that can be reviewed and edited.
- Inputs such as product, images, and aspect ratio are treated as visible campaign ingredients.
- The same brand model feeds several destinations, including campaigns, photoshoots, a brand book, and websites.
- A sidecar agent remains available while the user inspects the brand model.

### Verified — official

- Pomelli builds Business DNA from a business website and uses it as the basis for campaign assets.
- Campaign creatives can be adjusted by changing image, headline, description, call to action, typography, and layout.
- Brand Books collect the derived brand system into a reviewable artifact.

## Transferable product mechanics

1. **Website first:** a URL is the fastest path to a useful visual identity.
2. **Review before generation:** extraction should produce a draft, not invisible configuration.
3. **Separate identity from campaign:** durable brand rules should not be mixed with one-off messaging.
4. **Use explicit ingredients:** products, people, images, source claims, and destinations should be visible inputs.
5. **Generate a brief first:** a concise narrative gate prevents expensive asset generation from starting with the wrong premise.

## Recommended adaptation

Use two human-readable project contracts:

### `DESIGN.md`

Generated from a website by default, then confirmed by the user. It should hold:

- logo and image usage;
- color tokens and accessible combinations;
- typography roles;
- spacing, radius, border, shadow, and composition rules;
- illustration and photography direction;
- motion and transition rules;
- do/don't examples;
- extraction confidence and source URLs.

### `FRAME.md`

Generated from the source set and a short interview. It should hold:

- audience and objective;
- primary message and narrative arc;
- approved claims and evidence requirements;
- tone and call to action;
- asset destinations and constraints;
- open questions and prohibited claims.

Pomelli's Business DNA inspires `DESIGN.md`; the campaign brief inspires `FRAME.md`. Keeping them separate lets one brand support many grounded projects.

## Website-to-design flow

1. User pastes a website URL.
2. The system extracts tokens, typography, logos, image patterns, layout characteristics, and voice.
3. The system shows a compact confidence-aware preview: “We found these rules.”
4. The user accepts, edits, or replaces uncertain items.
5. The confirmed result becomes portable `DESIGN.md` plus machine-readable tokens.
6. Every renderer consumes the same approved design contract.

This flow should take less than a minute for a typical public marketing site and should never silently copy private or inaccessible assets.
