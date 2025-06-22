import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LanguageSelector } from '../componentsIndex';
import {
    setCodeContent,
    setLanguage,
    setSelectedFile,
} from '../../store/slices/editorSlice';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';

function EditorToolbar({
    handleFormatCode,
    handleRunCode,
    handleLanguageChange,
}) {
    const dispatch = useDispatch();
    const { files } = useSelector((state) => state.files);
    const { selectedFile, language } = useSelector((state) => state.editor);

    function handleFileChange(event) {
        const fileId = event.target.value;
        dispatch(setSelectedFile(fileId));

        const file = files.find((f) => f.$id === fileId);
        if (file) {
            setLanguage(getLanguageFromFileName(file.fileName));
            dispatch(setCodeContent(file.content));
        }
    }

    return (
        <div
            className="flex justify-between pb-4"
            role="toolbar"
            aria-label="Editor toolbar"
        >
            <select
                value={selectedFile}
                onChange={handleFileChange}
                className="w-full min-w-25 rounded border border-gray-300 bg-gray-100 p-1.5 text-gray-800 focus:outline-none md:w-1/3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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
                    <option key={file.$id} value={file.$id} className="">
                        {file.fileName}
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
    );
}

export default memo(EditorToolbar);
