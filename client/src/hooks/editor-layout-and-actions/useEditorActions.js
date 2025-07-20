import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import {
    connectYjsForFile,
    disconnectAllYjs,
    disconnectYjsForFile,
    getOrCreateYDoc,
} from '../../lib/yjs';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';
import {
    saveAllFilesForNewProject,
    updateAllFilesForExistingProject,
} from '../../store/slices/filesSlice';
import { addNotification, setModalType } from '../../store/slices/uiSlice';
import { getDefaultCodeForLanguage } from '../../utils/getDefaultCodeForLanguage';
import {
    setCodeContent,
    setEditorSettings,
    setLanguage,
    setSelectedFile,
} from '../../store/slices/editorSlice';
import { setPreferences } from '../../store/slices/userSlice';

/**
 * Custom hook that provides reusable editor-related actions such as formatting,
 * running code, saving files, managing settings UI, handling collaboration (Yjs) and file and language changes.
 *
 * @param {Object} options
 * @param {boolean} options.isNewProject Whether the project is newly created.
 * @param {string} options.projectId Unique ID of the project.
 * @param {React.RefObject} options.editorRef Ref to the Monaco editor instance.
 * @param {Array} options.files List of all files in the current project.
 * @param {Object} options.selectedFile Currently selected file object.
 * @param {string} options.codeContent Current code content of the editor.
 * @param {string} options.language Currently selected programming language.
 * @param {Object} options.settings Current editor settings from Redux.
 * @param {React.SetStateAction} options.setOutput Setter to update output (used in run simulation).
 * @param {string} options.input Custom input provided by user for code execution.
 * @param {React.ComponentState<boolean>} options.isYjsConnected Whether Yjs collaboration is active.
 * @param {React.SetStateAction} options.setIsSettingsOpen Setter to control settings modal visibility.
 * @param {React.SetStateAction} options.setIsShortcutsOpen Setter to control shortcuts modal visibility.
 * @param {React.SetStateAction} options.setIsYjsConnected Setter to enable/disable Yjs collaboration.
 * @param {React.SetStateAction} options.setIsInvited Setter to mark user as invited in a session.
 * @param {React.SetStateAction} options.setIsAdmin Setter to mark user as admin of a room.
 * @param {React.ComponentState<Object>} options.yjsResources Contains yText, yDoc, and awareness instances.
 *
 * @returns {Object} Memoized Editor action handlers
 * @returns {Function} handleFileChange - Changes the selected file.
 * @returns {Function} handleLanguageChange - Changes the selected language in Monaco.
 * @returns {Function} handleFormatCode - Formats the code using Monaco's formatter.
 * @returns {Function} handleRunCode - Simulates running code using current content and input.
 * @returns {Function} handleSaveAllFiles - Saves all files to Appwrite (new or existing project).
 * @returns {Function} handleOpenSettings - Opens the settings modal.
 * @returns {Function} handleOpenKeyboardShortcuts - Opens the keyboard shortcuts modal.
 * @returns {Function} handleCloseSettings - Closes the settings modal.
 * @returns {Function} handleCloseKeyboardShortcuts - Closes the keyboard shortcuts modal.
 * @returns {Function} handleResetCode - Resets the current file content to default template.
 * @returns {Function} handleFontSizeIncrement - Increases font size (max 24).
 * @returns {Function} handleFontSizeDecrement - Decreases font size (min 10).
 * @returns {Function} handleWordWrapChange - Toggles word wrap setting.
 * @returns {Function} handleMinimapChange - Toggles minimap visibility.
 * @returns {Function} handleStickyScrollChange - Toggles sticky scroll setting.
 * @returns {Function} handleTabSizeChange - Updates tab size based on dropdown.
 * @returns {Function} handleInvite - Starts or copies invite link for Yjs collaboration.
 */

