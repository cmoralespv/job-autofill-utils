/**
 * Fills an input field selected via a CSS selector.
 * Dispatches an 'input' event to ensure frameworks detect the change.
 * @param {string} selector - The CSS selector targeting the input element.
 * @param {string} value - The value to set in the input field.
 */
window.fillInputBySelector = (selector, value, container = document) => {
  const el = container.querySelector(selector);
  if (el) {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    console.warn("Input not found:", selector);
  }
};

/**
 * Fills an input field by targeting it via its `name` attribute.
 * @param {string} name - The name attribute of the input.
 * @param {string} value - The value to set.
 */
window.fillInputByName = (name, value, container = document) => {
  window.fillInputBySelector(`input[name="${name}"]`, value, container);
};

/**
 * Opens a dropdown and selects the matching label.
 * @param {string} buttonSelector - Selector for the button that opens the dropdown.
 * @param {string} labelToMatch - Visible text of the option to select.
 * @param {string} [optionSelector='[role="option"]'] - Selector for the dropdown options.
 */
window.selectDropdownByLabel = (buttonSelector, labelToMatch, optionSelector = '[role="option"]', container = document) => {
  const button = container.querySelector(buttonSelector);
  if (!button) {
    console.warn("Dropdown button not found:", buttonSelector);
    return;
  }
  button.click();
  setTimeout(() => {
    const options = container.querySelectorAll(optionSelector);
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
 * Sets the value of an input element programmatically in a way that simulates user input.
 * This ensures compatibility with frameworks like React that rely on synthetic events.
 *
 * @param {HTMLInputElement} el - The input element to modify.
 * @param {string} value - The value to assign to the input element.
 * @returns {Promise<void>} Resolves once the value has been set and events dispatched.
 */
window.dateSetValue = async (el, value) => {
  if (!el) return;

  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  if (!nativeSetter) return;

  el.focus();
  nativeSetter.call(el, value);
  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

// BEHAVIOR FUNCTIONS

/**
 * Clicks a button using a CSS selector.
 * @param {string} selector - The selector for the button element.
 */
window.clickButton = (selector, container = document) => {
  const btn = container.querySelector(selector);
  if (btn) btn.click();
  else console.warn("Button not found:", selector);
};

/**
 * Pauses execution for a specified time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
window.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
  * Waits for an element to be available in the DOM.
  * @param {string} selector - CSS selector for the desired element.
  * @param {number} timeout - Max wait time in ms.
  * @returns {Promise<Element>} - Resolves with the element or rejects if timeout.
  */
window.waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
  const start = Date.now();
  const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout: Element not found: ${selector}`));
      }
    }, 100);
  });
}

/**
 * Simulates a click on a neutral part of the screen to dismiss open dropdowns or overlays.
 * Useful when custom dropdowns stay open after selection.
 */
window.clickAway = () => {
  setTimeout(() => {
      // Try clicking the body or a neutral container to force blur
      const backdrop = document.body || document.querySelector('div');
      if (backdrop) {
          backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          backdrop.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
  }, 500);
};


