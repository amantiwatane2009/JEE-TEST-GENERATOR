# Step-by-Step Test Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the combined test setup with a three-step wizard for question count, chapters, and timing.

**Architecture:** Keep the existing page entry and test-start mechanisms. Add a small setup state object and renderer in `app.js`, and extend the existing chapter-proportional sampler to accept a subset of chapters. Add focused responsive styles to `style.css`.

**Tech Stack:** Vanilla JavaScript, HTML strings, CSS.

**Spec:** `docs/superpowers/specs/2026-11-19-step-by-step-test-setup-design.md`

## Global Constraints

- Use no new dependencies.
- Keep the existing class, subject, source filter, scoring, timer, and question flows.
- Default chapter scope is all chapters; allocation remains proportional to available questions.
- The question count is clamped to the pool for the active chapter scope.

## Review Focus

- No automated test framework is configured (`npm test` is a placeholder); do not add or run tests for this task.
- Check for stale selected chapter names after source filtering and keep the available pool/count coherent.
- Keep Continue disabled when a specific chapter scope has no selected chapters.
- Preserve question count, chapter scope, and time mode when navigating Back.
- Keep keyboard focus, labels, selected states, and mobile layout usable.

---

### Task 1: Add chapter-subset question sampling

**Files:**
- Modify: `app.js` (`selectQuestions`)

**Interfaces:**
- Extend `selectQuestions(n = 80)` to accept an optional chapter-name list, defaulting to the full `chapters` array.
- The returned questions remain unique, randomized, capped to the available eligible pool, and proportionally distributed across the eligible chapter pools.

- [x] Add an optional chapter list to `selectQuestions`; derive its pools and count allocation from that list, retaining the current previous-paper avoidance and fallback behavior.

### Task 2: Replace combined setup with the three-step wizard

**Files:**
- Modify: `app.js` (`renderStart`, remove `customModal`, add setup state and step renderer)

**Interfaces:**
- Setup state contains `step`, `questionCount`, `chapterMode`, `selectedChapters`, and `timeMode`.
- A single renderer updates the setup card for each step; the existing `startTest(questions, minutesPerQuestion)` remains the start interface.

- [x] Render step 1 with 20, 40, 80, and custom count choices; clamp the editable count to the active chapter scope.
- [x] Render step 2 with all chapters as the default or selected chapters with available pool counts; disable Continue if no chapters are selected.
- [x] Render step 3 with the existing five time modes and a summary of count, chapter scope, and calculated duration.
- [x] Wire Back and Continue so state is retained; Start test samples from the selected scope and passes the chosen time mode to `startTest`.
- [x] Keep the source filter, history, and change-selection controls in the page header.

### Task 3: Style and check the wizard

**Files:**
- Modify: `style.css` (wizard steps, choice states, chapter list, summary, responsive rules)

- [x] Add styles that follow existing card, button, border, accent, dark-theme, and mobile conventions.
- [x] Run `node --check app.js` and review the diff for obsolete combined-setup handlers and IDs.
