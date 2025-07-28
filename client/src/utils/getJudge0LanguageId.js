import { judge0LanguagesIds } from '../conf/languages';

/**
 * Retrieves Judge0 language id for given language extension.
 * @param {string} languageExtension - The programming language extension.
 * @returns {number} Judge0 language id or id of plain text if undefined.
 */
export function getJudge0LanguageId(language) {
    return judge0LanguagesIds[language] || 43;
}
