import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

import {
    setCodeContent,
    setEditorSettings,
    setLanguage,
    setSelectedFile,
} from '../../store/slices/editorSlice';
import {
    getFilesByProject,
    saveAllFilesForNewProject,
    updateAllFilesForExistingProject,
} from '../../store/slices/filesSlice.js';
import {
    CodeEditor,
    EditorToolbar,
    InputPanel,
    Modal,
    OutputPanel,
} from '../componentsIndex.js';
import { defaultsSnippets } from '../../conf/languages';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName.js';
import { modalConfig } from '../../conf/modalConfig.jsx';
import { addNotification, setModalType } from '../../store/slices/uiSlice.js';
import {
    getOrCreateYDoc,
    connectYjsForFile,
    disconnectYjsForFile,
    disconnectAllYjs,
} from '../../../lib/yjs.js';

/**
 * Layout component for the editor interface.
 * @param {object} props - Props for the component.
 * @param {string} props.projectId - Project ID of an existing project.
 * @param {boolean} props.isNewProject - Whether the project is new.
 * @returns {JSX.Element} The editor layout with CodeEditor, InputPanel and OutputPanel.
 */
export default function EditorLayout({ projectId, isNewProject }) {
    const dispatch = useDispatch();
    const { files } = useSelector((state) => state.files);
    const { codeContent, selectedFile, language, settings } = useSelector(
        (state) => state.editor
    );

    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [editorWidth, setEditorWidth] = useState(66.67); // 2/3 of screen
    const [inputHeight, setInputHeight] = useState(50); // 50% of right panel
    const [isResizing, setIsResizing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const isDraggingHorizontal = useRef(false);
    const isDraggingVertical = useRef(false);

    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        []
    );
    const isInvitedSession = urlParams.get('invite') === 'true';
    const [isInvited, setIsInvited] = useState(isInvitedSession);
    const [isYjsConnected, setIsYjsConnected] = useState(isInvitedSession);
    const [isInviter, setIsInviter] = useState(false);

    // References to hold the currently active Y.Doc, Y.Text, WebsocketProvider and its Awareness
    // These will be passed down to CodeEditor

    const [yjsResources, setYjsResources] = useState({
        yDoc: null,
        yText: null,
        awareness: null,
    });

    // Use a ref to store the currently active file ID that Yjs is connected to.
    const currentConnectedFileIdRef = useRef(null);

    //TODO remove this when deploying, only for dev cuz of strict mode
    const isMountedRef = useRef(false);

    // Set initial file and language
    useEffect(() => {
        if (files.length > 0 && !selectedFile) {
            const initialFile = files[0];
            dispatch(
                setSelectedFile({
                    $id: initialFile.$id,
                    fileName: initialFile.fileName,
                    content: initialFile.content,
                })
            );
            dispatch(
                setLanguage(getLanguageFromFileName(initialFile.fileName))
            );
        }
    }, [dispatch, files, selectedFile]);

    useEffect(() => {
        if (!selectedFile?.$id) {
            // If no file is selected, disconnect the previously connected file, if any.
            if (currentConnectedFileIdRef.current) {
                disconnectYjsForFile(currentConnectedFileIdRef.current);
                currentConnectedFileIdRef.current = null;
            }
            return; // Nothing to do if no file is selected.
        }

        // Early return if no collaboration
        if (!isYjsConnected) {
            return;
        }

        const newFileId = selectedFile.$id;

        // Disconnect the previous file's Yjs if the file has changed
        if (
            currentConnectedFileIdRef.current &&
            currentConnectedFileIdRef.current !== newFileId
        ) {
            disconnectYjsForFile(currentConnectedFileIdRef.current);
        }

        const { yDoc, yText, awareness } = getOrCreateYDoc(newFileId);

        // Update yjs resources
        setYjsResources({ yDoc, yText, awareness });

        // Connect to the WebSocket room for the new file if not already connected
        // or if this is an "invited" scenario that should force connection.
        // For general file switching, you typically want to connect.
        // For now, let's connect whenever a file is selected and we get its YDoc.
        if (isYjsConnected) {
            connectYjsForFile(newFileId);
            currentConnectedFileIdRef.current = newFileId; // Mark this file as currently connected
        } else {
            // If Yjs is not meant to be connected, ensure it's disconnected for the current file
            disconnectYjsForFile(newFileId); // This might be redundant if previous logic already handled it
            currentConnectedFileIdRef.current = null; // No file is actively connected via Yjs
        }

        // Set initial content for the Y.Text if it's empty, otherwise use Yjs content
        if (
            isInviter &&
            yText.length === 0 &&
            selectedFile.content.length > 0
        ) {
            yText.insert(0, selectedFile.content);
        }

        // Dispatch the content from yText to Redux.
        dispatch(setCodeContent(yText.toString()));
        dispatch(setLanguage(getLanguageFromFileName(selectedFile.fileName)));

        // Observer for Y.Text changes to keep Redux in sync
        const observer = () => {
            if (yjsResources.yText && isYjsConnected) {
                dispatch(setCodeContent(yjsResources.yText.toString()));
            }
        };

        yText.observe(observer);

        return () => {
            yText.unobserve(observer);
        };
    }, [selectedFile, dispatch, isYjsConnected, isInviter, yjsResources.yText]);

    // Add global event listeners for dragging
    useEffect(() => {
        window.addEventListener('mousemove', handleHorizontalMouseMove);
        window.addEventListener('mouseup', handleHorizontalMouseUp);
        window.addEventListener('mousemove', handleVerticalMouseMove);
        window.addEventListener('mouseup', handleVerticalMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleHorizontalMouseMove);
            window.removeEventListener('mouseup', handleHorizontalMouseUp);
            window.removeEventListener('mousemove', handleVerticalMouseMove);
            window.removeEventListener('mouseup', handleVerticalMouseUp);
        };
    }, []);

    // Update container styles dynamically
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                '--editor-width',
                `${editorWidth}%`
            );
            containerRef.current.style.setProperty(
                '--input-height',
                `${inputHeight}%`
            );
        }
    }, [editorWidth, inputHeight]);

    //TODO Fetch project files - Use Tanstack query for fetching this
    useEffect(() => {
        if (projectId && !isNewProject) {
            dispatch(getFilesByProject(projectId));
        }
    }, [projectId, isNewProject, dispatch]);

    // Disconnect ALL WS connections and clear Y.Docs on component unmount
    useEffect(() => {
        isMountedRef.current = true; // For strict mode

        return () => {
            if (!isMountedRef.current) {
                disconnectAllYjs(); // Disconnects all active providers and clears docs
                isMountedRef.current = false;
            }
        };
    }, []);

    function handleFileChange(event) {
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
    }

    /**
     * Retrieves default code template for a given language.
     * @param {string} language - The programming language.
     * @returns {string} Default code template or empty string if not found.
     */
    function getDefaultCodeForLanguage(language) {
        return defaultsSnippets[language] || '';
    }

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

    const handleFormatCode = useCallback(() => {
        editorRef.current?.trigger(
            'format',
            'editor.action.formatDocument',
            {}
        );
    }, []);

    // Placeholder for running code (to be implemented in Phase 6)
    const handleRunCode = useCallback(() => {
        const { yText } = getOrCreateYDoc(selectedFile.$id);
        // Simulate output for now
        setOutput(
            `Simulated output for:\n${yText ? yText.toString() : codeContent}\nInput:\n${input}`
        );
    }, [codeContent, input, selectedFile]);

    // Horizontal resize (CodeEditor vs Right Panel)
    function handleHorizontalMouseDown() {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingHorizontal.current = true;
        setIsResizing(true);
    }

    function handleHorizontalMouseMove(event) {
        if (isDraggingHorizontal.current && containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const newX = event.clientX;
            const newWidth = (newX / containerWidth) * 100;
            setEditorWidth(Math.max(20, Math.min(80, newWidth))); // Min 20%, Max 80%
        }
    }

    function handleHorizontalMouseUp() {
        isDraggingHorizontal.current = false;
        setIsResizing(false);
    }

    // Vertical resize (OutputPanel vs InputPanel)
    function handleVerticalMouseDown() {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingVertical.current = true;
        setIsResizing(true);
    }

    function handleVerticalMouseMove(e) {
        if (isDraggingVertical.current && containerRef.current) {
            const containerHeight = containerRef.current.offsetHeight;
            const newY =
                e.clientY - containerRef.current.getBoundingClientRect().top;
            const newHeight = (newY / containerHeight) * 100;
            setInputHeight(Math.max(20, Math.min(80, newHeight))); // Min 20%, Max 80%
        }
    }

    function handleVerticalMouseUp() {
        isDraggingVertical.current = false;
        setIsResizing(false);
    }

    // Saves the current file content and metadata to Appwrite.
    const handleSaveAllFiles = useCallback(() => {
        const filesToSave = files.map((file) => {
            const { yText } = getOrCreateYDoc(file.$id);
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
    }, [dispatch, files, isNewProject, isYjsConnected, selectedFile?.$id]);

    // Open Settings modal
    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
        dispatch(setModalType('settings'));
    }, [dispatch]);

    // Open Keyboard shortcuts modal
    const handleOpenKeyboardShortcuts = useCallback(() => {
        setIsShortcutsOpen(true);
        dispatch(setModalType('keyboard-shortcuts'));
    }, [dispatch]);

    // Close Settings modal
    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
        dispatch(setModalType(null));
    }, [dispatch]);

    // Close Keyboard shortcuts modal
    const handleCloseKeyboardShortcuts = useCallback(() => {
        setIsShortcutsOpen(false);
        dispatch(setModalType(null));
    }, [dispatch]);

    // Reset code to language defualt
    const handleResetCode = useCallback(() => {
        const { yText } = getOrCreateYDoc(selectedFile.$id);
        const defaultCode = getDefaultCodeForLanguage(language);
        yText.delete(0, yText.length);
        yText.insert(0, defaultCode);
        dispatch(setCodeContent(defaultCode));
    }, [dispatch, language, selectedFile]);

    // Handler for font size increment
    const handleFontSizeIncrement = useCallback(() => {
        const newSize = Math.min(24, settings.fontSize + 1);
        dispatch(setEditorSettings({ fontSize: newSize }));
    }, [dispatch, settings.fontSize]);

    // Handler for font size decrement
    const handleFontSizeDecrement = useCallback(() => {
        const newSize = Math.max(10, settings.fontSize - 1);
        dispatch(setEditorSettings({ fontSize: newSize }));
    }, [dispatch, settings.fontSize]);

    // Handler for word wrap change
    const handleWordWrapChange = useCallback(
        (e) => {
            dispatch(
                setEditorSettings({ wordWrap: e.target.checked ? 'on' : 'off' })
            );
        },
        [dispatch]
    );

    // Handler for minimap change
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

    // Handler for minimap change
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

    // Handler for tab size change
    const handleTabSizeChange = useCallback(
        (e) => {
            dispatch(setEditorSettings({ tabSize: Number(e.target.value) }));
        },
        [dispatch]
    );

    // Invite and open WebSocket connection
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
        if (isYjsConnected) {
            const currentProjectId = projectId || 'bytetogether'; // Fallback to default
            const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true&room=${currentProjectId}&file=${selectedFile.$id}`;

            window.navigator.clipboard.writeText(inviteUrl);

            dispatch(
                addNotification({
                    message: '✅ Invite Link copied',
                    type: 'success',
                })
            );
            return;
        }

        setIsYjsConnected(true);
        setIsInvited(true);
        setIsInviter(true);
        const currentProjectId = projectId || 'bytetogether'; // Fallback to default

        // Connect Yjs for the current room
        connectYjsForFile(selectedFile.$id);

        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=true&room=${currentProjectId}&file=${selectedFile.$id}`;

        window.navigator.clipboard.writeText(inviteUrl);

        dispatch(
            addNotification({
                message: '✅ Invite Link copied',
                type: 'success',
            })
        );
    }, [isYjsConnected, projectId, selectedFile, dispatch]);

    return (
        <section
            className={`editor-layout-container flex h-dvh flex-col bg-white text-gray-800 md:flex-row dark:bg-[#222233] dark:text-gray-200 ${isResizing ? 'select-none' : ''} `}
            ref={containerRef}
        >
            {/* Editor Section */}
            <section className="w-full p-4 md:w-[var(--editor-width)] md:min-w-112">
                {/* File Selector */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="hidden">
                        <select
                            value={selectedFile?.fileName || 'index.js'}
                            onChange={handleFileChange}
                            className="w-full min-w-25 rounded border border-gray-300 bg-gray-100 p-1.5 text-gray-800 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            aria-label="Select file to edit"
                        >
                            <option
                                value=""
                                disabled
                                className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                                Select a file
                            </option>
                            {files.map((file) => (
                                <option
                                    key={file.$id}
                                    value={file.$id}
                                    className=""
                                >
                                    {file.fileName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <EditorToolbar
                        handleRunCode={handleRunCode}
                        handleFormatCode={handleFormatCode}
                        handleLanguageChange={handleLanguageChange}
                        handleSaveAllFiles={handleSaveAllFiles}
                        fileCount={files.length}
                        handleOpenSettings={handleOpenSettings}
                        handleOpenKeyboardShortcuts={
                            handleOpenKeyboardShortcuts
                        }
                        handleResetCode={handleResetCode}
                        handleInvite={handleInvite}
                    />
                </div>
                <CodeEditor
                    language={language}
                    codeContent={codeContent}
                    ref={editorRef}
                    yDoc={yjsResources.yDoc}
                    yText={yjsResources.yText}
                    awareness={yjsResources.awareness}
                    isInvited={isInvited}
                />
            </section>

            {/* Modals */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <Modal
                        key="settings-modal"
                        isOpen={isSettingsOpen}
                        onClose={handleCloseSettings}
                    >
                        {modalConfig.settings.content({
                            fontSize: settings.fontSize,
                            onFontSizeIncrement: handleFontSizeIncrement,
                            onFontSizeDecrement: handleFontSizeDecrement,
                            wordWrap: settings.wordWrap,
                            onWordWrapChange: handleWordWrapChange,
                            minimapEnabled: settings.minimap,
                            onMinimapChange: handleMinimapChange,
                            stickyScrollEnabled: settings.stickyScroll,
                            onStickyScrollChange: handleStickyScrollChange,
                            tabSize: settings.tabSize,
                            onTabSizeChange: handleTabSizeChange,
                        })}
                    </Modal>
                )}
                {isShortcutsOpen && (
                    <Modal
                        key="shortcuts-modal"
                        isOpen={isShortcutsOpen}
                        onClose={handleCloseKeyboardShortcuts}
                    >
                        {modalConfig.shortcuts.content}
                    </Modal>
                )}
            </AnimatePresence>

            {/* Horizontal Resizer */}
            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
            <div
                className="hidden w-1 cursor-ew-resize bg-gray-300 hover:bg-blue-600 active:bg-blue-600 md:block dark:bg-gray-500"
                onMouseDown={handleHorizontalMouseDown}
                role="separator"
                aria-label="Resize Code Editor and Panels"
            ></div>

            {/* Input/Output Section */}
            <section className="flex w-full flex-col md:w-[calc(100%-var(--editor-width))] md:min-w-64 md:flex-1">
                <section className="max-h-full min-h-40 md:h-[var(--input-height)]">
                    <InputPanel input={input} onInputChange={setInput} />
                </section>
                <div
                    className="hidden h-1 cursor-ns-resize bg-gray-300 hover:bg-blue-600 active:bg-blue-600 md:block dark:bg-gray-500"
                    onMouseDown={handleVerticalMouseDown}
                    role="separator"
                    aria-label="Resize Output and Input Panels"
                ></div>
                <section className="max-h-full min-h-42 flex-1 md:h-[calc(100%-var(--input-height))]">
                    <OutputPanel output={output} />
                </section>
            </section>
        </section>
    );
}
