import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for managing code preview state.
 */
const previewSlice = createSlice({
    name: 'preview',
    initialState: {
        isPreviewVisible: false,
        html: '',
        css: '',
        js: '',
        consoleLogs: [],
        isConsoleVisible: false,
        error: null,
    },
    reducers: {
        /**
         * Sets the visibility of preview panel.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setIsPreviewVisible(state, action) {
            state.isPreviewVisible = action.payload;
        },
        /**
         * Sets the html output.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setHtml(state, action) {
            state.html = action.payload;
        },
        /**
         * Sets the css output.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setCss(state, action) {
            state.css = action.payload;
        },
        /**
         * Sets the js output.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setJs(state, action) {
            state.js = action.payload;
        },
        /**
         * Sets the visibility of console in preview panel.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setIsConsoleVisible(state, action) {
            state.isConsoleVisible = action.payload;
        },
        /**
         * Sets the console logs for the iframe doc.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setConsoleLogs(state, action) {
            state.consoleLogs.push(action.payload);
        },
        /**
         * Clears the console logs for the iframe doc.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        clearConsoleLogs(state) {
            state.consoleLogs = [];
        },
        /**
         * Sets the error state for preview mode.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const {
    setHtml,
    setCss,
    setJs,
    setConsoleLogs,
    clearConsoleLogs,
    setError,
    setIsConsoleVisible,
    setIsPreviewVisible,
} = previewSlice.actions;
export default previewSlice.reducer;
