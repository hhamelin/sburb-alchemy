/**
 * Sburb Alchemy Item Database & Registry
 */

import { CIPHER } from "./engine.js";

export const ITEMS_DATABASE = {
  "00000000": { name: "perfectly-generic-object", title: "Perfectly Generic Object", img: "perfectly-generic-object.png" },
  "11111111": { name: "captchalogue-card", title: "Captchalogue Card", img: "captchalogue-card.png" },
  "DQMmJLeK": { name: "green-slime-ghost-pogo", title: "Green Slime Ghost Pogo", img: "green-slime-ghost-pogo.png" },
  "nZ7Un6BI": { name: "claw-hammer", title: "Claw Hammer", img: "claw-hammer.png" },
  "dskjhsdk": { name: "rocket-pack-with-items", title: "Rocket Pack (Loaded)", img: "rocket-pack-with-items.png" },
  "126GH48G": { name: "pogo-hammer", title: "Pogo Hammer", img: "pogo-hammer.png" },
  "cZCMY4Qf": { name: "cruxite-apple", title: "Cruxite Apple", img: "cruxite-apple.png" },
  "zxN?pNhM": { name: "hammerhead-pogo-ride", title: "Hammerhead Pogo Ride", img: "hammerhead-pogo-ride.png" },
  "00080020": { name: "joker-figurine", title: "Joker Figurine", img: "joker-figurine.png" },
  "CuPA8LnQ": { name: "potted-plant", title: "Potted Plant", img: "potted-plant.png" },
  "CuPA8LpQ": { name: "cosby-poster-that-john-drew-on", title: "Cosby Poster (John's Art)", img: "cosby-poster-that-john-drew-on.png" },
  "CuP28LpQ": { name: "painting-of-a-horse-attacking-a-football-player", title: "Horse vs Football Player Painting", img: "painting-of-a-horse-attacking-a-football-player.png" },
  "CuP28LnQ": { name: "clean-cosby-poster", title: "Clean Cosby Poster", img: "clean-cosby-poster.png" },
  "Q82a0H54": { name: "cruxite-bottle", title: "Cruxite Bottle", img: "cruxite-bottle.png" },
  "?0YFY90!": { name: "dutton-photo", title: "Charles Dutton Photo", img: "dutton-photo.png" },
  "L229BxoG": { name: "punch-designix", title: "Punch Designix", img: "punch-designix.png" },
  "PCHOOOOO": { name: "rocket-pack", title: "Rocket Pack", img: "rocket-pack.png" },
  "pshoooes": { name: "rocket-boots", title: "Rocket Boots", img: "rocket-boots.png" },
  "PSWOOOOP": { name: "rocket-wings", title: "Rocket Wings", img: "rocket-wings.png" },
  "WIin189Q": { name: "fear-no-anvil", title: "Fear No Anvil", img: "fear-no-anvil.png" },
  "72KH?CNq": { name: "roses-journals", title: "Rose's Journals", img: "roses-journals.png" },
  "FFFFFFWW": { name: "ahabs-crosshairs", title: "Ahab's Crosshairs", img: "ahabs-crosshairs.png" },
  "r5jQS?v2": { name: "box-of-chalk", title: "Box of Chalk", img: "box-of-chalk.png" },
  "82THE8TH": { name: "fluorite-octet", title: "Fluorite Octet", img: "fluorite-octet.png" },
  "qG4e0H5C": { name: "cruxite-dog-pinata", title: "Cruxite Dog Piñata", img: "cruxite-dog-pinata.png" },
  "uROBuROS": { name: "red-sucker", title: "Red Sucker", img: "red-sucker.png" },
  "UrobUros": { name: "green-sucker", title: "Green Sucker", img: "green-sucker.png" },
  "!!!!!!!!": { name: "perfectly-unique-object", title: "Perfectly Unique Object", img: "perfectly-unique-object.png" }
};

/**
 * Custom Base64 code comparator adhering strictly to the calculator's CIPHER ordering:
 * 0-9 (0..9) < A-Z (10..35) < a-z (36..61) < ? (62) < ! (63)
 * @param {string} codeA 
 * @param {string} codeB 
 * @returns {number}
 */
export function compareBase64Codes(codeA = "", codeB = "") {
  const len = Math.max(codeA.length, codeB.length);
  for (let i = 0; i < len; i++) {
    const charA = codeA[i] || "";
    const charB = codeB[i] || "";
    if (charA === charB) continue;

    const idxA = CIPHER.indexOf(charA);
    const idxB = CIPHER.indexOf(charB);

    const valA = idxA !== -1 ? idxA : (charA ? 1000 + charA.charCodeAt(0) : -1);
    const valB = idxB !== -1 ? idxB : (charB ? 1000 + charB.charCodeAt(0) : -1);

    return valA - valB;
  }
  return 0;
}

/**
 * Returns item metadata for a code string.
 * @param {string} code 
 * @returns {object|null} Item metadata or null if unknown
 */
export function getItemByCode(code) {
  if (!code) return null;
  return ITEMS_DATABASE[code] || null;
}

/**
 * Gets the image URL for an item code.
 * @param {string} code 
 * @returns {string|null} Relative path to item image or null
 */
export function getItemImageUrl(code) {
  const item = getItemByCode(code);
  if (item) {
    return `img/item/${item.img}`;
  }
  return null;
}

/**
 * Search items prioritizing captchalogue code prefix matches first, followed by item title/name matches.
 * Codes only match if they start with the query.
 * @param {string} query 
 * @returns {Array<{code: string, title: string, name: string}>}
 */
