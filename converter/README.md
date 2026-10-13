# JEE PYQ PDF-to-JSON Converter

A separate local tool for reviewing JEE Main Physics, Chemistry and Mathematics PDFs before exporting question data. It does not edit the website or its existing question bank.

## Windows quick start

1. Install **Python 3.11 or newer** from https://www.python.org/downloads/ and enable **Add Python to PATH**.
2. For scanned PDFs, install Tesseract OCR for Windows from https://github.com/UB-Mannheim/tesseract/wiki. If it is not on PATH, add its installation folder to PATH.
3. From this folder, double-click `run_converter.bat`. The script creates `.venv`, installs free base dependencies and opens the local Streamlit interface.
4. Upload one or more PDFs, enter the source metadata and process the files.
5. Review extracted question text, options, answer values and flags. Inspect the preserved page images. Fix uncertain data before selecting records for export.
6. Download or use the separate `output/` folder. Only copy validated output into the website manually after checking it.

If the command launcher fails, open Command Prompt in this folder and run:

```bat
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

## OCR and AI

- PDFs with selectable text use PyMuPDF first.
- Pages with little or no embedded text use local Tesseract OCR. OCR quality depends on scan quality.
- The base version works without an API key. Optional AI-assisted parsing is available by installing `requirements-ai.txt`, copying `.env.example` to `.env`, and setting `OPENAI_API_KEY`. API usage may incur charges. Never commit `.env`.
- AI suggestions are not treated as verified answers. Always review the source PDF and answer key.

## Output and compatibility

Each run writes to a timestamped folder under `output/`, separate from the production files. It contains `questions.json`, source page images under `assets/`, a review queue and `conversion-report.json`. The question records retain the existing website conventions: `id`, `chapter`, `attempt`, `source_page`, `question_no`, `answer`, `image`, `flagged`, `clean_answer`, `type`, `year`, `source_id` and `source_name`. Extra extracted text and options are retained for review but should not be assumed to render in the current website.

For safety, page images are preserved in full in this first version. This avoids silently cutting off diagrams, but when a page contains multiple questions, the image is not yet a one-question crop. Such records are flagged for image review and should not be marked validated until you have created/checked a single-question crop. The converter never replaces manually corrected website image crops.

## Duplicate handling

The app compares normalized extracted question text within the current batch and, when an existing `questions.json` is available, compares source identifiers and question metadata. Matches are warnings only: records are never automatically deleted or merged.

## Tests

Run unit tests with:

```bat
.venv\Scripts\python -m unittest discover -s tests -v
```

The tests cover parsing, flagging and schema validation. They do not claim OCR accuracy on a particular PDF; verify extraction against your own sample papers.
