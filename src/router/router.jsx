import { createBrowserRouter } from 'react-router';

import {
    Layout,
    //   Home,
    Login,
    Signup,
    //   About,
    //   Contact,
    ProtectedRoute,
    NotFound,
    ErrorBoundaryInRoutes,
    //   UserProfile,
    //   EditProfile,
    ForgotPassword,
    ResetPassword,
    VerifyEmail,
    EmailSent,
    ResendVerificationEmail,
    //   SearchResults,
    //   ProjectList,
    //   ProjectEditor,
    NewProject,
} from '../components/componentsIndex.js';

/**
 * Router configuration for ByteTogether.
 */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorBoundaryInRoutes />, // Root error fallback
        children: [
            // { path: '', index: true, element: <Home /> },
            // { path: 'about', element: <About /> },
            // { path: 'contact', element: <Contact /> },
            // {
            //     path: 'projects',
            //     element: (
            //         <ProtectedRoute>
            //             <ProjectList />
            //         </ProtectedRoute>
            //     ),
            // },
            {
                path: 'project/new',
                element: (
                    // <ProtectedRoute>
                    <NewProject />
                    // </ProtectedRoute>
                ),
            },
            // {
            //     path: 'project/:projectId',
            //     element: (
            //         <ProtectedRoute>
            //             <ProjectEditor />
            //         </ProtectedRoute>
            //     ),
            // },
            // {
            //     path: 'profile/:userId',
            //     element: (
            //         <ProtectedRoute>
            //             <UserProfile />
            //         </ProtectedRoute>
            //     ),
            // },
            // {
            //     path: 'profile/edit/:userId',
            //     element: (
            //         <ProtectedRoute>
            //             <EditProfile />
            //         </ProtectedRoute>
            //     ),
            // },
            // { path: 'search', element: <SearchResults /> },
            { path: '*', element: <NotFound /> },
        ],
    },
    {
        path: 'login',
        element: <Login />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'signup',
        element: <Signup />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'forgot-password',
        element: <ForgotPassword />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'reset-password',
        element: <ResetPassword />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'verify-email',
        element: <VerifyEmail />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'email-sent',
        element: <EmailSent />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
    {
        path: 'resend-verification-email',
        element: <ResendVerificationEmail />,
        errorElement: <ErrorBoundaryInRoutes />,
    },
]);