export function searchItems(query = "") {
  let q = String(query).trim();
  const allCodes = Object.keys(ITEMS_DATABASE);

  let matches = performSearch(q, allCodes);

  // Fallback: If user appended text after a code (e.g. "DQMmJLeKpogo"), search trailing query
  if (matches.length === 0 && q.length > 8 && ITEMS_DATABASE[q.slice(0, 8)]) {
    const trailingQ = q.slice(8).trim();
    if (trailingQ) {
      matches = performSearch(trailingQ, allCodes);
    }
  }

  return matches;
}

function performSearch(q, allCodes) {
  if (!q) {
    return allCodes
      .sort(compareBase64Codes)
      .map(code => ({ code, ...ITEMS_DATABASE[code] }));
  }

  const qLower = q.toLowerCase();
  const queryWords = qLower.split(/\s+/).filter(Boolean);

  const codeMatches = [];
  const titleMatches = [];

  allCodes.forEach(code => {
    const item = ITEMS_DATABASE[code];
    const codeLower = code.toLowerCase();
    const titleLower = (item.title || "").toLowerCase();
    const nameLower = (item.name || "").toLowerCase();

    // 1. Code Prefix Match: code MUST start with the query
    if (codeLower.startsWith(qLower)) {
      codeMatches.push({ code, ...item });
      return;
    }

    // 2. Title / Name Word-Prefix Match (Word Cluster Matching)
    const titleWords = titleLower.split(/[\s\-_()',".!?:;]+/).filter(Boolean);
    const nameWords = nameLower.split(/[\s\-_()',".!?:;]+/).filter(Boolean);
    const wordClusters = [...new Set([...titleWords, ...nameWords])];

    const matchesWordPrefixes = queryWords.every(qWord =>
      wordClusters.some(cluster => cluster.startsWith(qWord))
    );

    if (matchesWordPrefixes) {
      titleMatches.push({ code, ...item });
    }
  });

  // Sort code-prefix matches: exact case code prefix first, then cipher order
  codeMatches.sort((a, b) => {
    const aExact = a.code.startsWith(q);
    const bExact = b.code.startsWith(q);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return compareBase64Codes(a.code, b.code);
  });

  // Sort title matches: titles starting with query first, then cipher order
  titleMatches.sort((a, b) => {
    const aTitleStart = (a.title || "").toLowerCase().startsWith(qLower);
    const bTitleStart = (b.title || "").toLowerCase().startsWith(qLower);
    if (aTitleStart && !bTitleStart) return -1;
    if (!aTitleStart && bTitleStart) return 1;
    return compareBase64Codes(a.code, b.code);
  });

  return [...codeMatches, ...titleMatches];
}

/**
 * Curated preset combinations for demonstration and quick testing.
 */
export const PRESET_RECIPES = [
  {
    name: "Pogo Hammer",
    card1: "nZ7Un6BI", // Claw Hammer
    card2: "DQMmJLeK", // Green Slime Ghost Pogo
    operator: "&&",
    opKey: "AND",
    description: "Combine Claw Hammer && Green Slime Ghost Pogo to create Pogo Hammer!"
  },
  {
    name: "Hammerhead Pogo Ride",
    card1: "nZ7Un6BI", // Claw Hammer
    card2: "DQMmJLeK", // Green Slime Ghost Pogo
    operator: "||",
    opKey: "OR",
    description: "Combine Claw Hammer || Green Slime Ghost Pogo to create Hammerhead Pogo Ride!"
  },
  {
    name: "Horse vs Football Player Painting",
    card1: "00080020", // Joker Figurine
    card2: "CuPA8LnQ", // Potted Plant
    operator: "^^",
    opKey: "XOR",
    description: "Combine Joker Figurine ^^ Potted Plant to create Horse Painting!"
  },
  {
    name: "Clean Cosby Poster (AND)",
    card1: "CuPA8LnQ", // Potted Plant
    card2: "CuP28LpQ", // Horse vs Football Player Painting
    operator: "&&",
    opKey: "AND",
    description: "Combine Potted Plant && Horse Painting to create Clean Cosby Poster!"
  },
  {
    name: "Clean Cosby Poster (ABJ)",
    card1: "CuPA8LnQ", // Potted Plant
    card2: "00080020", // Joker Figurine
    operator: "ABJ",
    opKey: "ABJ",
    description: "Combine Potted Plant ABJ Joker Figurine to create Clean Cosby Poster!"
  },
  {
    name: "Cosby Poster Modification",
    card1: "CuPA8LnQ", // Potted Plant
    card2: "CuPA8LpQ", // Cosby Poster (John's Art)
    operator: "||",
    opKey: "OR",
    description: "Combine Potted Plant || Cosby Poster (John's Art)!"
  },
  {
    name: "Joker Figurine",
    card1: "CuP28LnQ", // Clean Cosby Poster
    card2: "CuPA8LpQ", // Cosby Poster (John's Art)
    operator: "^^",
    opKey: "XOR",
    description: "Combine Clean Cosby Poster ^^ Cosby Poster to create Joker Figurine!"
  },
  {
    name: "Generic Object",
    card1: "00000000", // Perfectly Generic Object
    card2: "11111111", // Captchalogue Card
    operator: "&&",
    opKey: "AND",
    description: "Alchemize Perfectly Generic Object with Captchalogue Card!"
  }
];
