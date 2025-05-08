/**
 * Fills an input field selected via a CSS selector.
 * Dispatches an 'input' event to ensure frameworks detect the change.
 * @param {string} selector - The CSS selector targeting the input element.
 * @param {string} value - The value to set in the input field.
 */
window.fillInputBySelector = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    console.warn("Input not found:", selector);
  }
};

/**
 * Fills an input field by targeting it via its `name` attribute.
 * @param {string} name - The name attribute of the input.
 * @param {string} value - The value to set.
 */
window.fillInputByName = (name, value) => {
  window.fillInputBySelector(`input[name="${name}"]`, value);
};

/**
 * Opens a dropdown and selects the matching label.
 * @param {string} buttonSelector - Selector for the button that opens the dropdown.
 * @param {string} labelToMatch - Visible text of the option to select.
 * @param {string} [optionSelector='[role="option"]'] - Selector for the dropdown options.
 */
window.selectDropdownByLabel = (buttonSelector, labelToMatch, optionSelector = '[role="option"]') => {
  const button = document.querySelector(buttonSelector);
  if (!button) {
    console.warn("Dropdown button not found:", buttonSelector);
    return;
  }
  button.click();
  setTimeout(() => {
    const options = document.querySelectorAll(optionSelector);
    const match = Array.from(options).find(opt =>
      opt.textContent.trim().toLowerCase() === labelToMatch.trim().toLowerCase()
    );
    if (match) {
      match.click();
    } else {
      console.warn("Dropdown option not found:", labelToMatch);
    }
  }, 300);
};

/**
 * Selects a radio button by name and value.
 * @param {string} name - The name attribute of the radio group.
 * @param {string} value - The value of the radio button to select.
 */
window.setRadio = (name, value) => {
  const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.click();
  else console.warn("Radio not found:", name, value);
};

/**
 * Sets the checked state of a checkbox using a CSS selector.
 * @param {string} selector - CSS selector to locate the checkbox.
 * @param {boolean} checked - Whether the checkbox should be checked.
 */
window.setCheckboxBySelector = (selector, checked) => {
    const el = document.querySelector(selector);
    if (el) {
      if (el.checked !== checked) {
        el.click();
        console.log("Checkbox clicked programmatically.");
    }
  } else {
    console.warn("Checkbox not found:", selector);
  }
};

/**
 * Sets the checked state of a checkbox using its name attribute.
 * @param {string} name - The name attribute of the checkbox.
 * @param {boolean} checked - Whether the checkbox should be checked.
 */
window.setCheckboxByName = (name, checked) => {
  window.setCheckboxBySelector(`input[name="${name}"]`, checked);
};

/**
 * Clicks a button using a CSS selector.
 * @param {string} selector - The selector for the button element.
 */
window.clickButton = (selector) => {
  const btn = document.querySelector(selector);
  if (btn) btn.click();
};

/**
 * Pauses execution for a specified time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
window.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
