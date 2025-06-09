import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { motion } from 'framer-motion';

import { completePasswordReset, setError } from '../../store/slices/authSlice';
import {
    AuthLayout,
    CloseEye,
    OpenEye,
    Spinner,
} from '../../components/componentsIndex';

/**
 * Component for completing password reset.
 * @returns {JSX.Element} Password reset form.
 */
export default function ResetPassword() {
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({ mode: 'onChange' });

    const password = watch('password');

    useEffect(() => {
        dispatch(setError(null));
        if (!searchParams.get('userId') || !searchParams.get('secret')) {
            dispatch(
                setError('Invalid or missing password reset link parameters')
            );
            setTimeout(() => navigate('/login'), 4000);
        }
    }, [searchParams, dispatch, navigate]);

    async function resetPasswordOnSubmit(data) {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        try {
            await dispatch(
                completePasswordReset({
                    userId,
                    secret,
                    newPassword: data.password,
                })
            ).unwrap();
            setSuccess(true);
            setTimeout(() => navigate('/login'), 5000);
        } catch (error) {
            dispatch(setError(error || 'Failed to reset password'));
        }
    }

    function togglePasswordVisibility() {
        setShowPassword((prev) => !prev);
    }

    function toggleConfirmPasswordVisibility() {
        setShowConfirmPassword((prev) => !prev);
    }

    return (
        <AuthLayout>
            <section className="w-full max-w-md rounded-lg border border-gray-300 p-8 shadow-xl backdrop-blur-xl dark:border-white/30 dark:bg-white/10 dark:backdrop-blur-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Reset Password
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

                {success ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <p className="mb-4 text-green-500 dark:text-green-400">
                            Password reset successfully! Please log in with your
                            new password.
                        </p>
                        <div className="flex items-center justify-center">
                            <p className="text-gray-700 dark:text-gray-200">
                                Redirecting to login
                            </p>
                            <Spinner
                                className="ml-2 text-gray-900 dark:text-gray-200"
                                aria-label="Loading spinner for redirect"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <form
                        onSubmit={handleSubmit(resetPasswordOnSubmit)}
                        className="space-y-6"
                    >
                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                                New Password{' '}
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
                                                'Password must be at least 8 characters and contain 1 uppercase, 1 digit, 1 special character',
                                        },
                                        maxLength: {
                                            value: 256,
                                            message:
                                                'Password must be less than 256 characters',
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
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    {...register('confirmPassword', {
                                        required:
                                            'Confirm Password is required',
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
                                        errors.confirmPassword
                                            ? 'true'
                                            : 'false'
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
                                            ? 'Hide confirm password'
                                            : 'Show confirm password'
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
                                    errors.password || errors.confirmPassword
                                        ? 1
                                        : 1.05,
                            }}
                            whileFocus={{
                                scale:
                                    errors.password || errors.confirmPassword
                                        ? 1
                                        : 1.05,
                            }}
                            whileTap={{
                                scale:
                                    errors.password || errors.confirmPassword
                                        ? 1
                                        : 0.95,
                            }}
                            type="submit"
                            disabled={
                                isLoading ||
                                errors.password ||
                                errors.confirmPassword
                            }
                            className={`w-full rounded-md py-3 font-semibold text-white duration-200 ${
                                errors.password || errors.confirmPassword
                                    ? 'bg-blue-400 dark:bg-sky-400'
                                    : 'cursor-pointer bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 dark:bg-sky-500 dark:hover:bg-sky-600'
                            } focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-70 dark:focus:bg-sky-600 dark:focus:ring-sky-400`}
                            aria-label="Reset password"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    Resetting Password{' '}
                                    <Spinner className="ml-2" />
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </motion.button>
                    </form>
                )}

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
        </AuthLayout>
    );
}
