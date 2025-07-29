import { memo, useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import {
    Format,
    Invite,
    InviteAdminPanel,
    InvitePanel,
    Keyboard,
    LanguageSelector,
    ModeSelector,
    Reset,
    Run,
    Save,
    SaveAll,
    Settings,
    Tooltip,
} from '../componentsIndex';

/**
 * Toolbar component for editor controls.
 * @param {object} props Props for the component.
 * @param {Function} props.handleFormatCode Callback to format code in the editor.
 * @param {Function} props.handleRunCode Callback to run the code.
 * @param {Function} props.handleLanguageChange Callback to change language for the editor.
 * @param {Function} props.handleSaveAllFiles Callback to save all files to DB.
 * @param {number} props.fileCount Number of files in state.
 * @param {Function} props.handleOpenSettings Callback to open settings modal.
 * @param {Function} props.handleOpenKeyboardShortcuts Callback to open keyboard shortcuts modal.
 * @param {Function} props.handleResetCode Callback to reset code to language default.
 * @param {Function} props.handleInvite Callback to invite a collaborator.
 * @returns {JSX.Element} The memoized editor toolbar with LanguageSelector and other editor controls.
 */
function EditorToolbar({
    language,
    handleFormatCode,
    handleRunCode,
    handleLanguageChange,
    handleSaveAllFiles,
    fileCount,
    handleOpenSettings,
    handleOpenKeyboardShortcuts,
    handleResetCode,
    handleInvite,
    isAdmin,
    handleEndRoom,
    // onRemoveCollaborator,
    // collaborators,
    yjsResources,
    setIsYjsConnected,
}) {
    const { executionMode } = useSelector((state) => state.execution);

    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const inviteButtonRef = useRef(null);

    function handleInviteClick() {
        setIsAdminPanelOpen((prev) => !prev);
    }

    const closeAdminPanel = useCallback(() => {
        setIsAdminPanelOpen(false);
    }, []);

    const handleEndSession = useCallback(() => {
        handleEndRoom();
        setIsYjsConnected(false);
        setIsAdminPanelOpen(false);
    }, [handleEndRoom, setIsYjsConnected]);

    return (
        <div
            className="flex w-full flex-grow justify-center gap-1 pb-4"
            role="toolbar"
            aria-label="Editor toolbar"
        >
            <LanguageSelector
                selectedLanguage={language}
                onLanguageChange={handleLanguageChange}
            />
            <ModeSelector />
            <div className="flex w-full items-center justify-center gap-1 sm:gap-8 md:justify-end md:gap-1.5">
                <Tooltip content={'Format code'}>
                    <button
                        onClick={handleFormatCode}
                        className="cursor-pointer rounded-full px-3 pt-2.25 pb-2 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Format code"
                    >
                        <Format width={1.6} height={1.6} />
                    </button>
                </Tooltip>
                {executionMode === 'judge0' && (
                    <Tooltip content={'Run code'}>
                        <button
                            onClick={handleRunCode}
                            className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-green-400 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                            aria-label="Run code"
                        >
                            <Run />
                        </button>
                    </Tooltip>
                )}
                <Tooltip content={'Reset code'}>
                    <button
                        onClick={handleResetCode}
                        className="cursor-pointer rounded-full px-3 pt-2.5 pb-2 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Reset code to language default"
                    >
                        <Reset width={1.3} height={1.3} />
                    </button>
                </Tooltip>
                <Tooltip
                    content={fileCount > 1 ? 'Save all files' : 'Save file'}
                >
                    <button
                        onClick={handleSaveAllFiles}
                        className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label={
                            fileCount > 1 ? 'Save all files' : 'Save file'
                        }
                    >
                        {fileCount > 1 ? (
                            <SaveAll width={1.3} height={1.3} />
                        ) : (
                            <Save width={1.3} height={1.3} />
                        )}
                    </button>
                </Tooltip>
                <Tooltip content={'Settings'}>
                    <button
                        onClick={handleOpenSettings}
                        className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Open settings"
                    >
                        <Settings width={1.7} height={1.7} />
                    </button>
                </Tooltip>
                <Tooltip content={'Keyboard shortcuts'}>
                    <button
                        onClick={handleOpenKeyboardShortcuts}
                        className="cursor-pointer rounded-full px-3 pt-2.25 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Open Keyboard shortcuts"
                    >
                        <Keyboard width={1.7} height={1.7} />
                    </button>
                </Tooltip>
                <Tooltip content={'Invite'}>
                    <button
                        ref={inviteButtonRef}
                        onClick={handleInviteClick}
                        className="cursor-pointer rounded-full px-2.5 py-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Invite collaborators"
                    >
                        <Invite width={1.8} height={1.8} />
                    </button>
                </Tooltip>
                <AnimatePresence>
                    {isAdmin && isAdminPanelOpen && (
                        <InviteAdminPanel
                            isOpen={isAdminPanelOpen}
                            key={'InviteAdminPanel'}
                            onClose={closeAdminPanel}
                            awareness={yjsResources.awareness}
                            onEndSession={handleEndSession}
                            onCopyLink={handleInvite}
                            anchorRef={inviteButtonRef}
                        />
                    )}{' '}
                    {!isAdmin && isAdminPanelOpen && (
                        <InvitePanel
                            isOpen={isAdminPanelOpen}
                            key={'InvitePanel'}
                            onClose={closeAdminPanel}
                            awareness={yjsResources.awareness}
                            onEndSession={handleEndSession}
                            onCopyLink={handleInvite}
                            anchorRef={inviteButtonRef}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default memo(EditorToolbar);
