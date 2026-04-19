# Theory Supplement — College Timetable Validator
## Phase 2: Regex Design (Theory)
### TOC Project · Topic #15 · Course Code: 2304220T · AY 2025–26

---

## 1. Field-wise Regex Documentation

### Field 1: Subject Code

| Property | Value |
|----------|-------|
| Regex Pattern | `^[A-Z]{2,4}[0-9]{3,4}$` |
| Formal Language | L₁ = { w ∈ Σ* \| w ∈ [A-Z]{2,4} · [0-9]{3,4} } |
| Character Classes | `[A-Z]` = uppercase Latin alphabet; `[0-9]` = decimal digits |
| Quantifiers | `{2,4}` = 2 to 4 repetitions; `{3,4}` = 3 to 4 repetitions |
| Anchors | `^` (start of string), `$` (end of string) |
| Automaton Class | **Regular Language** — recognizable by DFA with finite states |
| Why Regular? | The language has a fixed structural pattern with bounded repetition, requiring no stack or memory beyond counting — well within DFA power. |

**Valid Test Strings:**
- `CS101` ✅ (2 letters + 3 digits)
- `MATH201` ✅ (4 letters + 3 digits)
- `IT2301` ✅ (2 letters + 4 digits)

**Invalid Test Strings:**
- `cs101` ❌ (lowercase letters not allowed)
- `CS1` ❌ (only 1 digit; minimum is 3)
- `COMPS12345` ❌ (5 letters + 5 digits; exceeds both bounds)

---

### Field 2: Subject Name

| Property | Value |
|----------|-------|
| Regex Pattern | `^[A-Za-z][A-Za-z ]{2,49}$` |
| Formal Language | L₂ = { w \| w[0] ∈ [A-Za-z], w[1..] ∈ [A-Za-z ]*, 3 ≤ \|w\| ≤ 50 } |
| Automaton Class | **Regular Language** |
| Why Regular? | Bounded-length constraint with a character-class restriction — trivially regular. |

**Valid:** `Theory of Computation`, `Data Structures`, `Maths`  
**Invalid:** `  Algorithms` (leading space), `A` (too short), `CS-101 Lab` (hyphen not in alphabet)

---

### Field 3: Faculty Name

| Property | Value |
|----------|-------|
| Regex Pattern | `^(Dr\.|Prof\.)? ?[A-Za-z]+( [A-Za-z]+){1,3}$` |
| Formal Language | L₃ = { w \| w = p·name₁·(·nameₙ)* where p ∈ {Dr., Prof., ε}, n ∈ {2..4} } |
| Automaton Class | **Regular Language** |
| Why Regular? | The optional prefix and bounded name-token repetition form a finite union of concatenations — all regular. |

**Valid:** `Dr. Sharma`, `Prof. A Patil`, `Rajan Kumar Mehta`  
**Invalid:** `123 Sharma` (digit prefix), `Dr.` (no name), `Smith-Jones` (hyphen)

---

### Field 4: Day of Week

| Property | Value |
|----------|-------|
| Regex Pattern | `^(Monday\|Tuesday\|Wednesday\|Thursday\|Friday\|Saturday)$` |
| Formal Language | L₄ = { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday } — **finite set** |
| Automaton Class | **Regular Language** (finite languages are always regular) |
| Why Regular? | Any finite language is regular; a DFA can be constructed with one accepting state per string. |

**Valid:** `Monday`, `Saturday`  
**Invalid:** `Sunday`, `monday`, `MON`, `Tue`

---

### Field 5: Time Slot ⟵ DFA Designed Below

| Property | Value |
|----------|-------|
| Regex Pattern | `^([01][0-9]\|2[0-3]):[0-5][0-9]-([01][0-9]\|2[0-3]):[0-5][0-9]$` |
| Formal Language | L₅ = { w = T₁-T₂ \| T₁,T₂ ∈ ValidTime, T₁ < T₂ } where ValidTime = 00:00–23:59 |
| Automaton Class | **Regular Language** (for format check) |
| ⚠ Limitation | The constraint T₁ < T₂ (start < end) **cannot** be enforced by regex alone. This is a **semantic constraint** requiring procedural logic, demonstrating the boundary of regular language expressiveness. |

**Valid:** `09:00-10:00`, `13:30-14:30`, `08:00-09:00`  
**Invalid:** `9:00-10:00` (no leading zero), `24:00-25:00` (invalid hours), `10:00-09:00` (end before start — caught by semantic check)

---

### Field 6: Room / Lab Number ⟵ NFA Designed Below

| Property | Value |
|----------|-------|
| Regex Pattern | `^[A-Z]{1,3}-?[0-9]{1,4}$` |
| Formal Language | L₆ = { w \| w ∈ [A-Z]{1,3} · {-, ε} · [0-9]{1,4} } |
| Automaton Class | **Regular Language** |

**Valid:** `A101`, `LAB-3`, `B202`, `CR-1001`  
**Invalid:** `a101` (lowercase), `101A` (digits before letters), `LAB101X` (trailing letter)

---

### Field 7: Lecture Type

| Property | Value |
|----------|-------|
| Regex Pattern | `^(Theory\|Practical\|Tutorial)$` |
| Formal Language | L₇ = { Theory, Practical, Tutorial } — **finite set** |
| Automaton Class | **Regular Language** (finite) |

---

### Field 8: Semester

| Property | Value |
|----------|-------|
| Regex Pattern | `^[1-8]$` |
| Formal Language | L₈ = { 1, 2, 3, 4, 5, 6, 7, 8 } — **finite set** |
| Automaton Class | **Regular Language** |

---

## 2. DFA Design — Field 5: Time Slot (Format Check)

