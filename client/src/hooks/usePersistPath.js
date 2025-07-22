import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * Custom hook to persist the current route path and navigation type in sessionStorage.
 * Useful for redirecting users after authentication actions (e.g., login/logout).
 */
export function usePersistPath() {
    const location = useLocation();
    const navigationType = useNavigationType(); // "PUSH", "POP", or "REPLACE"

    useEffect(() => {
        // Store the last path for redirect handling
        sessionStorage.setItem('lastPath', location.pathname);
        // Store the navigation type
        sessionStorage.setItem('navigationType', navigationType);
    }, [location.pathname, navigationType]);
}
