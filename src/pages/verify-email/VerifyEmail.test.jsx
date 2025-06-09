import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import VerifyEmail from './VerifyEmail.jsx';

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
        completeEmailVerification: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/verify-email?userId=123&secret=abc']
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
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/resend-verification-email"
                            element={<div>Resend Verification Email Page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
    };
};

describe('VerifyEmail Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authService.getCurrentUser.mockResolvedValue(null);
    });

    it('renders the loading state with valid query params', () => {
        renderWithProviders({
            auth: { authStatus: false, isLoading: true, error: null },
        });

        expect(
            screen.getByRole('heading', { name: 'Email Verification' })
        ).toBeInTheDocument();
        expect(screen.getByText('Verifying your email')).toBeInTheDocument();
    });

    it('displays local error for missing query params', () => {
        renderWithProviders(
            { auth: { authStatus: false, isLoading: false, error: null } },
            ['/verify-email']
        );

        expect(
            screen.getByText(/invalid or missing verification link parameters/i)
        ).toBeInTheDocument();
    });
});
