import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { loginUser, setError } from '../../store/slices/authSlice';
// import { addNotification } from '../store/slices/uiSlice';
import { CloseEye, OpenEye, Spinner } from '../../components/componentsIndex';

/**
 * Renders the login page with a form for user authentication.
 * @returns {JSX.Element} The login page component.
 */
export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authStatus, isLoading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'onChange' }); // Real-time validation

    useEffect(() => {
        dispatch(setError(null)); // Clear errors on mount
        if (authStatus) {
            navigate(`/`);
        }
    }, [authStatus, navigate, dispatch]);

    async function loginOnSubmit(data) {
        try {
            await dispatch(loginUser(data)).unwrap();

            // Redirect to the last path (if stored) or projects page
            const lastPath = sessionStorage.getItem('lastPath') || '/';
            navigate(lastPath);
        } catch (error) {
            dispatch(setError(error || 'Login failed'));
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-400 via-indigo-300 to-teal-400 p-4 dark:from-black dark:via-sky-900 dark:to-indigo-900"
        >
            <section className="w-full max-w-md rounded-lg border border-gray-300 p-8 shadow-xl backdrop-blur-xl dark:border-white/30 dark:bg-white/10 dark:backdrop-blur-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Login
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
                    onSubmit={handleSubmit(loginOnSubmit)}
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

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            Password{' '}
                            <sup className="text-red-500 dark:text-red-400">
                                *
                            </sup>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message:
                                            'Password must be at least 8 characters and must contain at least 1 uppercase, 1 digit and 1 special character',
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])(?!.*[ ])(?=.*[!@#$%^&*_-|]).{8,}$/,
                                        message:
                                            'Password must contain at least 1 uppercase, 1 digit and 1 special character',
                                    },
                                })}
                                className={`mt-1 w-full ${
                                    errors.password
                                        ? 'border-2 border-red-400'
                                        : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                                } rounded-md bg-gray-200 p-3 text-gray-900 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                                disabled={isLoading}
                                autoComplete="current-password"
                                aria-invalid={
                                    errors.password ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-gray-100 dark:hover:text-gray-400 dark:focus:text-gray-400"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? (
                                    <CloseEye className="h-5 w-5" />
                                ) : (
                                    <OpenEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p
                                id="password-error"
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                role="alert"
                            >
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-900 hover:text-blue-700 hover:underline focus:underline focus:outline-none dark:text-sky-300 dark:hover:text-teal-400 dark:focus:text-teal-400"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{
                            scale: errors.email || errors.password ? 1 : 1.05,
                        }}
                        whileFocus={{
                            scale: errors.email || errors.password ? 1 : 1.05,
                        }}
                        whileTap={{
                            scale: errors.email || errors.password ? 1 : 0.95,
                        }}
                        type="submit"
                        disabled={isLoading || errors.email || errors.password}
                        className={`w-full rounded-md py-3 font-semibold text-white duration-200 ${errors.email || errors.password ? 'bg-blue-400 dark:bg-sky-400' : 'cursor-pointer bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 dark:bg-sky-500 dark:hover:bg-sky-600'} focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-70 dark:focus:bg-sky-600 dark:focus:ring-sky-400`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                Logging in <Spinner size="1" className="ml-2" />
                            </div>
                        ) : (
                            'Login'
                        )}
                    </motion.button>
                </form>

                {/* Signup Link and Cookie Notice */}
                <footer className="mt-6 text-center text-sm text-gray-700 dark:text-gray-200">
                    <p>
                        Don’t have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-blue-900 hover:text-blue-700 hover:underline focus:text-blue-700 focus:underline focus:outline-none dark:text-sky-300 dark:hover:text-sky-400 dark:focus:text-sky-400"
                        >
                            Sign up
                        </Link>
                    </p>
                    <p className="mt-2">
                        We use third-party cookies for authentication. Please
                        ensure you have enabled third-party cookies in your
                        browser settings.
                    </p>
                </footer>
            </section>
        </motion.main>
    );
}
