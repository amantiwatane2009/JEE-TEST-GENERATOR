"""Local review UI for the JEE PYQ PDF-to-JSON converter."""
from __future__ import annotations
import hashlib, json, re, time
from pathlib import Path
import streamlit as st
from dotenv import load_dotenv
from converter import extract_pdf, load_existing, normalize_text, parse_options, split_page_questions, validate_record

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
load_dotenv(HERE / ".env")
st.set_page_config(page_title="JEE PYQ PDF-to-JSON Converter", page_icon="📄", layout="wide")
st.title("JEE PYQ PDF-to-JSON Converter")
st.caption("Local-first extraction and review. Nothing is imported into the website automatically.")

with st.sidebar:
    st.header("Source metadata")
    year = st.number_input("Exam year", min_value=2002, max_value=2100, value=2025, step=1)
    subject = st.selectbox("Subject", ["Physics", "Chemistry", "Mathematics"])
    klass = st.selectbox("Class", [11, 12], index=0)
    session = st.text_input("Paper/session", placeholder="e.g. 22 Jan Shift 1")
    source_name = st.text_input("Source name", value="JEE Main")
    source_id = st.text_input("Source ID", value=f"jee-main-{year}-class{klass}-{subject.lower()}")
    chapter_default = st.text_input("Default chapter", placeholder="Leave blank if unknown")
    tesseract_cmd = st.text_input("Tesseract executable (optional)", placeholder=r"C:\Program Files\Tesseract-OCR\tesseract.exe")

st.markdown("""
**Workflow:** upload PDFs → extract text/OCR → inspect each question and source image → mark validated → export a separate folder.
Scanned-page OCR and automated question boundaries can be imperfect. The original page image is always retained.
""")
uploads = st.file_uploader("Choose one or more JEE PYQ PDFs", type=["pdf"], accept_multiple_files=True)
existing_path = HERE.parent / "questions.json"
existing = load_existing(existing_path)
st.caption(f"Existing bank available for duplicate warnings: {len(existing)} records" if existing else "No existing questions.json detected beside the converter. Batch duplicate detection still works.")

if st.button("Extract uploaded PDFs", type="primary", disabled=not uploads):
    rows, image_assets, errors = [], {}, []
    for up in uploads:
        try:
            pages = extract_pdf(up.getvalue(), up.name, tesseract_cmd.strip() or None)
        except Exception as exc:
            errors.append({"file": up.name, "error": str(exc)})
            continue
        safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", Path(up.name).stem).strip("_") or "paper"
        for page in pages:
            page_asset = f"assets/{safe_stem}_page_{page['page_number']:03d}.png"
            image_assets[page_asset] = page["image_bytes"]
            segments = split_page_questions(page["text"])
            multi = len(segments) > 1
            for seq, seg in enumerate(segments, 1):
                qtext = seg["text"]
                options = parse_options(qtext)
                flags = []
                if page["method"] in {"ocr", "ocr_unavailable"}: flags.append("OCR_REVIEW")
                if page["method"] == "ocr_unavailable": flags.append("OCR_UNAVAILABLE")
                if not seg["segmentation_confident"]: flags.append("QUESTION_BOUNDARY_UNCERTAIN")
                if multi: flags.append("IMAGE_CROP_REVIEW")
                if not options: flags.append("OPTIONS_NOT_DETECTED")
                if not chapter_default.strip(): flags.append("CHAPTER_UNKNOWN")
                if not qtext: flags.append("QUESTION_TEXT_MISSING")
                if page["ocr_error"]: flags.append("OCR_ERROR")
                rows.append({
                    "id": None, "source_id": source_id.strip(),
                    "source_name": source_name.strip() or "JEE Main", "year": int(year),
                    "subject": subject, "class": int(klass), "chapter": chapter_default.strip(),
                    "attempt": session.strip() or str(year), "source_page": page["page_number"],
                    "question_no": seg["question_no"] if seg["question_no"] is not None else seq,
                    "answer": "", "clean_answer": "", "type": "mcq" if len(options) >= 2 else "response",
                    "image": page_asset, "flagged": True, "question_text": qtext,
                    "options_json": json.dumps(options, ensure_ascii=False),
                    "extraction_method": page["method"],
                    "review_flags": ", ".join(dict.fromkeys(flags + ["ANSWER_KEY_NOT_MAPPED"])),
                    "validated": False, "duplicate_warning": "",
                    "_text_hash": hashlib.sha256(normalize_text(qtext).encode("utf-8")).hexdigest() if qtext else "",
                    "_source_file": up.name,
                })
    counts = {}
    for row in rows:
        h = row["_text_hash"]
        if h: counts[h] = counts.get(h, 0) + 1
    existing_keys = {(str(q.get("source_id", q.get("sourceId", ""))), str(q.get("year", "")),
                      str(q.get("source_page", "")), str(q.get("question_no", ""))) for q in existing}
    for row in rows:
        notes = []
        if row["_text_hash"] and counts.get(row["_text_hash"], 0) > 1: notes.append("Duplicate text in this batch")
        key = (row["source_id"], str(row["year"]), str(row["source_page"]), str(row["question_no"]))
        if key in existing_keys: notes.append("Source/page/question metadata matches existing bank")
        row["duplicate_warning"] = "; ".join(notes)
    st.session_state["rows"], st.session_state["images"] = rows, image_assets
    st.session_state["errors"] = errors
    st.session_state["run_id"] = time.strftime("%Y%m%d_%H%M%S")
    st.success(f"Extracted {len(rows)} candidate question records from {len(uploads)} PDF(s). Review flags before export.")

