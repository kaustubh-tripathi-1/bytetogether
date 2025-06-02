import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router'; // Updated to react-router-dom
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { signupUser, setError } from '../../store/slices/authSlice';
import { CloseEye, OpenEye, Spinner } from '../componentsIndex';

/**
 * Renders the signup page with a form for user registration.
 * @returns {JSX.Element} The signup page component.
 */
export default function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authStatus, isLoading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ mode: 'onChange' }); // Real-time validation

    const password = watch('password'); // Watch password for confirm password validation

    useEffect(() => {
        dispatch(setError(null)); // Clear errors on mount
        if (authStatus) {
            navigate(`/`);
        }
    }, [authStatus, navigate, dispatch]);

    async function signupOnSubmit(data) {
        try {
            await dispatch(signupUser(data)).unwrap();
            navigate('/email-sent?type=email-verification');
        } catch (error) {
            dispatch(setError(error || 'Signup failed'));
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
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
                    Sign Up
                </h2>

                {/* Error from Redux */}
                {error &&
                    error !== 'User (role: guests) missing scope (account)' && (
                        <div
                            className="mb-4 rounded-md bg-red-400/50 p-3 text-center text-red-700 dark:bg-red-900/25 dark:text-red-400"
                            role="alert"
                        >
                            {error}
                            {error ===
                                'A user already exists with this email. Please log in.' && (
                                <Link
                                    to="/login"
                                    className="ml-1 text-blue-900 hover:text-blue-700 hover:underline focus:underline focus:outline-none dark:text-sky-300 dark:hover:text-teal-400 dark:focus:text-teal-400"
                                >
                                    Log in instead
                                </Link>
                            )}
                        </div>
                    )}

                <form
                    onSubmit={handleSubmit(signupOnSubmit)}
                    className="space-y-6"
                >
                    {/* Name Field */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            Name{' '}
                            <sup className="text-red-500 dark:text-red-400">
                                *
                            </sup>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 1,
                                    message:
                                        'Name must be at least 1 character',
                                },
                                maxLength: {
                                    value: 127,
                                    message:
                                        'Name must be less than 128 characters',
                                },
                            })}
                            className={`mt-1 w-full ${
                                errors.name
                                    ? 'border-2 border-red-400'
                                    : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                            } rounded-md bg-gray-200 p-3 text-gray-900 placeholder-gray-500 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                            disabled={isLoading}
                            autoComplete="name"
                            aria-invalid={errors.name ? 'true' : 'false'}
                            aria-describedby={
                                errors.name ? 'name-error' : undefined
                            }
                        />
                        {errors.name && (
                            <p
                                id="name-error"
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                role="alert"
                            >
                                {errors.name.message}
                            </p>
                        )}
                    </div>

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

                    {/* Username Field */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            Username{' '}
                            <sup className="text-red-500 dark:text-red-400">
                                *
                            </sup>
                        </label>
                        <input
                            id="username"
                            type="text"
                            {...register('username', {
                                required: 'Username is required',
                                minLength: {
                                    value: 3,
                                    message:
                                        'Username must be at least 3 characters',
                                },
                                maxLength: {
                                    value: 30,
                                    message:
                                        'Username must be less than 30 characters',
                                },
                                pattern: {
                                    value: /^[\w]+$/,
                                    message:
                                        'Username can only contain letters, numbers, and underscores',
                                },
                            })}
                            className={`mt-1 w-full ${
                                errors.username
                                    ? 'border-2 border-red-400'
                                    : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                            } rounded-md bg-gray-200 p-3 text-gray-900 placeholder-gray-500 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                            disabled={isLoading}
                            autoComplete="username"
                            aria-invalid={errors.username ? 'true' : 'false'}
                            aria-describedby={
                                errors.username ? 'username-error' : undefined
                            }
                        />
                        {errors.username && (
                            <p
                                id="username-error"
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                role="alert"
                            >
                                {errors.username.message}
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
                                            'Password must be at least 8 characters and must contain at least 1 uppercase, 1 digit, and 1 special character',
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])(?!.*[ ])(?=.*[!@#$%^&*_-|]).{8,}$/,
                                        message:
                                            'Password must contain at least 1 uppercase, 1 digit, and 1 special character',
                                    },
                                })}
                                className={`mt-1 w-full ${
                                    errors.password
                                        ? 'border-2 border-red-400'
                                        : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                                } rounded-md bg-gray-200 p-3 text-gray-900 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                                disabled={isLoading}
                                autoComplete="new-password"
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

                    {/* Confirm Password Field */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            Confirm Password{' '}
                            <sup className="text-red-500 dark:text-red-400">
                                *
                            </sup>
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    required: 'Confirm Password is required',
                                    validate: (value) =>
                                        value === password ||
                                        'Passwords do not match',
                                })}
                                className={`mt-1 w-full ${
                                    errors.confirmPassword
                                        ? 'border-2 border-red-400'
                                        : 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500'
                                } rounded-md bg-gray-200 p-3 text-gray-900 shadow-md transition-[box-shadow] duration-300 focus:outline-none dark:bg-white/20 dark:text-white`}
                                disabled={isLoading}
                                autoComplete="new-password"
                                aria-invalid={
                                    errors.confirmPassword ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.confirmPassword
                                        ? 'confirmPassword-error'
                                        : undefined
                                }
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-gray-100 dark:hover:text-gray-400 dark:focus:text-gray-400"
                                aria-label={
                                    showConfirmPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showConfirmPassword ? (
                                    <CloseEye className="h-5 w-5" />
                                ) : (
                                    <OpenEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                role="alert"
                            >
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{
                            scale:
                                errors.name ||
                                errors.email ||
                                errors.username ||
                                errors.password ||
                                errors.confirmPassword
                                    ? 1
                                    : 1.05,
                        }}
                        whileFocus={{
                            scale:
                                errors.name ||
                                errors.email ||
                                errors.username ||
                                errors.password ||
                                errors.confirmPassword
                                    ? 1
                                    : 1.05,
                        }}
                        whileTap={{
                            scale:
                                errors.name ||
                                errors.email ||
                                errors.username ||
                                errors.password ||
                                errors.confirmPassword
                                    ? 1
                                    : 0.95,
                        }}
                        type="submit"
                        disabled={
                            isLoading ||
                            errors.name ||
                            errors.email ||
                            errors.username ||
                            errors.password ||
                            errors.confirmPassword
                        }
                        className={`w-full rounded-md py-3 font-semibold text-white duration-200 ${
                            errors.name ||
                            errors.email ||
                            errors.username ||
                            errors.password ||
                            errors.confirmPassword
                                ? 'bg-blue-400 dark:bg-sky-400'
                                : 'cursor-pointer bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 dark:bg-sky-500 dark:hover:bg-sky-600'
                        } focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-70 dark:focus:bg-sky-600 dark:focus:ring-sky-400`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                Signing up <Spinner size="1" className="ml-2" />
                            </div>
                        ) : (
                            'Sign Up'
                        )}
                    </motion.button>
                </form>

                {/* Login Link and Cookie Notice */}
                <footer className="mt-6 text-center text-sm text-gray-700 dark:text-gray-200">
                    <p>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-900 hover:text-blue-700 hover:underline focus:text-blue-700 focus:underline focus:outline-none dark:text-sky-300 dark:hover:text-sky-400 dark:focus:text-sky-400"
                        >
                            Log in
                        </Link>
                    </p>
                    <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        Already signed up but missed verification email?{' '}
                    </p>
                    <Link
                        to="/resend-verification-email"
                        className="text-blue-900 hover:text-blue-700 hover:underline focus:text-blue-700 focus:underline focus:outline-none dark:text-sky-300 dark:hover:text-sky-400 dark:focus:text-sky-400"
                    >
                        Resend Verification Email
                    </Link>
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
