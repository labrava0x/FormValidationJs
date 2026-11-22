export function createStepper({
  form,
  controls = [],
  validateField,
  onStepChange = () => {},
} = {}) {
  const fields = controls
    .map((control) => control?.closest(".field"))
    .filter(Boolean);

  let unlockedCount = 1;
  let activeIndex = 0;
  let isTransitioning = false;
  let transitionTimer = null;

  function isControlValid(control) {
    if (!control) return false;
    if (typeof validateField === "function") {
      return Boolean(validateField(control));
    }
    return control.checkValidity();
  }

  function computeUnlockedCount() {
    let count = 1;
    for (let i = 0; i < controls.length - 1; i += 1) {
      if (isControlValid(controls[i])) {
        count = i + 2;
      } else {
        break;
      }
    }
    return Math.min(count, fields.length || 1);
  }

  function renderSingleField(indexToShow, animateIn = false) {
    if (!fields.length) return;

    const targetIndex = Math.max(0, Math.min(indexToShow, fields.length - 1));
    activeIndex = targetIndex;

    fields.forEach((fieldEl, idx) => {
      fieldEl.classList.remove("step-folding");
      if (idx === targetIndex) {
        fieldEl.classList.remove("step-hidden");
        if (animateIn) {
          fieldEl.classList.remove("step-active");
          void fieldEl.offsetWidth;
          fieldEl.classList.add("step-active");
        }
      } else {
        fieldEl.classList.add("step-hidden");
        fieldEl.classList.remove("step-active");
      }
    });
  }

  function foldThenUnfold(fromIndex, toIndex) {
    const currentField = fields[fromIndex];
    const nextField = fields[toIndex];

    if (!currentField || !nextField || fromIndex === toIndex) {
      renderSingleField(toIndex, true);
      isTransitioning = false;
      onStepChange(toIndex);
      return;
    }

    isTransitioning = true;
    clearTimeout(transitionTimer);

    currentField.classList.remove("step-hidden", "step-active");
    currentField.classList.add("step-folding");
    onStepChange(toIndex);

    transitionTimer = setTimeout(() => {
      currentField.classList.remove("step-folding");
      currentField.classList.add("step-hidden");

      nextField.classList.remove("step-hidden", "step-folding", "step-active");
      void nextField.offsetWidth;
      nextField.classList.add("step-active");

      activeIndex = toIndex;
      isTransitioning = false;

      const nextControl = controls[toIndex];
      if (nextControl && form && !form.hidden) {
        nextControl.focus({ preventScroll: true });
      }
    }, 260);
  }

  function update({ allowAdvance = true } = {}) {
    if (!fields.length) return;

    const nextUnlocked = computeUnlockedCount();
    const previousUnlocked = unlockedCount;
    unlockedCount = nextUnlocked;

    if (isTransitioning) return;

    // If an earlier step became invalid again, step back to that invalid field
    if (activeIndex >= unlockedCount) {
      renderSingleField(unlockedCount - 1, true);
      return;
    }

    // Advance only when the current field just became valid and unlocked the next step
    if (
      allowAdvance &&
      unlockedCount > previousUnlocked &&
      activeIndex + 1 < unlockedCount
    ) {
      foldThenUnfold(activeIndex, activeIndex + 1);
      return;
    }

    renderSingleField(activeIndex, false);
  }

  function goToControl(targetControl) {
    const idx = controls.indexOf(targetControl);
    if (idx === -1) return;

    clearTimeout(transitionTimer);
    isTransitioning = false;

    const maxAllowed = Math.max(unlockedCount - 1, 0);
    const dest = Math.min(idx, maxAllowed);
    renderSingleField(dest, true);
  }

  function reset() {
    clearTimeout(transitionTimer);
    isTransitioning = false;
    unlockedCount = 1;
    activeIndex = 0;
    renderSingleField(0, true);
  }

  renderSingleField(0, false);

  return {
    update,
    goToControl,
    reset,
    getActiveIndex: () => activeIndex,
  };
}