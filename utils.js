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
 * Opens a dropdown or multiselect and selects the matching option using direct or alias-based matching.
 * @param {string} buttonSelector - Selector for the button that opens the menu.
 * @param {string} labelToMatch - Text to match against menu options.
 * @param {Element} [container=document] - Optional container within which to search.
 * @param {string[]} [aliases=[]] - Optional list of alias strings.
 * @param {string} [optionSelector='[role="option"]'] - Selector for the dropdown options.
 */
window.selectFromDropdownOption = async (
  buttonSelector, 
  labelToMatch, 
  container = document, 
  aliases = [], 
  optionSelector = '[role="option"]'
) => {
  const button = container.querySelector(buttonSelector);
  if (!button) {
    console.warn("Dropdown button not found:", buttonSelector);
    return;
  }
  
  // open dropdown
  button.click();

  // Wait for options to appear
  try {
    await waitForElement(optionSelector);
  } catch (err) {
    console.warn("Timed out waiting for dropdown options:", err.message);
    return;
  }
  
  // fetch and normalize options from full document scope
  const activeDropdown = getActiveDropdownContainer();
  if (!activeDropdown) {
    console.warn("⚠️ No active dropdown container found.");
    return;
  }
  const options = Array.from(activeDropdown.querySelectorAll(optionSelector));
  console.log("Dropdown options found:", options.map(o => o.textContent.trim()));

  // direct match
  const match = findMatchingOption(options, labelToMatch, aliases) 
  
  if (match) {
    match.click();
  } else {
    console.warn("Dropdown option not found:", labelToMatch, "Aliases tried:", aliases);
  }
};

/**
 * Simulates user input to select one or more options from a virtualized dropdown menu by typing the desired labels.
 * The function supports both single and multi-select inputs. It types each candidate value (including aliases),
 * confirms the selection via simulated keyboard events, and validates whether the label was successfully added.
 * The `labelToMatch` parameter can be either a single string (for single-select fields)
 * or an array of strings (for multi-select scenarios like skill selection).
 * @param {string} triggerSelector - CSS selector for the input element that triggers the dropdown.
 * @param {string|string[]} labelToMatch - The main label(s) to match and select. Accepts a string for single values or an array for multiple.
 * @param {boolean} [allowMultiple=false] - Whether to allow selecting multiple values. Set to true for multi-select dropdowns.
 * @param {Element} [container=document] - DOM container to scope the query. Defaults to `document`.
 * @param {string[]} [aliases=[]] - Optional array of fallback aliases to try if the primary candidate isn't found.
 * @param {string} [optionSelector='[data-automation-id="promptOption"]'] - Selector used to identify dropdown options.
 */
window.selectByTypingFromDropdown = async (
  triggerSelector,
  labelToMatch,
  allowMultiple = false,
  container = document,
  aliases = [],
  optionSelector = '[data-automation-id="promptOption"]'
) => {
  const trigger = container.querySelector(triggerSelector);
  if (!trigger) {
    console.warn("Menu trigger not found:", triggerSelector);
    return;
  }

  trigger.click();
  const labelArray = Array.isArray(labelToMatch) ? labelToMatch : [labelToMatch];
  const candidates = [...labelArray, ...aliases];
  const unacceptedCandidates = [];

  for (const candidate of candidates) {
    const currentPills = getCurrentPills(container);
    if (!allowMultiple && currentPills.includes(candidate.toLowerCase())) {
      console.log("Already present:", candidate);
      break;
    }

    // type and dispatch
    trigger.value = candidate;
    console.log("Typing candidate:", candidate, "→ Trigger value now:", trigger.value);
    trigger.dispatchEvent(new Event("input", {bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 300));

    // press enter to confirm selection
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    trigger.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 500));

    // Re-check pills after typing
    const newPills = getCurrentPills(container);
    if (newPills.includes(candidate.toLowerCase())) {
      console.log("✅ Added:", candidate);
      if (!allowMultiple) break;
    } else {
      console.warn("❌ Candidate not accepted:", candidate);
      unacceptedCandidates.push(candidate);
      continue;
    }
  }
  console.log("💡 Loop finished. Now printing unacceptedCandidates.");
  if (unacceptedCandidates.length > 0) {
    console.warn("Unaccepted candidates:", unacceptedCandidates);
  }
};

/**
 * Finds a matching option based on exact label or aliases.
 * @param {Element[]} options - The list of <option>-like elements to search.
 * @param {string} labelToMatch - The main label.
 * @param {string[]} aliases - A list of fallback alias strings.
 * @returns {Element|null} - The matching option, or null.
 */
findMatchingOption = (options, labelToMatch, aliases = []) => {
  const normalizedLabel = labelToMatch.trim().toLowerCase();

  let match = options.find(opt =>
    opt.textContent.trim().toLowerCase() === normalizedLabel
  );

  if (!match && Array.isArray(aliases)) {
    for (const alias of aliases) {
      const normalizedAlias = alias.trim().toLowerCase();
      match = options.find(opt =>
        opt.textContent.trim().toLowerCase() === normalizedAlias
      );
      if (match) break;
    }
  }

  return match || null;
}

/**
 * Retrieves the list of currently selected "pill" labels from a multi-select dropdown container.
 * Pills are identified by elements with IDs starting with "pill-" and a `data-automation-id="selectedItem"` attribute,
 * and their labels are assumed to be contained in a nested <p> element with `data-automation-id="promptOption"`.
 * @param {Element} [container=document] - The container in which to search for pills. Defaults to the global document.
 * @returns {string[]} An array of normalized (lowercased and trimmed) text values from the matched pill labels.
 */
const getCurrentPills = (container = document) => {
  return Array.from(container.querySelectorAll('[id^="pill-"][data-automation-id="selectedItem"] p[data-automation-id="promptOption"]'))
    .map(p => p.textContent.trim().toLowerCase());
};

/**
 * Returns the most recently opened dropdown container (typically a floating menu with role="listbox").
 * Assumes the most recently added matching element is the active one.
 * @returns {Element|null} The container DOM element, or null if not found.
 */
getActiveDropdownContainer = () => {
  const listboxes = Array.from(document.querySelectorAll('[role="listbox"]'));
  if (listboxes.length === 0) return null;

  // Return the last one in the DOM (most recently appended)
  return listboxes[listboxes.length - 1];
}

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
window.setCheckboxBySelector = (selector, checked, container = document) => {
  const el = container.querySelector(selector);
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
window.setCheckboxByName = (name, checked, container = document) => {
  window.setCheckboxBySelector(`input[name="${name}"]`, checked, container);
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
window.waitForElement = (selector, container = document, timeout = 5000) => {
  return new Promise((resolve, reject) => {
  const start = Date.now();
  const interval = setInterval(() => {
      const el = container.querySelector(selector);
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


