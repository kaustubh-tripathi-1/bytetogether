import { Outlet } from 'react-router';

import { usePersistPath } from '../../hooks/usePersistPath';

// import { Header, Footer } from '../componentsIndex';

/**
 * Renders the main app layout with header, footer, and child routes.
 * Persists the current path and navigation type for redirect handling.
 * @returns {JSX.Element} The layout structure with Outlet for child routes.
 */
export default function Layout() {
    // Persist path using the custom hook
    usePersistPath();

    return (
        <div className="flex min-h-screen flex-col">
            {/* <Header /> */}
            <main className="flex-1 bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200">
                <Outlet />
            </main>
            {/* <Footer /> */}
        </div>
    );
}
