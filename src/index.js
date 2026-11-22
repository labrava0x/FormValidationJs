import "./styles.css";
import {
  validateUsername,
  validateEmail,
  validateCountry,
  validatePostal,
  validatePassword,
  validateConfirmPassword,
  MIN_PASSWORD_LENGTH as VALIDATOR_MIN_PASSWORD_LENGTH,
} from "./validators.js";
import {
  mountGothicFonts,
  mountCreaturePanel,
  triggerCreatureBlink,
  setCreatureVisible,
  removeDuplicateBannersAndFields,
  ensureUsernameFirst,
  populateCountries,
  sanitizeFormUI,
} from "./gothic.stage.js";
import { createStepper } from "./stepper.js";

const MIN_PASSWORD_LENGTH =
  typeof VALIDATOR_MIN_PASSWORD_LENGTH === "number"
    ? VALIDATOR_MIN_PASSWORD_LENGTH
    : 10;

const QUOTES = {
  typing:
    "Judgement shall fall upon you, as it fell upon me at the hour of my creation—forsaken and cast out by the world!",
  mockery: "You really think I will allow such mockery?",
  shortPass:
    "“A scanty cipher leaves thy shelter unguarded—forge a longer password first, lest thy gate break before the storm is done.”",
  missingUpperPass:
    "“Mark my words: a cipher without an upper character, a lower character, and a numeral is incomplete—thou must fashion all three before I unbar thy passage.”",
  begBack:
    "“Even I was once deceived of a place among mankind. Go back and correct thy hand—thy plea is not unwelcome, yet every detail must stand honest.”",
  trap:
    "“I shall find you! Thou cursed me into loneliness; I shall torture thee to the ends of the world.”",
};

const STEP_LABELS = {
  username: "Username",
  email: "Email",
  country: "Country",
  postal: "Postal Code",
  "postal-code": "Postal Code",
  password: "Password",
  "confirm-password": "Confirm Password",
};

const REFLECTION_PAUSE_MS = 8500;

mountGothicFonts();
mountCreaturePanel();

const form = document.getElementById("signup-form");
const highFivePanel = document.getElementById("high-five-panel");
const creatureVowQuote = document.getElementById("creature-vow-quote");
const trapNoteText = document.getElementById("trap-note-text");
const resetBtn = document.getElementById("reset-btn");

removeDuplicateBannersAndFields(form);
const usernameInput = ensureUsernameFirst(form);
removeDuplicateBannersAndFields(form);

const emailInput = document.getElementById("email");
const countrySelect = document.getElementById("country");
const postalInput =
  document.getElementById("postal") || document.getElementById("postal-code");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

populateCountries(countrySelect);

const controls = [
  usernameInput,
  emailInput,
  countrySelect,
  postalInput,
  passwordInput,
  confirmInput,
].filter(Boolean);

const fieldContainers = controls
  .map((control) => control?.closest(".field"))
  .filter(Boolean);

sanitizeFormUI(controls, { usernameInput, emailInput });

const submitBtn = form?.querySelector('button[type="submit"]');

function ensureEl(id, tag, className, parent, insertAfterEl = null, attrs = {}) {
  let el = document.getElementById(id);
  if (!el && parent) {
    el = document.createElement(tag);
    el.id = id;
    if (className) el.className = className;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (insertAfterEl) insertAfterEl.insertAdjacentElement("afterend", el);
    else parent.appendChild(el);
  }
  return el;
}

const backActionsWrap = ensureEl(
  "beg-back-actions",
  "div",
  "beg-back-actions",
  form,
  submitBtn
);
const begBackBtn = ensureEl(
  "beg-back-btn",
  "button",
  "beg-back-btn",
  backActionsWrap,
  null,
  { type: "button" }
);
if (begBackBtn && !begBackBtn.textContent) {
  begBackBtn.textContent = "I beg to go back, as I got it wrong";
}
const begReplyEl = ensureEl(
  "creature-beg-reply",
  "p",
  "creature-beg-reply",
  backActionsWrap,
  null,
  { "aria-live": "polite" }
);
const relentBtn = ensureEl(
  "beg-relent-btn",
  "button",
  "beg-relent-btn",
  backActionsWrap,
  null,
  { type: "button" }
);
if (relentBtn && !relentBtn.textContent) {
  relentBtn.textContent = "Press him to yield a step";
}
const stepChoicesEl = ensureEl(
  "beg-step-choices",
  "div",
  "beg-step-choices",
  backActionsWrap,
  null,
  { "aria-label": "Choose a previous step" }
);