> Recognizes strings of the form `HH:MM-HH:MM` where HH ∈ 00–23, MM ∈ 00–59.
> Semantic ordering (T₁ < T₂) is beyond DFA capability and is handled in code.

```
Alphabet Σ = { 0,1,2,3,4,5,6,7,8,9, : , - }

States:  q0  (start)
         q1  HH first digit accepted (0 or 1 → digit range[0-9]; 2 → digit range[0-3])
         q2  HH second digit accepted
         q3  ':' consumed
         q4  MM first digit accepted (0–5)
         q5  MM second digit accepted  [accept start half]
         q6  '-' consumed
         q7  HH first digit of end time
         q8  HH second digit of end time
         q9  ':' of end time consumed
         q10 MM first digit of end time (0–5)
         q11 MM second digit of end time  ← ACCEPTING STATE
         qE  error / dead state

Transitions (simplified — full deterministic expansion):

  q0 --[0,1]--> q1a    (first digit 0 or 1: hours 00–19)
  q0 --[2]----> q1b    (first digit 2:      hours 20–23)
  q0 --other--> qE

  q1a --[0-9]--> q2    (any second digit valid when first is 0 or 1)
  q1b --[0-3]--> q2    (second digit 0–3 when first is 2)
  q1b --[4-9]--> qE

  q2 --[:]--> q3
  q3 --[0-5]--> q4
  q4 --[0-9]--> q5
  q5 --[-]--> q6

  q6  (mirrors q0)  --[0,1]--> q7a
                    --[2]----> q7b
  q7a --[0-9]--> q8
  q7b --[0-3]--> q8  |  q7b --[4-9]--> qE

  q8 --[:]--> q9
  q9 --[0-5]--> q10
  q10 --[0-9]--> q11  (ACCEPT)
  q11 --any--> qE    (no extra characters allowed; anchors enforce this)

  All undefined transitions → qE
```

**DFA Note:** Because anchors `^` and `$` bound the input, q11 is the sole accepting state. This DFA has **12 states** (excluding the dead state). The language L₅_format is regular.

---

## 3. NFA Design — Field 6: Room / Lab Number

> Recognizes strings matching `[A-Z]{1,3}-?[0-9]{1,4}`.

```
Alphabet Σ = [A-Z] ∪ {-} ∪ [0-9]

NFA States: q0 (start), q1, q2, q3 (letter states),
            q4 (optional hyphen), q5, q6, q7, q8 (digit states), qF (accept)

Transitions (ε = epsilon / empty):

  q0 --[A-Z]--> q1
  q1 --[A-Z]--> q2    | q1 --ε--> q4   (1 letter is enough)
  q2 --[A-Z]--> q3    | q2 --ε--> q4   (2 letters is enough)
  q3 --ε------> q4                      (3 letters is enough)

  q4 --[-]----> q5    | q4 --ε--> q5   (hyphen is optional; NFA guesses)

  q5 --[0-9]--> q6
  q6 --[0-9]--> q7    | q6 --ε--> qF   (1 digit is enough)
  q7 --[0-9]--> q8    | q7 --ε--> qF   (2 digits is enough)
  q8 --[0-9]--> qF    | q8 --ε--> qF   (3 digits is enough; 4 also accepted from q8)
  qF is accepting.

Equivalent DFA: obtained via subset construction.
The NFA exploits non-determinism to model the optional hyphen and bounded repetition
without explicitly branching on each case.
```

**Key observation:** This NFA has **9 states**. Its subset-construction DFA would have up to 2⁹ = 512 states (in the worst case), but in practice far fewer reachable states. This illustrates why NFA representations are compact for bounded repetition patterns.

---

## 4. Automata Class Justification Table

| # | Field | Regex | Regular? | Justification |
|---|-------|-------|----------|---------------|
| 1 | Subject Code | `^[A-Z]{2,4}[0-9]{3,4}$` | ✅ Yes | Bounded concatenation, finite-state recognizable |
| 2 | Subject Name | `^[A-Za-z][A-Za-z ]{2,49}$` | ✅ Yes | Length-bounded character-class string |
| 3 | Faculty Name | `^(Dr.\|Prof\.)? ?[A-Za-z]+( [A-Za-z]+){1,3}$` | ✅ Yes | Union of bounded concatenations |
| 4 | Day of Week | `^(Monday\|...\|Saturday)$` | ✅ Yes | Finite language — always regular |
| 5 | Time Slot | `^HH:MM-HH:MM$` (format only) | ✅ Yes | Fixed format; order constraint is semantic, not structural |
| 5 | Time Slot | T₁ < T₂ constraint | ❌ Not by regex | Requires numeric comparison — beyond FSA capability |
| 6 | Room Number | `^[A-Z]{1,3}-?[0-9]{1,4}$` | ✅ Yes | Bounded letters, optional symbol, bounded digits |
| 7 | Lecture Type | `^(Theory\|Practical\|Tutorial)$` | ✅ Yes | Finite set |
| 8 | Semester | `^[1-8]$` | ✅ Yes | Single character from finite set |

---

## 5. CO Mapping

| CO | How this Theory Supplement Addresses It |
|----|------------------------------------------|
| CO.1 | Each field identifies the automata class (DFA/NFA/regex) and justifies limitations (e.g. time ordering beyond regular languages) |
| CO.2 | Formal DFA/NFA constructed for Fields 5 and 6; equivalent regex patterns derived |
| CO.3 | Each regex formally described using set-builder and formal language notation |
| CO.4 | Evaluated whether each pattern requires regular or context-sensitive recognition; documented semantic limits |
| CO.5 | Time Slot field demonstrates the boundary between decidable finite-state validation and computationally richer constraints |
