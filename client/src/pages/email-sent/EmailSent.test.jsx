import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

import EmailSent from './EmailSent.jsx';

// Mock Framer Motion (include motion.main)
vi.mock('framer-motion', () => ({
    motion: {
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
}));

describe('EmailSent Component', () => {
    beforeEach(() => {
        vi.useFakeTimers(); // Mock timers for setTimeout
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers(); // Restore real timers after each test
    });

    it('renders correctly for email verification', () => {
        render(
            <MemoryRouter
                initialEntries={['/email-sent?type=email-verification']}
            >
                <Routes>
                    <Route path="/email-sent" element={<EmailSent />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole('heading', { name: 'Email Sent!' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/a verification email has been sent/i)
        ).toBeInTheDocument();
        expect(screen.getByText('Redirecting to login')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Resend Verification Email' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Go to Login' })
        ).toBeInTheDocument();
    });

    it('renders correctly for password reset', () => {
        render(
            <MemoryRouter initialEntries={['/email-sent?type=password-reset']}>
                <Routes>
                    <Route path="/email-sent" element={<EmailSent />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByRole('heading', { name: 'Email Sent!' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/a password reset email has been sent/i)
        ).toBeInTheDocument();
        expect(screen.getByText('Redirecting to login')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Try Again' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Go to Login' })
        ).toBeInTheDocument();
    });

    it('redirects to login after 10 seconds', async () => {
        render(
            <MemoryRouter
                initialEntries={['/email-sent?type=email-verification']}
            >
                <Routes>
                    <Route path="/email-sent" element={<EmailSent />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        // Fast-forward time by 10 seconds
        vi.advanceTimersByTime(10000);

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    it('displays Resend Verification Email link for email-verification type', () => {
        render(
            <MemoryRouter
                initialEntries={['/email-sent?type=email-verification']}
            >
                <Routes>
                    <Route path="/email-sent" element={<EmailSent />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const resendLink = screen.getByRole('link', {
            name: 'Resend Verification Email',
        });
        expect(resendLink).toBeInTheDocument();
        expect(resendLink).toHaveAttribute(
            'href',
            '/resend-verification-email'
        );
    });

    it('displays Try Again link for password-reset type', () => {
        render(
            <MemoryRouter initialEntries={['/email-sent?type=password-reset']}>
                <Routes>
                    <Route path="/email-sent" element={<EmailSent />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const tryAgainLink = screen.getByRole('link', { name: 'Try Again' });
        expect(tryAgainLink).toBeInTheDocument();
        expect(tryAgainLink).toHaveAttribute('href', '/forgot-password');
    });
});
