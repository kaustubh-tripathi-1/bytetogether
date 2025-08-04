import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';

import { addNotification } from '../store/slices/uiSlice';
import {
    setOutput,
    setError,
    setIsRunning,
    setStatus,
    setTime,
    setMemory,
    clearJudge0States,
} from '../store/slices/executionSlice';
import { decodeFromBase64, encodeToBase64 } from '../utils/base64';
import { judge0Limits } from '../conf/judge0Config';

const API_URL = '/api'; // Proxied to backend or Vercel function

/**
 * Executes code using Judge0 CE API via backend proxy in dev mode or via vercel functions in prod. Fetch variant
 * @param {Object} params
 * @param {number} params.language - Language ID (50 for C, 54 for C++, 71 for Python).
 * @param {string} params.sourceCode - Code to execute.
 * @param {string} params.stdin - User-provided input.
 * @returns {Object} stdout and stderr - Program output and errors if any
 */
export async function executeCodeFetch({ language, sourceCode, stdin }) {
    try {
        const response = await fetch(
            `${API_URL}/submissions?base64_encoded=true`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: encodeToBase64(sourceCode),
                    language_id: language,
                    stdin: encodeToBase64(stdin),
                    ...judge0Limits,
                }),
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(
                    `Too many requests. Please try after some time...`
                );
            }
            throw new Error(
                `Judge0 API error: Status - ${response.status}, StatusText - ${response.statusText}`
            );
        }

        const { token } = await response.json();

        let result;
        for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const statusResponse = await fetch(
                `${API_URL}/submissions/${token}?base64_encoded=true`
            );
            result = await statusResponse.json();
            if (result.status.id > 2) break;
        }

        console.log(result);

        let {
            stdout,
            stderr,
            compile_output,
            time,
            memory,
            status,
            wall_time,
        } = result || {};

        if (status?.id === 5) {
            time = wall_time;
        }

        const output = stdout ? decodeFromBase64(stdout) : '';
        const error = stderr
            ? decodeFromBase64(stderr)
            : compile_output
              ? decodeFromBase64(compile_output)
              : '';

        return { stdout: output, stderr: error, time, memory, status };
    } catch (error) {
        console.error(`Execution failed error: ${error.message}`);
        throw new Error(`Execution failed: ${error.message}`);
    }
}

/**
 * Executes code using Judge0 CE API via backend proxy in dev mode or via vercel functions in prod. Axios variant
 * @param {Object} params
 * @param {number} params.language - Language ID (50 for C, 54 for C++, 71 for Python).
 * @param {string} params.sourceCode - Code to execute.
 * @param {string} params.stdin - User-provided input.
 * @returns {Object} stdout and stderr - Program output and errors if any
 */
export async function executeCodeAxios({ language, sourceCode, stdin }) {
    try {
        const response = await axios.post(
            `${API_URL}/submissions?base64_encoded=true`,
            {
                source_code: encodeToBase64(sourceCode),
                language_id: language,
                stdin: encodeToBase64(stdin),
                ...judge0Limits,
            },
            {
                headers: {
                    'content-type': 'application/json',
                },
            }
        );

        const { token } = response.data;
        let result;
        for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            result = (
                await axios.get(
                    `${API_URL}/submissions/${token}?base64_encoded=true`
                )
            ).data;
            if (result.status.id > 2) break;
        }

        let {
            stdout,
            stderr,
            compile_output,
            time,
            memory,
            status,
            wall_time,
        } = result || {};

        if (status?.id === 5) {
            time = wall_time;
        }

        const output = stdout ? decodeFromBase64(stdout) : '';
        const error = stderr
            ? decodeFromBase64(stderr)
            : compile_output
              ? decodeFromBase64(compile_output)
              : '';

        return { stdout: output, stderr: error, time, memory, status };
    } catch (error) {
        console.error(`Execution failed error: ${error.message}`);
        if (error.response.status === 429) {
            throw new Error(`Too many requests. Please try after some time...`);
        }
        throw new Error(`Execution failed: ${error.message}`);
    }
}

/**
 * Hook to execute code through Judge0 using TanStack Query.
 * @returns {Object} Mutation hook with execute mutation function and other props.
 */
export function useExecuteCode() {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async ({ language, sourceCode, stdin }) => {
            const response = await fetch(
                `${API_URL}/submissions?base64_encoded=true`,
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        source_code: encodeToBase64(sourceCode),
                        language_id: language,
                        stdin: encodeToBase64(stdin),
                        ...judge0Limits,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(
                        `Too many requests. Please try after some time...`
                    );
                }
                throw new Error(`Judge0 API error: ${response.status}`);
            }

            const { token } = await response.json();

            let result;
            for (let i = 0; i < 10; i++) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const statusResponse = await fetch(
                    `${API_URL}/submissions/${token}?base64_encoded=true`
                );
                result = await statusResponse.json();
                if (result.status.id > 2) break;
            }

            console.log(result);

            let {
                stdout,
                stderr,
                compile_output,
                time,
                memory,
                status,
                wall_time,
            } = result || {};

            if (status?.id === 5) {
                time = wall_time;
            }

            const output = stdout ? decodeFromBase64(stdout) : '';
            const error = stderr
                ? decodeFromBase64(stderr)
                : compile_output
                  ? decodeFromBase64(compile_output)
                  : '';

            return { stdout: output, stderr: error, time, memory, status };
        },

        retry: 3,
        retryDelay: 2000,

        onMutate: () => {
            dispatch(setIsRunning(true));
            dispatch(clearJudge0States());
        },

        onSuccess: (data) => {
            if (data.stdout) {
                dispatch(setOutput(data.stdout));
            }
            if (data.stderr) {
                dispatch(setError(data.stderr));
                dispatch(
                    addNotification({
                        message: `Execution error: ${data.stderr}`,
                        type: 'error',
                        timeout: 4000,
                    })
                );
            }

            if (!data.stderr) {
                dispatch(setTime(data.time));
                dispatch(setMemory(data.memory));
            }
            dispatch(setStatus(data.status));
        },

        onError: (error) => {
            console.error(`Execution failed error: ${error.message}`);
            dispatch(setError(error.message));
            dispatch(
                addNotification({
                    message: `Execution failed: ${error.message}`,
                    type: 'error',
                    timeout: 4000,
                })
            );
        },

        onSettled: () => {
            dispatch(setIsRunning(false));
        },
    });
}
