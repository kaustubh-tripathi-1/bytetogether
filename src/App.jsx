import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCurrentUser } from './store/slices/authSlice';
import { router } from './router/router.jsx';

/**
 * Root component that sets up routing, auth validation, and theme switching.
 * @returns {JSX.Element} The router provider.
 */
export default function App() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.ui);

    // Perform background auth validation on mount
    useEffect(() => {
        dispatch(fetchCurrentUser()).catch((error) => {
            console.error('Background auth validation failed:', error);
        });
    }, [dispatch]);

    // Apply theme using data-theme attribute
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
    }, [theme]);

    return <RouterProvider router={router} />;
}
