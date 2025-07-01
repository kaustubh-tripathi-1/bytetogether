import { motion } from 'framer-motion';
import { Link, useNavigate, useRouteError } from 'react-router';

// React-Router functional Error Boundary for errors within router/routes
export default function ErrorBoundaryInRouter() {
    const error = useRouteError(); // Get the error from React Router
    const navigate = useNavigate();

    console.error('Caught by Router ErrorBoundary:', error); // Log it

    if (!error) {
        // If no error, redirect to home or render nothing
        navigate('/', { replace: true });
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center overflow-auto bg-white text-gray-800 dark:bg-[#222233] dark:text-gray-200"
        >
            <div className="flex max-w-5/6 flex-col items-center justify-center gap-4 p-4 text-center">
                <h1 className="mb-4 text-center text-4xl font-bold">
                    Something went wrong!
                </h1>
                <p className="mb-4 max-w-full px-4 text-center text-lg break-words text-red-500 dark:text-red-400">
                    {error?.message || 'Unknown error'}
                </p>
                <div className="flex items-center justify-center gap-12">
                    <button
                        onClick={() => window.location.reload()}
                        className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                    >
                        Reload Page
                    </button>
                    <Link
                        to="/"
                        className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white outline-offset-2 hover:bg-blue-600 focus:bg-blue-600 focus:outline-2 focus:outline-blue-500"
                    >
                        Go To Home
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
