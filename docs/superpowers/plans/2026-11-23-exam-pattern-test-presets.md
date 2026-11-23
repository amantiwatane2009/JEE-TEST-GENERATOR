# Exam Pattern Test Presets Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Add JEE Main and NEET full-length test presets with per-subject chapter scope and a clear three-hour start confirmation.

**Architecture:** Keep the existing custom practice route. Add a preset route that selects questions from the already loaded `allQuestions` bank by exam subject, class range, and chapter scope. Reuse the current test runner and result scoring, while persisting the preset label so a resumed test stays correctly identified.

**Tech Stack:** Static HTML, CSS, and browser JavaScript; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-23-exam-pattern-test-presets-design.md`

## Global Constraints

- JEE Main preset contains exactly 25 Physics, 25 Chemistry, and 25 Mathematics questions.
- NEET preset follows the requested 2026 format: 45 Physics, 45 Chemistry, and 90 Biology single-answer MCQs in 180 minutes. Label it NEET 2026 and disclose the current 2027 format difference in the review screen.
- Current NEET Physics and Chemistry questions come from JEE PYQ banks; show the approved disclaimer before starting and keep it accurate if source-tagged NEET questions are added later.
- Both presets use a 180-minute timer that starts only after explicit confirmation.
- Do not change the existing custom practice setup, scoring, or result analysis.
- Do not add or run tests; no test request was made.

## Files

- Modify `app.js`: preset configuration, navigation, chapter-scope selection, question sampling, final confirmation, active-test persistence, and mixed-subject test labels.
- Modify `style.css`: responsive styling for the preset and confirmation screens, following existing card and setup patterns.
- Modify `README.md`: document the presets and subject counts.

## Review Focus

- NEET Physics/Chemistry only sample single-answer MCQs, while NEET Biology remains NEET-sourced.
- Class 11, Class 12, and combined class selections produce the requested section counts when enough questions exist.
- A selected chapter scope with too few questions cannot launch a short or malformed preset.
- Reloading an active preset test preserves the exam label and remaining timer.
- Starting a new test from results returns to the exam/custom choice flow without leaking the previous preset into custom practice.

---

### Task 1: Add preset setup and question selection

**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Add `EXAM_PRESETS` with `jee` and `neet` subject/count definitions and `timeLimitSeconds: 10800`.
- Add a preset question-pool helper that takes `(subject, selectedClass, chapterScope, exam)` and returns eligible unique questions; NEET eligibility requires `q.type === 'mcq'` for every subject.
- Add preset setup state keyed by preset and class, with per-subject chapter modes defaulting to `all` and selected chapter arrays.

- [x] Add an exam/custom choice after class selection; route the existing subject chooser through “Custom practice.”
- [x] Render JEE and NEET preset setup with per-subject chapter lists, FST defaults, target/available counts, and a disabled continue action when any selected pool cannot satisfy its fixed target.
- [x] Add balanced random sampling within each subject and selected chapter scope, avoiding the most recent test's questions when an unused pool is available.
- [x] Add responsive styles for the preset and chapter-selection screens.
- [x] Review the helper and navigation paths for each preset and class range; do not add or run automated tests.

### Task 2: Add the timed confirmation and connect the existing runner

**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Add `activePreset` to active test persistence, restore it when a saved preset test resumes, and store the exam label and fixed timer in the result record.
- Add a final confirmation view that shows section counts and “3 hours”; NEET also displays the exact approved PYQ disclaimer.

- [x] Show the final confirmation screen only after setup is valid; its “Confirm and start” action assembles the fixed per-subject question counts and then calls the existing timed runner for 180 minutes.
- [x] Add subject badges in the mixed-subject test view and use the preset name in the test heading.
- [x] Preserve the active preset across reloads and ensure results/history can return to a clean exam/custom choice.
- [x] Review setup, confirmation, active-test, reload, and result navigation paths; do not add or run automated tests.

### Task 3: Update student-facing documentation

**Files:**
- Modify: `README.md`

- [x] Add JEE and NEET preset counts, chapter choice/FST behavior, three-hour timer confirmation, and the NEET Physics/Chemistry source notice to the feature summary.
- [x] Check the README wording against the implemented on-screen disclaimer and 2027 format note.
