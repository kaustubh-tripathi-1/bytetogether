import { useEffect, useRef } from 'react';

/**
 * Custom hook that debounces a callback function with a delay. Multiple call restarts the delay.
 * @param {function} callback - The callback function to execute when the timeout with delay expires
 * @param {number} delay - The delay after which the callback is to be executed
 * @returns {function} A debounced version of the callback
 */
export function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (...args) => {
        const preservedThis = this;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback.apply(preservedThis, args);
        }, delay);
    };
}
