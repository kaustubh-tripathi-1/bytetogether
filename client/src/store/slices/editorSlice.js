/**
 * Redux slice for managing editor state in ByteTogether.
 * @module editorSlice
 */
import { createSlice } from '@reduxjs/toolkit';

import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';

/**
 * Initial state for the editor slice.
 * @typedef {Object} EditorState
 * @property {string} codeContent - Content of the currently selected file.
 * @property {Object} settings - Editor settings (e.g. font size, word wrap etc.).
 * @property {Object} selectedFile - Currently selected file from files state.
 * @property {Object} langauge - language of codeContent for monaco.
 * @property {boolean} isLoading - Loading state for async operations.
 * @property {string|null} error - Error message for failed operations.
 */
const initialState = {
    codeContent: '',
    settings: {
        fontSize: 14,
        wordWrap: 'on',
        tabSize: 4,
        minimap: true,
        stickyScroll: true,
    },
    selectedFile: null,
    language: 'javascript',
    isLoading: false,
    error: null,
};

/**
 * Editor slice with reducers for managing editor state.
 */
const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        /**
         * Sets the code content of the selected file.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing code string.
         */
        setCodeContent(state, action) {
            state.codeContent = action.payload;
        },
        /**
         * Updates editor settings (e.g., font size, word wrap).
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing settings object.
         */
        setEditorSettings(state, action) {
            state.settings = { ...state.settings, ...action.payload };
        },
        /**
         * Sets the the selected file.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing selected file name.
         */
        setSelectedFile: (state, action) => {
            state.selectedFile = action.payload;
            if (action.payload) {
                state.language = getLanguageFromFileName(
                    action.payload.fileName
                );
                state.codeContent = action.payload.codeContent;
            } else {
                state.codeContent = '';
            }
        },
        /**
         * Sets the the selected file content.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing selected file name.
         */
        setSelectedFileContent: (state, action) => {
            if (state.selectedFile) {
                state.selectedFile.codeContent = action.payload;
            }
        },
        /**
         * Sets the programming language
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing language name
         */
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        /**
         * Sets the loading state.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing boolean.
         */
        setIsLoading(state, action) {
            state.isLoading = action.payload;
        },
        /**
         * Sets the error message.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing error string.
         */
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const {
    setCodeContent,
    setLanguage,
    setSelectedFile,
    setSelectedFileContent,
    setEditorSettings,
    setIsLoading,
    setError,
} = editorSlice.actions;

export default editorSlice.reducer;
