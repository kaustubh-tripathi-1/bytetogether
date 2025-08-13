import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Query } from 'appwrite';

import appwriteConfig from '../../conf/appwriteConfig';
import { databaseService } from '../../appwrite-services/database';

export const createProject = createAsyncThunk(
    'projects/createProject',
    async ({ name }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            return await databaseService.createDocument(
                appwriteConfig.appwriteProjectsCollectionID,
                { name, ownerId: user.$id }
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async ({ projectId }, { rejectWithValue }) => {
        try {
            await databaseService.deleteDocument(
                appwriteConfig.appwriteProjectsCollectionID,
                projectId
            );

            return projectId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserProjects = createAsyncThunk(
    'projects/fetchUserProjects',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            const response = await databaseService.listDocuments(
                appwriteConfig.appwriteProjectsCollectionID,
                [Query.equal('ownerId', user.$id)]
            );
            return response.documents;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Initial state for the files slice.
 * @typedef {Object} ProjectState
 * @property {Object} activeProject - The currently active project (ID and metadata)..
 * @property {Array} projects - List of project ids of the user.
 * @property {Array} collaborators - List of collaborators.
 * @property {boolean} isLoading - Loading state for project operations.
 * @property {string|null} error - Error message for failed operations.
 */
const initialState = {
    activeProject: null,
    projects: [],
    collaborators: [],
    isLoading: false,
    error: null,
};

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        /**
         * Sets the active project.
         * @param {ProjectState} state - Current state.
         * @param {Object} action - Action with payload containing project data.
         */
        setActiveProject: (state, action) => {
            state.activeProject = action.payload;
        },
        /**
         * Sets the list of collaborators.
         * @param {ProjectState} state - Current state.
         * @param {Object} action - Action with payload containing array of collaborators.
         */
        setCollaborators(state, action) {
            state.collaborators.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Project
            .addCase(createProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects.push(action.payload);
                state.activeProject = action.payload.$id;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete Project
            .addCase(deleteProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects = state.projects.filter(
                    (project) => project.$id !== action.payload
                );
                state.activeProject = null;
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch User Projects
            .addCase(fetchUserProjects.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects = action.payload;
            })
            .addCase(fetchUserProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setActiveProject, setCollaborators } = projectsSlice.actions;
export default projectsSlice.reducer;
