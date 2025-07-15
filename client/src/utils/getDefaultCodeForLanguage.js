import { defaultsSnippets } from '../conf/languages';

/**
 * Retrieves default code template for a given language.
 * @param {string} language - The programming language.
 * @returns {string} Default code template or empty string if not found.
 */
export function getDefaultCodeForLanguage(language) {
    return defaultsSnippets[language] || '';
}
