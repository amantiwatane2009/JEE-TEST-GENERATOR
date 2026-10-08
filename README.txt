JEE Physics PYQ Simulator — fixed question-image extraction

This version uses the original PDF page geometry (PyMuPDF) rather than OCR-only
coordinates to isolate individual questions. Question images are cropped from
actual question boundaries, with special handling for final questions in a
column so they do not get cut in half or accidentally include the next question.

Features:
- Custom number of questions
- Untimed test mode
- Full Class 11 Physics PYQ bank
- Randomized tests
- Question palette
- Mark for review
- JEE-style scoring
- Post-test analysis

Run START_TEST.bat on Windows.