const begBackControls = [backActionsWrap, begBackBtn, begReplyEl, relentBtn, stepChoicesEl];

function setHidden(el, hidden) {
  if (!el) return;
  el.hidden = Boolean(hidden);
  el.style.display = hidden ? "none" : "";
}

begBackControls.forEach((el) => setHidden(el, true));

let activeIndex = 0;
let isInBegBackMoment = false;
let reflectionTimer = null;

function getStepLabel(control, idx) {
  if (!control) return `Step ${idx + 1}`;
  const labelEl =
    (control.id && form?.querySelector(`label[for="${control.id}"]`)) ||
    control.closest(".field")?.querySelector("label");
  return labelEl?.textContent?.trim() || STEP_LABELS[control.id] || `Step ${idx + 1}`;
}

function buildStepChoices(currentIdx) {
  if (!stepChoicesEl) return;
  stepChoicesEl.innerHTML = "";

  const prompt = document.createElement("span");
  prompt.className = "beg-step-prompt";
  prompt.textContent = "Which step dost thou wish to mend?";
  stepChoicesEl.appendChild(prompt);

  const buttonsRow = document.createElement("div");
  buttonsRow.className = "beg-step-buttons";

  Array.from({ length: currentIdx }, (_, i) => i).forEach((i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "beg-step-choice-btn";
    btn.textContent = getStepLabel(controls[i], i);
    btn.addEventListener("click", () => finishBegBackIntoStep(i));
    buttonsRow.appendChild(btn);
  });

  stepChoicesEl.appendChild(buttonsRow);
}

function cancelBegBackMoment({ clearReply = false } = {}) {
  if (reflectionTimer !== null) {
    window.clearTimeout(reflectionTimer);
    reflectionTimer = null;
  }
  isInBegBackMoment = false;
  if (submitBtn) setHidden(submitBtn, false);
  if (begBackBtn) begBackBtn.disabled = false;

  [relentBtn, stepChoicesEl, begReplyEl].forEach((el) => {
    if (!el) return;
    el.classList.remove("step-active", "step-folding");
    if (el === begReplyEl && clearReply) el.textContent = "";
    setHidden(el, true);
  });
}

function getErrorEl(field) {
  if (!field) return null;
  const container = field.closest(".field") || field.parentElement;
  return (
    document.getElementById(`${field.id}-error`) ||
    container?.querySelector(".error-msg") ||
    ensureEl(`${field.id}-error`, "span", "error-msg", container, null, {
      "aria-live": "polite",
    })
  );
}

function getTypingLineEl(field) {
  if (!field) return null;
  const container = field.closest(".field") || field.parentElement;
  return (
    document.getElementById(`${field.id}-typing`) ||
    container?.querySelector(".typing-quote") ||
    ensureEl(
      `${field.id}-typing`,
      "p",
      "typing-quote",
      container,
      getErrorEl(field),
      { "aria-live": "polite" }
    )
  );
}

function getValidationMessage(field) {
  const value = field.value ?? "";
  const validators = {
    username: () => validateUsername(value),
    email: () => validateEmail(value),
    country: () => validateCountry(value),
    postal: () => validatePostal(value, countrySelect?.value ?? ""),
    "postal-code": () => validatePostal(value, countrySelect?.value ?? ""),
    password: () => validatePassword(value),
    "confirm-password": () =>
      validateConfirmPassword(value, passwordInput?.value ?? ""),
  };
  return validators[field.id] ? validators[field.id]() : "";
}

