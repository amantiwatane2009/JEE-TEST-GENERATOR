# JEE/NEET PCM and Biology Test Generator

A browser-based practice tool for JEE Main Physics, Chemistry, and Mathematics and NEET Biology PYQs. Choose a class, subject, and chapters, build a timed or untimed test, and review your results.

**Existing hosted app:** https://jee11testgenerator.vercel.app/ (the local JEE/NEET changes here have not been deployed)

## Features

- **Custom test length** — create a paper with the number of questions you want to attempt.
- **Chapter selection** — practise the full available question bank or focus on selected chapters.
- **Source filtering** — filter questions by available year/source.
- **Untimed practice** — work without a countdown clock.
- **Question navigation** — move between questions using the question palette.
- **Answer review** — clear responses and mark questions to revisit before submitting.
- **Scoring and analysis** — review your score, correct and incorrect answers, skipped questions, and chapter-wise performance.
- **Mock history** — recent test results are stored locally in your browser.

The current scoring scheme is **+4 for a correct answer and −1 for an incorrect answer**. Questions marked out of syllabus are scored when a printed answer is available. Questions with missing or uncertain answer keys remain available for practice but are not scored.

## Question bank

Questions are loaded from the Supabase `jee_questions` table. Original question images remain in this repository so diagrams, equations, and printed options stay readable. The browser uses a publishable key with read-only row-level security; it does not contain a database write key. Test history and theme preference remain in the browser.

## Screenshots

### Test setup

The home screen shows the default mock configuration, question pool, chapter-wise distribution, and available test options.

<img width="1492" height="882" alt="image" src="https://github.com/user-attachments/assets/13be9b0d-de03-4fdb-958c-d9d2275bdb92" />

### Test analysis

The results screen summarizes the score, accuracy, attempt rate, time spent, and chapter-wise performance.
<img width="1521" height="906" alt="image" src="https://github.com/user-attachments/assets/93cf695d-a092-4d2e-b7fa-e827a6f686f2" />

### Answer review

After submitting a test, each reviewed question shows the selected answer, correct answer, time spent, and original PYQ image.

<img width="1304" height="542" alt="image" src="https://github.com/user-attachments/assets/bd8eb7b5-a95d-4cde-adeb-3f0e821b493b" />

### Taking a test

The test interface keeps the original question image beside the question palette, with controls to navigate, clear an answer, mark for review, and submit.

<img width="1308" height="793" alt="image" src="https://github.com/user-attachments/assets/774b285c-1fe8-4640-828e-8ca5a3fafc45" />

## Getting started

This is a static web project and does not require a build step. It needs an internet connection to load its question bank from Supabase.

1. Clone or download this repository.
2. Keep the HTML, CSS, Supabase configuration, question loader, and image folders in their existing relative locations.
3. For Windows testing, open PowerShell in the project folder and run `python -m http.server 8000`.
4. Open `http://localhost:8000` in your browser. Keep the server window open while practising.
5. If question images do not load, check that the `assets/questions` folder is present.

## Project direction

The immediate focus is reliability: preserving question layouts, improving image readability, and checking answer mappings. The longer-term goal is to grow the question bank while keeping one consistent test experience across sources.

## Acknowledgements

