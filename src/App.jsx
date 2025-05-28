import { createBrowserRouter, RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { useDispatch /* , useSelector */ } from 'react-redux';

import { fetchCurrentUser } from './store/slices/authSlice';
import {
    Layout,
    //   Home,
    Login,
    //   Signup,
    //   About,
    //   Contact,
    ProtectedRoute,
    //   NotFound,
    ErrorBoundary,
    //   UserProfile,
    //   EditProfile,
    //   ForgotPassword,
    //   ResetPassword,
    //   VerifyEmail,
    //   EmailSent,
    //   ResendVerificationEmail,
    //   SearchResults,
    //   ProjectList,
    //   ProjectEditor,
    //   NewProject
} from './components/componentsIndex';

/**
 * Router configuration for ByteTogether.
 */
const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorBoundary />, // Root error fallback
        children: [
            /* { path: '', index: true, element: <Home /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
            {
                path: 'projects',
                element: (
                    <ProtectedRoute>
                        <ProjectList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'project/new',
                element: (
                    <ProtectedRoute>
                        <NewProject />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'project/:projectId',
                element: (
                    <ProtectedRoute>
                        <ProjectEditor />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'profile/:userId',
                element: (
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'profile/edit/:userId',
                element: (
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                ),
            },
            { path: 'search', element: <SearchResults /> },
            { path: '*', element: <NotFound /> }, */
        ],
    },
    {
        path: 'login',
        element: <Login />,
        errorElement: <ErrorBoundary />,
    },
    // {
    //     path: 'signup',
    //     element: <Signup />,
    //     errorElement: <ErrorBoundary />,
    // },
    // {
    //     path: 'forgot-password',
    //     element: <ForgotPassword />,
    //     errorElement: <ErrorBoundary />,
    // },
    // {
    //     path: 'reset-password',
    //     element: <ResetPassword />,
    //     errorElement: <ErrorBoundary />,
    // },
    // {
    //     path: 'verify-email',
    //     element: <VerifyEmail />,
    //     errorElement: <ErrorBoundary />,
    // },
    // {
    //     path: 'email-sent',
    //     element: <EmailSent />,
    //     errorElement: <ErrorBoundary />,
    // },
    // {
    //     path: 'resend-verification-email',
    //     element: <ResendVerificationEmail />,
    //     errorElement: <ErrorBoundary />,
    // },
]);

/**
 * Root component that sets up routing, auth validation, and theme switching.
 * @returns {JSX.Element} The router provider.
 */
export default function App() {
    const dispatch = useDispatch();
    // const { theme } = useSelector((state) => state.ui);

    // Perform background auth validation on mount
    useEffect(() => {
        dispatch(fetchCurrentUser()).catch((error) => {
            console.error('Background auth validation failed:', error);
        });
    }, [dispatch]);

    // Apply theme using data-theme attribute
    /* useEffect(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
    }, [theme]); */

    return <RouterProvider router={router} />;
}