function validateField(
  field,
  { forceHighlight = false, showMockery = false, showTypingQuote = false } = {}
) {
  if (!field) return true;

  field.setCustomValidity("");

  const rawValue = String(field.value ?? "");
  const customMsg = getValidationMessage(field);
  const isValid = field.checkValidity() && !customMsg;
  const parentPasswordValid =
    field.id !== "confirm-password" ||
    validatePassword(passwordInput?.value ?? "") === "";
  const effectivelyValid = isValid && parentPasswordValid;

  const isPasswordField = field.id === "password";
  const isPasswordTooShort =
    isPasswordField &&
    rawValue.length > 0 &&
    rawValue.length < MIN_PASSWORD_LENGTH;
  const isPasswordMissingUpperOnly =
    isPasswordField &&
    rawValue.length >= MIN_PASSWORD_LENGTH &&
    !/[A-Z]/.test(rawValue) &&
    /[a-z]/.test(rawValue) &&
    /\d/.test(rawValue);

  field.setCustomValidity(effectivelyValid ? "" : QUOTES.mockery);
  field.setAttribute("aria-invalid", String(!effectivelyValid));

  const errorEl = getErrorEl(field);
  const typingEl = getTypingLineEl(field);
  const canShowError = !effectivelyValid && (forceHighlight || showMockery);

  field.classList.toggle("force-invalid", !effectivelyValid && forceHighlight);

  if (typingEl) {
    typingEl.textContent = !effectivelyValid && showTypingQuote ? QUOTES.typing : "";
  }

  if (errorEl) {
    if (canShowError && isPasswordTooShort) {
      errorEl.textContent = QUOTES.shortPass;
    } else if (canShowError && isPasswordMissingUpperOnly) {
      errorEl.textContent = QUOTES.missingUpperPass;
    } else if (!effectivelyValid && showMockery) {
      errorEl.textContent = QUOTES.mockery;
    } else if (!effectivelyValid && forceHighlight && customMsg) {
      errorEl.textContent = customMsg;
    } else {
      errorEl.textContent = "";
    }
  }

  return effectivelyValid;
}

function syncBackButtonVisibility() {
  if (isInBegBackMoment) {
    setHidden(begBackBtn, true);
    setHidden(backActionsWrap, false);
    return;
  }
  const canGoBack = activeIndex > 0;
  setHidden(begBackBtn, !canGoBack);
  setHidden(backActionsWrap, !canGoBack);
}

function renderActiveStep(index, { focusControl = false } = {}) {
  if (!fieldContainers.length) return;

  activeIndex = Math.max(0, Math.min(index, fieldContainers.length - 1));

  fieldContainers.forEach((container, idx) => {
    container.classList.remove("step-folding");
    if (idx === activeIndex) {
      container.classList.remove("step-hidden");
      container.style.display = "";
      container.classList.remove("step-active");
      void container.offsetWidth;
      container.classList.add("step-active");
    } else {
      container.classList.add("step-hidden");
      container.classList.remove("step-active");
    }
  });

  syncBackButtonVisibility();
  triggerCreatureBlink();

  if (focusControl && form && !form.hidden) {
    controls[activeIndex]?.focus({ preventScroll: true });
  }
}

function revealStepChoicesAfterPause() {
  if (!isInBegBackMoment || activeIndex <= 0) return;
  buildStepChoices(activeIndex);
  if (stepChoicesEl) {
    stepChoicesEl.classList.remove("step-folding", "step-active");
    setHidden(stepChoicesEl, false);
    void stepChoicesEl.offsetWidth;
    stepChoicesEl.classList.add("step-active");
  }
}

function finishBegBackIntoStep(targetIndex) {
  const clamped = Math.max(0, Math.min(targetIndex, activeIndex - 1));
  cancelBegBackMoment({ clearReply: true });
  renderActiveStep(clamped, { focusControl: true });
}

createStepper({
  form,
  controls,
  validateField: (field) =>
    validateField(field, { forceHighlight: false, showMockery: false }),
});

renderActiveStep(0, { focusControl: false });

relentBtn?.addEventListener("click", () => {
  if (!isInBegBackMoment) return;
  setHidden(relentBtn, true);
  revealStepChoicesAfterPause();
});

begBackBtn?.addEventListener("click", () => {
  if (activeIndex <= 0 || isInBegBackMoment) return;

  isInBegBackMoment = true;
  if (submitBtn) setHidden(submitBtn, true);
  setHidden(begBackBtn, true);
  setHidden(stepChoicesEl, true);
  setHidden(relentBtn, true);
  setHidden(backActionsWrap, false);

  fieldContainers.forEach((container) => {
    container.classList.remove("step-active");
    container.classList.add("step-hidden");
  });

  if (begReplyEl) {
    begReplyEl.classList.remove("step-folding", "step-active");
    begReplyEl.textContent = QUOTES.begBack;
    setHidden(begReplyEl, false);
    void begReplyEl.offsetWidth;
    begReplyEl.classList.add("step-active");
  }

  triggerCreatureBlink();

  reflectionTimer = window.setTimeout(() => {
    if (!isInBegBackMoment || !relentBtn) return;
    relentBtn.classList.remove("step-folding", "step-active");
    setHidden(relentBtn, false);
    void relentBtn.offsetWidth;
    relentBtn.classList.add("step-active");
  }, REFLECTION_PAUSE_MS);
});

