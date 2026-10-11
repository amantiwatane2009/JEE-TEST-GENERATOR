# JEE Main Physics — Class 11 PYQ Simulator

A small project built to make JEE Main Physics practice feel a little more like the real thing — without the pressure of a countdown timer.

I started this because I wanted a simple way to build a test from Class 11 Physics previous-year questions (PYQs), choose how many questions to attempt, and review what I got wrong afterwards. The goal is to keep improving it as the question bank grows.

**[Open the live simulator](https://jee11testgenerator.vercel.app/)**

## What you can do

- **Build a test your way:** choose the number of questions instead of being locked into one paper length.
- **Practise without a timer:** take the test at your own pace.
- **Choose a source or year:** filter the available PYQs when creating a paper.
- **Focus on chapters:** create a test from the chapters you want to practise.
- **Keep the exam flow:** move between questions, jump from the question palette, clear an answer, or mark a question for review.
- **See how you did:** get your score, chapter-wise analysis, and a review of incorrect or skipped questions.
- **Revisit past mocks:** test history is saved locally in your browser.

The simulator uses the usual **+4 for a correct answer and −1 for an incorrect answer**. Questions flagged because of source answer-key notes or ambiguity are excluded from the default pool rather than silently treated as reliable.

## A note about the questions

The question bank is based on JEE Main Class 11 Physics PYQs. Original question images are used so diagrams, equations, and formatting stay close to the source. Image quality and answer mappings still need careful checking as more question sets are added.

This is an evolving personal project, so if you spot a cropped image, a questionable answer, or something that behaves strangely, that's useful feedback.

## Run it locally

1. Download or clone this repository.
2. Keep the project files and question-image folders together so the relative image paths continue to work.
3. Open `index.html` in your browser, or use the included `START_TEST.bat` on Windows if you prefer the launcher.

No build step is required for the current static version.

## Screenshots

Screenshots would make this README more useful, especially for showing the test builder and the question-taking screen. I haven't added image embeds yet because there aren't any committed website screenshots in the repository; I don't want to add broken image links. Once screenshots are added to the repo, they can go here.

## What's next

This is the foundation, not a finished all-in-one JEE platform. The plan is to keep improving question extraction and validation, expand the question bank carefully, and build on the same test experience rather than creating a separate app for every source.

If you're preparing for JEE too, I hope it helps you get in a few more focused practice sessions.
