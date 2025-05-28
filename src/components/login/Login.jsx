import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { loginUser, setError } from '../../store/slices/authSlice';
// import { addNotification } from '../store/slices/uiSlice';
import { CloseEye, OpenEye } from '../componentsIndex';

/**
 * Renders the login page with a form for user authentication.
 * @returns {JSX.Element} The login page component.
 */
export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);
    // const { theme } = useSelector((state) => state.ui);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'onChange' }); // Real-time validation

    const loginOnSubmit = async (data) => {
        try {
            await dispatch(loginUser(data)).unwrap();

            // Redirect to the last path (if stored) or projects page
            const lastPath = sessionStorage.getItem('lastPath') || '/projects';
            navigate(lastPath);
        } catch (error) {
            dispatch(setError(error || 'Login failed'));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-black to-indigo-900 p-4"
        >
            <div className="w-full max-w-md rounded-lg border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">
                    Login
                </h2>

                {/* Error from Redux */}
                {error && (
                    /* error !== 'User (role: guests) missing scope (account)' && */ <div
                        className="mb-4 rounded bg-red-900/20 p-3 text-center text-red-300"
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
                            className="block text-sm font-medium text-gray-200"
                        >
                            Email <sup className="text-red-400">*</sup>
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
                            className="mt-1 w-full rounded-md bg-white/20 p-3 text-white placeholder-gray-300 transition-opacity duration-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="Enter your email"
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
                                className="mt-1 text-sm text-red-300"
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
                            className="block text-sm font-medium text-gray-200"
                        >
                            Password <sup className="text-red-400">*</sup>
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
                                            'Password must be at least 8 characters',
                                    },
                                })}
                                className="mt-1 w-full rounded-md bg-white/20 p-3 text-white placeholder-gray-300 transition-opacity duration-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                placeholder="Enter your password"
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
                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-100 hover:text-gray-300 focus:text-gray-300 focus:outline-none"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? <CloseEye /> : <OpenEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p
                                id="password-error"
                                className="mt-1 text-sm text-red-300"
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
                            className="focus:text- text-sm text-indigo-200 hover:underline focus:outline-none"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full cursor-pointer rounded-md bg-indigo-600 py-3 font-semibold text-white transition-colors duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none disabled:opacity-50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                {/* Signup Link and Cookie Notice */}
                <div className="mt-6 text-center text-sm text-gray-200">
                    <p>
                        Don’t have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-gray-500 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                    <p className="mt-2">
                        We use third-party cookies for authentication. Please
                        ensure you have enabled third-party cookies in your
                        browser settings.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
