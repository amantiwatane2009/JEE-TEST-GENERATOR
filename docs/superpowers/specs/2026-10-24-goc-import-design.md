# GOC chapter import

## Intent and goals

Add the supplied `GOC.pdf` to the local website as one Class 11 Chemistry chapter named **GOC**, combining the PDF's Isomerism, IUPAC nomenclature, and Basics of Organic Chemistry sections. Preserve each source question as an image-backed record so the existing simulator can present and score it.

## Scope and constraints

- Import all 316 questions: 5 Isomerism, 1 IUPAC nomenclature, and 310 Basics of Organic Chemistry.
- Keep the single chapter label `GOC`, while preserving printed question numbers and source PDF pages even when numbering restarts between PDF sections.
- Keep the PDF's out-of-syllabus Q310 visible but unscored using the existing `flagged` behavior.
- Follow the existing local Chemical Equilibrium bank pattern: load a local data file with the app and merge it into the fetched question bank.
- Create source-faithful question crops, an import QA manifest, source registry entry, and README documentation.
- Do not write to Supabase, create a GitHub branch, or deploy during this local testing stage. These are a later stage only after the user approves the local result.

## Approaches

- **Local image-backed bank merged by the browser** (selected): fits the existing app and makes the new chapter available for local testing and a later site deployment without a database mutation.
- **Supabase-only bank**: uses the existing remote source of questions, but would skip the requested local testing stage and has no local fallback.

## Builder decisions

Use existing question metadata and scoring behavior. Verify a collision-free ID range before assigning IDs. Record the source answer key as transcribed, and call out any unreadable or ambiguous entries in the QA manifest rather than guessing.
