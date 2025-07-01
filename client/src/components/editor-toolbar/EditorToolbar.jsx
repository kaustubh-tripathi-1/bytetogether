import { memo } from 'react';
import { useSelector } from 'react-redux';

import {
    Format,
    Keyboard,
    LanguageSelector,
    Reset,
    Run,
    Save,
    SaveAll,
    Settings,
} from '../componentsIndex';

/**
 * Toolbar component for editor controls.
 * @param {object} props - Props for the component.
 * @param {Function} props.handleFormatCode - Callback to format code in the editor.
 * @param {Function} props.handleRunCode - Callback to run the code.
 * @param {Function} props.handleLanguageChange - Callback to change language for the editor.
 * @param {Function} props.handleSaveAllFiles - Callback to save all files to DB.
 * @param {number} props.fileCount - Number of files in state.
 * @param {Function} props.handleOpenSettings - Callback to open settings modal.
 * @param {Function} props.handleOpenKeyboardShortcuts - Callback to open keyboard shortcuts modal.
 * @param {Function} props.handleResetCode - Callback to reset code to language default.
 * @returns {JSX.Element} The memoized editor toolbar with LanguageSelector and other editor controls.
 */
function EditorToolbar({
    handleFormatCode,
    handleRunCode,
    handleLanguageChange,
    handleSaveAllFiles,
    fileCount,
    handleOpenSettings,
    handleOpenKeyboardShortcuts,
    handleResetCode,
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
            <div className="flex items-center gap-1">
                <button
                    onClick={handleFormatCode}
                    className="cursor-pointer rounded-full px-3 pt-2 pb-2 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label="Format code"
                >
                    <Format />
                </button>
                <button
                    onClick={handleRunCode}
                    className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-green-400 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label="Run code"
                >
                    <Run />
                </button>
                <button
                    onClick={handleResetCode}
                    className="cursor-pointer rounded-full px-3 pt-2.25 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label="Reset code to language default"
                >
                    <Reset width={1.2} height={1.2} />
                </button>
                <button
                    onClick={handleSaveAllFiles}
                    className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label={fileCount > 1 ? 'Save all files' : 'Save file'}
                >
                    {fileCount > 1 ? (
                        <SaveAll width={1.3} height={1.3} />
                    ) : (
                        <Save width={1.3} height={1.3} />
                    )}
                </button>
                <button
                    onClick={handleOpenSettings}
                    className="cursor-pointer rounded-full px-3 pt-2.25 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label="Open settings"
                >
                    <Settings width={1.6} height={1.6} />
                </button>
                <button
                    onClick={handleOpenKeyboardShortcuts}
                    className="cursor-pointer rounded-full px-3 pt-2.25 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                    aria-label="Open Keyboard shortcuts"
                >
                    <Keyboard width={1.6} height={1.6} />
                </button>
            </div>
        </div>
    );
}

export default memo(EditorToolbar);
