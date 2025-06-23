import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    setCodeContent,
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
    OutputPanel,
} from '../componentsIndex.js';
import { defaultsSnippets } from '../../conf/languages';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName.js';

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
    const { codeContent, selectedFile, language } = useSelector(
        (state) => state.editor
    );
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [editorWidth, setEditorWidth] = useState(66.67); // 2/3 of screen
    const [inputHeight, setInputHeight] = useState(50); // 50% of right panel
    const [isResizing, setIsResizing] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const isDraggingHorizontal = useRef(false);
    const isDraggingVertical = useRef(false);

    // Set initial file and language
    useEffect(() => {
        if (files.length > 0 && !selectedFile) {
            dispatch(
                setSelectedFile({
                    $id: files[0].$id,
                    fileName: files[0].fileName,
                    content: files[0].content,
                })
            );
            dispatch(setLanguage(getLanguageFromFileName(files[0].fileName)));
            dispatch(setCodeContent(files[0].content));
        }
    }, [dispatch, files, selectedFile]);

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

    function handleFileChange(event) {
        const fileId = event.target.value;
        dispatch(setSelectedFile(fileId));

        const file = files.find((f) => f.$id === fileId);
        if (file) {
            setLanguage(getLanguageFromFileName(file.fileName));
            dispatch(setCodeContent(file.content));
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

            const file = files.find((f) => f.$id === selectedFile.$id);
            if (!file) {
                // No file selected, load default code
                const defaultCode = getDefaultCodeForLanguage(newLanguage);
                dispatch(setCodeContent(defaultCode));
                return;
            }

            // If file exists, check if saved code matches the new language
            const savedLanguage = getLanguageFromFileName(file.fileName);

            if (savedLanguage !== newLanguage) {
                // Load default code for the new language
                const defaultCode = getDefaultCodeForLanguage(newLanguage);
                dispatch(setCodeContent(defaultCode));
                return;
            }

            dispatch(setCodeContent(file.content || ''));
        },
        [dispatch, files, selectedFile]
    );

    const handleFormatCode = useCallback(() => {
        editorRef.current?.trigger(
            'format',
            'editor.action.formatDocument',
            {}
        );
    }, []);

    // Placeholder for running code (to be implemented in Phase 5)
    const handleRunCode = useCallback(() => {
        // Simulate output for now
        setOutput(`Simulated output for:\n${codeContent}\nInput:\n${input}`);
    }, [codeContent, input]);

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
    function handleSaveAllFiles() {
        const filesToSave = files.map((file) => ({
            $id: file.$id,
            name: file.fileName,
            language: getLanguageFromFileName(file.fileName),
            content: file.content || '',
        }));

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
    }

    return (
        <section
            className={`editor-layout-container flex h-dvh flex-col bg-white text-gray-800 md:flex-row dark:bg-[#222233] dark:text-gray-200 ${isResizing ? 'select-none' : ''} `}
            ref={containerRef}
        >
            {/* Editor Section */}
            <section className="w-full p-4 md:w-[var(--editor-width)] md:min-w-112">
                {/* File Selector */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="">
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
                    />
                </div>
                <CodeEditor
                    language={language}
                    codeContent={codeContent}
                    ref={editorRef}
                />
            </section>

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
