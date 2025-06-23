import { memo } from 'react';
import { useSelector } from 'react-redux';

import { LanguageSelector } from '../componentsIndex';

/**
 * Toolbar component for editor controls.
 * @param {object} props - Props for the component.
 * @param {string} props.handleFormatCode - Callback to format code in the editor.
 * @param {boolean} props.handleRunCode - Callback to run the code.
 * @param {boolean} props.handleLanguageChange - Callback to change language for the editor.
 * @returns {JSX.Element} The editor toolbar with LanguageSelector and all the controls required for the editor.
 */
function EditorToolbar({
    handleFormatCode,
    handleRunCode,
    handleLanguageChange,
    handleSaveAllFiles,
}) {
    const { language } = useSelector((state) => state.editor);

    return (
        <div
            className="flex flex-grow justify-between pb-4"
            role="toolbar"
            aria-label="Editor toolbar"
        >
            <LanguageSelector
                selectedLanguage={language}
                onLanguageChange={handleLanguageChange}
            />
            <div className="flex gap-4">
                <button
                    onClick={handleFormatCode}
                    className="cursor-pointer rounded bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 focus:bg-blue-600 focus:outline-1 focus:outline-offset-2 focus:outline-blue-400"
                    aria-label="Format code"
                >
                    Format
                </button>
                <button
                    onClick={handleRunCode}
                    className="cursor-pointer rounded bg-green-500 px-3 py-1.5 text-white hover:bg-green-600 focus:bg-green-600 focus:outline-1 focus:outline-offset-2 focus:outline-green-400"
                    aria-label="Run code"
                >
                    Run
                </button>
                <button
                    onClick={handleSaveAllFiles}
                    className="cursor-pointer rounded bg-gray-500 p-2 text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-1 focus:outline-offset-2 focus:outline-gray-400"
                    aria-label="Save all files"
                >
                    Save all
                </button>
            </div>
        </div>
    );
}

export default memo(EditorToolbar);