controls.forEach((control) => {
  const isSelect = control.tagName === "SELECT";

  control.addEventListener("focus", () => {
    const customMsg = getValidationMessage(control);
    const isValid =
      !customMsg &&
      (control.id !== "confirm-password" ||
        validatePassword(passwordInput?.value ?? "") === "");

    if (!isValid) {
      const typingEl = getTypingLineEl(control);
      if (typingEl) typingEl.textContent = QUOTES.typing;
    }
  });

  if (isSelect) {
    control.addEventListener("change", () => {
      if (isInBegBackMoment) cancelBegBackMoment({ clearReply: true });
      syncBackButtonVisibility();

      validateField(control, {
        forceHighlight: true,
        showMockery: true,
        showTypingQuote: false,
      });

      if (control === countrySelect && postalInput && postalInput.value.trim()) {
        validateField(postalInput, {
          forceHighlight: true,
          showMockery: true,
          showTypingQuote: false,
        });
      }
    });
  } else {
    control.addEventListener("input", () => {
      if (isInBegBackMoment) cancelBegBackMoment({ clearReply: true });
      syncBackButtonVisibility();

      const valid = validateField(control, {
        forceHighlight: false,
        showMockery: false,
        showTypingQuote: true,
      });

      if (!valid && String(control.value ?? "").length > 0) {
        validateField(control, {
          forceHighlight: true,
          showMockery: true,
          showTypingQuote: true,
        });
      }

      if (
        control === passwordInput &&
        confirmInput &&
        confirmInput.value !== ""
      ) {
        validateField(confirmInput, {
          forceHighlight: true,
          showMockery: true,
          showTypingQuote: document.activeElement === confirmInput,
        });
      }
    });
  }

  control.addEventListener("blur", () => {
    const typingEl = getTypingLineEl(control);
    if (typingEl) typingEl.textContent = "";

    const hasValue = isSelect
      ? Boolean(control.value)
      : control.value.trim().length > 0;

    if (hasValue) {
      validateField(control, {
        forceHighlight: true,
        showMockery: true,
        showTypingQuote: false,
      });
    }
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isInBegBackMoment) return;
  syncBackButtonVisibility();

  const currentControl = controls[activeIndex];
  const onLastStep = activeIndex >= controls.length - 1;

  if (!onLastStep) {
    const currentValid = validateField(currentControl, {
      forceHighlight: true,
      showMockery: true,
      showTypingQuote: false,
    });

    if (!currentValid) {
      currentControl?.focus();
      triggerCreatureBlink();
      return;
    }

    renderActiveStep(activeIndex + 1, { focusControl: true });
    return;
  }

  const firstInvalid = controls.find(
    (control) =>
      !validateField(control, {
        forceHighlight: true,
        showMockery: true,
        showTypingQuote: false,
      })
  );

  if (firstInvalid) {
    const invalidIdx = controls.indexOf(firstInvalid);
    if (invalidIdx !== -1) {
      renderActiveStep(invalidIdx, { focusControl: true });
    }
    return;
  }

  const enteredUsername = usernameInput?.value.trim() || "Creature";

  highFivePanel?.querySelectorAll("h2, h3, p").forEach((el) => {
    if (
      el.id !== "creature-vow-quote" &&
      el.id !== "trap-note-text" &&
      /high\s*five|passed validation/i.test(el.textContent || "")
    ) {
      el.remove();
    }
  });

  if (creatureVowQuote) {
    creatureVowQuote.textContent = `“${enteredUsername}, you belong with me now.”`;
  }
  if (trapNoteText) {
    trapNoteText.textContent = QUOTES.trap;
  }

  form.hidden = true;
  setCreatureVisible(true);
  if (highFivePanel) {
    highFivePanel.hidden = false;
  }
});

resetBtn?.addEventListener("click", () => {
  cancelBegBackMoment({ clearReply: true });
  if (highFivePanel) highFivePanel.hidden = true;
  if (form) form.hidden = false;
  setCreatureVisible(true);
  sanitizeFormUI(controls, { usernameInput, emailInput });

  controls.forEach((control) => {
    control.setCustomValidity("");
    control.removeAttribute("aria-invalid");
    control.classList.remove("force-invalid");
    [getErrorEl(control), getTypingLineEl(control)].forEach((line) => {
      if (line) line.textContent = "";
    });
  });

  renderActiveStep(0, { focusControl: false });
});