import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';

import {
    requestEmailVerification,
    setError,
} from '../../store/slices/authSlice';
import { Spinner } from '../../components/componentsIndex';

/**
 * Component for requesting a password reset email.
 * @returns {JSX.Element} Forgot Password form.
 */
export default function ForgotPassword() {
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'onChange' });

    async function requestPasswordResetOnSubmit(data) {
        try {
            await dispatch(requestEmailVerification(data.email)).unwrap();
            navigate('/email-sent?type=password-reset');
        } catch (error) {
            dispatch(setError(error || 'Failed to send reset email'));
        }
    }

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-400 via-indigo-300 to-teal-400 p-4 dark:from-black dark:via-sky-900 dark:to-indigo-900"
        >
            <section className="w-full max-w-md rounded-lg border border-gray-300 p-8 shadow-xl backdrop-blur-xl dark:border-white/30 dark:bg-white/10 dark:backdrop-blur-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Forgot Password
                </h2>

                {/* Error from Redux */}
                {error &&
                    error !== 'User (role: guests) missing scope (account)' && (
                        <div
                            className="mb-4 rounded-md bg-red-400/50 p-3 text-center text-red-700 dark:bg-red-900/25 dark:text-red-400"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                <form
                    onSubmit={handleSubmit(requestPasswordResetOnSubmit)}
                    className="space-y-6"
                >
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            Email{' '}
                            <sup className="text-red-500 dark:text-red-400">
                                *
                            </sup>
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Invalid email format',
                                },
                            })}
                            className={`mt-1 w-full ${
                                errors.email
                                    ? 'border-2 border-red-400'
                                    : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                            } rounded-md bg-gray-200 p-3 text-gray-900 placeholder-gray-500 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                            disabled={isLoading}
                            autoComplete="email"
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                        />
                        {errors.email && (
                            <p
                                id="email-error"
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                role="alert"
                            >
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{
                            scale: errors.email ? 1 : 1.05,
                        }}
                        whileFocus={{
                            scale: errors.email ? 1 : 1.05,
                        }}
                        whileTap={{
                            scale: errors.email ? 1 : 0.95,
                        }}
                        type="submit"
                        disabled={isLoading || errors.email}
                        className={`w-full rounded-md py-3 font-semibold text-white duration-200 ${
                            errors.email
                                ? 'bg-blue-400 dark:bg-sky-400'
                                : 'cursor-pointer bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 dark:bg-sky-500 dark:hover:bg-sky-600'
                        } focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-70 dark:focus:bg-sky-600 dark:focus:ring-sky-400`}
                        aria-label="Send reset email"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                Sending Email <Spinner className="ml-2" />
                            </div>
                        ) : (
                            'Send Reset Email'
                        )}
                    </motion.button>
                </form>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-6 text-center text-sm text-gray-700 dark:text-gray-200"
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
