import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for managing code execution state.
 */
const executionSlice = createSlice({
    name: 'execution',
    initialState: {
        output: '',
        error: '',
        isRunning: false,
    },
    reducers: {
        /**
         * Sets the execution output.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setOutput(state, action) {
            state.output = action.payload;
            state.error = '';
        },
        /**
         * Sets the execution error.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setError(state, action) {
            state.error = action.payload;
            state.output = '';
        },
        /**
         * Sets the running state.
         * @param {Object} state
         * @param {Object} action
         * @param {boolean} action.payload
         */
        setIsRunning(state, action) {
            state.isRunning = action.payload;
        },
    },
});

export const { setOutput, setError, setIsRunning } = executionSlice.actions;
export default executionSlice.reducer;
