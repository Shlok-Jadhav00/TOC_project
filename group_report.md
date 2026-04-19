# Group Report — College Timetable Validator
## TOC Project · Topic #15 · Course Code: 2304220T · AY 2025–26

---

### 1. Topic Description

**College Timetable Validator** is a regex-based web form that validates the 8 key fields of a college lecture schedule entry: Subject Code, Subject Name, Faculty Name, Day of Week, Time Slot, Room/Lab Number, Lecture Type, and Semester. The system ensures timetable entries conform to standardized formats — preventing data inconsistencies such as invalid room codes, malformed time slots, or out-of-range semester values — before they are committed to any scheduling system.

---

### 2. Team Roles

| Role | Responsibility |
|------|----------------|
| Team Lead | Overall coordination, theory documentation, formal language descriptions, CO mapping |
| UI Developer | HTML form layout (Phase 1), CSS styling, real-time visual feedback, accessibility (Phase 4) |
| Script Developer | JavaScript validation logic, regex pattern design and testing, semantic time-order check (Phases 3 & 5) |
| Documentation Lead | Theory Supplement (Phase 2), Test Report compilation (Phase 5), Group Report |

*All members contributed equally. Individual contribution: 25% each.*

---

### 3. Key Learnings

- **Regex and Regular Languages are equivalent:** Every regex pattern we designed corresponds directly to a regular grammar and a finite automaton (DFA/NFA). Writing the DFA for the Time Slot field made this relationship concrete and intuitive.
- **Boundaries of Regular Languages:** The Time Slot field revealed that *structural format* (HH:MM-HH:MM) is easily expressible as a regex, but *semantic ordering* (start < end) is not — it requires procedural code. This is a direct practical encounter with the theoretical limit of FSAs.
- **NFA compactness:** Designing the NFA for Room Number demonstrated how non-determinism compresses state-space representation. The equivalent DFA would be significantly larger.
- **Anchors matter:** Forgetting `^` and `$` anchors caused partial matches (e.g., `CS101XYZ` passing as `CS101`). Anchors enforce the full-string match requirement.
- **Quantifier optimization:** Using `{2,4}` and `{3,4}` quantifiers rather than `[A-Z][A-Z][A-Z]?[A-Z]?` is both more readable and less prone to catastrophic backtracking.

---

### 4. Challenges

- **Time Slot validation:** Encoding the 24-hour constraint into a single regex required careful use of alternation: `([01][0-9]|2[0-3])`. Ensuring the minutes were bounded by `[0-5][0-9]` took several iterations of testing.
- **Faculty Name flexibility:** Supporting optional `Dr.` / `Prof.` prefixes while still requiring at least two name parts needed careful use of `?` (optionality) and `{1,3}` (bounded repetition) without over-permitting strings like `Dr.` alone.
- **Real-time UX:** Balancing immediate error feedback with not flagging a field as invalid while the user is still typing required event handling that clears errors on empty input and only marks fields after meaningful content is present.

---

### 5. Files Submitted

| File | Phase | Description |
|------|-------|-------------|
| `index.html` | 1, 4 | Form layout with all 8 fields and semantic markup |
| `validator.js` | 3 | Regex validation logic with formal comments |
| `style.css` | 4 | Visual design, error/success states, animations |
| `theory_supplement.md` | 2 | Formal regex notation, DFA/NFA designs, automata justification |
| `test_report.md` | 5 | 80 test cases (10 per field) with pass/fail results |
| `group_report.md` | 5 | This document |
