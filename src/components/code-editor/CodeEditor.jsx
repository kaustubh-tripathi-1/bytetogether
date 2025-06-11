/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {string} projectId - The ID of the active project.
 * @returns {JSX.Element} The Monaco Editor with file selector.
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useQuery } from '@tanstack/react-query';
import MonacoEditor from '@monaco-editor/react';

import { databaseService } from '../../appwrite-services/database';
import {
    setCodeContent,
    setError,
    setIsLoading,
} from '../../store/slices/editorSlice';
import { setFiles } from '../../store/slices/filesSlice';

/**
 * Maps file extension to Monaco language.
 * @param {string} fileName - Name of the file.
 * @returns {string} Monaco language identifier.
 */
function getLanguageFromFileName(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
        js: 'javascript',
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

    // Fetch project files from Appwrite
    useEffect(() => {
        async function fetchFiles() {
            try {
                dispatch(setIsLoading(true));
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
            } catch (error) {
                dispatch(setError(error.message));
            } finally {
                dispatch(setIsLoading(false));
            }
        }
        fetchFiles();
    }, [projectId, dispatch]);

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
            <div className="p-2">
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
            </div>
            <MonacoEditor
                height="80vh"
                width="100%"
                language={language}
                value={codeContent}
                onChange={handleEditorChange}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                options={{
                    fontSize: settings.fontSize,
                    wordWrap: settings.wordWrap,
                    minimap: settings.minimap,
                    accessibilitySupport: 'auto',
                    tabSize: 4,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    suggest: { showSnippets: true, showWords: true },
                    stickyScroll: { enabled: false },
                }}
            />
        </div>
    );
}
