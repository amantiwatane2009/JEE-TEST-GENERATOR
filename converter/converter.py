"""Extraction, conservative question segmentation, and schema checks."""
from __future__ import annotations

import hashlib
import io
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

import fitz
from PIL import Image

QUESTION_START = re.compile(
    r"^\s*(?:Q(?:uestion)?\s*)?(\d{1,3})\s*[.)]\s+",
    re.IGNORECASE,
)
OPTION_LINE = re.compile(r"^\s*[([]?([A-Da-d1-4])[)\].:]\s*(.+?)\s*$")


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "").lower()
    return re.sub(r"[^a-z0-9]+", "", value)


def text_hash(value: str) -> str:
    return hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()


def extract_pdf(pdf_bytes: bytes, filename: str, tesseract_cmd: str | None = None) -> list[dict[str, Any]]:
    """Extract page text and preserve each source page as a PNG asset."""
    pages: list[dict[str, Any]] = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for idx, page in enumerate(doc):
            text = page.get_text("text") or ""
            method = "embedded_text"
            if len(re.sub(r"\s+", "", text)) < 25:
                method = "ocr"
                try:
                    import pytesseract
                    if tesseract_cmd:
                        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    image = Image.open(io.BytesIO(pix.tobytes("png")))
                    text = pytesseract.image_to_string(image, config="--psm 6")
                except Exception as exc:
                    text = text or ""
                    method = "ocr_unavailable"
                    ocr_error = str(exc)
                else:
                    ocr_error = ""
            else:
                ocr_error = ""
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            pages.append({
                "page_number": idx + 1,
                "text": text.strip(),
                "method": method,
                "image_bytes": pix.tobytes("png"),
                "ocr_error": ocr_error,
                "filename": filename,
            })
    finally:
        doc.close()
    return pages


def split_page_questions(text: str) -> list[dict[str, Any]]:
    """Split text only at clear numbered-question line starts; otherwise flag the page."""
    lines = (text or "").splitlines()
    starts: list[tuple[int, int]] = []
    for idx, line in enumerate(lines):
        match = QUESTION_START.match(line)
        if match:
            starts.append((idx, int(match.group(1))))
    if not starts:
        return [{"question_no": None, "text": (text or "").strip(), "segmentation_confident": False}]
    out = []
    for pos, (start, qno) in enumerate(starts):
        end = starts[pos + 1][0] if pos + 1 < len(starts) else len(lines)
        block = "\n".join(lines[start:end]).strip()
        if block:
            out.append({"question_no": qno, "text": block, "segmentation_confident": True})
    return out


def parse_options(text: str) -> list[dict[str, str]]:
    options = []
    for line in (text or "").splitlines():
        match = OPTION_LINE.match(line)
        if match:
            label = match.group(1).upper()
            if label in {"A", "B", "C", "D", "1", "2", "3", "4"}:
                options.append({"label": label, "text": match.group(2).strip()})
    # Avoid interpreting ordinary numbered prose as four MCQ choices.
    labels = [o["label"] for o in options]
    if len(options) >= 2 and labels[:4] not in (["A", "B", "C", "D"], ["1", "2", "3", "4"]):
        alpha = [x for x in labels if x in {"A", "B", "C", "D"}]
        if len(alpha) < 2:
            return []
    return options


def validate_record(record: dict[str, Any]) -> list[str]:
    errors = []
    required = ("id", "chapter", "attempt", "source_page", "question_no", "answer",
                "image", "flagged", "clean_answer", "type", "year", "source_id", "source_name")
    for key in required:
        if key not in record:
            errors.append(f"Missing required field: {key}")
    if record.get("type") not in {"mcq", "response"}:
        errors.append("type must be 'mcq' or 'response'")
    if not str(record.get("answer", "")).strip():
        errors.append("Answer is missing")
    if not str(record.get("chapter", "")).strip():
        errors.append("Chapter is missing")
    if not str(record.get("image", "")).strip():
        errors.append("Image path is missing")
    return errors


def load_existing(path: str | Path) -> list[dict[str, Any]]:
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []
