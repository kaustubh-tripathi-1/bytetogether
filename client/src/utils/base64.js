/**
 * Converts a Uint8Array to a Base64-encoded string.
 * Safe for all UTF-8 characters (emojis, symbols, etc.)
 * @param {Uint8Array} bytes Stream of Uint8Array bytes
 * @returns {string} A Base64-encoded string
 */
function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte)
    ).join('');
    return btoa(binString);
}

/**
 * Converts a Base64-encoded string to a Uint8Array.
 * @param {string} base64 A Base64-encoded string
 * @returns Stream of Uint8Array bytes
 */
function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (char) => char.codePointAt(0));
}

/**
 * Encodes a raw UTF-8 string into a Base64 string.
 * Safe for all languages, symbols, emojis, etc.
 * @param {string} str UTF-8 string
 * @returns {string} Base64-encoded string
 */
export function encodeToBase64(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    return bytesToBase64(utf8Bytes);
}

/**
 * Decodes a Base64 string back into its original UTF-8 string.
 * @param {string} base64 Base64-encoded string
 * @returns {string} UTF-8 string
 */
export function decodeFromBase64(base64) {
    const bytes = base64ToBytes(base64);
    return new TextDecoder().decode(bytes);
}
