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
        <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h1 className="mb-4 text-4xl font-bold">
                    Something went wrong!
                </h1>
                <p className="mb-4 px-4 text-lg text-red-500 dark:text-red-400">
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
        </div>
    );
}

// Classic Class based Error Boundary
// export default class ErrorBoundaryInRouter extends Component {
//     state = { hasError: false, error: null };

//     static getDerivedStateFromError(error) {
//         // Update state so the next render shows the fallback UI
//         return { hasError: true, error };
//     }

//     componentDidCatch(error, errorInfo) {
//         // Log error to a service (e.g., Sentry) or console
//         console.error("Caught by ErrorBoundary:", error, errorInfo);
//     }

//     render() {
//         if (this.state.hasError) {
//             return (
//                 <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 animate-fade-in">
//                     <div className="flex flex-col justify-center items-center">
//                         <h1 className="text-4xl font-bold mb-6">
//                             Something went wrong!
//                         </h1>
//                         <p className="mb-6 text-red-500 dark:text-red-400">
//                             {this.state.error?.message || "Unknown error"}
//                         </p>
//                         <Link to="/">
//                             <button
//                                 onClick={() =>
//                                     this.setState({
//                                         hasError: false,
//                                         error: null,
//                                     })
//                                 }
//                                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
//                             >
//                                 Go To Home
//                             </button>
//                         </Link>
//                     </div>
//                 </div>
//             );
//         }

//         return this.props.children;
//     }
// }
