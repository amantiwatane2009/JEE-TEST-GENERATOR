# JEE Main Class 11 Physics Test Maker

A browser-based practice tool for working through JEE Main previous-year questions (PYQs) from Class 11 Physics. It is designed to make focused practice easy: choose a test length, select chapters, answer questions at your own pace, and review your performance when you're done.

**Live app:** https://jee11testgenerator.vercel.app/

## Features

- **Custom test length** — create a paper with the number of questions you want to attempt.
- **Chapter selection** — practise the full available question bank or focus on selected chapters.
- **Source filtering** — filter questions by available year/source.
- **Untimed practice** — work without a countdown clock.
- **Question navigation** — move between questions using the question palette.
- **Answer review** — clear responses and mark questions to revisit before submitting.
- **Scoring and analysis** — review your score, correct and incorrect answers, skipped questions, and chapter-wise performance.
- **Mock history** — recent test results are stored locally in your browser.

The current scoring scheme is **+4 for a correct answer and −1 for an incorrect answer**. Questions flagged because of notes or ambiguity in the source answer key are excluded from the default test pool.

## Question bank

Questions are presented using image assets to preserve the original equations, diagrams, and formatting as closely as possible. The bank is being expanded and reviewed over time, so image crops and answer-key mappings should be checked when issues are reported. Source-specific flags are retained rather than silently treating uncertain answers as verified.

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

This is a static web project and does not require a build step.

1. Clone or download this repository.
2. Keep the JavaScript, HTML, CSS, data files, and question-image folders in their existing relative locations.
3. Open `index.html` in a browser, or run `START_TEST.bat` on Windows.

If images do not load, check that the image files are present and that their paths match the references in the question data.

## Project direction

The immediate focus is reliability: preserving question layouts, improving image readability, and checking answer mappings. The longer-term goal is to grow the question bank while keeping one consistent test experience across sources.

## Acknowledgements

- **Physics question PDFs:** Credit and thanks to **[Eduniti](https://www.youtube.com/@mohitgoenka99)** for creating and sharing the Physics question PDFs used as a source for this project. [Access the PDF collection on Google Drive](https://drive.google.com/drive/folders/1785MiemoRxcc3o6dto6DKCdEfcW70gO_).
- **Chemical Kinetics question PDF:** Credit to **[ExamGOAL PDF Library](https://pdf.questions.examgoal.com/)** as the source of the Chemical Kinetics question PDF used for this project.

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
