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
        status: null,
        time: '',
        memory: null,
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
         * Sets the status after execution.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setStatus(state, action) {
            state.status = action.payload;
        },
        /**
         * Sets the time taken to execute.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setTime(state, action) {
            state.time = action.payload;
        },
        /**
         * Sets the status after execution.
         * @param {Object} state
         * @param {Object} action
         * @param {string} action.payload
         */
        setMemory(state, action) {
            state.memory = action.payload;
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
        /**
         * Clears Judge0 states.
         * @param {Object} state
         */
        clearJudge0States(state) {
            state.output = '';
            state.input = '';
            state.error = '';
            state.status = null;
            state.time = '';
            state.memory = null;
        },
    },
});

export const {
    setOutput,
    setError,
    setIsRunning,
    setExecutionMode,
    setInput,
    setMemory,
    setStatus,
    setTime,
    clearJudge0States,
} = executionSlice.actions;
export default executionSlice.reducer;
