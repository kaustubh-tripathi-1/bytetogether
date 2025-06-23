import { motion } from 'framer-motion';
import { Component } from 'react';

// Classic Class based Error Boundary for errors outside routes i.e. App.
export default class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to a service (e.g., Sentry) or console
        console.error('Caught by global ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex min-h-screen items-center justify-center bg-white text-gray-800 dark:bg-[#222233] dark:text-gray-200"
                >
                    <div className="animate-fade-in flex max-w-5/6 flex-col items-center justify-center p-4">
                        <h1 className="mb-6 text-center text-4xl font-bold">
                            Something went wrong!
                        </h1>
                        <p className="mb-4 max-w-full px-4 text-center text-lg break-words text-red-500 dark:text-red-400">
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                        <div className="flex items-center justify-center gap-12">
                            <button
                                onClick={() => window.location.reload()}
                                className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({
                                        hasError: false,
                                        error: null,
                                    });
                                    window.location.assign('/');
                                }}
                                className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                            >
                                Go To Home
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}
