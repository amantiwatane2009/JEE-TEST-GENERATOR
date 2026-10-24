# GOC Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 316 questions from the three supplied PDF sections available locally as one Class 11 Chemistry chapter named GOC.

**Architecture:** Create one image-backed local question bank in the existing JavaScript record format. Load it before `supabase-questions.js`, which will merge it with fetched records just as it already does for Chemical Equilibrium. Record the import audit in the existing JSON/source registry and README.

**Tech Stack:** Existing vanilla JavaScript, PyMuPDF 1.28.2 already present in `.pdf-tools`, JSON manifests, local JPG question crops.

**Spec:** `docs/superpowers/specs/2026-10-24-goc-import-design.md`

## Global Constraints

- Import all 316 questions: 5 Isomerism, 1 IUPAC nomenclature, and 310 Basics of Organic Chemistry.
- Keep the single chapter label `GOC`, while preserving printed question numbers and source PDF pages even when numbering restarts between PDF sections.
- Keep the PDF's out-of-syllabus Q310 visible but unscored using the existing `flagged` behavior.
- Follow the existing local Chemical Equilibrium bank pattern: load a local data file with the app and merge it into the fetched question bank.
- Create source-faithful question crops, an import QA manifest, source registry entry, and README documentation.
- Do not write to Supabase, create a GitHub branch, or deploy during this local testing stage. These are a later stage only after the user approves the local result.

## Review Focus

- Three source sections restart question numbering; keep their question image paths and source pages distinct. Validate 316 unique `source_id` values and image references.
- The source marks Basics Q310 out of syllabus; it must remain visible and be flagged so scoring excludes it.
- Single-correct MCQ, multi-correct MCQ, and numerical entries must map to the UI's `mcq`, `multi`, and `integer` question types. Validate expected totals: 272 `mcq`, 3 `multi`, and 41 `integer` (including the Isomerism section's numerical Q1).
- Local GOC records must merge with remote records, and remain available if Supabase is unreachable. Check the loader wiring and run a browser smoke check with mocked fetch behavior if feasible without changing unrelated app code.
- Crops must preserve each full question's text, options, and diagrams; inspect representative images from each section and the final question.

---

### Task 1: Import all PDF questions as one local GOC bank

**Files:**
- Create: `goc_data.js`
- Create: `assets/questions/goc/q001.jpg` through `q316.jpg`
- Create: `GOC_IMPORT_QA.json`
- Modify: `index.html`
- Modify: `supabase-questions.js`
- Modify: `data-sources.json`
- Modify: `README.md`
- Test: temporary validation script in the system temp directory (do not add test framework or permanent test scaffolding)

**Interfaces:**
- Consumes the PDF at `C:\Users\HP\Downloads\GOC.pdf` and the existing `CHEMICAL_EQUILIBRIUM_QUESTIONS` loader pattern.
- Produces `window.GOC_QUESTIONS`, with 316 records using the existing question metadata shape and `chapter: "GOC"` on every record.
- Local `JEE_BANK_READY` resolves to fetched questions plus `window.CHEMICAL_EQUILIBRIUM_QUESTIONS` and `window.GOC_QUESTIONS`; on fetch failure, the existing Chemical Equilibrium fallback remains, and GOC is also included.

- [ ] **Step 1: Extract and map the PDF.** Confirm the three section boundaries and answer keys; map question numbers, years, attempts, types, answers, source pages, and the out-of-syllabus marker before creating records. Use `source_id` values `goc-q001` through `goc-q316` for stable unique identities, and choose record IDs only after checking the maximum IDs present in repository records.
- [ ] **Step 2: Create source image crops.** Save one complete question image per record in `assets/questions/goc/`, keeping the three sections' printed number resets mapped to unique sequential crop names. Render representative crops from all sections plus Q310 to verify legibility and page boundaries.
- [ ] **Step 3: Generate `goc_data.js` and `GOC_IMPORT_QA.json`.** Emit the existing metadata fields (`id`, `sourceId`, `source_name`, `source_id`, `year`, `subject`, `class`, `chapter`, `attempt`, `source_page`, `question_no`, `answer`, `clean_answer`, `type`, `image`, `flagged`). Use `multi` for the 3 multi-correct records; use `integer` for the 41 numerical records, including Isomerism Q1; flag only Basics Q310 as out of syllabus.
- [ ] **Step 4: Write the failing loader assertion first.** Add a temporary check that `JEE_BANK_READY` contains GOC when fetch succeeds and when it fails, with no duplicate GOC source IDs. Run it against the current loader and confirm it fails because GOC is not loaded.
- [ ] **Step 5: Wire the local bank.** Add `goc_data.js` before `supabase-questions.js` in `index.html`; update `supabase-questions.js` to merge GOC records alongside Chemical Equilibrium in both success and failure paths; rerun the loader assertion and confirm it passes.
- [ ] **Step 6: Register and document the source.** Add the source, three section counts, 316 total, question type totals, Q310 flag, PDF source, and local asset/data paths to `data-sources.json`, `GOC_IMPORT_QA.json`, and the README.
- [ ] **Step 7: Validate and leave ready for local testing.** Run `node --check goc_data.js`, `python -m json.tool GOC_IMPORT_QA.json`, and a temporary assertion script verifying 316 records, unique IDs/source IDs, correct chapter/class/subject, counts 272/3/41, all image paths present, and Basics Q310 flagged. Recheck loader success/fallback behavior, then report how to run the local site. Do not touch Supabase or GitHub.
