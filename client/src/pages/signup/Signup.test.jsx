import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import Signup from './Signup.jsx';

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

// Mock authService.signUp
vi.mock('../../appwrite-services/auth', () => ({
    authService: {
        signUp: vi.fn(),
        createSession: vi.fn(),
        requestEmailVerification: vi.fn(),
        updatePrefs: vi.fn(),
        deleteSession: vi.fn(),
        createUsername: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/signup']
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
                        <Route path="/signup" element={<Signup />} />
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

describe('Signup Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the signup form correctly', () => {
        renderWithProviders();

        expect(
            screen.getByRole('heading', { name: 'Sign Up' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Username *')).toBeInTheDocument();
        expect(screen.getByLabelText('Password *')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /sign up/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
        expect(
            screen.getByText('Resend Verification Email')
        ).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', async () => {
        renderWithProviders();

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument();
            expect(screen.getByText('Email is required')).toBeInTheDocument();
            expect(
                screen.getByText('Username is required')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Password is required')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Confirm Password is required')
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid email', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'invalid-email' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email format')
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid username', async () => {
        renderWithProviders();

        // Test for too short username
        fireEvent.change(screen.getByLabelText('Username *'), {
            target: { value: 'ab' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Username must be at least 3 characters')
            ).toBeInTheDocument();
        });

        // Test for invalid characters
        fireEvent.change(screen.getByLabelText('Username *'), {
            target: { value: 'user name!' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Username can only contain letters, numbers, and underscores'
                )
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for invalid password', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/password must contain at least 1 uppercase/i)
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for mismatched confirm password', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Confirm Password *'), {
            target: { value: 'Password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Passwords do not match')
            ).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderWithProviders();

        const passwordInput = screen.getByLabelText('Password *');
        const confirmPasswordInput =
            screen.getByLabelText('Confirm Password *');
        const togglePasswordButton = screen.getAllByRole('button', {
            name: 'Show password',
        })[0];
        const toggleConfirmPasswordButton = screen.getAllByRole('button', {
            name: 'Show password',
        })[1];

        // Test password visibility toggle
        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(togglePasswordButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(
            screen.getAllByRole('button', { name: 'Hide password' })[0]
        ).toBeInTheDocument();

        // Test confirm password visibility toggle
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleConfirmPasswordButton);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
        expect(
            screen.getAllByRole('button', { name: 'Hide password' })[1]
        ).toBeInTheDocument();
    });

    it('dispatches signupUser and redirects on success', async () => {
        authService.signUp.mockResolvedValue({ $id: 'user123' });
        authService.createSession.mockResolvedValue();
        authService.requestEmailVerification.mockResolvedValue();
        authService.updatePrefs.mockResolvedValue();
        authService.deleteSession.mockResolvedValue();
        authService.createUsername.mockResolvedValue();

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Name *'), {
            target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Username *'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Confirm Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(authService.signUp).toHaveBeenCalledWith(
                'test@example.com',
                'Password123!',
                'testuser',
                'Test User'
            );
            expect(screen.getByText('Email Sent Page')).toBeInTheDocument();
        });
    });

    it('displays error message on signup failure', async () => {
        authService.signUp.mockRejectedValue(
            new Error('A user already exists with this email. Please log in.')
        );

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Name *'), {
            target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'existing@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Username *'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Confirm Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'A user already exists with this email. Please log in.'
                )
            ).toBeInTheDocument();
            expect(screen.getByText('Log in instead')).toBeInTheDocument();
        });
    });
});
