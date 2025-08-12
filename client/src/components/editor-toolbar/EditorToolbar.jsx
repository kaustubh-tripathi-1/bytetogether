import React, { memo, useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import {
    Files,
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
 * @param {Object} props Props for the component.
 * @param {React.ComponentState<string>} props.language Current language for code in the editor.
 * @param {Function} props.handleFormatCode Callback to format code in the editor.
 * @param {Function} props.handleRunCode Callback to run the code.
 * @param {Function} props.handleLanguageChange Callback to change language for the editor.
 * @param {Function} props.handleSaveAllFiles Callback to save all files to DB.
 * @param {number} props.fileCount Number of files in state.
 * @param {Function} props.handleOpenSettings Callback to open settings modal.
 * @param {Function} props.handleOpenKeyboardShortcuts Callback to open keyboard shortcuts modal.
 * @param {Function} props.handleResetCode Callback to reset code to language default.
 * @param {Function} props.handleInvite Callback to invite a collaborator.
 * @param {React.ComponentState<boolean>} props.isAdmin Whether the user is admin or not.
 * @param {Function} props.handleEndRoom Callback to end the collab room if admin or just leave the room if non-admin.
 * @param {React.ComponentState<Object>} props.yjsResources Yjs resources liek Ydoc, YText, Awareness and WSPRovider.
 * @param {React.SetStateAction<Function>} props.setIsYjsConnected State setter for isYjsConnected state.
 * @returns {JSX.Element} The memoized editor toolbar with editor controls.
 */
function EditorToolbar({
    // language,
    handleFormatCode,
    handleRunCode,
    // handleLanguageChange,
    handleSaveAllFiles,
    fileCount,
    handleOpenSettings,
    handleOpenKeyboardShortcuts,
    handleResetCode,
    handleInvite,
    isAdmin,
    handleEndRoom,
    yjsResources,
    setIsYjsConnected,
    toggleFileExplorer,
}) {
    const { executionMode } = useSelector((state) => state.execution);

    const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
    const inviteButtonRef = useRef(null);

    function handleInviteClick() {
        setIsInvitePanelOpen((prev) => !prev);
    }

    const closeAdminPanel = useCallback(() => {
        setIsInvitePanelOpen(false);
    }, []);

    const handleEndSession = useCallback(() => {
        handleEndRoom();
        setIsYjsConnected(false);
        setIsInvitePanelOpen(false);
    }, [handleEndRoom, setIsYjsConnected]);

    return (
        <div
            className="flex w-full flex-grow items-center justify-center gap-1 pb-4"
            role="toolbar"
            aria-label="Editor toolbar"
        >
            <div className="flex items-center justify-center gap-2">
                <Tooltip content={'File Explorer'}>
                    <button
                        className="flex cursor-pointer items-center justify-center rounded-xl p-1 hover:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        onClick={toggleFileExplorer}
                    >
                        <Files width={2} height={2} />
                    </button>
                </Tooltip>
                {/* <LanguageSelector
                selectedLanguage={language}
                onLanguageChange={handleLanguageChange}
            /> */}
                <ModeSelector />
            </div>
            <div className="flex w-full items-center justify-center gap-1 sm:gap-8 md:justify-end md:gap-1.5">
                <Tooltip content={'Format code'}>
                    <button
                        onClick={handleFormatCode}
                        className="cursor-pointer rounded-full px-3 pt-2.25 pb-2 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Format code"
                    >
                        <Format width={1.2} height={1.2} />
                    </button>
                </Tooltip>
                {executionMode === 'judge0' && (
                    <Tooltip content={'Run code'}>
                        <button
                            onClick={handleRunCode}
                            className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-green-400 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                            aria-label="Run code"
                        >
                            <Run width={1.2} height={1.2} />
                        </button>
                    </Tooltip>
                )}
                <Tooltip content={'Reset code'}>
                    <button
                        onClick={handleResetCode}
                        className="cursor-pointer rounded-full px-3 pt-2.5 pb-2 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Reset code to language default"
                    >
                        <Reset width={1} height={1} />
                    </button>
                </Tooltip>
                <Tooltip
                    content={fileCount > 1 ? 'Save all files' : 'Save file'}
                >
                    <button
                        onClick={handleSaveAllFiles}
                        className="cursor-pointer rounded-full pt-2 pr-3.5 pb-1.5 pl-3 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label={
                            fileCount > 1 ? 'Save all files' : 'Save file'
                        }
                    >
                        {fileCount > 1 ? (
                            <SaveAll width={1.2} height={1.2} />
                        ) : (
                            <Save width={1.1} height={1.1} />
                        )}
                    </button>
                </Tooltip>
                <Tooltip content={'Settings'}>
                    <button
                        onClick={handleOpenSettings}
                        className="cursor-pointer rounded-full px-3 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Open settings"
                    >
                        <Settings width={1.3} height={1.3} />
                    </button>
                </Tooltip>
                <Tooltip content={'Keyboard shortcuts'}>
                    <button
                        onClick={handleOpenKeyboardShortcuts}
                        className="cursor-pointer rounded-full px-3 pt-2.25 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                        aria-label="Open Keyboard shortcuts"
                    >
                        <Keyboard width={1.3} height={1.3} />
                    </button>
                </Tooltip>
                {executionMode === 'judge0' && (
                    <>
                        <Tooltip content={'Invite'}>
                            <button
                                ref={inviteButtonRef}
                                onClick={handleInviteClick}
                                className="cursor-pointer rounded-full px-2.5 pt-2 pb-1.5 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                                aria-label="Invite collaborators"
                            >
                                <Invite width={1.4} height={1.4} />
                            </button>
                        </Tooltip>
                        <AnimatePresence>
                            {isAdmin && isInvitePanelOpen && (
                                <InviteAdminPanel
                                    isOpen={isInvitePanelOpen}
                                    key={'InviteAdminPanel'}
                                    onClose={closeAdminPanel}
                                    awareness={yjsResources.awareness}
                                    onEndSession={handleEndSession}
                                    onCopyLink={handleInvite}
                                    anchorRef={inviteButtonRef}
                                />
                            )}{' '}
                            {!isAdmin && isInvitePanelOpen && (
                                <InvitePanel
                                    isOpen={isInvitePanelOpen}
                                    key={'InvitePanel'}
                                    onClose={closeAdminPanel}
                                    awareness={yjsResources.awareness}
                                    onEndSession={handleEndSession}
                                    onCopyLink={handleInvite}
                                    anchorRef={inviteButtonRef}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(EditorToolbar);
