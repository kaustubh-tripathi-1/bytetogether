import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import ResendVerificationEmail from './ResendVerificationEmail.jsx';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => (
            <button {...props}>{children}</button>
        ),
        footer: ({ children, ...props }) => (
            <footer {...props}>{children}</footer>
        ),
    },
}));

// Mock authService
vi.mock('../../appwrite-services/auth', () => ({
    authService: {
        createSession: vi.fn(),
        requestEmailVerification: vi.fn(),
        deleteSession: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/resend-verification-email']
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
                            path="/resend-verification-email"
                            element={<ResendVerificationEmail />}
                        />
                        <Route
                            path="/email-sent"
                            element={<div>Email Sent Page</div>}
                        />
                        <Route path="/" element={<div>Home Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
    };
};

describe('ResendVerificationEmail Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderWithProviders();

        expect(
            screen.getByRole('heading', { name: 'Resend Verification Email' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/enter the email and password/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Password *')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /resend verification email/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', async () => {
        renderWithProviders();

        fireEvent.click(
            screen.getByRole('button', { name: /resend verification email/i })
        );

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(
                screen.getByText('Password is required')
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid email', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'invalid-email' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /resend verification email/i })
        );

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email format')
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid password', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'password' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /resend verification email/i })
        );

        await waitFor(() => {
            expect(
                screen.getByText(/password must contain at least 1 uppercase/i)
            ).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderWithProviders();

        const passwordInput = screen.getByLabelText('Password *');
        const toggleButton = screen.getByRole('button', {
            name: 'Show password',
        });

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(
            screen.getByRole('button', { name: 'Hide password' })
        ).toBeInTheDocument();
    });

    it('dispatches actions and redirects on success', async () => {
        authService.createSession.mockResolvedValue();
        authService.requestEmailVerification.mockResolvedValue();
        authService.deleteSession.mockResolvedValue();

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /resend verification email/i })
        );

        await waitFor(() => {
            expect(authService.createSession).toHaveBeenCalledWith(
                'test@example.com',
                'Password123!'
            );
            expect(authService.requestEmailVerification).toHaveBeenCalled();
            expect(authService.deleteSession).toHaveBeenCalled();
            expect(screen.getByText('Email Sent Page')).toBeInTheDocument();
        });
    });

    it('displays error message on failure', async () => {
        authService.createSession.mockRejectedValue(
            new Error('Invalid email or password')
        );

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'wrong@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /resend verification email/i })
        );

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email or password')
            ).toBeInTheDocument();
        });
    });
});