- **Physics question PDFs:** Credit and thanks to **[Eduniti](https://www.youtube.com/@mohitgoenka99)** for creating and sharing the Physics question PDFs used as a source for this project. [Access the PDF collection on Google Drive](https://drive.google.com/drive/folders/1785MiemoRxcc3o6dto6DKCdEfcW70gO_).
- **Chemistry question PDFs:** Credit to **[ExamGOAL PDF Library](https://pdf.questions.examgoal.com/)** as the source of the Chemical Kinetics, Biomolecules, and Compounds Containing Nitrogen question PDFs used for this project.
- **Biology question PDF:** Credit to **[ExamGOAL PDF Library](https://pdf.questions.examgoal.com/)** as the source of the NEET Biology chapter-wise PYQs used for this project.

The PDFs are credited to their respective sources; this project is an independent practice tool.

## Feedback

If you find an incorrect answer, a cropped or unreadable question, or a problem with test navigation or scoring, please report the issue with the relevant question number and source where possible.

## Added question bank: d and f Block Elements (Class 12 Chemistry)

The supplied `JEE Main d and f Block Elements Previous Year Questions with Answer Key` PDF has been integrated as a separate bank in `d_f_block_data.js` with one image crop per question under `assets/questions/d_f_block/`.

- 245 questions added (Q1–Q245), with unique IDs 10430–10674.
- Single-correct MCQ: Q1–Q204; numerical response: Q205–Q244.
- Q108 is flagged and excluded from scoring because the source answer key says “Scan QR”.
- Q245 is flagged and excluded from scoring because it is multiple-correct while the current UI supports single-select MCQs.
- Import audit: `DF_BLOCK_IMPORT_QA.json`.

### Test locally

1. Extract this ZIP into a new folder.
2. Double-click `START_TEST.bat` (or open `index.html` in a browser if your browser allows local assets).
3. Choose **Class 12**, then **Chemistry**.
4. Use the chapter selection to select **d and f Block Elements**, and run a short test first.
5. Check chemical notation and question images, numerical answer entry, and answer review. Q108 and Q245 should be marked unscored.

This import preserves the source's question images and answer-key entries; it is not a claim that every chemistry answer was independently re-solved. Review the flagged entries before any production deployment.


### Multiple-correct question support
Question 245 in the d- and f-block import is implemented as a multi-select MCQ. Click options A–D to toggle selections; the exact answer set A,D is scored using the simulator’s standard +4/−1 scheme (an unattempted question earns 0). It is no longer excluded from scoring. The source-key-only QR question Q108 remains flagged and excluded from scoring.

## Added question bank: Class 12 Mathematics — Integration and Area Under the Curves

The supplied `integration + aoi pyq.pdf` has been added as a separate question bank in `maths_integration_aoi_data.js`, with 569 question crops under `assets/questions/maths_integration_aoi/`.

- **Indefinite Integrals:** 90 questions (76 single-correct MCQs, 14 numerical).
- **Definite Integration:** 309 in-syllabus questions (231 single-correct MCQs, 77 numerical, 1 multiple-correct MCQ).
- **Area Under the Curves:** 170 questions (124 single-correct MCQs, 46 numerical).
- **Excluded:** Definite Integration Q310–Q331, marked out of syllabus in the supplied PDF.
- Question IDs: 10675–11243; printed question numbers restart per chapter and are preserved alongside chapter metadata.
- `MATHS_INTEGRATION_AOI_IMPORT_QA.json` records counts and import checks.

The mathematical notation is preserved as question images. Answer keys were transcribed from the PDF; they have not all been independently re-solved. The multi-correct question uses the existing multi-select interface.

### Test locally

1. Extract the ZIP into a folder.
2. Double-click `START_TEST.bat` or open `index.html` in a browser.
3. Select **Class 12 → Mathematics**.
4. Run a short test, then try **Choose chapters** to test each of the three chapters individually.
5. Check question images, MCQ selection, numerical entry, the multi-correct question, and answer review.

## Added Class 12 Chemistry chapters

This build includes three additional chapter banks from the supplied chapter-wise PYQ PDF:

- **Solid State** — 69 questions. The source marks this chapter as out of the current JEE Main syllabus; it is included for optional legacy practice.
- **Solutions** — 195 questions.
- **Electrochemistry** — 225 questions.

Question images are cropped in grayscale to preserve formulas and diagrams. One Solutions answer-key entry (Q32) was marked for manual checking because the source key says “Scan QR”; it is excluded from scoring until verified. The included `CHEMISTRY_CHAPTERS_IMPORT_QA.json` records the import counts and caveats.

### Run locally

Extract the ZIP, then double-click `START_TEST.bat` or open `index.html` in a modern browser. If your browser blocks local assets, use a local static server (for example, run `python -m http.server 8000` in the extracted folder and open `http://localhost:8000`).

## Added question bank: Class 11 Chemistry - Ionic Equilibrium

The supplied `JEE Main Ionic Equilibrium Previous Year Questions with Answer Key.pdf` is integrated in `ionic_equilibrium_data.js` with one source image per question under `assets/questions/ionic_equilibrium/`.

- 154 questions: 108 single-correct MCQs and 46 numerical questions.
- Covers JEE Main questions from 2002-2026; printed question numbers are preserved.
- Question IDs: 12732-12885.
- Q83 is flagged and excluded from scoring because the printed answer key says "Scan QR".
- Answer keys were transcribed from the PDF and have not all been independently re-solved. See `IONIC_EQUILIBRIUM_IMPORT_QA.json`.

Choose **Class 11 -> Chemistry** to practise this bank. Questions use source image crops to preserve formulas and answer choices.

## Added question bank: Class 11 Chemistry - Chemical Equilibrium

The supplied `JEE Main Chemical Equilibrium Previous Year Questions with Answer Key.pdf` adds 127 question-image crops under `assets/questions/chemical_equilibrium/` and local question metadata in `chemical_equilibrium_data.js`.

- 77 single-correct MCQs, 49 numerical questions, and 1 multiple-correct MCQ.
- Covers JEE Main/AIEEE questions from 2002-2026; question numbering and source pages are preserved.
- Q122 accepts the printed numerical range 72-75; Q127 uses exact-match multi-select scoring for answers A and B.
- Answers were transcribed from the printed PDF key and have not all been independently re-solved. See `CHEMICAL_EQUILIBRIUM_IMPORT_QA.json`.
- The local bank is merged with Supabase questions in the browser, and its 127 records are synced to `public.jee_questions`. If Supabase is unreachable, the local Chemical Equilibrium chapter still loads for testing. The new image assets are local; the hosted static website needs a separate deployment to serve them.

Choose **Class 11 -> Chemistry -> Chemical Equilibrium** to practise it locally.

## Added Class 11 Chemistry chapter: GOC

`GOC.pdf` combines three source sections into one **GOC (General Organic Chemistry)** chapter: Isomerism (5 questions), IUPAC Nomenclature (1 question), and Basics of Organic Chemistry (310 questions). The local bank has 316 questions total under `goc_data.js`, with question crops in `assets/questions/goc/`.

- 272 single-correct MCQs, 3 multiple-correct MCQs, and 41 numerical questions.
- Printed question numbers and original PDF pages are preserved; `source_section` distinguishes repeated numbering across the three sections.
- Basics of Organic Chemistry Q310 is marked out of syllabus in the source; it remains visible and is scored using its printed answer.
- Answers were transcribed from the printed keys and have not all been independently re-solved. See `GOC_IMPORT_QA.json`.

Choose **Class 11 -> Chemistry -> GOC** to practise the combined chapter. Its 316 question records are synced to Supabase; the local bank remains available if Supabase is unreachable.

## Added NEET Biology chapters

`Biology 3 chaps.pdf` adds 266 Class 11 single-correct questions to Supabase, with source image crops under `assets/questions/biology/`:

- Biomolecules: 102 questions.
- Cell Cycle and Cell Division: 82 questions.
- Photosynthesis in Higher Plants: 82 questions.

The answer keys were transcribed from the PDF and stored with each question; they have not all been independently re-solved. The import audit is in `BIOLOGY_3_CHAPTERS_IMPORT_QA.json`; the local source records are in `biology_three_chapters_data.json`.

Choose **Class 11 -> Biology** to practise these questions. Biology is also available in subject combinations and All Subjects; Class 12 filtering excludes these Class 11 questions.

## Added Class 12 Mathematics chapter: Differential Equations

The supplied `JEE Main Differential Equations Previous Year Questions with Answer Key (1).pdf` adds 243 in-syllabus questions to `differential_equations_data.js`, with question crops in `assets/questions/maths_differential_equations/`.

- 193 single-correct MCQs and 50 numerical questions from 2002–2026.
- The 23 questions marked out of syllabus in the PDF (Q244–Q266) are excluded.
- Q12 is flagged and left unscored because the printed key says “Scan QR” instead of giving an answer.
- Answers were transcribed from the printed key and have not all been independently re-solved. See `DIFFERENTIAL_EQUATIONS_IMPORT_QA.json`.

Choose **Class 12 -> Maths -> Differential Equations** to practise this chapter. Its 243 question records are synced to Supabase. The image assets still need a static-site deployment before the hosted site can serve them.

## Added Chemistry chapters: Hydrocarbons and Haloalkanes and Haloarenes

The supplied merged ExamGOAL PDF adds two image-backed chapters in `hydrocarbons_haloalkanes_data.js`:

- **Class 11 Hydrocarbons:** 188 questions (158 single-correct MCQs, 28 numerical, and 2 multiple-correct MCQs).
- **Class 12 Haloalkanes and Haloarenes:** 202 questions (189 single-correct MCQs and 13 numerical).

Question crops are in `assets/questions/hydrocarbons/` and `assets/questions/haloalkanes_haloarenes/`. Printed question numbers, source pages, years, shifts, and answer keys are preserved. Hydrocarbons Q167 accepts either printed answer, 8 or 6; both are scored as correct. The answer keys were transcribed from the PDF and have not all been independently re-solved. See `HYDROCARBONS_HALOALKANES_IMPORT_QA.json`.

Both chapters are loaded locally. Supabase sync is pending because the configured publishable key has read-only access (HTTP 401 on insert). Deploy the static site separately for hosted users to receive the new question images.

## Added Class 12 Chemistry chapters: Alcohols and Carbonyl Compounds

The supplied ExamGOAL PDF adds two image-backed chapters in `alcohols_aldehydes_data.js`:

- **Alcohols, Phenols and Ethers:** 203 questions (187 single-correct MCQs, 14 numerical, and 2 multiple-correct MCQs).
- **Aldehydes, Ketones and Carboxylic Acids:** 291 questions (260 single-correct MCQs, 27 numerical, and 4 multiple-correct MCQs).

Question crops are in `assets/questions/alcohols_phenols_ethers/` and `assets/questions/aldehydes_ketones_carboxylic_acids/`. Printed question numbers, source pages, years, shifts, and answer keys are preserved, including questions split across page breaks. The printed numerical answer range for Aldehydes, Ketones and Carboxylic Acids Q287 is retained and accepted by the scorer. Answers were transcribed from the PDF and have not all been independently re-solved. See `ALCOHOLS_ALDEHYDES_IMPORT_QA.json`.

Both chapters are available from the local question bank. Supabase sync is pending because the configured key previously returned HTTP 401 on insert. Deploy the static site separately for hosted users to receive the new question images.

## Added Class 12 Chemistry chapter: Biomolecules

The supplied `JEE Main Biomolecules Previous Year Questions with Answer Key.pdf` is integrated in `biomolecules_data.js`, with one source-faithful image crop per question under `assets/questions/biomolecules/`.

- **214 in-syllabus questions:** 191 single-correct MCQs and 23 numerical questions, covering 2002-2026.
- **Out of syllabus:** Q215 and Q216 remain available and are scored using their printed answers.
- Question IDs are 15201-15416. `BIOMOLECULES_IMPORT_QA.json` records the counts, answer mapping, and source pages.
- The local question bank is merged with Supabase results in the browser and remains available if Supabase is unreachable. Supabase sync is pending because the configured publishable key returned HTTP 401 on upsert. The hosted website needs a separate deployment to serve the new data and images.
- Answers were transcribed from the printed key and have not all been independently re-solved.

Choose **Class 12 -> Chemistry -> Biomolecules** to practise this bank locally.

## Added Class 12 Chemistry chapter: Compounds Containing Nitrogen

The supplied `JEE Main Compounds Containing Nitrogen Previous Year Questions with Answer Key.pdf` is integrated in `compounds_containing_nitrogen_data.js`, with one source-faithful image crop per question under `assets/questions/compounds_containing_nitrogen/`.

- 265 questions from 2002-2026: 237 single-correct MCQs and 28 numerical questions.
- Question IDs are 15417-15681. Q24, Q38, Q66, Q101, Q172, and Q190 include content that continues across PDF pages.
- Q265 preserves the printed accepted range, 37.80 to 38.20, supported by the simulator's numerical range scoring.
- The local question bank is merged with Supabase results and remains available if Supabase is unreachable. The hosted website needs a separate deployment to serve the new data and images.
- Answers were transcribed from the printed key and have not all been independently re-solved. See `COMPOUNDS_CONTAINING_NITROGEN_IMPORT_QA.json`.

Choose **Class 12 -> Chemistry -> Compounds Containing Nitrogen** to practise this bank locally.

## Added Chemistry chapters: s-Block, p-Block, and Coordination Compounds

The supplied `COORDINATION + S BLOCK + P BLOCK.pdf` adds three local, image-backed question banks in `chemistry_s_p_block_coordination_data.js`:

- **Class 11 s-Block Elements:** 129 questions (125 single-correct MCQs and 4 numerical). The source marks all 129 out of syllabus; they remain visible and scored.
- **Class 11 p-Block Elements:** 282 questions (260 single-correct MCQs, 21 numerical, and 1 multiple-correct MCQ). The source marks Q135-Q282 out of syllabus; those with printed answers are scored. Q243's key says “Scan QR” and remains unscored.
- **Class 12 Coordination Compounds:** 380 questions (299 single-correct MCQs, 80 numerical, and 1 multiple-correct MCQ). Q110, Q174, and Q200 are flagged because the key says “Scan QR”.

Question IDs are 16238-17028. Images are in `assets/questions/s_block/`, `assets/questions/p_block/`, and `assets/questions/coordination_compounds/`. Questions with missing answer keys remain available for practice but are not scored. The local banks are merged into the question pool; no Supabase rows were written. Answers were transcribed from the printed key and have not all been independently re-solved. See `CHEMISTRY_S_P_BLOCK_COORDINATION_IMPORT_QA.json`.

## Added Chemistry chapters: Periodic Table, Chemical Bonding, and Salt Analysis

The supplied `chem bonding + periodic table + salt analysis.pdf` adds three local, image-backed question banks in `chemistry_bonding_periodic_salt_data.js`:

- **Class 11 Periodic Table & Periodicity:** 179 questions (173 single-correct MCQs, 5 numerical, and 1 multiple-correct MCQ). Q179 is marked out of syllabus and is scored using its printed answer.
- **Class 11 Chemical Bonding & Molecular Structure:** 309 questions (244 single-correct MCQs, 64 numerical, and 1 multiple-correct MCQ).
- **Class 11 and 12 Salt Analysis:** 68 questions (60 single-correct MCQs, 7 numerical, and 1 multiple-correct MCQ). Q67 and Q68 are marked out of syllabus and scored using their printed answers.

Question images are in `assets/questions/periodic-table/`, `assets/questions/chemical-bonding/`, and `assets/questions/salt-analysis/`. Chemical Bonding Q23 continues across two PDF pages and is preserved as one complete image. The local banks are merged into the question pool; no Supabase rows were written. Answers were transcribed from the printed key and have not all been independently re-solved. See `CHEMISTRY_BONDING_PERIODIC_SALT_IMPORT_QA.json`.

## Added Class 11 Chemistry chapters: Some Basic Concepts, Structure of Atom, and Redox Reactions

The supplied `ilovepdf_merged (9).pdf` adds three local, image-backed question banks in `chemistry_basic_structure_redox_data.js`:

- **Some Basic Concepts of Chemistry:** 255 questions (131 single-correct MCQs, 119 numerical, and 5 out-of-syllabus questions).
- **Structure of Atom:** 230 questions (168 single-correct MCQs, 58 numerical, and 4 out-of-syllabus questions).
- **Redox Reactions:** 87 questions (52 single-correct MCQs and 35 numerical).

Question IDs are 17029-17600. Source-faithful images are in `assets/questions/some_basic_concepts_of_chemistry/`, `assets/questions/structure_of_atom/`, and `assets/questions/redox_reactions/`. All nine questions marked out of syllabus by the source have answer keys and are scored. The question banks load locally; no Supabase rows were written. Answers were transcribed from the printed key and have not all been independently re-solved. See `CHEMISTRY_BASIC_STRUCTURE_REDOX_IMPORT_QA.json`.

## Added Class 11 Chemistry chapter: Chemical Thermodynamics

The supplied `JEE Main Thermodynamics Previous Year Questions with Answer Key.pdf` adds 243 local questions in `chemical_thermodynamics_data.js`: 102 numerical questions and 141 single-correct MCQs. Question IDs are 17601-17843, with source-page crops in `assets/questions/chemical_thermodynamics/`.

The PDF does not mark any questions out of syllabus. All 243 printed answers are included, including numerical answer ranges. The bank loads locally; no Supabase rows were written. Answers were transcribed from the printed key and have not all been independently re-solved. See `CHEMICAL_THERMODYNAMICS_IMPORT_QA.json`.

## Added Maths chapters: Functions, Limits, Differentiation, and Application of Derivatives

The supplied `functions, limits, differentiation , aod .pdf` adds four local banks with 823 questions total in `maths_functions_limits_differentiation_aod_data.js`:

- **Class 11 Functions:** 184 questions (149 single-correct MCQs and 35 numerical).
- **Class 11 Limits:** 289 questions (230 single-correct MCQs and 59 numerical). The PDF groups this material under “Limits, Continuity and Differentiability”; the app labels it **Limits**, as requested.
- **Class 12 Differentiation:** 88 questions (75 single-correct MCQs, 12 numerical, and one out-of-syllabus numerical question). Q88 is scored from its printed answer; Q9 says “Scan QR” and remains unscored.
- **Class 12 Application of Derivatives:** 262 questions (164 in-syllabus MCQs, 28 in-syllabus numerical, and 70 out-of-syllabus questions). Q193-Q252 are MCQs and Q253-Q262 are numerical; all 70 out-of-syllabus questions have printed answers and remain scored. Q52 says “Scan QR” and remains unscored.

Question IDs are 17844-18666. Source-page crops are under `assets/questions/maths_functions/`, `assets/questions/maths_limits/`, `assets/questions/maths_differentiation/`, and `assets/questions/maths_application_of_derivatives/`. The bank loads locally; no Supabase rows were written. Answers were transcribed from the printed keys and have not all been independently re-solved. See `MATHS_FUNCTIONS_LIMITS_DIFFERENTIATION_AOD_IMPORT_QA.json`.

## Added Maths chapters: Trigonometry and Inverse Trigonometric Functions

The three supplied PDFs add 248 questions in `maths_trigonometry_data.js`:

- **Class 11 Trigonometry:** 140 questions, combining Trigonometric Equations (66) with Trigonometric Ratio and Identities (74). This bank contains 114 single-correct MCQs and 26 numerical questions. The source marks Trigonometric Equations Q22-Q66 out of syllabus; all 45 have printed answers and remain scored.
- **Class 12 Inverse Trigonometric Functions:** 108 questions: 89 in-syllabus single-correct MCQs, 17 numerical, one multiple-correct MCQ, and one out-of-syllabus question. Q108 is scored using its printed answer; Q107 has the multiple-correct answers A and D.

Question IDs are 18667-18914. Images are in `assets/questions/maths_trigonometry/` and `assets/questions/maths_inverse_trigonometric_functions/`. All 248 questions have printed answer-key entries. The banks load locally; no Supabase rows were written. See `MATHS_TRIGONOMETRY_IMPORT_QA.json`.

## Added Class 11 Maths chapters: Sets and Relations, Logarithm, and Quadratic Equation and Inequalities

The supplied `sets + log + quadratic .pdf` adds 348 local, image-backed questions in `maths_sets_log_quadratic_data.js`:

- **Sets and Relations:** 125 questions (92 single-correct MCQs and 33 numerical).
- **Logarithm:** 11 questions (5 single-correct MCQs and 6 numerical).
- **Quadratic Equation and Inequalities:** 212 questions (171 single-correct MCQs and 41 numerical).

Question IDs are 19627-19974. Images are under `assets/questions/maths_sets_log_quadratic/`. All printed answer keys are mapped. The source marks Quadratic Equation and Inequalities Q212 out of syllabus; its printed answer is 4, so it remains scored. The bank loads locally; no Supabase rows were written. See `MATHS_SETS_LOG_QUADRATIC_IMPORT_QA.json`.

## Added Maths chapters: Complex Numbers, 3D Geometry, Statistics, Matrices and Determinants, Permutations and Combinations, and Probability

The six supplied JEE Main PYQ PDFs add 1,707 local, image-backed questions in `maths_complex_3d_statistics_matrices_pnc_probability_data.js`:

- **Class 11 Complex Numbers:** 224 questions (185 single-correct MCQs and 39 numerical), including one out-of-syllabus question with a printed answer.
- **Class 12 3D Geometry:** 418 questions (331 single-correct MCQs and 87 numerical), including 219 out-of-syllabus questions with printed answers.
- **Class 11 Statistics:** 160 questions (123 single-correct MCQs and 37 numerical).
- **Class 12 Matrices and Determinants:** 414 questions (334 single-correct MCQs and 80 numerical), including 57 out-of-syllabus questions with printed answers.
- **Class 11 Permutations and Combinations:** 236 questions (140 single-correct MCQs and 96 numerical).
- **Class 12 Probability:** 255 questions (219 single-correct MCQs and 36 numerical), including 39 out-of-syllabus questions with printed answers.

Question IDs are 20584-22290. All out-of-syllabus questions with printed answers remain scored. Matrices and Determinants Q239 and Permutations and Combinations Q106 say “Scan QR” and remain unscored. Images are under `assets/questions/maths_complex_numbers/`, `assets/questions/maths_3d_geometry/`, `assets/questions/maths_statistics/`, `assets/questions/maths_matrices_determinants/`, `assets/questions/maths_permutations_combinations/`, and `assets/questions/maths_probability/`. The banks load locally; no Supabase rows were written. Answers were transcribed from the printed keys and have not all been independently re-solved. See `MATHS_COMPLEX_3D_STATISTICS_MATRICES_PNC_PROBABILITY_IMPORT_QA.json`.

## Physics chapters replaced from PDFs

The 28 Physics PDFs in `questions/physics questions/` provide 5,723 image-backed questions in `physics_pdf_data.js`, with crops under `assets/questions/physics_examgoal/`. The three Maths PDFs in that folder were excluded. The added Rotational Motion, Capacitor, Magnetic Effect of Current, and Geometrical Optics PDFs map to the app’s existing Rotation, Capacitors, Moving Charges & Magnetism, and Ray Optics chapters. Matching Physics questions from Supabase are filtered in the browser and replaced by this local bank; Supabase itself was not changed.

Magnetic Properties of Matter remains a separate chapter. Ten questions with “Scan QR” keys remain unscored, and Electrostatics Q254 is marked as a bonus question. Answers were transcribed from the printed keys and have not all been independently re-solved. See `PHYSICS_PDFS_IMPORT_QA.json`. The hosted site needs a separate deployment to serve the updated bank and images.

## Added Class 11 Maths chapters: Sequences and Series, and Binomial Theorem

The supplied `JEE Main Sequences and Series Previous Year Questions with Answer Key.pdf` and `JEE Main Binomial Theorem Previous Year Questions with Answer Key.pdf` add 609 local, image-backed questions in `maths_sequences_series_binomial_theorem_data.js`:

- **Sequences and Series:** 341 questions (263 single-correct MCQs and 78 numerical), IDs 19975-20315.
- **Binomial Theorem:** 268 questions (179 single-correct MCQs and 89 numerical), IDs 20316-20583.

The PDFs cover 2002-2026. The sources mark Sequences and Series Q231-Q341 and Binomial Theorem Q193-Q268 out of syllabus; questions in those ranges with usable printed answers remain scored. The four “Scan QR” answer keys (Sequences and Series Q164, Q240, Q301; Binomial Theorem Q39) remain unscored. Images are under `assets/questions/maths_sequences_series/` and `assets/questions/maths_binomial_theorem/`. The banks load locally; no Supabase rows were written. Answers were transcribed from the printed keys and have not all been independently re-solved. See `MATHS_SEQUENCES_BINOMIAL_IMPORT_QA.json`.
