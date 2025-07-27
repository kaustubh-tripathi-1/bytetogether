import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import DOMPurify from 'dompurify';

import { addNotification } from '../store/slices/uiSlice';
import {
    setOutput,
    setError,
    setIsRunning,
} from '../store/slices/executionSlice';

const API_URL = '/api'; // Proxied to backend or Vercel function

/**
 * Executes code using Judge0 CE API via backend proxy and dispatches results to Redux. Fetch variant
 * @param {Object} params
 * @param {number} params.language - Language ID (50 for C, 54 for C++, 71 for Python).
 * @param {string} params.sourceCode - Code to execute.
 * @param {string} params.stdin - User-provided input.
 * @param {Function} params.dispatch - Redux dispatch function.
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function executeCodeFetch({ language, sourceCode, stdin }) {
    try {
        const sanitizedCode = DOMPurify.sanitize(sourceCode);
        const sanitizedStdin = DOMPurify.sanitize(stdin || '');

        const response = await fetch(
            `${API_URL}/submissions?base64_encoded=true`,
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    source_code: btoa(sanitizedCode),
                    language_id: language,
                    stdin: btoa(sanitizedStdin),
                }),
            }
        );

        if (!response.ok)
            throw new Error(`Judge0 API error: ${response.status}`);
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

        const output = result.stdout ? atob(result.stdout) : '';
        const error = result.stderr
            ? atob(result.stderr)
            : result.compile_output
              ? atob(result.compile_output)
              : '';

        return { stdout: output, stderr: error };
    } catch (error) {
        throw new Error(`Execution failed: ${error.message}`);
    }
}

/**
 * Executes code using Judge0 CE API via backend proxy and dispatches results to Redux. Axios variant
 * @param {Object} params
 * @param {number} params.language - Language ID (50 for C, 54 for C++, 71 for Python).
 * @param {string} params.sourceCode - Code to execute.
 * @param {string} params.stdin - User-provided input.
 * @param {Function} params.dispatch - Redux dispatch function.
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function executeCodeAxios({ language, sourceCode, stdin }) {
    try {
        const sanitizedCode = DOMPurify.sanitize(sourceCode);
        const sanitizedStdin = DOMPurify.sanitize(stdin || '');

        const response = await axios.post(
            `${API_URL}/submissions?base64_encoded=true`,
            {
                source_code: btoa(sanitizedCode),
                language_id: language,
                stdin: btoa(sanitizedStdin),
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

        const output = result.stdout ? atob(result.stdout) : '';
        const error = result.stderr
            ? atob(result.stderr)
            : result.compile_output
              ? atob(result.compile_output)
              : '';

        return { stdout: output, stderr: error };
    } catch (error) {
        throw new Error(`Execution failed: ${error.message}`);
    }
}

/**
 * Hook to execute code using TanStack Query.
 * @param {Function} dispatch - Redux dispatch function.
 * @returns {Object} Mutation hook with execute function.
 */
export function useExecuteCode(dispatch) {
    return useMutation({
        mutationFn: async ({ language, sourceCode, stdin }) => {
            const sanitizedCode = DOMPurify.sanitize(sourceCode);
            const sanitizedStdin = DOMPurify.sanitize(stdin || '');

            const response = await fetch(
                `${API_URL}/submissions?base64_encoded=true`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        source_code: btoa(sanitizedCode),
                        language_id: language,
                        stdin: btoa(sanitizedStdin),
                    }),
                }
            );

            if (!response.ok)
                throw new Error(`Judge0 API error: ${response.status}`);
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

            return {
                stdout: result.stdout ? atob(result.stdout) : '',
                stderr: result.stderr
                    ? atob(result.stderr)
                    : result.compile_output
                      ? atob(result.compile_output)
                      : '',
            };
        },
        onMutate: () => {
            dispatch(setIsRunning(true));
        },
        onSuccess: (data) => {
            dispatch(setOutput(data.stdout));
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
        },
        onError: (error) => {
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
