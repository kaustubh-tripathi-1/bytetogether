/**
 * Redux slice for managing file-related state in ByteTogether.
 * @module filesSlice
 */
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for the files slice.
 * @typedef {Object} FilesState
 * @property {Array} files - List of files in the project.
 * @property {boolean} isLoading - Loading state for file operations.
 * @property {string|null} error - Error message for failed operations.
 */
const initialState = {
    files: [],
    isLoading: false,
    error: null,
};

/**
 * Files slice with reducers for managing file state.
 */
const filesSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        /**
         * Sets the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing array of files.
         */
        setFiles: function (state, action) {
            state.files = action.payload;
        },
        /**
         * Adds a file to the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing the file.
         */
        addFile: function (state, action) {
            state.files.push(action.payload);
        },
        /**
         * Deletes a file from the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing the file ID.
         */
        deleteFile: function (state, action) {
            state.files = state.files.filter(function (file) {
                return file.$id !== action.payload;
            });
        },
        /**
         * Sets the loading state.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing boolean.
         */
        setIsLoading: function (state, action) {
            state.isLoading = action.payload;
        },
        /**
         * Sets the error message.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing error string.
         */
        setError: function (state, action) {
            state.error = action.payload;
        },
    },
});

export const { setFiles, addFile, deleteFile, setIsLoading, setError } =
    filesSlice.actions;

export default filesSlice.reducer;
