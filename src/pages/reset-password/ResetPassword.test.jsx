import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import ResetPassword from './ResetPassword.jsx';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({
            children,
            _whileHover,
            _whileFocus,
            _whileTap,
            ...props
        }) => <button {...props}>{children}</button>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
}));

// Mock authService
vi.mock('../../appwrite-services/auth', () => ({
    authService: {
        completePasswordReset: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/reset-password?userId=123&secret=abc']
) => {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: initialState,
    });

    return {
        store,
        ...render(
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Routes>
                        <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                        />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
    };
};

describe('ResetPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authService.getCurrentUser.mockResolvedValue(null);
    });

    it('renders the form correctly with valid query params', () => {
        renderWithProviders();

        expect(
            screen.getByRole('heading', { name: 'Reset Password' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('New Password *')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /reset password/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/back to/i)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Log in' })
        ).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', () => {
        renderWithProviders();

        fireEvent.click(
            screen.getByRole('button', { name: /reset password/i })
        );

        expect(
            screen.getByRole('paragraph', { value: /password is required/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('paragraph', {
                value: /confirm password is required/i,
            })
        ).toBeInTheDocument();
    });

    it('displays validation error for invalid password', () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('New Password *'), {
            target: { value: 'pass' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /reset password/i })
        );

        expect(
            screen.getByRole('paragraph', {
                value: /password must be at least 8 characters/i,
            })
        ).toBeInTheDocument();
    });

    it('displays validation error for mismatched passwords', () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('New Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Confirm Password *'), {
            target: { value: 'Password123?' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /reset password/i })
        );

        expect(
            screen.getByRole('paragraph', { value: /Passwords do not match/i })
        ).toBeInTheDocument();
    });

    it('toggles password visibility for both fields', () => {
        renderWithProviders();

        const passwordInput = screen.getByLabelText('New Password *');
        const confirmPasswordInput =
            screen.getByLabelText('Confirm Password *');
        const togglePasswordButton = screen.getByRole('button', {
            name: 'Show password',
        });
        const toggleConfirmPasswordButton = screen.getByRole('button', {
            name: 'Show confirm password',
        });

        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        fireEvent.click(togglePasswordButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(
            screen.getByRole('button', { name: 'Hide password' })
        ).toBeInTheDocument();

        fireEvent.click(toggleConfirmPasswordButton);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
        expect(
            screen.getByRole('button', { name: 'Hide confirm password' })
        ).toBeInTheDocument();
    });
});
