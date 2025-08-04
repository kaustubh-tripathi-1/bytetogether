import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook that debounces a callback function with a delay. Multiple calls restarts the delay.
 * @param {function} callback - The callback function to execute when the timeout with delay expires
 * @param {number} delay - The delay in milliseconds after which the callback is to be executed
 * @returns {function} A memoized debounced version of the callback
 */
export function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);
    const savedCallbackRef = useRef(callback);

    // Always use the latest version of callback
    useEffect(() => {
        savedCallbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            timeoutRef.current = setTimeout(() => {
                savedCallbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}
