import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';

import image404 from '../../assets/not-found-404.jpg';

export default function NotFound() {
    const location = useLocation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen w-full flex-col items-center justify-center bg-white text-red-600 dark:bg-gray-800 dark:text-red-400"
        >
            <img
                src={image404}
                alt="404 not found"
                className="w-80 rounded-2xl shadow-lg shadow-black dark:shadow-gray-50"
            />
            {/* Attribution */}
            <a
                href="https://www.freepik.com/free-vector/oops-404-error-with-broken-robot-concept-illustration_13315300.htm#fromView=keyword&page=1&position=0&uuid=d7de2c0b-baee-45c3-af52-66e080ec7db7&query=404+Page+Found"
                target="_blank"
                className="-ml-35 text-sm text-gray-800 dark:text-gray-50"
                rel="noopener noreferrer"
            >
                Image by storyset on Freepik
            </a>
            <p className="animate-fade-in mt-4 text-2xl" role="alert">
                Page &quot;{location.pathname}&quot; not found. This page does
                not exist
            </p>
            <Link
                to="/"
                className="mt-4 cursor-pointer text-2xl text-blue-500 transition-colors duration-200 hover:text-blue-700 hover:underline focus:text-blue-700 focus:underline focus:outline-none dark:text-blue-500"
            >
                Return to Home Page
            </Link>
        </motion.div>
    );
}
