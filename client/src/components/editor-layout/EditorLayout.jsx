import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';

import { getFilesByProject } from '../../store/slices/filesSlice.js';
import {
    CodeEditor,
    EditorToolbar,
    FileExplorer,
    InputPanel,
    KeyboardShortcuts,
    Modal,
    OutputPanel,
    PreviewPanel,
    SettingsContent,
} from '../componentsIndex.js';
import { disconnectAllYjs } from '../../lib/yjs.js';
import { useRealTimeSync } from '../../hooks/yjs-real-time-sync/useRealTimeSync.js';
import { usePanelsResize } from '../../hooks/editor-layout-and-actions/usePanelsResize.js';
import { useEditorActions } from '../../hooks/editor-layout-and-actions/useEditorActions.js';
import { useFileActions } from '../../hooks/file-actions/useFileActions.js';

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
    const { profile } = useSelector((state) => state.user);
    const { username } = profile || {};
    const { input, executionMode } = useSelector((state) => state.execution);
    const { isPreviewVisible } = useSelector((state) => state.preview);

    // Layout and UI related States
    const [editorWidth, setEditorWidth] = useState(66.67); // 2/3 of screen
    const [inputHeight, setInputHeight] = useState(50); // 50% of right panel
    const [consoleHeight, setConsoleHeight] = useState(20); // 20% of right panel
    const [isResizing, setIsResizing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const previewContainerRef = useRef(null);
    const isDraggingHorizontal = useRef(false);
    const isDraggingVertical = useRef(false);

    // YJS related states
    // References to hold the currently active Y.Doc, Y.Text, WebsocketProvider and its Awareness
    const [yjsResources, setYjsResources] = useState({
        yDoc: null,
        yText: null,
        awareness: null,
        wsProvider: null,
    });
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        []
    );
    const isInvitedSession = urlParams.get('invite') === 'true';
    const [isYjsConnected, setIsYjsConnected] = useState(isInvitedSession);
    const [isAdmin, setIsAdmin] = useState(!isInvitedSession);

    // Store the currently active file ID that Yjs is connected to.
    const currentConnectedFileIdRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const { handleSaveAllFiles, toggleFileExplorer } = useFileActions({
        files,
        username,
        isAdmin,
        selectedFile,
        isYjsConnected,
        isNewProject,
        setIsFileExplorerOpen,
    });

    useRealTimeSync({
        selectedFile,
        isYjsConnected,
        setIsYjsConnected,
        isAdmin,
        setIsAdmin,
        yjsResources,
        currentConnectedFileIdRef,
        setYjsResources,
        isNewProject,
        projectId,
        username,
        navigate,
        location,
    });

    const { handleHorizontalMouseDown, handleVerticalMouseDown } =
        usePanelsResize({
            editorWidth,
            setEditorWidth,
            inputHeight,
            setInputHeight,
            containerRef,
            isDraggingHorizontal,
            isDraggingVertical,
            setIsResizing,
            consoleHeight,
            setConsoleHeight,
            isPreviewVisible,
            previewContainerRef,
        });

    const {
        handleLanguageChange,
        handleFormatCode,
        handleRunCode,
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
    } = useEditorActions({
        isNewProject,
        projectId,
        editorRef,
        files,
        selectedFile,
        codeContent,
        language,
        settings,
        input,
        isYjsConnected,
        setIsYjsConnected,
        setIsSettingsOpen,
        setIsShortcutsOpen,
        isAdmin,
        yjsResources,
        setYjsResources,
        currentConnectedFileIdRef,
        username,
    });

    //TODO remove this when deploying, only for dev cuz of strict mode
    const isMountedRef = useRef(false);

    //TODO Fetch project files - Use Tanstack query for fetching this
    useEffect(() => {
        if (projectId && !isNewProject) {
            dispatch(getFilesByProject(projectId));
        }
    }, [projectId, isNewProject, dispatch]);

    // Disconnect ALL WS connections and clear Y.Docs on component unmount
    //TODO Move this to useRealTimeSync before deploying
    useEffect(() => {
        isMountedRef.current = true; // For strict mode

        return () => {
            if (!isMountedRef.current) {
                disconnectAllYjs(); // Disconnects all active providers and clears docs
                isMountedRef.current = false;
            }
        };
    }, []);

    return (
        <section
            className={`editor-layout-container relative flex h-dvh flex-col bg-white text-gray-800 md:flex-row dark:bg-[#222233] dark:text-gray-200 ${isResizing ? 'select-none' : ''} `}
            ref={containerRef}
        >
            {/* Editor Section */}
            <section className="w-full p-4 md:w-[var(--editor-width)] md:min-w-112">
                {/* File Selector */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <AnimatePresence>
                        {isFileExplorerOpen && (
                            <FileExplorer
                                toggleFileExplorer={toggleFileExplorer}
                            />
                        )}
                    </AnimatePresence>

                    <EditorToolbar
                        language={language}
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
                        isAdmin={isAdmin}
                        handleEndRoom={handleEndRoom}
                        yjsResources={yjsResources}
                        isYjsConnected={isYjsConnected}
                        setIsYjsConnected={setIsYjsConnected}
                        isInvited={isInvitedSession}
                        toggleFileExplorer={toggleFileExplorer}
                    />
                </div>
                <CodeEditor
                    ref={editorRef}
                    yjsResources={yjsResources}
                    isYjsConnected={isYjsConnected}
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
                        <SettingsContent
                            fontSize={settings.fontSize}
                            onFontSizeIncrement={handleFontSizeIncrement}
                            onFontSizeDecrement={handleFontSizeDecrement}
                            wordWrap={settings.wordWrap}
                            onWordWrapChange={handleWordWrapChange}
                            minimapEnabled={settings.minimap}
                            onMinimapChange={handleMinimapChange}
                            stickyScrollEnabled={settings.stickyScroll}
                            onStickyScrollChange={handleStickyScrollChange}
                            tabSize={settings.tabSize}
                            onTabSizeChange={handleTabSizeChange}
                        />
                    </Modal>
                )}
                {isShortcutsOpen && (
                    <Modal
                        key="shortcuts-modal"
                        isOpen={isShortcutsOpen}
                        onClose={handleCloseKeyboardShortcuts}
                    >
                        <KeyboardShortcuts />
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
            {executionMode === 'preview' && isPreviewVisible ? (
                <section className="w-full md:w-[calc(100%-var(--editor-width))] md:min-w-64">
                    <PreviewPanel
                        handleVerticalMouseDown={handleVerticalMouseDown}
                        ref={previewContainerRef}
                    />
                </section>
            ) : (
                <section className="flex w-full flex-col md:w-[calc(100%-var(--editor-width))] md:min-w-64 md:flex-1">
                    <section className="max-h-full min-h-40 md:h-[var(--input-height)]">
                        <InputPanel />
                    </section>
                    <div
                        className="hidden h-1 cursor-ns-resize bg-gray-300 hover:bg-blue-600 active:bg-blue-600 md:block dark:bg-gray-500"
                        onMouseDown={handleVerticalMouseDown}
                        role="separator"
                        aria-label="Resize Output and Input Panels"
                    />
                    <section className="max-h-full min-h-42 flex-1 md:h-[calc(100%-var(--input-height))]">
                        <OutputPanel />
                    </section>
                </section>
            )}

            {/* The Transparent Overlay to stop iframe from capturing resize events */}
            {isResizing && (
                <div
                    className={`bg absolute inset-0 z-50 ${
                        isDraggingHorizontal.current ? 'cursor-ew-resize' : ''
                    } ${isDraggingVertical.current ? 'cursor-ns-resize' : ''}`} // Explicitly set cursor type
                />
            )}
        </section>
    );
}
