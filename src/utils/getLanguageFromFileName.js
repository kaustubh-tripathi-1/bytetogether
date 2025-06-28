import { languageMap } from '../conf/languages';

/**
 * Returns language name from the name of file
 * @param {string} fileName - The name of the file
 * @returns {string} The full language name
 */
export function getLanguageFromFileName(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();

    return languageMap[extension]?.value || 'plaintext';
}
