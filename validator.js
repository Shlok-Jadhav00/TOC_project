/**
 * validator.js — College Timetable Validator
 * Phase 3: Validation Script (JS)
 * TOC Project · Topic #15 · Course Code: 2304220T
 *
 * Uses RegExp for client-side validation of all 8 timetable fields.
 * Each regex is documented with its accepted language (formal notation).
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
   SECTION 1 — REGEX PATTERNS WITH FORMAL LANGUAGE DESCRIPTIONS
   Each entry: { pattern, description, errorMsg, formalLang }
   ══════════════════════════════════════════════════════════════════ */

const VALIDATORS = {

  /**
   * Field 1: Subject Code
   * Formal Language: L₁ = { w | w ∈ [A-Z]{2,4}[0-9]{3,4} }
   * Examples (valid)  : CS101, IT2301, MATH201, ECE103
   * Examples (invalid): cs101, CS1, 101CS, CS-101
   */
  subjectCode: {
    pattern: /^[A-Z]{2,4}[0-9]{3,4}$/,
    description: "Subject Code",
    errorMsg: "Must be 2–4 uppercase letters followed by 3–4 digits (e.g. CS101, MATH201)",
    formalLang: "L = { w | w ∈ [A-Z]{2,4} · [0-9]{3,4} }"
  },

  /**
   * Field 2: Subject Name
   * Formal Language: L₂ = { w | w starts with [A-Za-z], followed by [A-Za-z ]{2,49} }
   * Examples (valid)  : Theory of Computation, Data Structures, Maths
   * Examples (invalid): "  Algorithms" (leading space), "A" (too short), "CS-101 Lab" (hyphen)
   */
  subjectName: {
    pattern: /^[A-Za-z][A-Za-z ]{2,49}$/,
    description: "Subject Name",
    errorMsg: "Must be 3–50 alphabetic characters and spaces, starting with a letter",
    formalLang: "L = { w | w[0] ∈ [A-Za-z], w[1..] ∈ [A-Za-z ]*, 3 ≤ |w| ≤ 50 }"
  },

  /**
   * Field 3: Faculty Name
   * Formal Language: L₃ = { w | optional (Dr.|Prof.) prefix + space + one or more name tokens }
   * Examples (valid)  : Dr. Sharma, Prof. A Patil, Rajan Mehta, Dr. S K Joshi
   * Examples (invalid): "123 Sharma", "Dr", "Dr. " (trailing space only)
   */
  facultyName: {
    pattern: /^(Dr\.|Prof\.)? ?[A-Za-z]+( [A-Za-z]+){0,3}$/,
    description: "Faculty Name",
    errorMsg: "Optional 'Dr.' or 'Prof.' prefix, then 1–4 name parts (letters only)",
    formalLang: "L = { w | w ∈ (Dr\\.|Prof\\.)? [A-Za-z]+([ ][A-Za-z]+){1,3} }"
  },

  /**
   * Field 4: Day of Week
   * Formal Language: L₄ = { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday }
   * Examples (valid)  : Monday, Friday, Saturday
   * Examples (invalid): Sunday, monday, MON, Tue
   */
  day: {
    pattern: /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$/,
    description: "Day of Week",
    errorMsg: "Select a valid weekday (Monday–Saturday). Sunday is not a college day.",
    formalLang: "L = { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday }"
  },

  /**
   * Field 5: Time Slot (24-hour, HH:MM-HH:MM)
   * Formal Language: L₅ = { w | w is HH:MM-HH:MM where HH ∈ [00-23], MM ∈ [00-59],
   *                          and start time < end time }
   * Examples (valid)  : 09:00-10:00, 13:30-14:30, 08:00-09:00
   * Examples (invalid): 9:00-10:00, 24:00-25:00, 10:00-09:00, 09:00-09:00
   */
  timeSlot: {
    pattern: /^([01][0-9]|2[0-3]):[0-5][0-9]-([01][0-9]|2[0-3]):[0-5][0-9]$/,
    description: "Time Slot",
    errorMsg: "Use HH:MM-HH:MM in 24-hour format. End time must be after start time.",
    formalLang: "L = { w | w = T₁-T₂, T₁,T₂ ∈ ([01][0-9]|2[0-3]):[0-5][0-9], T₁ < T₂ }"
  },

  /**
   * Field 6: Room / Lab Number
   * Formal Language: L₆ = { w | w ∈ [A-Z]{1,3} optional(-) [0-9]{1,4} }
   * Examples (valid)  : A101, LAB-3, B202, CR-1001
   * Examples (invalid): a101, 101A, AB, -101, LAB101X
   */
  roomNumber: {
    pattern: /^[A-Z]{1,3}-?[0-9]{1,4}$/,
    description: "Room / Lab Number",
    errorMsg: "1–3 uppercase letters, optional hyphen, then 1–4 digits (e.g. A101, LAB-3)",
    formalLang: "L = { w | w ∈ [A-Z]{1,3} · -? · [0-9]{1,4} }"
  },

  /**
   * Field 7: Lecture Type
   * Formal Language: L₇ = { Theory, Practical, Tutorial }
   * Examples (valid)  : Theory, Practical, Tutorial
   * Examples (invalid): theory, Lecture, Lab, THEORY
   */
  lectureType: {
    pattern: /^(Theory|Practical|Tutorial)$/,
    description: "Lecture Type",
    errorMsg: "Select exactly one of: Theory, Practical, Tutorial",
    formalLang: "L = { Theory, Practical, Tutorial }"
  },

  /**
   * Field 8: Semester
   * Formal Language: L₈ = { 1, 2, 3, 4, 5, 6, 7, 8 }
   * Examples (valid)  : 1, 4, 8
   * Examples (invalid): 0, 9, 12, -1
   */
  semester: {
    pattern: /^[1-8]$/,
    description: "Semester",
    errorMsg: "Enter a semester number between 1 and 8",
    formalLang: "L = { w | w ∈ {1,2,3,4,5,6,7,8} }"
  }
};

