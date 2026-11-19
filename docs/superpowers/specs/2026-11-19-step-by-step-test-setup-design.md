# Step-by-Step Test Setup

## Intent

Make test creation easier to scan by asking for one setup choice at a time after class and subject selection.

## Goals

- Present three steps: question count, chapter scope, then time limit.
- Preserve choices when moving Back and Continue.
- Offer all chapters by default, preserving proportional question distribution; also allow a selected chapter subset.
- Show the chosen settings together before starting the test.
- Keep the existing source filter, history, scoring, timer, and question flow.

## Non-goals and constraints

- Do not change class or subject selection, scoring, or active test behavior.
- Use the existing vanilla JavaScript app and CSS; add no dependencies.
- Keep the question count between 1 and the available question pool, including the selected chapter pool.
- Chapter names and counts come from the current source-filtered question bank.

## Approaches

- **Three-step wizard (chosen):** A focused screen per choice, with Back/Continue and a setup summary on the timing step. This follows the approved mockup and keeps the choices separate.
- **Progressive disclosure on one page:** Reveal one group at a time. This reduces navigation but leaves the full configuration in one page and weakens the requested step-by-step feel.
- **Separate modal per setting:** Strong focus, but it fragments the flow and adds extra overlays.

## Design details

The question step offers 20, 40, 80, and a custom count. The chapter step defaults to all chapters and permits selecting a subset. The timing step offers untimed and 1, 1.5, 2, or 2.5 minutes per question, shows the resulting duration and the accumulated setup, and starts the test. Each prior selection remains available when navigating backward.

The implementation may choose exact layout details within the existing visual system. The approved mockup is at `C:\Users\Aman\.codex\visualizations\2026\11\19\01a1f4e4-0040-7e21-ba1a-03f6169e71f0\setup-wizard-mockup.html`.
