# Exam Pattern Test Presets

Date: 2026-11-23

## Intent

Give students a quick way to start a JEE Main or NEET exam-pattern test, with the option to use the full syllabus or limit the test to selected chapters. Keep the existing custom practice flow available.

## Goals

- JEE Main preset: 25 Physics, 25 Chemistry, and 25 Mathematics questions (75 total).
- NEET preset: 45 Physics, 45 Chemistry, and 90 Biology questions (180 total), using single-answer MCQs and the requested three-hour format (NTA 2026 pattern).
- Label this preset as the 2026 format. The NTA NEET 2027 page currently lists a different pattern (200 questions, 180 to answer, 200 minutes), so disclose this in the confirmation screen and point students to the upcoming information bulletin.
- Let students choose Full Syllabus Test (FST) or chapters separately for each subject. Keep preset subject counts fixed and require enough questions in the chosen chapter pools before launch.
- Set both preset tests to a three-hour timer and require an explicit confirmation before starting it.
- Before NEET launch, disclose the selected Physics and Chemistry question sources. With the current banks, state that they are JEE PYQs until NEET PYQs are added; Biology uses the available NEET PYQs.

## Constraints and non-goals

- Use the existing local and Supabase-loaded question banks; do not import new question data or modify Supabase.
- NEET Physics and Chemistry sections temporarily use single-answer JEE MCQs. Show each question's original source during the test as the current app already does.
- Do not change the existing custom single-subject practice setup, scoring, or result analysis.

## Approaches

1. **Add exam-pattern presets alongside the existing practice flow (chosen).** Reuse the loaded question banks, filter to each subject and selected chapters, and show the NEET source notice at the final confirmation step. This makes both requested modes available now and is clear about question origins.
2. **Wait for NEET Physics and Chemistry banks.** Keep NEET unavailable until dedicated question sources are imported. This avoids using JEE PYQs in a NEET mock, but delays the requested NEET pattern test.

## Flow and behavior

- Add a preset choice for JEE Main or NEET while retaining the current custom practice path.
- After the student chooses a class range, show FST (all available chapters) and chapter-selection options. Chapter selection is grouped by subject for the chosen exam.
- Show each subject's target count and available question count. Do not allow launch if any subject's chosen chapter pool is smaller than its target.
- Before starting either preset, show a final summary with subject counts and the three-hour duration. The NEET summary discloses question sources, identifies the preset as the 2026 format, and warns that the listed 2027 pattern differs. The student must choose an explicit “Confirm and start” action.
- Randomly select the target number from each subject's eligible questions and use the existing timed test, scoring, and review flow.

## Builder calls

- Preset mode defaults to FST.
- NEET questions are restricted to single-answer MCQs; JEE test section counts are fixed at 25 per subject, while the existing JEE question types remain supported.
- The confirmation screen is the final step before the timer starts; no timer runs during setup.
