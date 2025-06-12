/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {string} projectId - The ID of the active project.
 * @returns {JSX.Element} The Monaco Editor with file selector.
 */
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import MonacoEditor from '@monaco-editor/react';

import { databaseService } from '../../appwrite-services/database';
import { setCodeContent } from '../../store/slices/editorSlice';
import {
    setFiles,
    setError,
    setIsLoading as filesLoading,
} from '../../store/slices/filesSlice';
import { Spinner } from '../componentsIndex';
// import { setTheme } from '../../store/slices/uiSlice';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';

/**
 * Maps file extension to Monaco language.
 * @param {string} fileName - Name of the file.
 * @returns {string} Monaco language identifier.
 */
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

export default function CodeEditor({ projectId }) {
    const dispatch = useDispatch();
    const { codeContent, settings } = useSelector((state) => state.editor);
    const { files } = useSelector((state) => state.files);
    const { theme } = useSelector((state) => state.ui);
    const [selectedFile, setSelectedFile] = useState('');
    const [language, setLanguage] = useState('javascript');

    const editorRef = useRef(null);

    // Define custom Night Owl theme
    function handleEditorWillMount(monaco) {
        monaco.editor.defineTheme('night-owl', nightOwlTheme);
        monaco.editor.defineTheme('vs-light', vsLight);
    }

    // Assign editor instance to editorRef on mount
    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }

    function handleFormatCode() {
        editorRef.current?.trigger(
            'format',
            'editor.action.formatDocument',
            {}
        );
    }

    // Fetch files using TanStack Query
    const { isLoading, error } = useQuery({
        queryKey: ['files', projectId],
        queryFn: async () => {
            const fileList = await databaseService.listDocuments('files', [
                `projectId=${projectId}`,
            ]);
            dispatch(setFiles(fileList.documents));
            if (fileList.documents.length > 0) {
                setSelectedFile(fileList.documents[0].$id);
                setLanguage(
                    getLanguageFromFileName(fileList.documents[0].name)
                );
                dispatch(setCodeContent(fileList.documents[0].content));
            }
            return fileList.documents;
        },
        retry: 2, // 3 attempts (initial + 2 retry)
        staleTime: 2 * 60000, // 2 minutes
    });

    useEffect(() => {
        dispatch(filesLoading(isLoading));
        dispatch(setError(error ? error.message : null));
        // dispatch(setTheme('dark'));
    }, [dispatch, isLoading, error]);

    // Handle file selection
    function handleFileChange(event) {
        const fileId = event.target.value;
        setSelectedFile(fileId);
        const file = files.find((f) => f.$id === fileId);
        setLanguage(getLanguageFromFileName(file.name));
        dispatch(setCodeContent(file.content));
    }

    // Handle code changes
    function handleEditorChange(value) {
        dispatch(setCodeContent(value));
    }

    return (
        <div
            className="flex h-full flex-col"
            role="region"
            aria-label="Code editor"
        >
            <div className="flex gap-10 p-2">
                <select
                    value={selectedFile}
                    onChange={handleFileChange}
                    className="w-full rounded border p-2 md:w-1/3"
                    aria-label="Select file to edit"
                >
                    <option value="" disabled>
                        Select a file
                    </option>
                    {files.map((file) => (
                        <option key={file.$id} value={file.$id}>
                            {file.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleFormatCode}
                    className="cursor-pointer rounded bg-blue-500 p-2 text-white"
                    aria-label="Format code"
                >
                    Format
                </button>
            </div>
            <MonacoEditor
                height="80vh"
                width="100%"
                language={language}
                value={codeContent}
                onChange={handleEditorChange}
                theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                loading={<Spinner size="4" />}
                options={{
                    fontSize: settings.fontSize,
                    wordWrap: settings.wordWrap,
                    minimap: settings.minimap,
                    tabSize: settings.tabSize,
                    insertSpaces: true,
                    accessibilitySupport: 'auto',
                    lineNumbers: 'on',
                    formatOnPaste: true,
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    suggest: { showSnippets: true, showWords: true },
                    stickyScroll: { enabled: false },
                    smoothScrolling: true,
                    hover: { delay: 500 },
                }}
            />
        </div>
    );
}
