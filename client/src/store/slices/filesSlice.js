/**
 * Redux slice for managing file-related state in ByteTogether.
 * @module filesSlice
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ID, Query } from 'appwrite';

import { databaseService } from '../../appwrite-services/database';
import appwriteConfig from '../../conf/appwriteConfig';

/**
 * Async thunk to save all files for a new project in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {string} payload.projectName - The project name.
 * @param {Array<Object>} payload.files - Array of file objects { name, language, codeContent }.
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
                }
            );

            const savePromises = files.map((file) =>
                databaseService.createDocument(
                    appwriteConfig.appwriteFilesCollectionID,
                    {
                        projectId: project.$id,
                        fileName: file.fileName,
                        language: file.language,
                        codeContent: file.codeContent,
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
 * @param {Array<Object>} payload.files - Array of file objects { $id, codeContent, language }.
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
                        codeContent: file.codeContent,
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
 * @param {string} payload.codeContent - The file codeContent.
 * @returns {Promise<Object>} The created document.
 */
export const createFileDB = createAsyncThunk(
    'files/createFileDB',
    async (
        { projectId, fileName, language, codeContent, documentId },
        { rejectWithValue, dispatch, getState }
    ) => {
        const { user } = getState().auth;

        try {
            const data = {
                $id: documentId,
                projectId,
                fileName,
                language,
                codeContent,
                ownerId: user?.$id || 'guest',
            };

            dispatch(addFile(data)); // Optimistic Update

            const newFile = await databaseService.createDocument(
                appwriteConfig.appwriteFilesCollectionID,
                documentId,
                data
            );

            return newFile;
        } catch (error) {
            dispatch(deleteFile(documentId)); // Rollback on failure
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to update an existing file in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {string} payload.fileId - The file ID.
 * @param {string} payload.codeContent - The updated codeContent.
 * @param {string} payload.language - The updated language.
 * @returns {Promise<Object>} The updated document.
 */
export const updateFileDB = createAsyncThunk(
    'files/updateFileDB',
    async (
        { fileId, codeContent, language, fileName },
        { rejectWithValue, dispatch, getState }
    ) => {
        const { files } = getState().files;
        const oldFile = files.find((file) => file.$id === fileId);

        try {
            const newfile = { ...oldFile, codeContent, language, fileName };

            dispatch(updateFile(newfile)); // Optimistic Update

            const data = { codeContent, language, fileName };
            const updatedFile = await databaseService.updateDocument(
                appwriteConfig.appwriteFilesCollectionID,
                fileId,
                data
            );

            return updatedFile;
        } catch (error) {
            if (oldFile) {
                dispatch(updateFile(oldFile)); // Rollback on failure
            }
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to delete a file in Appwrite.
 * @param {Object} payload - The action payload.
 * @param {string} payload.fileId - The file ID.
 * @returns {void}
 */
export const deleteFileDB = createAsyncThunk(
    'files/deleteFileDB',
    async ({ fileId }, { rejectWithValue, dispatch, getState }) => {
        const { files } = getState().files;
        const fileToDelete = files.find((file) => file.$id === fileId);

        try {
            dispatch(deleteFile(fileId)); // Optimistic update

            await databaseService.deleteDocument(
                appwriteConfig.appwriteFilesCollectionID,
                fileId
            );
        } catch (error) {
            if (fileToDelete) {
                dispatch(addFile(fileToDelete)); // Rollback on failure
            }
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
        setFiles: (state, action) => {
            state.files = action.payload;
        },
        /**
         * Adds a file to the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing the file.
         */
        addFile: (state, action) => {
            if (!state.files.includes(action.payload.$id)) {
                state.files.push(action.payload);
            }
        },
        /**
         * Updates a file in the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing the file.
         */
        updateFile: (state, action) => {
            const { $id } = action.payload;
            const index = state.files.findIndex((file) => file.$id === $id);

            if (index !== -1) {
                state.files[index] = {
                    ...action.payload,
                };
            }
        },
        /**
         * Deletes a file from the list of files for the project.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing the file ID.
         */
        deleteFile: (state, action) => {
            state.files = state.files.filter(
                (file) => file.$id !== action.payload
            );
        },
        /**
         * Sets the loading state.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing boolean.
         */
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        /**
         * Sets the error message.
         * @param {FilesState} state - Current state.
         * @param {Object} action - Action with payload containing error string.
         */
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Save files to DB for a new Project
            .addCase(saveAllFilesForNewProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(saveAllFilesForNewProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files = action.payload;
            })
            .addCase(saveAllFilesForNewProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update files in DB for an existing Project
            .addCase(updateAllFilesForExistingProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                updateAllFilesForExistingProject.fulfilled,
                (state, action) => {
                    state.isLoading = false;
                    state.files = action.payload;
                }
            )
            .addCase(
                updateAllFilesForExistingProject.rejected,
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            )
            // Get all files by Project ID
            .addCase(getFilesByProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getFilesByProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.files = action.payload;
            })
            .addCase(getFilesByProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create File
            .addCase(createFileDB.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createFileDB.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createFileDB.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update File
            .addCase(updateFileDB.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateFileDB.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateFileDB.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete File
            .addCase(deleteFileDB.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteFileDB.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteFileDB.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFiles,
    addFile,
    updateFile,
    deleteFile,
    setIsLoading,
    setError,
} = filesSlice.actions;

export default filesSlice.reducer;
