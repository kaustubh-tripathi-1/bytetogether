import { createSlice } from '@reduxjs/toolkit';

/**
 * Redux slice for managing code execution state.
 */
const executionSlice = createSlice({
    name: 'execution',
    initialState: {
        output: '',
        input: '',
        error: '',
        isRunning: false,
        executionMode: 'judge0', // or "preview"
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
         * Sets the execution input.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setInput(state, action) {
            state.input = action.payload;
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
        /**
         * Sets the execution mode state.
         * @param {Object} state
         * @param {Object} action
         * @param {boolean} action.payload
         */
        setExecutionMode(state, action) {
            state.executionMode = action.payload;
        },
    },
});

export const { setOutput, setError, setIsRunning, setExecutionMode, setInput } =
    executionSlice.actions;
export default executionSlice.reducer;
