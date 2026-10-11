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

## Getting started

This is a static web project and does not require a build step.

1. Clone or download this repository.
2. Keep the JavaScript, HTML, CSS, data files, and question-image folders in their existing relative locations.
3. Open `index.html` in a browser, or run `START_TEST.bat` on Windows.

If images do not load, check that the image files are present and that their paths match the references in the question data.

## Screenshots

Screenshots of the test setup and question interface can be added here once they are committed to the repository. This section is intentionally left without image links until those files are available.

## Project direction

The immediate focus is reliability: preserving question layouts, improving image readability, and checking answer mappings. The longer-term goal is to grow the question bank while keeping one consistent test experience across sources.

## Feedback

If you find an incorrect answer, a cropped or unreadable question, or a problem with test navigation or scoring, please report the issue with the relevant question number and source where possible.
