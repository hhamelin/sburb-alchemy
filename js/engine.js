/**
 * Sburb Alchemy Engine
 * Encodes and decodes 8-character captchalogue codes into 48-bit binary representations
 * and performs bitwise alchemy operations (AND, OR, XOR, ABJ).
 */

export const CIPHER = [
  "0","1","2","3","4","5","6","7","8","9",
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
  "?","!"
];

/**
 * Encodes an 8-character code string into a 48-element binary array (0 or 1).
 * @param {string} code 
 * @returns {number[]} Array of 48 binary digits (0 or 1)
 */
export function encodeCode(code = "") {
  const binaryArray = new Array(48).fill(0);
  const normalized = String(code).padEnd(8, "0").slice(0, 8);

  for (let i = 0; i < 8; i++) {
    const char = normalized[i];
    let charIndex = CIPHER.indexOf(char);
    if (charIndex === -1) charIndex = 0;

    let charVal = charIndex;
    for (let j = 1; j <= 6; j++) {
      binaryArray[(i * 6) + 6 - j] = charVal % 2;
      charVal = Math.floor(charVal / 2);
    }
  }

  return binaryArray;
}

/**
 * Decodes a 48-element binary array back into an 8-character code string.
 * @param {number[]} binaryArray 
 * @returns {string} 8-character captchalogue code
 */
export function decodeCode(binaryArray = []) {
  if (!Array.isArray(binaryArray) || binaryArray.length < 48) {
    return "00000000";
  }

  let result = "";
  for (let i = 0; i < 8; i++) {
    const sixBits = binaryArray.slice(i * 6, (i + 1) * 6);
    const charVal = parseInt(sixBits.join(""), 2) || 0;
    result += CIPHER[charVal] || "0";
  }

  return result;
}

/**
 * Performs Alchemy operation between two 48-bit arrays.
 * @param {number[]} bits1 
 * @param {number[]} bits2 
 * @param {'AND' | 'OR' | 'XOR' | 'ABJ'} operator 
 * @returns {number[]} Resulting 48-bit array
 */
export function alchemizeBits(bits1, bits2, operator) {
  const b1 = bits1.length === 48 ? bits1 : encodeCode(bits1);
  const b2 = bits2.length === 48 ? bits2 : encodeCode(bits2);
  const result = new Array(48).fill(0);

  for (let i = 0; i < 48; i++) {
    const v1 = b1[i] ? 1 : 0;
    const v2 = b2[i] ? 1 : 0;

    switch (operator) {
      case "AND":
        result[i] = v1 & v2;
        break;
      case "OR":
        result[i] = v1 | v2;
        break;
      case "XOR":
        result[i] = v1 ^ v2;
        break;
      case "ABJ":
        // ABJ / Abjure: AND NOT (Keep bit from b1 only if b2 bit is 0)
        result[i] = (v1 === 1 && v2 === 0) ? 1 : 0;
        break;
      default:
        result[i] = 0;
        break;
    }
  }

  return result;
}
