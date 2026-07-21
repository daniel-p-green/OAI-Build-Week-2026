# Third-party notices and media boundary

Last reviewed: 2026-07-20 CT.

WorkshopLM is MIT-licensed. This inventory records the non-WorkshopLM software and design references that materially affect the runnable product or judge-facing media. It is an evidence record, not legal advice.

## Runtime and creation dependencies

| Component | Version in the current lockfile | License or permission | WorkshopLM use |
| --- | --- | --- | --- |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | 0.18.1 | MIT | Editable constrained semantic Map. Its packaged font files are consumed as part of the unmodified npm distribution and are not separately redistributed as WorkshopLM assets. |
| [GSAP](https://gsap.com/community/standard-license/) | 3.14.2 | Standard no-charge GSAP license | Local HyperFrames composition animation. WorkshopLM is a knowledge-work application, not a visual animation builder that competes with Webflow. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | 0.7.60 | Apache-2.0 | Local rendering from the approved Storyboard, Style tokens, generated images, and narration. |
| [Next.js](https://github.com/vercel/next.js) | 15.5.20 | MIT | Local web application. |
| [React](https://github.com/facebook/react) and React DOM | 19.2.7 | MIT | User interface runtime. |
| [PptxGenJS](https://github.com/gitbrent/PptxGenJS) | 4.0.1 | MIT | Editable Presentation and Infographic PowerPoint exports. |
| [Zod](https://github.com/colinhacks/zod) | 3.25.76 | MIT | Runtime schema validation. |

The installed dependency inventory contains 317 unique package/version records: 226 MIT, 47 ISC, 20 Apache-2.0, 13 BSD-3-Clause, and a small set of other permissive or dual-licensed packages. `khroma@2.1.0` omits the SPDX field from `package.json`, but its installed `license` file contains the MIT license. `pnpm licenses list --prod --json` is not currently usable in this checkout because the pnpm store lacks one Excalidraw package-index record; the inventory above was verified from installed package metadata and license files instead.

## Product design reference

The interface was grounded in the [Apps in ChatGPT · OpenAI Official community kit](https://www.figma.com/community/file/1625636989296445101) and OpenAI's published Apps design guidance. The local research record identifies the community file as CC BY 4.0. WorkshopLM implements its own React/CSS components from those primitives; it does not ship the `.fig` source or copied OpenAI logos, illustrations, or trademark artwork.

Attribution: “Apps in ChatGPT · OpenAI Official,” OpenAI, Figma Community, used as a UI-system reference under CC BY 4.0. WorkshopLM is an independent Build Week prototype and does not imply OpenAI endorsement.

## Judge-fixture and generated media

- The six judge-fixture images were generated with `gpt-image-2` from sanitized WorkshopLM prompts. Their manifest records model, request IDs, hashes, and generation timestamps.
- Audio Overview and Storyboard narration were generated with `gpt-4o-mini-tts` using Cedar. The interface and public claim ledger disclose AI-generated voice.
- Local product Videos are assembled from WorkshopLM UI captures, generated images, generated narration, Style tokens, and locally authored graphic elements. The separate Build Week public-demo edit uses the `Different Window` master supplied and authorized by project owner Daniel Green.
- The final public-demo master is hash-bound to one founder-authorized project script narrated with a disclosed OpenAI Cedar AI voice. It does not imitate or represent the founder's voice.
- The Image API reference fixture is a locally authored one-pixel PNG with its own license note.
- System font stacks are used for WorkshopLM UI and generated professional work unless a user explicitly supplies and confirms a licensed font.

## Excluded research and dogfood material

- NotebookLM screenshots and the local OpenAI `.fig` file are research references. They are not product assets and must not appear in the public video, thumbnail, or Devpost gallery.
- The AI Collective dogfood Presentation and its supplied logo are external-use evaluation material. They remain excluded from the final judge package unless explicit publication permission is recorded.
- The public project name, video title, thumbnail, and interface must not contain Google or NotebookLM marks.

## Final publication gate

Before checking the submission's complete third-party-authorization requirement:

1. The exact ready package and final Video are inventoried by their manifests and SHA-256 hashes.
2. Every reviewed frame and audio track is WorkshopLM-authored, founder-authorized, OpenAI-generated, or covered by the dependency licenses above.
3. The final public demo contains no unlicensed music, research screenshots, external logos, or unlicensed fonts. Its `Different Window` master is project-owner authorized and hash-bound in the film manifest.
4. Retain this notice in the tagged judge release and record any additional attribution required by later publication assets.
