import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { motion } from 'framer-motion';

import {
    completeEmailVerification,
    setError,
} from '../../store/slices/authSlice';
import { Spinner } from '../../components/componentsIndex';

/**
 * Component for completing email verification.
 * @returns {JSX.Element} Verification UI.
 */
export default function VerifyEmail() {
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
            dispatch(
                setError('Invalid or missing verification link parameters')
            );
            setTimeout(() => navigate('/login'), 4000);
            return;
        }

        async function verifyEmail() {
            try {
                await dispatch(
                    completeEmailVerification(userId, secret)
                ).unwrap();
                setSuccess(true);
                setVerified(true);
                setTimeout(() => navigate('/login'), 5000);
            } catch (error) {
                setSuccess(false);
                setVerified(false);
                const errorMessage = error.includes('too_many_requests')
                    ? 'Too many verification attempts. Please try again later.'
                    : error ||
                      'Failed to verify email. The link may be invalid or expired.';
                dispatch(setError(errorMessage));
            }
        }

        verifyEmail();
    }, [searchParams, dispatch, navigate]);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-400 via-indigo-300 to-teal-400 p-4 dark:from-black dark:via-sky-900 dark:to-indigo-900"
        >
            <section className="w-full max-w-md rounded-lg border border-gray-300 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/30 dark:bg-white/10 dark:backdrop-blur-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Email Verification
                </h2>

                <div aria-live="polite">
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <p className="text-gray-700 dark:text-gray-200">
                                Verifying your email
                            </p>
                            <Spinner
                                className="ml-2"
                                aria-label="Loading spinner for email verification"
                            />
                        </div>
                    ) : success && verified ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <p className="mb-4 text-green-500 dark:text-green-400">
                                Email verified successfully! Please log in.
                            </p>
                            <div className="flex items-center justify-center">
                                <p className="text-gray-700 dark:text-gray-200">
                                    Redirecting to login
                                </p>
                                <Spinner
                                    className="ml-2"
                                    aria-label="Loading spinner for redirect"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        error &&
                        error !==
                            'User (role: guests) missing scope (account)' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <p className="mb-4 text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                                <p className="mb-4 text-gray-700 dark:text-gray-200">
                                    Please try again or request a new
                                    verification email.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileFocus={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        navigate('/resend-verification-email')
                                    }
                                    className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:bg-sky-600 dark:focus:ring-sky-400"
                                    aria-label="Resend verification email"
                                >
                                    Resend Verification Email
                                </motion.button>
                            </motion.div>
                        )
                    )}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-4 text-center text-sm text-gray-700 dark:text-gray-200"
                >
                    Back to{' '}
                    <Link
                        to="/login"
                        className="text-blue-900 hover:text-blue-700 hover:underline focus:underline dark:text-sky-300 dark:hover:text-teal-400 dark:focus:text-teal-400"
                    >
                        Log in
                    </Link>
                </motion.p>
            </section>
        </motion.main>
    );
}
