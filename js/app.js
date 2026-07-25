/**
 * Sburb Captchalogue Alchemy Application Controller
 */

import { initPortfolioBanner } from "./components/banner.js";
import { CaptchaCard } from "./components/card.js";
import { alchemizeBits, decodeCode } from "./engine.js";
import { ITEMS_DATABASE, PRESET_RECIPES, getItemByCode } from "./items.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Portfolio Return Banner
  initPortfolioBanner();

  // 2. DOM Elements & Helpers Initialization
  const equalsButton = document.getElementById("EqualsButton");
  const resultTitleEl = document.getElementById("resultItemTitle");
  const resultCodeEl = document.getElementById("resultItemCode");
  const copyBtn = document.getElementById("copyResultBtn");

  // Operator Radio Buttons
  const opButtons = {
    AND: document.getElementById("AndButton"),
    OR: document.getElementById("OrButton"),
    XOR: document.getElementById("XorButton"),
    ABJ: document.getElementById("AbjButton")
  };

  let currentOperator = "AND";
  if (opButtons.AND) {
    opButtons.AND.checked = true;
  }

  function updateResultMeta(code, opKey) {
    const item = getItemByCode(code);
    if (resultTitleEl) {
      resultTitleEl.textContent = item ? item.title : "Custom Alchemized Creation";
    }
    if (resultCodeEl) {
      resultCodeEl.textContent = `Code: [${code}] (${opKey} Alchemy)`;
    }
  }

  // Set up operator radio click listeners
  Object.keys(opButtons).forEach(opKey => {
    const radio = opButtons[opKey];
    if (radio) {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          currentOperator = opKey;
          updateOperatorState();
          clearOutput();
        }
      });
    }
  });

  function clearOutput() {
    if (card3) {
      card3.setBits(new Array(48).fill(0), "");
    }
    if (resultTitleEl) {
      resultTitleEl.textContent = "—";
    }
    if (resultCodeEl) {
      resultCodeEl.textContent = "Click Alchemize button to calculate";
    }
  }

  function isCodeComplete(card) {
    if (!card) return false;
    if (typeof card.isComplete === "function") {
      return card.isComplete();
    }
    const val = card.inputElement ? card.inputElement.value.trim() : (card.code || "");
    return val.length === 8;
  }

  function updateOperatorState() {
    if (!equalsButton) return;
    const canAlchemize = isCodeComplete(card1) && isCodeComplete(card2);

    if (canAlchemize) {
      equalsButton.src = "img/btn/alchemize-00.png";
      equalsButton.classList.remove("disabled");
      equalsButton.setAttribute("title", `Click to Alchemize using ${currentOperator}`);
      equalsButton.setAttribute("tabindex", "0");
    } else {
      equalsButton.src = "img/btn/alchemize-02.png";
      equalsButton.classList.add("disabled");
      equalsButton.setAttribute("title", "Enter full 8-character codes on both cards to Alchemize");
      equalsButton.setAttribute("tabindex", "-1");
    }
  }

  // 3. Initialize Captchalogue Cards
  const card1 = new CaptchaCard({
    id: "1",
    cardElement: document.getElementById("Card1"),
    inputElement: document.getElementById("TextPut1"),
    holesGridElement: document.getElementById("HolesGrid1"),
    onChange: () => {
      updateOperatorState();
      clearOutput();
    }
  });

  const card2 = new CaptchaCard({
    id: "2",
    cardElement: document.getElementById("Card2"),
    inputElement: document.getElementById("TextPut2"),
    holesGridElement: document.getElementById("HolesGrid2"),
    onChange: () => {
      updateOperatorState();
      clearOutput();
    }
  });

  const card3 = new CaptchaCard({
    id: "3",
    cardElement: document.getElementById("Card3"),
    inputElement: document.getElementById("TextPut3"),
    holesGridElement: document.getElementById("HolesGrid3"),
    readOnly: true
  });

  // Default initial values
  card1.setCode("nZ7Un6BI"); // Claw Hammer
  card2.setCode("DQMmJLeK"); // Green Slime Ghost Pogo

  // Animation helper for button press visual reaction (alchemize-00.png -> alchemize-01.png -> alchemize-00.png)
  let animTimer = null;
  function triggerButtonPressAnimation() {
    if (!equalsButton || equalsButton.classList.contains("disabled")) return;
    if (animTimer) clearTimeout(animTimer);

    equalsButton.src = "img/btn/alchemize-01.png";
    animTimer = setTimeout(() => {
      equalsButton.src = "img/btn/alchemize-00.png";
    }, 160);
  }

  // Alchemize Action Function
  function performAlchemy() {
    if (!currentOperator || !card1 || !card2 || !card3) return;
    if (!isCodeComplete(card1) || !isCodeComplete(card2)) return;

    // Visual button press animation
    triggerButtonPressAnimation();

    // Compute Alchemy
    const resultBits = alchemizeBits(card1.bits, card2.bits, currentOperator);
    const decodedCode = decodeCode(resultBits);

    // Set Card 3 result
    card3.setBits(resultBits, decodedCode);

    // Trigger visual reaction on Card 3 container
    const card3Container = document.getElementById("Card3");
    if (card3Container) {
      card3Container.classList.remove("alchemy-flash");
      void card3Container.offsetWidth; // force reflow
      card3Container.classList.add("alchemy-flash");
    }

    // Update Result Info Bar
    updateResultMeta(decodedCode, currentOperator);
  }

  if (equalsButton) {
    equalsButton.addEventListener("click", () => {
      if (isCodeComplete(card1) && isCodeComplete(card2)) {
        performAlchemy();
      }
    });
    equalsButton.addEventListener("mousedown", () => {
      if (isCodeComplete(card1) && isCodeComplete(card2)) {
        equalsButton.src = "img/btn/alchemize-01.png";
      }
    });
    equalsButton.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && isCodeComplete(card1) && isCodeComplete(card2)) {
        e.preventDefault();
        performAlchemy();
      }
    });
  }

  // Keyboard shortcut: Shift + Enter anywhere alchemizes if valid
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) {
      if (isCodeComplete(card1) && isCodeComplete(card2)) {
        e.preventDefault();
        performAlchemy();
      }
    }
  });

  // Copy Result Code Button Listener
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const codeToCopy = card3.code;
      if (!codeToCopy) return;
      navigator.clipboard.writeText(codeToCopy).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = origText;
          copyBtn.classList.remove("copied");
        }, 1800);
      });
    });
  }

  // Initial state: output starts cleared until Alchemize is pressed
  clearOutput();
  updateOperatorState();

  // --- PRESETS & CATALOG MODAL ---
  const presetContainer = document.getElementById("presetRecipesList");
  if (presetContainer) {
    PRESET_RECIPES.forEach(recipe => {
      const btn = document.createElement("button");
      btn.className = "preset-pill";
      btn.type = "button";
      btn.innerHTML = `<strong>${recipe.name}</strong> <span>(${recipe.card1} ${recipe.operator} ${recipe.card2})</span>`;
      btn.addEventListener("click", () => {
        card1.setCode(recipe.card1);
        card2.setCode(recipe.card2);
        if (opButtons[recipe.opKey]) {
          opButtons[recipe.opKey].checked = true;
          currentOperator = recipe.opKey;
        }
        performAlchemy();
      });
      presetContainer.appendChild(btn);
    });
  }

  // Catalog Drawer Modal Toggle
  const catalogToggleBtn = document.getElementById("toggleCatalogBtn");
  const catalogModal = document.getElementById("catalogModal");
  const closeCatalogBtn = document.getElementById("closeCatalogBtn");
  const catalogGrid = document.getElementById("catalogGrid");

  function renderCatalog() {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = "";

    Object.keys(ITEMS_DATABASE).forEach(code => {
      const item = ITEMS_DATABASE[code];
      const cardEl = document.createElement("div");
      cardEl.className = "catalog-card";
      cardEl.innerHTML = `
        <div class="catalog-thumb" style="background-image: url('img/item/${item.img}');"></div>
        <div class="catalog-info">
          <div class="catalog-title">${item.title}</div>
          <div class="catalog-code"><code>${code}</code></div>
        </div>
        <div class="catalog-actions">
          <button type="button" class="load-card-btn load-card-1" title="Load into Card 1">Card 1</button>
          <button type="button" class="load-card-btn load-card-2" title="Load into Card 2">Card 2</button>
        </div>
      `;

      cardEl.querySelector(".load-card-1").addEventListener("click", () => {
        card1.setCode(code);
        performAlchemy();
      });

      cardEl.querySelector(".load-card-2").addEventListener("click", () => {
        card2.setCode(code);
        performAlchemy();
      });

      catalogGrid.appendChild(cardEl);
    });
  }

  renderCatalog();

  if (catalogToggleBtn && catalogModal) {
    catalogToggleBtn.addEventListener("click", () => {
      catalogModal.classList.add("active");
    });

    closeCatalogBtn?.addEventListener("click", () => {
      catalogModal.classList.remove("active");
    });

    catalogModal.addEventListener("click", (e) => {
      if (e.target === catalogModal) {
        catalogModal.classList.remove("active");
      }
    });
  }
});
