/**
 * Sburb Captchalogue Card UI Component
 * Encapsulates dynamic rendering of 48-bit hole grids, sorted autocompletion,
 * item preview images, and keyboard navigation.
 */

import { encodeCode } from "../engine.js";
import { getItemByCode, getItemImageUrl, searchItems } from "../items.js";

export class CaptchaCard {
  /**
   * @param {object} options
   * @param {string} options.id - Card ID suffix (e.g. "1", "2", "3")
   * @param {HTMLElement} options.cardElement - Card container element
   * @param {HTMLInputElement} options.inputElement - Code text input element
   * @param {HTMLElement} options.holesGridElement - 48-hole grid container element
   * @param {HTMLElement} [options.suggestionsElement] - Auto-complete container element
   * @param {boolean} [options.readOnly=false] - If true, user input is disabled
   * @param {function} [options.onChange] - Callback fired when code value changes
   */
  constructor({ id, cardElement, inputElement, holesGridElement, suggestionsElement, readOnly = false, onChange }) {
    this.id = id;
    this.cardElement = cardElement;
    this.inputElement = inputElement;
    this.holesGridElement = holesGridElement;
    this.suggestionsElement = suggestionsElement;
    this.readOnly = readOnly;
    this.onChange = onChange;

    this.code = "";
    this.bits = new Array(48).fill(0);
    this.suggestionIndex = -1;
    this.currentMatches = [];

    this.init();
  }

  init() {
    // 1. Build Item Image node if not present
    this.itemElement = this.cardElement.querySelector(".item");
    if (!this.itemElement) {
      this.itemElement = document.createElement("div");
      this.itemElement.className = "item";
      this.cardElement.insertBefore(this.itemElement, this.cardElement.firstChild);
    }

    // 2. Build 48 Punch Holes dynamically
    this.holesGridElement.innerHTML = "";
    this.holeNodes = [];
    for (let i = 0; i < 48; i++) {
      const hole = document.createElement("div");
      hole.className = "hole";
      const charIndex = Math.floor(i / 6) + 1;
      const bitPosition = 6 - (i % 6);
      hole.setAttribute("data-bit-index", i);
      hole.setAttribute("title", `Char ${charIndex}, Bit ${bitPosition} (Index ${i})`);
      this.holesGridElement.appendChild(hole);
      this.holeNodes.push(hole);
    }

    // 3. Create dedicated suggestions element if not provided
    if (!this.readOnly && this.inputElement) {
      if (!this.suggestionsElement && this.inputElement.parentElement) {
        this.suggestionsElement = document.createElement("div");
        this.suggestionsElement.className = "suggestions";
        this.suggestionsElement.id = `suggestions-card-${this.id}`;
        this.inputElement.parentElement.appendChild(this.suggestionsElement);
      }

      this.inputElement.addEventListener("input", (e) => this.handleInput(e));
      this.inputElement.addEventListener("focus", () => this.handleFocus());
      this.inputElement.addEventListener("keydown", (e) => this.handleKeyDown(e));

      // Close suggestions when clicking outside card column
      document.addEventListener("click", (e) => {
        const columnEl = this.cardElement ? (this.cardElement.closest ? this.cardElement.closest(".cardColumn") : this.cardElement.parentElement) : null;
        const isInsideColumn = columnEl && columnEl.contains(e.target);
        const isInsideSuggestions = this.suggestionsElement && this.suggestionsElement.contains(e.target);
        if (!isInsideColumn && !isInsideSuggestions) {
          this.hideSuggestions();
        }
      });
    }

    // Initial render based on existing input value without firing premature onChange during constructor
    const initialVal = this.inputElement ? this.inputElement.value : "00000000";
    this.setCode(initialVal, true);
  }

  /**
   * Sets the code, updates bits, holes, image, and fires change callback.
   * @param {string} newCode 
   * @param {boolean} [skipOnChange=false] 
   */
  setCode(newCode = "00000000", skipOnChange = false) {
    this.code = String(newCode).slice(0, 8);
    if (this.inputElement && this.inputElement.value !== this.code) {
      this.inputElement.value = this.code;
    }

    this.bits = encodeCode(this.code);
    this.updatePunches();
    this.updateImage();
    this.hideSuggestions();

    if (!skipOnChange && typeof this.onChange === "function") {
      try {
        this.onChange(this.code, this.bits);
      } catch (err) {
        console.error("onChange error:", err);
      }
    }
  }

  /**
   * Directly sets bit pattern and decodes code string.
   * @param {number[]} bits Array of 48 binary digits
   * @param {string} decodedCode Decoded 8-character string
   */
  setBits(bits, decodedCode) {
    this.bits = bits;
    this.code = decodedCode;
    if (this.inputElement) {
      this.inputElement.value = decodedCode;
    }
    this.updatePunches();
    this.updateImage();
  }

  /**
   * Updates visibility of hole punches according to bit array.
   */
  updatePunches() {
    for (let i = 0; i < 48; i++) {
      const isVisible = !!this.bits[i];
      this.holeNodes[i].style.visibility = isVisible ? "visible" : "hidden";
      if (isVisible) {
        this.holeNodes[i].classList.add("punched");
      } else {
        this.holeNodes[i].classList.remove("punched");
      }
    }
  }

