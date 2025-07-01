import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';

import authReducer from '../../store/slices/authSlice';
import { authService } from '../../appwrite-services/auth';

import Login from './Login.jsx';

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

// Mock authService.login
vi.mock('../../appwrite-services/auth', () => ({
    authService: {
        login: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

const renderWithProviders = (
    initialState = {
        auth: { authStatus: false, isLoading: false, error: null },
    },
    initialEntries = ['/login']
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
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/projects"
                            element={<div>Projects Page</div>}
                        />
                        <Route path="/" element={<div>Home Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
    };
};

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the login form correctly', () => {
        renderWithProviders();

        expect(
            screen.getByRole('heading', { name: 'Login' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Password *')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /login/i })
        ).toBeInTheDocument();
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', async () => {
        renderWithProviders();

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

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
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email format')
            ).toBeInTheDocument();
        });
    });

    it('displays validation error for short password', async () => {
        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'short' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/password must be at least 8 characters/i)
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

    it('dispatches loginUser and redirects on success', async () => {
        sessionStorage.setItem('lastPath', '/projects');
        authService.login.mockResolvedValue({ $id: 'session123' });
        authService.getCurrentUser.mockResolvedValue({
            $id: 'user123',
            email: 'test@example.com',
        });

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'Password123!' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith(
                'test@example.com',
                'Password123!'
            );
            expect(screen.getByText('Projects Page')).toBeInTheDocument();
        });
    });

    it('displays error message on login failure', async () => {
        authService.login.mockRejectedValue(
            new Error('Invalid email or password')
        );

        renderWithProviders();

        fireEvent.change(screen.getByLabelText('Email *'), {
            target: { value: 'wrong@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Password *'), {
            target: { value: 'WrongPassword@1234' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Invalid email or password')
            ).toBeInTheDocument();
        });
    });
});
