import unittest
from converter import normalize_text, parse_answer_key_pages, parse_options, split_page_questions, validate_record

class ConverterTests(unittest.TestCase):
    def test_splits_numbered_questions(self):
        got = split_page_questions("1. Find x.\n(A) 1\n(B) 2\n2. Find y.\n(A) 3")
        self.assertEqual([x["question_no"] for x in got], [1, 2])
        self.assertTrue(all(x["segmentation_confident"] for x in got))

    def test_unrecognized_page_is_flagged(self):
        got = split_page_questions("A scanned question without reliable numbering")
        self.assertEqual(len(got), 1)
        self.assertFalse(got[0]["segmentation_confident"])

    def test_option_parse(self):
        got = parse_options("Question?\n(A) alpha\n(B) beta\n(C) gamma\n(D) delta")
        self.assertEqual([x["label"] for x in got], ["A", "B", "C", "D"])

    def test_normalize_text(self):
        self.assertEqual(normalize_text("  x² + 2 "), normalize_text("x2+2"))

    def test_answer_key_requires_clear_label(self):
        pages = [{"page_number": 9, "text": "Answer Key\n1. B\n2. 12\n3. D"}]
        answers, key_pages = parse_answer_key_pages(pages)
        self.assertEqual(answers, {1: "B", 2: "12", 3: "D"})
        self.assertEqual(key_pages, {9})

    def test_unlabelled_page_is_not_treated_as_answer_key(self):
        answers, key_pages = parse_answer_key_pages([{"page_number": 1, "text": "1. A\n2. B"}])
        self.assertEqual(answers, {})
        self.assertEqual(key_pages, set())

    def test_schema_requires_answer_and_chapter(self):
        record = {"id": 1, "chapter": "", "attempt": "Jan", "source_page": 1,
                  "question_no": 1, "answer": "", "image": "assets/page.png",
                  "flagged": True, "clean_answer": "", "type": "response",
                  "year": 2025, "source_id": "s", "source_name": "JEE"}
        issues = validate_record(record)
        self.assertTrue(any("Answer is missing" in x for x in issues))
        self.assertTrue(any("Chapter is missing" in x for x in issues))

if __name__ == "__main__":
    unittest.main()
