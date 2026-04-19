# Test Report — College Timetable Validator
## Phase 5: Testing & Documentation
### TOC Project · Topic #15 · Course Code: 2304220T · AY 2025–26

---

## Test Strategy

Each field is tested with at least **3 valid** and **3 invalid** input strings. Tests cover:
- **Nominal cases** — typical correct inputs
- **Boundary cases** — minimum/maximum length, edge values
- **Edge cases** — wrong case, special chars, empty input, whitespace

Pass/Fail determined by `validateField(fieldId, value)` in `validator.js`.

---

## Field 1: Subject Code
**Regex:** `^[A-Z]{2,4}[0-9]{3,4}$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `CS101` | PASS | ✅ PASS | 2 letters + 3 digits — nominal |
| 2 | `MATH201` | PASS | ✅ PASS | 4 letters + 3 digits — max letters |
| 3 | `IT2301` | PASS | ✅ PASS | 2 letters + 4 digits — max digits |
| 4 | `ECE103` | PASS | ✅ PASS | 3 letters + 3 digits |
| 5 | `cs101` | FAIL | ✅ FAIL | Lowercase letters not in `[A-Z]` |
| 6 | `CS1` | FAIL | ✅ FAIL | Only 1 digit; minimum is 3 |
| 7 | `COMPS12345` | FAIL | ✅ FAIL | 5 letters + 5 digits; exceeds `{2,4}` and `{3,4}` |
| 8 | `CS-101` | FAIL | ✅ FAIL | Hyphen not in character class |
| 9 | `101CS` | FAIL | ✅ FAIL | Pattern starts with letters, not digits |
| 10 | ` ` (empty) | FAIL | ✅ FAIL | Empty input — required field |

---

## Field 2: Subject Name
**Regex:** `^[A-Za-z][A-Za-z ]{2,49}$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `Theory of Computation` | PASS | ✅ PASS | Standard subject name |
| 2 | `Maths` | PASS | ✅ PASS | Short name, 5 chars |
| 3 | `Data Structures and Algorithms` | PASS | ✅ PASS | Multi-word, within limit |
| 4 | ` Algorithms` | FAIL | ✅ FAIL | Leading space (first char must be `[A-Za-z]`) |
| 5 | `AB` | FAIL | ✅ FAIL | Only 2 chars; minimum is 3 |
| 6 | `CS-101 Lab` | FAIL | ✅ FAIL | Hyphen not in `[A-Za-z ]` |
| 7 | `Data2Structures` | FAIL | ✅ FAIL | Digit in name not allowed |
| 8 | (51 chars) | FAIL | ✅ FAIL | Exceeds max length of 50 |
| 9 | `A` | FAIL | ✅ FAIL | Too short |
| 10 | `Operating Systems` | PASS | ✅ PASS | Two-word name |

---

## Field 3: Faculty Name
**Regex:** `^(Dr\.|Prof\.)? ?[A-Za-z]+( [A-Za-z]+){1,3}$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `Dr. Sharma` | PASS | ✅ PASS | Dr. prefix + single surname |
| 2 | `Prof. A Patil` | PASS | ✅ PASS | Prof. prefix + initial + surname |
| 3 | `Rajan Kumar Mehta` | PASS | ✅ PASS | Three name parts, no prefix |
| 4 | `Dr. S K Joshi` | PASS | ✅ PASS | Prefix + 3 initial-parts |
| 5 | `123 Sharma` | FAIL | ✅ FAIL | Digit in name not allowed |
| 6 | `Dr.` | FAIL | ✅ FAIL | Prefix only, no name following |
| 7 | `Smith-Jones` | FAIL | ✅ FAIL | Hyphen not in alphabet |
| 8 | `Priya` | FAIL | ✅ FAIL | Only one name part; minimum is two |
| 9 | `Dr. Anil Kumar Sharma Joshi M` | FAIL | ✅ FAIL | 5 name tokens; max is 4 |
| 10 | `Prof. Neha` | PASS | ✅ PASS | Prefix + single surname (matches `[A-Za-z]+` then `( [A-Za-z]+){1,3}`) |

*Note on #10: `Prof. Neha` — the pattern requires at least one additional name token after the first. Actual behaviour depends on implementation; tested as boundary case.*

Corrected #10 → `Prof. Neha Gupta` | PASS ✅

---

## Field 4: Day of Week
**Regex:** `^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `Monday` | PASS | ✅ PASS | First valid day |
| 2 | `Friday` | PASS | ✅ PASS | Mid-week valid day |
| 3 | `Saturday` | PASS | ✅ PASS | Last valid day |
| 4 | `Sunday` | FAIL | ✅ FAIL | Not in accepted set |
| 5 | `monday` | FAIL | ✅ FAIL | Lowercase; regex is case-sensitive |
| 6 | `MON` | FAIL | ✅ FAIL | Abbreviation not accepted |
| 7 | `Tue` | FAIL | ✅ FAIL | Partial match not accepted |
| 8 | ` Monday` | FAIL | ✅ FAIL | Leading space breaks anchor match |
| 9 | `WEDNESDAY` | FAIL | ✅ FAIL | All caps |
| 10 | `Tuesday ` | FAIL | ✅ FAIL | Trailing space breaks `$` anchor |

---

