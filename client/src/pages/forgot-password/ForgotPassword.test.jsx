import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import ForgotPassword from './ForgotPassword.jsx';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        button: ({ children, ...props }) => (
            <button {...props}>{children}</button>
        ),
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
}));

// Mock authService
vi.mock('../../appwrite-services/auth', () => ({
    authService: {
        requestPasswordReset: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/forgot-password']
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
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/email-sent"
                            element={<div>Email Sent Page</div>}
                        />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
    };
};

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderWithProviders();

        expect(
            screen.getByRole('heading', { name: 'Forgot Password' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /send reset email/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/back to/i)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Log in' })
        ).toBeInTheDocument();
    });

    it('displays validation error for empty email', async () => {
        renderWithProviders();

        fireEvent.click(
            screen.getByRole('button', { name: /send reset email/i })
        );

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid email', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'invalid-email' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /send reset email/i })
        );

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email format')
            ).toBeInTheDocument();
        });
    });

    it('dispatches action and redirects on success', async () => {
        authService.requestPasswordReset.mockResolvedValue();

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /send reset email/i })
        );

        await waitFor(() => {
            expect(authService.requestPasswordReset).toHaveBeenCalledWith(
                'test@example.com'
            );
            expect(screen.getByText('Email Sent')).toBeInTheDocument();
        });
    });

    it('displays error message on failure', async () => {
        authService.requestPasswordReset.mockRejectedValue(
            new Error('User not found')
        );

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /send reset email/i })
        );

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });
});
