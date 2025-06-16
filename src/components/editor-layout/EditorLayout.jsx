/**
 * Layout component for the editor interface.
 * @param {boolean} isNewProject - Whether the project is new.
 * @returns {JSX.Element} The editor layout with CodeEditor, InputPanel and OutputPanel.
 */
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    setCodeContent,
    setLanguage,
    setSelectedFile,
} from '../../store/slices/editorSlice';
import {
    CodeEditor,
    InputPanel,
    LanguageSelector,
    OutputPanel,
} from '../componentsIndex.js';

export default function EditorLayout({
    projectId: _projectId,
    isNewProject: _isNewProject,
}) {
    const dispatch = useDispatch();
    const { files } = useSelector((state) => state.files);
    const { codeContent, selectedFile, language } = useSelector(
        (state) => state.editor
    );
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [editorWidth, setEditorWidth] = useState(66.67); // 2/3 of screen
    const [outputHeight, setOutputHeight] = useState(50); // 50% of right panel
    const [isResizing, setIsResizing] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const isDraggingHorizontal = useRef(false);
    const isDraggingVertical = useRef(false);

    // Set initial file and language
    useEffect(() => {
        if (files.length > 0 && !selectedFile) {
            dispatch(setSelectedFile(files[0].$id));
            dispatch(setLanguage(getLanguageFromFileName(files[0].name)));
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

    function getLanguageFromFileName(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const languageMap = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            cpp: 'cpp',
            c: 'c',
            java: 'java',
            html: 'html',
            css: 'css',
        };

        return languageMap[extension] || 'plaintext';
    }

    function handleFileChange(event) {
        const fileId = event.target.value;
        dispatch(setSelectedFile(fileId));

        const file = files.find((f) => f.$id === fileId);
        if (file) {
            setLanguage(getLanguageFromFileName(file.name));
            dispatch(setCodeContent(file.content));
        }
    }

    function handleLanguageChange(newLanguage) {
        dispatch(setLanguage(newLanguage));
    }

    function handleEditorContentChange(value) {
        dispatch(setCodeContent(value));
    }

    function handleFormatCode() {
        editorRef.current?.trigger(
            'format',
            'editor.action.formatDocument',
            {}
        );
    }

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }

    // Placeholder for running code (to be implemented in Phase 5)
    function handleRunCode() {
        // Simulate output for now
        setOutput(`Simulated output for:\n${codeContent}\nInput:\n${input}`);
    }

    // Horizontal resize (CodeEditor vs Right Panel)
    function handleHorizontalMouseDown() {
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
        isDraggingVertical.current = true;
        setIsResizing(true);
    }

    function handleVerticalMouseMove(e) {
        if (isDraggingVertical.current && containerRef.current) {
            const containerHeight = containerRef.current.offsetHeight;
            const newY =
                e.clientY - containerRef.current.getBoundingClientRect().top;
            const newHeight = (newY / containerHeight) * 100;
            setOutputHeight(Math.max(20, Math.min(80, newHeight))); // Min 20%, Max 80%
        }
    }

    function handleVerticalMouseUp() {
        isDraggingVertical.current = false;
        setIsResizing(false);
    }

    return (
        <section
            className={`flex min-h-screen flex-col md:flex-row ${isResizing ? 'select-none' : ''}`}
            ref={containerRef}
        >
            <section
                className="w-full p-4 md:w-2/3 md:min-w-112"
                style={{ width: `${editorWidth}%` }}
            >
                <div className="flex gap-4 p-2">
                    <select
                        value={selectedFile}
                        onChange={handleFileChange}
                        className="w-full min-w-25 rounded border p-1.5 focus:outline-none md:w-1/3"
                        aria-label="Select file to edit"
                    >
                        <option value="" disabled className="">
                            Select a file
                        </option>
                        {files.map((file) => (
                            <option key={file.$id} value={file.$id}>
                                {file.name}
                            </option>
                        ))}
                    </select>
                    <LanguageSelector
                        selectedLanguage={language}
                        onLanguageChange={handleLanguageChange}
                    />
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
                </div>
                <CodeEditor
                    language={language}
                    codeContent={codeContent}
                    onChange={handleEditorContentChange}
                    onMount={handleEditorDidMount}
                />
            </section>

            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
            <div
                className="hidden w-1 cursor-ew-resize bg-gray-500 md:block"
                onMouseDown={handleHorizontalMouseDown}
                role="separator"
                aria-label="Resize Code Editor and Panels"
            ></div>
            <section
                className="flex w-full md:min-w-64 md:flex-col"
                style={{ width: `${100 - editorWidth}%` }}
            >
                <div style={{ height: `${outputHeight}%` }}>
                    <InputPanel input={input} onInputChange={setInput} />
                </div>
                <div
                    className="h-1 cursor-ns-resize bg-gray-500"
                    onMouseDown={handleVerticalMouseDown}
                    role="separator"
                    aria-label="Resize Output and Input Panels"
                ></div>
                <div style={{ height: `${100 - outputHeight}%` }}>
                    <OutputPanel output={output} />
                </div>
            </section>
        </section>
    );
}
