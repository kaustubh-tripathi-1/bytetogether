/**
 * Redux slice for managing editor state in ByteTogether.
 * @module editorSlice
 */
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for the editor slice.
 * @typedef {Object} EditorState
 * @property {Object|null} activeProject - The currently active project (ID and metadata).
 * @property {Array} collaborators - List of collaborators (for real-time sync).
 * @property {string} codeContent - Content of the currently selected file.
 * @property {Object} settings - Editor settings (e.g. font size, word wrap etc.).
 * @property {boolean} isLoading - Loading state for async operations.
 * @property {string|null} error - Error message for failed operations.
 */
const initialState = {
    activeProject: null,
    collaborators: [],
    codeContent: '',
    settings: {
        fontSize: 14,
        wordWrap: 'on',
        tabSize: 4,
        minimap: true,
        stickyScroll: false,
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
         * Sets the active project.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing project data.
         */
        setActiveProject(state, action) {
            state.activeProject = action.payload;
        },
        /**
         * Sets the list of collaborators.
         * @param {EditorState} state - Current state.
         * @param {Object} action - Action with payload containing array of collaborators.
         */
        setCollaborators(state, action) {
            state.collaborators = action.payload;
        },
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
    setActiveProject,
    setCollaborators,
    setCodeContent,
    setLanguage,
    setSelectedFile,
    setEditorSettings,
    setIsLoading,
    setError,
} = editorSlice.actions;

export default editorSlice.reducer;
