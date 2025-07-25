/**
 * Redux slice for managing file-related state in ByteTogether.
 * @module filesSlice
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Query } from 'appwrite';

import { databaseService } from '../../appwrite-services/database';
import appwriteConfig from '../../conf/appwriteConfig';

/**
 * Async thunk to save all files for a new project in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {string} payload.projectName - The project name.
 * @param {Array<Object>} payload.files - Array of file objects { name, language, content }.
 * @returns {Promise<Array<Object>>} Array of created documents.
 */
export const saveAllFilesForNewProject = createAsyncThunk(
    'files/saveAllFilesForNewProject',
    async ({ projectName, files }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;

            const project = await databaseService.createDocument(
                appwriteConfig.appwriteProjectsCollectionID,
                {
                    name: projectName,
                    ownerId: user?.$id,
                    collaborators: [],
                }
            );

            const savePromises = files.map((file) =>
                databaseService.createDocument(
                    appwriteConfig.appwriteFilesCollectionID,
                    {
                        projectId: project.$id,
                        fileName: file.fileName,
                        language: file.language,
                        content: file.content,
                    }
                )
            );
            const results = await Promise.all(savePromises);
            return results;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to update all files for an existing project in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {Array<Object>} payload.files - Array of file objects { $id, content, language }.
 * @returns {Promise<Array<Object>>} Array of updated documents.
 */
export const updateAllFilesForExistingProject = createAsyncThunk(
    'files/updateAllFilesForExistingProject',
    async (files, { rejectWithValue }) => {
        try {
            const updatePromises = files.map((file) =>
                databaseService.updateDocument(
                    appwriteConfig.appwriteFilesCollectionID,
                    file.$id,
                    {
                        content: file.content,
                        language: file.language,
                    }
                )
            );
            const results = await Promise.all(updatePromises);
            return results;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to fetch all files for an existing project.
 * @param {string} payload - The project ID.
 * @returns {Promise<Array<Object>>} Array of file documents.
 */
export const getFilesByProject = createAsyncThunk(
    'files/getFilesByProject',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await databaseService.listDocuments(
                appwriteConfig.appwriteFilesCollectionID,
                [Query.equal('projectId', projectId)]
            );
            return response.documents;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to create a new file in Appwrite for a new project.
 * @param {Object} payload - The action payload.
 * @param {string} payload.projectId - The project ID.
 * @param {string} payload.fileName - The file name.
 * @param {string} payload.language - The programming language.
 * @param {string} payload.content - The file content.
 * @returns {Promise<Object>} The created document.
 */
export const createFile = createAsyncThunk(
    'files/createFile',
    async ({ projectId, fileName, language, content }, { rejectWithValue }) => {
        try {
            const data = { projectId, fileName, language, content };
            return await databaseService.createDocument(
                appwriteConfig.appwriteFilesCollectionID,
                data
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to update an existing file in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {string} payload.fileId - The file ID.
 * @param {string} payload.content - The updated content.
 * @param {string} payload.language - The updated language.
 * @returns {Promise<Object>} The updated document.
 */
export const updateFile = createAsyncThunk(
    'files/updateFile',
    async ({ fileId, content, language }, { rejectWithValue }) => {
        try {
            const data = { content, language };
            return await databaseService.updateDocument(
                appwriteConfig.appwriteFilesCollectionID,
                fileId,
                data
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

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
        extraReducers: (builder) => {
            builder
                // Save files to DB for a new Project
                .addCase(saveAllFilesForNewProject.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(
                    saveAllFilesForNewProject.fulfilled,
                    (state, action) => {
                        state.loading = false;
                        state.files = action.payload;
                    }
                )
                .addCase(
                    saveAllFilesForNewProject.rejected,
                    (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                    }
                )
                // Update files in DB for an existing Project
                .addCase(updateAllFilesForExistingProject.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(
                    updateAllFilesForExistingProject.fulfilled,
                    (state, action) => {
                        state.loading = false;
                        state.files = action.payload;
                    }
                )
                .addCase(
                    updateAllFilesForExistingProject.rejected,
                    (state, action) => {
                        state.loading = false;
                        state.error = action.payload;
                    }
                )
                // Get all files by Project ID
                .addCase(getFilesByProject.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(getFilesByProject.fulfilled, (state, action) => {
                    state.loading = false;
                    state.files = action.payload;
                })
                .addCase(getFilesByProject.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })
                // Create File
                .addCase(createFile.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(createFile.fulfilled, (state, action) => {
                    state.loading = false;
                    state.files.push(action.payload);
                })
                .addCase(createFile.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })
                // Update File
                .addCase(updateFile.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(updateFile.fulfilled, (state, action) => {
                    state.loading = false;
                    const index = state.files.findIndex(
                        (f) => f.$id === action.payload.$id
                    );
                    if (index !== -1) state.files[index] = action.payload;
                })
                .addCase(updateFile.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                });
        },
    },
});

export const { setFiles, addFile, deleteFile, setIsLoading, setError } =
    filesSlice.actions;

export default filesSlice.reducer;
