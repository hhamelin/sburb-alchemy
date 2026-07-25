# Sburb Alchemy — Captchalogue Card Bitwise Calculator

Interactive 48-bit Captchalogue Card bitwise alchemy workbench inspired by *Homestuck*. Encodes and decodes 8-character Base64 item codes into 48-bit binary hole punch grids, evaluating bitwise alchemy operations (`AND`, `OR`, `XOR`, `ABJ`/Abjure) in real-time. Built with modular Vanilla JavaScript (ES6), custom CSS design tokens, real-time autocompletion, dynamic 48-hole card renderings, a pre-seeded item database, curated preset recipes, and an interactive item catalog overlay.

## Live Deployment

- [Sburb Alchemy Calculator Live Preview](https://projects.havenhamelin.work/alchemy)

## Key Features

- **48-Bit Captchalogue Encoding Engine**: Encodes 8-character captchalogue codes into 48-element binary bitmask arrays using a custom 64-character cipher (`0-9`, `A-Z`, `a-z`, `?`, `!`), mapping 6 bits per character across the 48-hole captchalogue grid (`js/engine.js`).
- **Bitwise Alchemy Evaluation**: Simulates canonical Sburb alchemy by applying bitwise operators across two input cards to compute target output codes and artwork previews:
  - **Bitwise AND (`&&`)**: Computes bitwise conjunction (`v1 & v2`), retaining hole punches present in *both* input cards.
  - **Bitwise OR (`||`)**: Computes bitwise disjunction (`v1 | v2`), combining hole punches from *either* input card.
  - **Bitwise XOR (`^^`)**: Computes bitwise exclusive-OR (`v1 ^ v2`), retaining hole punches present in *only one* input card.
  - **Bitwise ABJ (`ABJ` / Abjure)**: Computes bitwise abjuration / AND-NOT subtraction (`v1 & ~v2`), retaining holes from Card 1 that are *absent* in Card 2.
- **Interactive 48-Hole Punch Grid Component**: Dynamic `CaptchaCard` component (`js/components/card.js`) rendering 48 individual hole nodes on captchalogue card graphics (`img/punched-card.png`), synchronizing punch visibility instantly with code edits.
- **Intelligent Autocomplete & Cipher Search**: Real-time suggestion dropdown with custom Base64 cipher sorting (`compareBase64Codes`), exact code-prefix prioritization, and word-cluster title search (`js/items.js`).
- **Sburb Item Database & Catalog Drawer**: Pre-seeded registry (`ITEMS_DATABASE`) featuring iconic items (e.g., *Claw Hammer*, *Green Slime Ghost Pogo*, *Pogo Hammer*, *Cruxite Apple*, *Clean Cosby Poster*, *Ahab's Crosshairs*, *Fluorite Octet*), complete with a modal drawer catalog (`#catalogModal`) and instant card loading.
- **Preset Recipe Workbench**: One-click preset pills (`PRESET_RECIPES`) for rapid testing of canonical item combinations.
- **Result Metadata & Clipboard Actions**: Real-time display of alchemized item names, operator badges, generated code strings, and a zero-dependency copy action using `navigator.clipboard`.
- **Portfolio Navigation Integration**: Auto-detecting banner component (`js/components/banner.js`) for seamless navigation back to Haven Hamelin's portfolio site.

---

## Technical Highlight: 48-Bit Encoding & Operator Specifications

### Base64 Cipher Ordering

Captchalogue codes map 8 characters to 48 binary bits using a custom 6-bit index (`0` to `63`):

$$\text{Cipher Sequence: } \texttt{0-9} \ (0..9) < \texttt{A-Z} \ (10..35) < \texttt{a-z} \ (36..61) < \texttt{?} \ (62) < \texttt{!} \ (63)$$

Each character in the 8-character string represents 6 bits of the 48-bit punch mask:

$$\text{Bit Index } i = (\text{Char Index} \times 6) + 6 - j \quad (1 \le j \le 6)$$

### Bitwise Alchemy Matrix

| Operator | Logical Expression | Bitwise Algorithm | Sburb Lore Equivalent |
| :--- | :--- | :--- | :--- |
| **AND (`&&`)** | `v1 && v2` | `v1 & v2` | Retains hole punches overlapping on **both** cards |
| **OR (`||`)** | `v1 \|\| v2` | `v1 \| v2` | Combines hole punches from **either** card |
| **XOR (`^^`)** | `v1 ^^ v2` | `v1 ^ v2` | Retains hole punches present in **only one** card |
| **ABJ (`ABJ`)** | `v1 && !v2` | `v1 & ~v2` | Abjures (subtracts) Card 2's hole pattern from Card 1 |

---

## Canonical Preset Recipes

| Recipe Name | Input Card 1 | Operator | Input Card 2 | Resulting Item | Output Code |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Pogo Hammer** | `nZ7Un6BI` (Claw Hammer) | `&&` | `DQMmJLeK` (Green Slime Ghost Pogo) | Pogo Hammer | `126GH48G` |
| **Hammerhead Pogo Ride** | `nZ7Un6BI` (Claw Hammer) | `\|\|` | `DQMmJLeK` (Green Slime Ghost Pogo) | Hammerhead Pogo Ride | `zxN?pNhM` |
| **Horse Painting** | `00080020` (Joker Figurine) | `^^` | `CuPA8LnQ` (Potted Plant) | Horse vs Football Player Painting | `CuP28LpQ` |
| **Clean Cosby Poster (AND)** | `CuPA8LnQ` (Potted Plant) | `&&` | `CuP28LpQ` (Horse Painting) | Clean Cosby Poster | `CuP28LnQ` |
| **Clean Cosby Poster (ABJ)** | `CuPA8LnQ` (Potted Plant) | `ABJ` | `00080020` (Joker Figurine) | Clean Cosby Poster | `CuP28LnQ` |
| **Cosby Poster Modification** | `CuPA8LnQ` (Potted Plant) | `\|\|` | `CuPA8LpQ` (Cosby Poster - John's Art) | Cosby Poster (John's Art) | `CuPA8LpQ` |
| **Joker Figurine** | `CuP28LnQ` (Clean Cosby Poster) | `^^` | `CuPA8LpQ` (Cosby Poster - John's Art) | Joker Figurine | `00080020` |
| **Generic Object** | `00000000` (Generic Object) | `&&` | `11111111` (Captchalogue Card) | Perfectly Generic Object | `00000000` |

---

## Tech Stack & Architecture

- **Scripting & Engine**: Vanilla JavaScript ES6 (ES Modules: `app.js`, `engine.js`, `items.js`, `card.js`, `banner.js`)
- **Markup & Accessibility**: HTML5 (Semantic containers, ARIA combobox attributes `role="combobox"`, `aria-autocomplete="list"`)
- **Styling & Visual Design**: Vanilla CSS3 (CSS custom properties, custom fonts, pixel-perfect card punch overlays, responsive workbench layout)
- **Typography & Assets**: Local web font rendering (*Bitfantasy*), pixel art button states (`alchemize-00.png` / `alchemize-01.png` / `alchemize-02.png`), item sprites (`img/item/`)

---

## Directory Structure

- `index.html` – Primary workbench HTML structure, card columns, operator selection controls, result cards, and catalog modal overlay.
- `style.css` – Global stylesheet containing CSS variables, card layout, punch hole grid styling, dropdown autocompletion styles, and modal CSS rules.
- `js/engine.js` – Core binary encoding/decoding engine (`encodeCode`, `decodeCode`), 64-character cipher registry (`CIPHER`), and bitwise alchemy processor (`alchemizeBits`).
- `js/items.js` – Item database (`ITEMS_DATABASE`), Base64 code comparator (`compareBase64Codes`), autocomplete search module (`searchItems`), and preset recipes (`PRESET_RECIPES`).
- `js/components/card.js` – `CaptchaCard` component class managing 48-hole grid DOM nodes, item preview overlays, autocompletion rendering, and keyboard event handlers (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- `js/components/banner.js` – Portfolio return banner component for referrer detection and cross-site navigation.
- `js/app.js` – Main application controller initializing components, event listeners, keyboard shortcuts (`Shift+Enter`), result metadata updates, and modal toggles.
- `img/` – Graphic assets including card backgrounds (`punched-card.png`, `empty-card.png`), punch holes (`punch-hole.png`), operator button sprites (`img/btn/`), and item renders (`img/item/`).
- `fonts/` – Local font assets (`Bitfantasy.ttf`).

---

## Local Setup

### 1. Requirements
- Any static web server or modern web browser supporting ES6 modules.

### 2. Clone Repository
```bash
git clone https://github.com/havenhamelin/sburb-alchemy.git
cd sburb-alchemy
```

### 3. Run Local Server
Launch using Python, Node.js, or PHP built-in web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js serve
npx serve .

# Or using PHP built-in server
php -S localhost:8000
```

Open `http://localhost:8000` in your web browser.

---

## Author

**Haven Hamelin**  
*Full-Stack Developer & UI/UX Designer*  
Portfolio: [Haven Hamelin Portfolio](https://havenhamelin.work)