if st.session_state.get("errors"):
    st.subheader("File errors")
    st.json(st.session_state["errors"])

rows = st.session_state.get("rows")
if rows is not None:
    st.subheader("Review extracted questions")
    st.info("Question images preserve the complete source page to avoid losing diagrams. If a page has multiple questions, IMAGE_CROP_REVIEW remains until you make and verify a single-question crop.")
    editable = st.data_editor(rows, use_container_width=True, num_rows="dynamic", hide_index=True,
        column_config={
            "id": st.column_config.NumberColumn("ID", help="Assigns a new ID on export if blank."),
            "question_text": st.column_config.TextColumn("Extracted question text", width="large"),
            "options_json": st.column_config.TextColumn("Options JSON", width="medium"),
            "answer": st.column_config.TextColumn("Answer key value"),
            "chapter": st.column_config.TextColumn("Chapter"),
            "review_flags": st.column_config.TextColumn("Review flags", width="large"),
            "validated": st.column_config.CheckboxColumn("Validated", help="Only mark after checking the source PDF, answer key and image."),
            "duplicate_warning": st.column_config.TextColumn("Duplicate warning", width="large"),
        },
        disabled=["_text_hash", "_source_file", "duplicate_warning", "extraction_method"], key="review_editor")
    st.session_state["edited_rows"] = editable
    selected = st.selectbox("Preview source page", list(range(len(editable))),
        format_func=lambda i: f"{i+1}. {editable[i].get('_source_file','PDF')} — page {editable[i].get('source_page','?')}")
    chosen = editable[selected]
    img_bytes = st.session_state.get("images", {}).get(chosen.get("image", ""))
    left, right = st.columns([1, 1])
    with left:
        st.markdown("**Extracted text**")
        st.text_area("Question text preview", chosen.get("question_text", ""), height=260, key=f"preview_{selected}")
        st.markdown("**Options**")
        st.code(chosen.get("options_json", "[]"), language="json")
    with right:
        st.markdown("**Original source page**")
        if img_bytes: st.image(img_bytes, use_container_width=True)
        else: st.warning("Image asset is missing from this session.")
        st.caption(f"Extraction method: {chosen.get('extraction_method', 'unknown')} · {chosen.get('review_flags', '')}")

    st.divider()
    st.subheader("Export")
    st.caption("Export creates new files under converter/output/<run timestamp>. Existing website files are never modified.")
    if st.button("Validate and export reviewed records"):
        current = st.session_state.get("edited_rows", rows)
        export_rows, review_rows, validation_errors = [], [], []
        seen_ids = {int(q["id"]) for q in existing if str(q.get("id", "")).isdigit()}
        next_id = max(seen_ids, default=0) + 1
        for row in current:
            if not str(row.get("id", "")).strip() or not str(row.get("id", "")).isdigit():
                row["id"] = next_id
                next_id += 1
            row["id"] = int(row["id"])
            try:
                opts = json.loads(row.get("options_json") or "[]")
                if not isinstance(opts, list): raise ValueError("Options must be a JSON array")
            except (json.JSONDecodeError, ValueError) as exc:
                validation_errors.append({"id": row["id"], "errors": [f"Invalid options_json: {exc}"]})
                review_rows.append(row)
                continue
            record = {
                "id": row["id"], "source_id": str(row.get("source_id", source_id)).strip(),
                "source_name": str(row.get("source_name", source_name)).strip(),
                "year": int(row.get("year", year)), "chapter": str(row.get("chapter", "")).strip(),
                "attempt": str(row.get("attempt", "")).strip(), "source_page": int(row.get("source_page", 0)),
                "question_no": int(row.get("question_no", 0)) if str(row.get("question_no", "")).isdigit() else row.get("question_no"),
                "answer": str(row.get("answer", "")).strip(), "image": str(row.get("image", "")).strip(),
                "flagged": bool(row.get("flagged", True)), "clean_answer": str(row.get("clean_answer", "")).strip(),
                "type": str(row.get("type", "response")).strip(), "subject": str(row.get("subject", subject)).strip(),
                "class": int(row.get("class", klass)), "question_text": str(row.get("question_text", "")).strip(),
                "options": opts, "extraction_method": str(row.get("extraction_method", "")),
                "review_flags": str(row.get("review_flags", "")),
            }
            issues = validate_record(record)
            if row.get("validated"):
                if record["review_flags"]: issues.append("Review flags must be cleared manually after resolving them")
                if record["flagged"]: issues.append("flagged must be false for a validated record")
            else: issues.append("Record has not been marked validated")
            if issues:
                validation_errors.append({"id": record["id"], "errors": issues})
                review_rows.append(record)
            else: export_rows.append(record)

        run_id = st.session_state.get("run_id") or time.strftime("%Y%m%d_%H%M%S")
        target = OUT / run_id
        (target / "assets").mkdir(parents=True, exist_ok=True)
        images = st.session_state.get("images", {})
        for rel in {r.get("image") for r in export_rows + review_rows if r.get("image")}:
            payload = images.get(rel)
            if payload:
                dest = target / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(payload)
        (target / "questions.json").write_text(json.dumps(export_rows, ensure_ascii=False, indent=2), encoding="utf-8")
        (target / "review-queue.json").write_text(json.dumps(review_rows, ensure_ascii=False, indent=2), encoding="utf-8")
        report = {
            "run_id": run_id, "uploaded_pdf_count": len({r.get("_source_file") for r in current}),
            "candidate_count": len(current), "exported_validated_count": len(export_rows),
            "flagged_or_failed_count": len(review_rows), "validation_errors": validation_errors,
            "file_errors": st.session_state.get("errors", []),
            "notes": ["Existing question bank was read for duplicate warnings only and was not modified.",
                      "Page-level images are retained; multi-question pages require a checked one-question crop before validation.",
                      "OCR-derived content must be reviewed against the original paper and answer key."]
        }
        (target / "conversion-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        st.success(f"Export finished: {len(export_rows)} validated record(s), {len(review_rows)} record(s) in review queue.")
        st.write(f"Output folder: {target}")
        st.json({k: report[k] for k in ["candidate_count", "exported_validated_count", "flagged_or_failed_count"]})
        st.download_button("Download validated questions.json", (target / "questions.json").read_bytes(), file_name="questions.json", mime="application/json")
        st.download_button("Download conversion report", (target / "conversion-report.json").read_bytes(), file_name="conversion-report.json", mime="application/json")