export function useEditorActions({
    isNewProject,
    projectId,
    editorRef,
    files,
    selectedFile,
    codeContent,
    language,
    settings,
    setOutput,
    input,
    isYjsConnected,
    setIsYjsConnected,
    setIsSettingsOpen,
    setIsShortcutsOpen,
    isAdmin,
    setIsAdmin,
    yjsResources,
    setYjsResources,
    currentConnectedFileIdRef,
    username,
    navigate,
    location,
}) {
    const dispatch = useDispatch();

    /**
     * Handler to switch between files by their ID.
     * @param {Event} event - File selection change event.
     */
    const handleFileChange = useCallback(
        (event) => {
            const fileId = event.target.value;
            const file = files.find((f) => f.$id === fileId);
            if (file) {
                dispatch(
                    setSelectedFile({
                        $id: file.$id,
                        fileName: file.fileName,
                        content: file.content, // This content is what Yjs will potentially use to initialize
                    })
                );
            }
        },
        [dispatch, files]
    );

    /**
     * Handles language change by updating the editor state and loading appropriate code.
     * @param {string} newLanguage - The newly selected language.
     */
    const handleLanguageChange = useCallback(
        (newLanguage) => {
            dispatch(setLanguage(newLanguage));

            //TODO Check this
            const file = files.find((f) => f.$id === selectedFile.$id);
            if (!file) {
                const defaultCode = getDefaultCodeForLanguage(newLanguage);
                if (yjsResources.yText && isYjsConnected) {
                    yjsResources.yText.delete(0, yjsResources.yText.length);
                    yjsResources.yText.insert(0, defaultCode);
                }
                dispatch(setCodeContent(defaultCode));
                return;
            }
            const savedLanguage = getLanguageFromFileName(file.fileName);
            if (savedLanguage !== newLanguage) {
                const defaultCode = getDefaultCodeForLanguage(newLanguage);
                if (yjsResources.yText && isYjsConnected) {
                    yjsResources.yText.delete(0, yjsResources.yText.length);
                    yjsResources.yText.insert(0, defaultCode);
                }
                dispatch(setCodeContent(defaultCode));
                return;
            }
            if (yjsResources.yText && isYjsConnected) {
                yjsResources.yText.delete(0, yjsResources.yText.length);
                yjsResources.yText.insert(0, file.content || '');
            }
            dispatch(setCodeContent(file.content || ''));
        },
        [dispatch, files, isYjsConnected, selectedFile, yjsResources.yText]
    );

    /**
     * Format code in Editor using the ref
     */
    const handleFormatCode = useCallback(() => {
        editorRef.current?.trigger(
            'format',
            'editor.action.formatDocument',
            {}
        );
    }, [editorRef]);

    /**
     * Placeholder for running code (to be implemented in Phase 6)
     */
    const handleRunCode = useCallback(() => {
        try {
            if (isYjsConnected) {
                const { yText } = getOrCreateYDoc(
                    selectedFile.$id,
                    username,
                    isAdmin
                );
                // Simulate output for now
                setOutput(
                    `Simulated output for:\n${yText ? yText.toString() : codeContent}\nInput:\n${input}`
                );
                return;
            }

            setOutput(
                `Simulated output for:\n${codeContent}\nInput:\n${input}`
            );
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to retrieve shared code! with error${error} Please try again...`,
                    type: 'error',
                })
            );
        }
    }, [
        codeContent,
        dispatch,
        input,
        isAdmin,
        isYjsConnected,
        selectedFile,
        setOutput,
        username,
    ]);

    /**
     * Saves the current file content and metadata to Appwrite.
     */
    const handleSaveAllFiles = useCallback(() => {
        try {
            const filesToSave = files.map((file) => {
                const { yText } = getOrCreateYDoc(file.$id, username, isAdmin);
                return {
                    $id: file.$id,
                    name: file.fileName,
                    language: getLanguageFromFileName(file.fileName),
                    content:
                        file.$id === selectedFile?.$id && isYjsConnected
                            ? yText.toString()
                            : file.content || '', // Save yText content for selected file
                };
            });

            if (isNewProject) {
                dispatch(
                    saveAllFilesForNewProject({
                        projectName: 'default',
                        files: filesToSave.filter((file) => !file.$id), // Only new files
                    })
                );
            } else {
                dispatch(
                    updateAllFilesForExistingProject(
                        filesToSave.filter((file) => file.$id) // Only existing files
                    )
                );
            }

            dispatch(
                addNotification({
                    message: 'Files saved successfully',
                    type: 'success',
                })
            );
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to save with ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    }, [
        dispatch,
        files,
        isAdmin,
        isNewProject,
        isYjsConnected,
        selectedFile,
        username,
    ]);

    /**
     * Open Settings modal
     */
    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
        dispatch(setModalType('settings'));
    }, [dispatch, setIsSettingsOpen]);

    /**
     * Open Keyboard shortcuts modal
     */
    const handleOpenKeyboardShortcuts = useCallback(() => {
        setIsShortcutsOpen(true);
        dispatch(setModalType('keyboard-shortcuts'));
    }, [dispatch, setIsShortcutsOpen]);

    /**
     * Close Settings modal
     */
    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
        dispatch(setModalType(null));
    }, [dispatch, setIsSettingsOpen]);

    /**
     * Close Keyboard shortcuts modal
     */
    const handleCloseKeyboardShortcuts = useCallback(() => {
        setIsShortcutsOpen(false);
        dispatch(setModalType(null));
    }, [dispatch, setIsShortcutsOpen]);

    /**
     * Reset code to language defualt
     */
    const handleResetCode = useCallback(() => {
        try {
            const { yText } = getOrCreateYDoc(
                selectedFile.$id,
                username,
                isAdmin
            );
            const defaultCode = getDefaultCodeForLanguage(language);
            yText.delete(0, yText.length);
            yText.insert(0, defaultCode);
            dispatch(setCodeContent(defaultCode));
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to reset with error ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    }, [dispatch, isAdmin, language, selectedFile, username]);

    /**
     * Handler for font size increment
     */
    const handleFontSizeIncrement = useCallback(() => {
        const newSize = Math.min(24, settings.fontSize + 1);
        dispatch(setEditorSettings({ fontSize: newSize }));
        dispatch(setPreferences({ fontSize: newSize }));
    }, [dispatch, settings.fontSize]);

    /**
     * Handler for font size decrement
     */
    const handleFontSizeDecrement = useCallback(() => {
        const newSize = Math.max(10, settings.fontSize - 1);
        dispatch(setEditorSettings({ fontSize: newSize }));
        dispatch(setPreferences({ fontSize: newSize }));
    }, [dispatch, settings.fontSize]);

    /**
     * Handler for word wrap change
     */
    const handleWordWrapChange = useCallback(
        (e) => {
            dispatch(
                setEditorSettings({ wordWrap: e.target.checked ? 'on' : 'off' })
            );
        },
        [dispatch]
    );

    /**
     * Handler for minimap change
     */
    const handleMinimapChange = useCallback(
        (e) => {
            dispatch(
                setEditorSettings({
                    minimap: e.target.checked,
                })
            );
        },
        [dispatch]
    );

    /**
     * Handler for minimap change
     */
    const handleStickyScrollChange = useCallback(
        (e) => {
            dispatch(
                setEditorSettings({
                    stickyScroll: e.target.checked,
                })
            );
        },
        [dispatch]
    );

    /**
     * Handler for tab size change
     */
    const handleTabSizeChange = useCallback(
        (e) => {
            dispatch(setEditorSettings({ tabSize: Number(e.target.value) }));
        },
        [dispatch]
    );

    /**
     * Invite and open WebSocket connection
     */
    const handleInvite = useCallback(() => {
        //TODO Enable this for prod
        /* if (!projectId) {
            dispatch(
                addNotification({
                    message: `Save the project first`,
                    type: 'warn',
                })
            );
            return;
        } */

        // Just copy the url and show noti if already connected
        try {
            if (!isAdmin) {
                window.navigator.clipboard.writeText(window.location.href);

                dispatch(
                    addNotification({
                        message: '✅ Invite Link copied',
                        type: 'success',
                    })
                );
                return;
            }

            setIsYjsConnected(true);
            setIsAdmin(true);
            const currentProjectId = projectId || 'bytetogether'; // Fallback to default

            // Connect Yjs for the current room
            connectYjsForFile(selectedFile.$id, username);

            const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true&admin=${!isAdmin}&room=${currentProjectId}&file=${selectedFile.$id}&username=${username}&clientId=${yjsResources.yDoc?.clientID || Date.now()}`;

            window.navigator.clipboard.writeText(inviteUrl);

            dispatch(
                addNotification({
                    message: '✅ Invite Link copied',
                    type: 'success',
                })
            );

            /* const currentProjectId = projectId || 'bytetogether';
            const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true&room=${currentProjectId}&file=${selectedFile.$id}&admin=${isAdmin}&username=${username}&clientId=${yjsResources.yDoc?.clientID || Date.now()}`;
            window.navigator.clipboard.writeText(inviteUrl);

            if (!yjsResources.wsProvider) {
                setIsYjsConnected(true);
                setIsAdmin(true);
                connectYjsForFile(selectedFile.$id, username);
                dispatch(
                    addNotification({
                        message: '✅ Invite Link copied',
                        type: 'success',
                        timeout: 4000,
                    })
                );
            } else {
                dispatch(
                    addNotification({
                        message: '✅ Invite Link copied',
                        type: 'success',
                        timeout: 4000,
                    })
                );
            } */
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Invite failed with error ${error}`,
                    type: 'error',
                })
            );
        }
    }, [
        isAdmin,
        setIsYjsConnected,
        setIsAdmin,
        projectId,
        selectedFile,
        username,
        yjsResources,
        dispatch,
    ]);

    const handleEndRoom = useCallback(() => {
        if (yjsResources.wsProvider) {
            try {
                if (isAdmin) {
                    yjsResources.wsProvider?.ws?.send(
                        JSON.stringify({
                            type: 'end-room',
                            //TODO replace this with projectId
                            room: `bytetogether-${currentConnectedFileIdRef.current}`,
                            clientId: yjsResources.yDoc?.clientID,
                            username,
                        })
                    );
                    disconnectAllYjs();
                    dispatch(
                        addNotification({
                            message:
                                '✅ Room closed and session ended successfully',
                            type: 'success',
                            timeout: 4000,
                        })
                    );
                } else {
                    yjsResources.wsProvider?.ws?.send(
                        JSON.stringify({
                            type: 'client-left',
                            //TODO replace this with projectId
                            room: `bytetogether-${currentConnectedFileIdRef.current}`,
                            clientId: yjsResources.yDoc?.clientID,
                            username,
                        })
                    );
                    disconnectYjsForFile(currentConnectedFileIdRef?.current);
                    dispatch(
                        addNotification({
                            message: '✅ Left room successfully',
                            type: 'success',
                            timeout: 4000,
                        })
                    );
                }

                setYjsResources({
                    yDoc: null,
                    yText: null,
                    awareness: null,
                    wsProvider: null,
                });
                setIsYjsConnected(false);
                // Notify clients or clean up state

                if (!isAdmin) {
                    const path = location.pathname;
                    navigate(`${path}`);
                }
            } catch (error) {
                dispatch(
                    addNotification({
                        message: `🔴 Error in ${isAdmin ? 'closing room' : 'leaving room'}: ${error.message}. Please try again...`,
                        type: 'error',
                        timeout: 4000,
                    })
                );
            }
        }
    }, [
        currentConnectedFileIdRef,
        dispatch,
        isAdmin,
        location.pathname,
        navigate,
        setIsYjsConnected,
        setYjsResources,
        username,
        yjsResources.wsProvider,
        yjsResources.yDoc?.clientID,
    ]);

    return {
        handleFileChange,
        handleLanguageChange,
        handleFormatCode,
        handleRunCode,
        handleSaveAllFiles,
        handleOpenSettings,
        handleOpenKeyboardShortcuts,
        handleCloseSettings,
        handleCloseKeyboardShortcuts,
        handleResetCode,
        handleFontSizeIncrement,
        handleFontSizeDecrement,
        handleWordWrapChange,
        handleMinimapChange,
        handleStickyScrollChange,
        handleTabSizeChange,
        handleInvite,
        handleEndRoom,
    };
}
