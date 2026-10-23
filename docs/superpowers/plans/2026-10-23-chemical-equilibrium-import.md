# Chemical Equilibrium chapter import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 127 supplied Chemical Equilibrium PYQs available in the local Class 11 Chemistry simulator and sync their records to Supabase.

**Architecture:** Keep the chapter as a local image-backed question dataset, merge it into the browser's question-bank result, and insert the matching records into `public.jee_questions`. Keep the image files local for the existing static-site asset convention.

**Tech Stack:** Existing vanilla JavaScript app, Python 3.13 with PyMuPDF for PDF extraction and image crops, JSON manifests.

**Spec:** `docs/superpowers/specs/2026-10-23-chemical-equilibrium-import-design.md`

## Global Constraints

- Preserve printed question numbers, source pages, years, shifts, answers, and notation.
- Use globally collision-free question IDs starting after the connected Supabase maximum, 13151.
- Flag uncertain answers instead of guessing; the printed key supplies all 127 answers.
- Keep question images local and sync only new question rows to Supabase; do not update or delete existing records.
- When the Supabase request fails, return the local Chemical Equilibrium bank so the chapter remains testable.

## Review Focus

- Verify the import contains exactly Q1–Q127 once each, with no duplicate IDs.
- Verify all 127 image references exist and show the full question and choices.
- Keep Q1–Q77 single-answer, Q78–Q126 numerical, and Q127 multiple-correct.
- Preserve the answer-key numeric range for Q122 so existing range scoring accepts any value from 72 through 75.
- Verify the local Chemistry selector includes Chemical Equilibrium while existing remote questions continue loading.

---

### Task 1: Import source questions, answers, and crops

**Files:**
- Create: `chemical_equilibrium_data.js`
- Create: `assets/questions/chemical_equilibrium/q001.jpg` through `q127.jpg`
- Create: `CHEMICAL_EQUILIBRIUM_IMPORT_QA.json`

**Interfaces:**
- Produces `CHEMICAL_EQUILIBRIUM_QUESTIONS`, an array following the existing `ionic_equilibrium_data.js` question metadata format.

- [x] Extract printed question numbers, attempts, and answer-key entries from the supplied PDF.
- [x] Render one crop per question, bounded by adjacent question headings; visually inspect sample crops from the start, middle, and end.
- [x] Assign IDs 13152–13278 and populate class 11, Chemistry, Chemical Equilibrium, type, answer, source page, attempt, image, source IDs, and flags.
- [x] Record source counts, page range, answer-key status, and validation notes in the QA manifest.
- [x] Check that questions 1–127 and image paths form a complete one-to-one mapping.

### Task 2: Load the chapter locally in the simulator

**Files:**
- Modify: `index.html`
- Modify: `supabase-questions.js`

**Interfaces:**
- Consumes `CHEMICAL_EQUILIBRIUM_QUESTIONS` loaded before `supabase-questions.js`.
- Produces a bank result containing both fetched questions and these local records.

- [x] Load `chemical_equilibrium_data.js` before `supabase-questions.js`.
- [x] Append the local questions to the fetched bank result so the existing class, subject, and chapter selectors discover the new chapter; if Supabase fails, return the local chapter for testing.
- [x] Confirm the records satisfy Chemistry/Class 11 filters, supported question types, and image references.

### Task 3: Register the local import

**Files:**
- Modify: `data-sources.json`
- Modify: `README.md`

- [x] Insert 127 records into `public.jee_questions` under `chemical_equilibrium_data.js` using `ON CONFLICT (source_file, question_id) DO NOTHING`; verify the inserted count and ID range.
- [x] Register the source PDF, Class 11 Chemistry chapter, 127-question count, local bank, Supabase sync, and answer-review status.
- [x] Document the new local chapter and its counts in the README.
- [x] Run JavaScript syntax checks and validate metadata, IDs, image paths, question-type counts, and answer coverage without changing the hosted database.