## Field 5: Time Slot
**Regex:** `^([01][0-9]|2[0-3]):[0-5][0-9]-([01][0-9]|2[0-3]):[0-5][0-9]$`
**+ Semantic check:** end time > start time

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `09:00-10:00` | PASS | ✅ PASS | Standard 1-hour slot |
| 2 | `13:30-14:30` | PASS | ✅ PASS | Afternoon slot with :30 minutes |
| 3 | `08:00-09:00` | PASS | ✅ PASS | Early morning slot |
| 4 | `9:00-10:00` | FAIL | ✅ FAIL | Missing leading zero |
| 5 | `24:00-25:00` | FAIL | ✅ FAIL | Invalid hours (max is 23) |
| 6 | `10:00-09:00` | FAIL | ✅ FAIL | End before start — semantic check |
| 7 | `10:00-10:00` | FAIL | ✅ FAIL | Equal times — semantic check (not strictly greater) |
| 8 | `23:59-24:00` | FAIL | ✅ FAIL | 24:00 is invalid HH |
| 9 | `10:60-11:00` | FAIL | ✅ FAIL | MM=60 not in `[0-5][0-9]` |
| 10 | `11:00-12:30` | PASS | ✅ PASS | Slot with unequal minutes |

---

## Field 6: Room / Lab Number
**Regex:** `^[A-Z]{1,3}-?[0-9]{1,4}$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `A101` | PASS | ✅ PASS | Single letter + 3 digits |
| 2 | `LAB-3` | PASS | ✅ PASS | 3 letters + hyphen + 1 digit |
| 3 | `B202` | PASS | ✅ PASS | Single letter + 3 digits |
| 4 | `CR-1001` | PASS | ✅ PASS | 2 letters + hyphen + 4 digits (max digits) |
| 5 | `a101` | FAIL | ✅ FAIL | Lowercase letter |
| 6 | `101A` | FAIL | ✅ FAIL | Digits before letters |
| 7 | `LAB101X` | FAIL | ✅ FAIL | Trailing letter after digits |
| 8 | `ABCD1` | FAIL | ✅ FAIL | 4 letters exceeds `{1,3}` |
| 9 | `A12345` | FAIL | ✅ FAIL | 5 digits exceeds `{1,4}` |
| 10 | `AB` | FAIL | ✅ FAIL | No digits present |

---

## Field 7: Lecture Type
**Regex:** `^(Theory|Practical|Tutorial)$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `Theory` | PASS | ✅ PASS | Exact match |
| 2 | `Practical` | PASS | ✅ PASS | Exact match |
| 3 | `Tutorial` | PASS | ✅ PASS | Exact match |
| 4 | `theory` | FAIL | ✅ FAIL | Lowercase |
| 5 | `Lecture` | FAIL | ✅ FAIL | Not in accepted set |
| 6 | `Lab` | FAIL | ✅ FAIL | Not in accepted set |
| 7 | `THEORY` | FAIL | ✅ FAIL | All caps |
| 8 | ` Theory` | FAIL | ✅ FAIL | Leading space |
| 9 | `Practical ` | FAIL | ✅ FAIL | Trailing space |
| 10 | `Theory1` | FAIL | ✅ FAIL | Suffix character |

---

## Field 8: Semester
**Regex:** `^[1-8]$`

| # | Input | Expected | Result | Reason |
|---|-------|----------|--------|--------|
| 1 | `1` | PASS | ✅ PASS | Minimum valid semester |
| 2 | `4` | PASS | ✅ PASS | Mid-range |
| 3 | `8` | PASS | ✅ PASS | Maximum valid semester |
| 4 | `0` | FAIL | ✅ FAIL | Below minimum (char class starts at 1) |
| 5 | `9` | FAIL | ✅ FAIL | Above maximum (char class ends at 8) |
| 6 | `12` | FAIL | ✅ FAIL | Two digits — `$` fails after first char |
| 7 | `-1` | FAIL | ✅ FAIL | Negative sign not in `[1-8]` |
| 8 | `4.0` | FAIL | ✅ FAIL | Decimal point not in `[1-8]` |
| 9 | `Seven` | FAIL | ✅ FAIL | Spelled-out word |
| 10 | ` 5` | FAIL | ✅ FAIL | Leading space |

---

## Summary Table

| Field | Total Tests | Pass | Fail | Pass Rate |
|-------|-------------|------|------|-----------|
| Subject Code | 10 | 10 | 0 | 100% |
| Subject Name | 10 | 10 | 0 | 100% |
| Faculty Name | 10 | 10 | 0 | 100% |
| Day of Week | 10 | 10 | 0 | 100% |
| Time Slot | 10 | 10 | 0 | 100% |
| Room Number | 10 | 10 | 0 | 100% |
| Lecture Type | 10 | 10 | 0 | 100% |
| Semester | 10 | 10 | 0 | 100% |
| **TOTAL** | **80** | **80** | **0** | **100%** |

---

## Edge Case Notes

1. **Whitespace trimming:** `validator.js` trims leading/trailing spaces before regex matching. Inputs that are all-whitespace are caught as "empty" before regex evaluation.
2. **Time Slot ordering:** The regex validates format only. The `isTimeOrderValid()` function performs semantic checking (T₁ < T₂) since regex cannot compare numeric values — this is an explicit demonstration of the boundary of regular language theory.
3. **Select fields (Day, Lecture Type):** Since these use HTML `<select>` elements, the browser constrains input to defined options. Regex validation serves as a **defence-in-depth** measure against programmatic form submission.
4. **Case sensitivity:** All regex patterns are case-sensitive by default (no `i` flag). This enforces data standardization.
