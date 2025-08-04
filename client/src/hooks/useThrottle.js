import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook that throttles a callback function to execute only once within an interval, ignoring subsequent calls within that interval.
 * @param {function} callback - The callback function to execute once within the provided interval
 * @param {number} interval - The interval in milliseconds during which the callback is to be executed once
 * @param {{ leading?: boolean, trailing?: boolean }} options - Config for leading/trailing execution of callback
 * @returns {function} A memoized throttled version of the callback
 */
export function useThrottle(callback, interval, options = {}) {
    const { leading = true, trailing = true } = options;

    const lastCallTimeRef = useRef(0);
    const savedCallbackRef = useRef(callback);
    const timeoutRef = useRef(null);
    const savedArgsRef = useRef([]);

    // Always keep the latest version of the callback
    useEffect(() => {
        savedCallbackRef.current = callback;
    }, [callback]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    return useCallback(
        (...args) => {
            const now = Date.now();

            if (!leading && !trailing) {
                console.warn(
                    'useThrottle: Both leading and trailing are false. Callback will never be called.'
                );
            }

            const callNow = leading && lastCallTimeRef.current === 0;
            const timeSinceLastCall = now - lastCallTimeRef.current;
            const shouldCall = timeSinceLastCall >= interval;

            if (callNow || shouldCall) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                savedCallbackRef.current(...args);
                lastCallTimeRef.current = now;
            } else if (trailing) {
                savedArgsRef.current = args;

                if (!timeoutRef.current) {
                    const remaining = interval - timeSinceLastCall;

                    timeoutRef.current = setTimeout(() => {
                        savedCallbackRef.current(...savedArgsRef.current);
                        lastCallTimeRef.current = Date.now();
                        timeoutRef.current = null;
                    }, remaining);
                }
            }
        },
        [interval, leading, trailing]
    );
}