  /**
   * Updates card item preview image.
   */
  updateImage() {
    const itemUrl = getItemImageUrl(this.code);
    const itemMeta = getItemByCode(this.code);

    if (itemUrl) {
      this.itemElement.style.backgroundImage = `url('${itemUrl}')`;
      this.cardElement.setAttribute("title", `${itemMeta.title} [${this.code}]`);
      this.cardElement.classList.add("has-item");
    } else {
      this.itemElement.style.backgroundImage = "";
      this.cardElement.removeAttribute("title");
      this.cardElement.classList.remove("has-item");
    }
  }

  /**
   * Checks whether card currently holds a full 8-character captchalogue code.
   * @returns {boolean}
   */
  isComplete() {
    const rawVal = this.inputElement ? this.inputElement.value.trim() : (this.code || "");
    return rawVal.length === 8;
  }

  handleInput(evt) {
    const val = this.inputElement ? this.inputElement.value : (evt && evt.target ? evt.target.value : "");
    const q = val.trim();

    // 1. Instantly filter & update suggestions list on text entry
    const matches = searchItems(q);
    if (matches.length > 0) {
      this.showSuggestions(matches);
    } else {
      this.hideSuggestions();
    }

    // 2. Determine active item code (exact code, top search match code when searching, or raw input)
    let activeCode = q;
    if (!getItemByCode(q)) {
      if (q && matches.length > 0) {
        activeCode = matches[0].code;
      } else {
        activeCode = q;
      }
    }

    this.code = activeCode;
    this.bits = encodeCode(this.code);
    this.updatePunches();
    this.updateImage();

    if (typeof this.onChange === "function") {
      try {
        this.onChange(this.code, this.bits);
      } catch (err) {
        console.error("onChange error:", err);
      }
    }
  }

  handleFocus() {
    if (this.inputElement) {
      setTimeout(() => {
        try {
          this.inputElement.select();
        } catch (_) {}
      }, 0);
    }

    const val = this.inputElement ? this.inputElement.value.trim() : "";
    const matches = searchItems(val);
    if (matches.length > 0) {
      this.showSuggestions(matches);
    } else {
      this.hideSuggestions();
    }
  }

  showSuggestions(matches) {
    if (!this.suggestionsElement) return;

    this.currentMatches = matches;
    this.suggestionIndex = 0;
    this.suggestionsElement.innerHTML = "";

    matches.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "suggestion-item";
      if (index === 0) itemEl.classList.add("highlight");
      itemEl.setAttribute("title", `${item.title} [${item.code}]`);
      itemEl.innerHTML = `
        <span class="suggestion-code">${item.code}</span>
        <span class="suggestion-title">${item.title}</span>
      `;

      itemEl.addEventListener("mousedown", (e) => {
        // Prevent input blur before click event registers
        e.preventDefault();
      });

      itemEl.addEventListener("mouseenter", () => {
        this.suggestionIndex = index;
        const suggestionItems = this.suggestionsElement.querySelectorAll(".suggestion-item");
        this.highlightSuggestion(suggestionItems, index);
      });

      itemEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectSuggestion(index);
      });

      this.suggestionsElement.appendChild(itemEl);
    });

    this.suggestionsElement.style.display = "block";
    this.suggestionsElement.classList.add("active");

    const columnEl = this.cardElement ? (this.cardElement.closest ? this.cardElement.closest(".cardColumn") : this.cardElement.parentElement) : null;
    if (columnEl) {
      columnEl.classList.add("has-open-suggestions");
    }

    if (this.inputElement) {
      this.inputElement.setAttribute("aria-expanded", "true");
    }
  }

  selectSuggestion(index) {
    if (index >= 0 && index < this.currentMatches.length) {
      const selected = this.currentMatches[index];
      this.setCode(selected.code);
    }
    this.hideSuggestions();
  }

  hideSuggestions() {
    if (!this.suggestionsElement) return;
    this.suggestionsElement.style.display = "none";
    this.suggestionsElement.classList.remove("active");
    this.suggestionsElement.innerHTML = "";
    this.suggestionIndex = -1;
    this.currentMatches = [];

    const columnEl = this.cardElement ? (this.cardElement.closest ? this.cardElement.closest(".cardColumn") : this.cardElement.parentElement) : null;
    if (columnEl) {
      columnEl.classList.remove("has-open-suggestions");
    }

    if (this.inputElement) {
      this.inputElement.setAttribute("aria-expanded", "false");
    }
  }

  handleKeyDown(event) {
    const isVisible = this.suggestionsElement && (this.suggestionsElement.style.display === "block" || this.suggestionsElement.classList.contains("active")) && this.currentMatches.length > 0;

    if (event.key === "Enter" || event.key === "Tab") {
      if (isVisible) {
        event.preventDefault();
        event.stopPropagation();
        const targetIdx = this.suggestionIndex >= 0 ? this.suggestionIndex : 0;
        this.selectSuggestion(targetIdx);
      } else {
        this.hideSuggestions();
      }
      return;
    }

    if (event.key === "Escape") {
      this.hideSuggestions();
      return;
    }

    if (!isVisible) return;
    const suggestionItems = this.suggestionsElement.querySelectorAll(".suggestion-item");

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.suggestionIndex = (this.suggestionIndex + 1) % this.currentMatches.length;
      this.highlightSuggestion(suggestionItems, this.suggestionIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.suggestionIndex <= 0) {
        this.suggestionIndex = this.currentMatches.length - 1;
      } else {
        this.suggestionIndex--;
      }
      this.highlightSuggestion(suggestionItems, this.suggestionIndex);
    }
  }

  highlightSuggestion(items, targetIndex) {
    items.forEach((item, i) => {
      if (i === targetIndex) {
        item.classList.add("highlight");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("highlight");
      }
    });
  }
}
