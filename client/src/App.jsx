import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCurrentUser, setAuthStatus } from './store/slices/authSlice';
import { router } from './router/router.jsx';
import { Notifications } from './components/componentsIndex.js';
import { setPreferences, setProfile } from './store/slices/userSlice.js';

/**
 * Root component that sets up routing, auth validation, and theme switching.
 * @returns {JSX.Element} The router provider.
 */
export default function App() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.ui);

    // Perform background auth validation on mount
    useEffect(() => {
        dispatch(fetchCurrentUser())
            .then((action) => {
                if (action.meta.requestStatus === 'fulfilled') {
                    const userData = action.payload;
                    dispatch(
                        setProfile({
                            ...userData,
                            username: userData?.prefs?.username,
                        })
                    );
                    dispatch(setPreferences(userData.prefs));
                }
            })
            .catch((error) => {
                console.error('Background auth validation failed:', error);
                dispatch(setAuthStatus(false));
            });
    }, [dispatch]);

    // Apply theme using data-theme attribute
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
        html.style.colorScheme = theme;
    }, [theme]);

    return (
        <>
            <Notifications />
            <RouterProvider router={router} />
        </>
    );
}