/* ══════════════════════════════════════════════════════════════════
   SECTION 2 — HELPER: TIME COMPARISON (semantic validation)
   Checks that HH:MM start is strictly before HH:MM end.
   This goes beyond pure regex — it is a semantic constraint.
   A regex cannot enforce T₁ < T₂ (requires context-sensitivity).
   ══════════════════════════════════════════════════════════════════ */

/**
 * @param {string} slot - e.g. "09:00-10:00"
 * @returns {boolean}
 */
function isTimeOrderValid(slot) {
  const parts = slot.split("-");
  if (parts.length !== 2) return false;
  const [startH, startM] = parts[0].split(":").map(Number);
  const [endH,   endM  ] = parts[1].split(":").map(Number);
  const startMins = startH * 60 + startM;
  const endMins   = endH   * 60 + endM;
  return endMins > startMins;
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 3 — CORE VALIDATE FUNCTION
   Returns { isValid, errorMsg }
   ══════════════════════════════════════════════════════════════════ */

/**
 * Validates a single field value against its regex + semantic rules.
 * @param {string} fieldId
 * @param {string} value
 * @returns {{ isValid: boolean, errorMsg: string }}
 */
function validateField(fieldId, value) {
  const v = VALIDATORS[fieldId];
  if (!v) return { isValid: true, errorMsg: "" };

  const trimmed = value.trim();

  // Empty check
  if (!trimmed) {
    return { isValid: false, errorMsg: `${v.description} is required.` };
  }

  // Regex check
  if (!v.pattern.test(trimmed)) {
    return { isValid: false, errorMsg: v.errorMsg };
  }

  // Semantic: time order check
  if (fieldId === "timeSlot" && !isTimeOrderValid(trimmed)) {
    return {
      isValid: false,
      errorMsg: "End time must be strictly after start time (e.g. 09:00-10:00)."
    };
  }

  return { isValid: true, errorMsg: "" };
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 4 — DOM UTILITIES
   ══════════════════════════════════════════════════════════════════ */

function getFieldGroup(id)  { return document.getElementById(`fg-${id}`); }
function getInput(id)       { return document.getElementById(id); }
function getErrorEl(id)     { return getFieldGroup(id).querySelector(".error-msg"); }

function markField(id, isValid, message) {
  const fg = getFieldGroup(id);
  const em = getErrorEl(id);
  fg.classList.remove("is-valid", "is-error");
  fg.classList.add(isValid ? "is-valid" : "is-error");
  em.textContent = isValid ? "" : message;
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5 — REAL-TIME VALIDATION (input / change events)
   ══════════════════════════════════════════════════════════════════ */

function attachRealTimeValidation() {
  Object.keys(VALIDATORS).forEach(id => {
    const el = getInput(id);
    if (!el) return;

    // Skip timeSlot and semester — handled by custom UI wiring
    if (id === "timeSlot" || id === "semester") return;

    const eventType = (el.tagName === "SELECT") ? "change" : "input";

    el.addEventListener(eventType, () => {
      const value = el.value;
      if (!value.trim()) {
        const fg = getFieldGroup(id);
        fg.classList.remove("is-valid", "is-error");
        getErrorEl(id).textContent = "";
        updateProgress();
        return;
      }
      const { isValid, errorMsg } = validateField(id, value);
      markField(id, isValid, errorMsg);
      updateProgress();
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5a — TIME PICKER WIRING
   Composes two <input type="time"> values into "HH:MM-HH:MM"
   ══════════════════════════════════════════════════════════════════ */

function setupTimePickers() {
  const startEl = document.getElementById("timeStart");
  const endEl   = document.getElementById("timeEnd");
  const hidden  = getInput("timeSlot");

  function compose() {
    const s = startEl.value; // "HH:MM" or ""
    const e = endEl.value;
    if (s && e) {
      hidden.value = `${s}-${e}`;
    } else {
      hidden.value = "";
    }
    // Trigger validation
    const value = hidden.value;
    if (!value) {
      const fg = getFieldGroup("timeSlot");
      fg.classList.remove("is-valid", "is-error");
      getErrorEl("timeSlot").textContent = "";
    } else {
      const { isValid, errorMsg } = validateField("timeSlot", value);
      markField("timeSlot", isValid, errorMsg);
    }
    updateProgress();
  }

  startEl.addEventListener("change", compose);
  endEl.addEventListener("change", compose);
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5b — SEMESTER BUTTON GROUP WIRING
   ══════════════════════════════════════════════════════════════════ */

function setupSemesterButtons() {
  const hidden = getInput("semester");
  const btns   = document.querySelectorAll(".sem-btn");

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Deselect all, select clicked
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hidden.value = btn.dataset.sem;

      const { isValid, errorMsg } = validateField("semester", hidden.value);
      markField("semester", isValid, errorMsg);
      updateProgress();
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 6 — PROGRESS COUNTER
   ══════════════════════════════════════════════════════════════════ */

function updateProgress() {
  const total   = Object.keys(VALIDATORS).length;
  const valid   = Object.keys(VALIDATORS).filter(id => {
    const fg = getFieldGroup(id);
    return fg && fg.classList.contains("is-valid");
  }).length;

  document.getElementById("progress-count").textContent = `${valid} / ${total} fields valid`;
  document.getElementById("progress-fill").style.width  = `${(valid / total) * 100}%`;
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 7 — FULL FORM VALIDATION (on "Validate Entry" click)
   ══════════════════════════════════════════════════════════════════ */

function validateAll() {
  let allValid = true;
  const errors = [];

  Object.keys(VALIDATORS).forEach(id => {
    const el = getInput(id);
    if (!el) return;
    const value = el.value;
    const { isValid, errorMsg } = validateField(id, value);
    markField(id, isValid, errorMsg);
    if (!isValid) {
      allValid = false;
      errors.push({ field: VALIDATORS[id].description, msg: errorMsg });
    }
  });

  updateProgress();
  showResult(allValid, errors);

  if (allValid) {
    renderPreview();
  } else {
    // Shake first error field
    const firstErrorFg = document.querySelector(".field-group.is-error");
    if (firstErrorFg) {
      firstErrorFg.classList.add("shake");
      firstErrorFg.addEventListener("animationend", () => firstErrorFg.classList.remove("shake"), { once: true });
      firstErrorFg.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    document.getElementById("preview-section").style.display = "none";
  }
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 8 — RESULT PANEL
   ══════════════════════════════════════════════════════════════════ */

function showResult(isValid, errors) {
  const panel = document.getElementById("result-panel");
  const icon  = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const desc  = document.getElementById("result-desc");

  panel.classList.remove("hidden", "success", "error");

  if (isValid) {
    panel.classList.add("success");
    icon.textContent  = "✅";
    title.textContent = "All Fields Valid — Entry Accepted";
    desc.textContent  = "All 8 timetable fields passed their regex validation rules. The entry is ready to be saved.";
  } else {
    panel.classList.add("error");
    icon.textContent  = "❌";
    title.textContent = `${errors.length} Validation Error${errors.length > 1 ? "s" : ""} Found`;
    desc.textContent  = errors.map(e => `• ${e.field}: ${e.msg}`).join("  ·  ");
  }
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 9 — TIMETABLE PREVIEW (shown only on full success)
   ══════════════════════════════════════════════════════════════════ */

function renderPreview() {
  const section  = document.getElementById("preview-section");
  const card     = document.getElementById("timetable-preview");

  const rows = [
    ["Subject Code",   getInput("subjectCode").value.trim(), true],
    ["Subject Name",   getInput("subjectName").value.trim(), false],
    ["Faculty",        getInput("facultyName").value.trim(), false],
    ["Day",            getInput("day").value,                false],
    ["Time Slot",      getInput("timeSlot").value.trim(),    true],
    ["Room / Lab",     getInput("roomNumber").value.trim(),  true],
    ["Lecture Type",   getInput("lectureType").value,        true],
    ["Semester",       `Semester ${getInput("semester").value}`, false],
  ];

  card.innerHTML = rows.map(([label, value, chip]) => `
    <div class="tt-row">
      <div class="tt-label">${label}</div>
      <div class="tt-value">${chip ? `<span class="chip">${value}</span>` : value}</div>
    </div>
  `).join("");

  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 10 — FORM RESET
   ══════════════════════════════════════════════════════════════════ */

function handleReset() {
  // Clear validation state on all field groups
  Object.keys(VALIDATORS).forEach(id => {
    const fg = getFieldGroup(id);
    if (!fg) return;
    fg.classList.remove("is-valid", "is-error");
    getErrorEl(id).textContent = "";
  });

  // Clear time pickers
  const ts = document.getElementById("timeStart");
  const te = document.getElementById("timeEnd");
  if (ts) ts.value = "";
  if (te) te.value = "";
  getInput("timeSlot").value = "";

  // Clear semester buttons
  document.querySelectorAll(".sem-btn").forEach(b => b.classList.remove("active"));
  getInput("semester").value = "";

  document.getElementById("result-panel").classList.add("hidden");
  document.getElementById("preview-section").style.display = "none";
  updateProgress();
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 11 — INIT
   ══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  attachRealTimeValidation();
  setupTimePickers();
  setupSemesterButtons();

  document.getElementById("btn-validate").addEventListener("click", validateAll);

  document.getElementById("timetable-form").addEventListener("reset", () => {
    // Defer to let the browser clear values first
    setTimeout(handleReset, 10);
  });
});
