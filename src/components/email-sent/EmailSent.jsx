import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'framer-motion';

import { CheckMark, Spinner } from '../componentsIndex';

/**
 * Component displayed after signup or password reset to inform user that an email has been sent.
 * @returns {JSX.Element} Email sent UI with a checkmark animation.
 */
export default function EmailSent() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const emailType = queryParams.get('type') || 'email-verification'; // Fallback

    useEffect(() => {
        // Auto-redirect to login after 20 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 10000);
        return () => clearTimeout(timer);
    }, [navigate]);

    // Checkmark animation variants
    const checkmarkVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 2, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
            },
        },
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-400 via-indigo-300 to-teal-400 p-4 dark:from-black dark:via-sky-900 dark:to-indigo-900"
        >
            <section className="w-full max-w-md rounded-lg border border-gray-300 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/30 dark:bg-white/10 dark:backdrop-blur-md">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                >
                    <CheckMark checkmarkVariants={checkmarkVariants} />
                </motion.div>

                <h1 className="mb-4 text-3xl font-bold text-green-500 dark:text-green-400">
                    Email Sent!
                </h1>
                <div className="mb-4 flex flex-col items-center justify-center">
                    <p className="mb-6 text-gray-700 dark:text-gray-200">
                        {emailType === 'email-verification' ? (
                            <>
                                A verification email has been sent to your
                                inbox. Please check your email (including
                                spam/junk folders) and click the link to verify
                                your account.
                            </>
                        ) : (
                            <>
                                A password reset email has been sent to your
                                inbox. Please check your email (including
                                spam/junk folders) and click the link to reset
                                your password.
                            </>
                        )}
                    </p>
                    <div className="flex items-center justify-center text-gray-700 dark:text-gray-200">
                        <p>Redirecting to login</p>
                        <Spinner
                            className="ml-2"
                            aria-label="Loading spinner for redirect"
                        />
                    </div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-8 text-gray-700 dark:text-gray-200"
                >
                    Didn’t receive the email?{' '}
                    {emailType === 'email-verification' ? (
                        <Link
                            to="/resend-verification-email"
                            className="text-blue-900 hover:text-blue-700 hover:underline focus:underline dark:text-sky-300 dark:hover:text-teal-400 dark:focus:text-teal-400"
                        >
                            Resend Verification Email
                        </Link>
                    ) : (
                        <Link
                            to="/forgot-password"
                            className="text-blue-900 hover:text-blue-700 hover:underline focus:underline dark:text-sky-300 dark:hover:text-teal-400 dark:focus:text-teal-400"
                        >
                            Try Again
                        </Link>
                    )}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    <Link
                        to="/login"
                        className="inline-block rounded-md bg-blue-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:bg-sky-600 dark:focus:ring-sky-400"
                        aria-label="Go to login page"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </section>
        </motion.main>
    );
}
