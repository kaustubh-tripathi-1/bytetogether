import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { authService } from '../../appwrite-services/auth';

/**
 * Logs in a user using Appwrite AuthService.
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<Object>} The logged-in user's data.
 */
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            // Validation
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }
            const session = await authService.login(
                credentials.email,
                credentials.password
            );
            const user = await authService.getCurrentUser();
            return { user, session };
        } catch (error) {
            if (error.code === 429) {
                return rejectWithValue(
                    'Too many login attempts. Please try again later.'
                );
            }
            if (error.code === 400 || error.code === 401) {
                return rejectWithValue('Invalid email or password');
            }

            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

/**
 * Logs out the current user using Appwrite AuthService.
 * @returns {Promise<void>}
 */
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (error) {
            if (error.code === 401) {
                // Session already gone, treat as success
                return;
            }
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

/**
 * Fetches the current user to validate authentication status.
 * @returns {Promise<Object|null>} The current user's data, or null if not logged in.
 */
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getCurrentUser();
            return user;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch user');
        }
    }
);

/**
 * Signs up a new user using Appwrite AuthService.
 * @param {Object} userData - The user's signup details.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's password.
 * @param {string} userData.name - The user's name.
 * @param {string} userData.username - The user's username.
 * @returns {Promise<Object>} The created user's data.
 */
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ email, password, name, username }, { rejectWithValue }) => {
        try {
            const user = await authService.signUp(
                email,
                password,
                username,
                name
            );
            return user;
        } catch (error) {
            if (error.type === 'user_already_exists') {
                return rejectWithValue(
                    'A user already exists with this email. Please log in.'
                );
            }
            return rejectWithValue(error.message || 'Signup failed');
        }
    }
);

/**
 * Creates a temporary session.
 * @param {Object} credentials - Email and password.
 * @returns {Promise<boolean>} Success status.
 */
export const createTempSession = createAsyncThunk(
    'auth/createTempSession',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            await authService.createSession(email, password);
            return true;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create session');
        }
    }
);

/**
 * Deletes the current session.
 * @returns {Promise<boolean>} Success status.
 */
export const deleteSession = createAsyncThunk(
    'auth/deleteSession',
    async (_, { rejectWithValue }) => {
        try {
            await authService.deleteSession();
            return true;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete session');
        }
    }
);

/**
 * Requests a password reset email.
 * @param {string} email - The user's email.
 * @returns {Promise<boolean>} Success status.
 */
export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async (email, { rejectWithValue }) => {
        try {
            await authService.requestPasswordReset(email);
            return true;
        } catch (error) {
            return rejectWithValue(
                error.message || 'Failed to send reset email'
            );
        }
    }
);

/**
 * Completes the password reset process.
 * @param {Object} data - The reset details.
 * @param {string} data.userId - The user's ID.
 * @param {string} data.secret - The reset secret.
 * @param {string} data.newPassword - The new password.
 * @returns {Promise<boolean>} Success status.
 */
export const completePasswordReset = createAsyncThunk(
    'auth/completePasswordReset',
    async ({ userId, secret, newPassword }, { rejectWithValue }) => {
        try {
            await authService.completePasswordReset(
                userId,
                secret,
                newPassword
            );
            return true;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reset password');
        }
    }
);

/**
 * Requests an email verification link.
 * @returns {Promise<boolean>} Success status.
 */
export const requestEmailVerification = createAsyncThunk(
    'auth/requestEmailVerification',
    async (_, { rejectWithValue }) => {
        try {
            await authService.requestEmailVerification();
            return true;
        } catch (error) {
            return rejectWithValue(
                error.message || 'Failed to send verification email'
            );
        }
    }
);

/**
 * Completes email verification.
 * @param {Object} data - The verification details.
 * @param {string} data.userId - The user's ID.
 * @param {string} data.secret - The verification secret.
 * @returns {Promise<boolean>} Success status.
 */
export const completeEmailVerification = createAsyncThunk(
    'auth/completeEmailVerification',
    async ({ userId, secret }, { rejectWithValue }) => {
        try {
            await authService.completeEmailVerification(userId, secret);
            return true;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify email');
        }
    }
);

/**
 * Initial state for the auth slice.
 * @typedef {Object} AuthState
 * @property {Object|null} user - The authenticated user's data (e.g., { $id, email, name, prefs }).
 * @property {boolean} authStatus - Indicates if the user is authenticated.
 * @property {boolean} session - The authenticated user's session data (e.g., { $id, $createdAt, $updatedAt, userId, expire }).
 * @property {boolean} isLoading - Indicates if an auth operation is in progress.
 * @property {boolean} isLoadingInitial - Indicates if the initial auth validation is in progress.
 * @property {string|null} error - Stores error messages from auth operations.
 */
const initialState = {
    user: null,
    authStatus: false,
    session: null,
    isLoading: false,
    isLoadingInitial: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Logs in the user synchronously and stores their data.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The user's data.
         */
        login: (state, action) => {
            state.authStatus = true;
            state.user = action.payload.user;
            state.session = action.payload.session;
            state.isLoading = false;
            state.error = null;
        },
        /**
         * Logs out the user synchronously and clears their data.
         * @param {AuthState} state - The current state.
         */
        logout: (state) => {
            state.authStatus = false;
            state.user = null;
            state.session = null;
            state.isLoading = false;
            state.error = null;
        },
        /**
         * Sets the user data synchronously.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object|null} action.payload - The user's data.
         */
        setUser: (state, action) => {
            state.user = action.payload;
            state.authStatus = action.payload !== null;
        },
        /**
         * Sets the auth status synchronously.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The auth status.
         */
        setAuthStatus: (state, action) => {
            state.authStatus = action.payload;
        },
        /**
         * Sets the loading state for general auth operations.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The loading state.
         */
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        /**
         * Sets the loading state for initial auth validation.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {boolean} action.payload - The initial loading state.
         */
        setIsLoadingInitial: (state, action) => {
            state.isLoadingInitial = action.payload;
        },
        /**
         * Sets the error message.
         * @param {AuthState} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string|null} action.payload - The error message or null.
         */
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login User
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.authStatus = true;
                state.user = action.payload.user;
                state.session = action.payload.session;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Logout User
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.session = null;
                state.authStatus = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Current User (for background validation)
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoadingInitial = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoadingInitial = false;
                if (action.payload) {
                    state.authStatus = true;
                    state.user = action.payload;
                } else {
                    state.authStatus = false;
                    state.user = null;
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoadingInitial = false;
                state.authStatus = false;
                state.user = null;
                state.error = action.payload;
            })
            // Signup User
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.authStatus = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Temporary Session
            .addCase(createTempSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createTempSession.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createTempSession.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete Session
            .addCase(deleteSession.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSession.fulfilled, (state) => {
                state.isLoading = false;
                state.authStatus = false;
                state.user = null;
            })
            .addCase(deleteSession.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Request Password Reset
            .addCase(requestPasswordReset.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(requestPasswordReset.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Complete Password Reset
            .addCase(completePasswordReset.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(completePasswordReset.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(completePasswordReset.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Request Email Verification
            .addCase(requestEmailVerification.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(requestEmailVerification.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(requestEmailVerification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Complete Email Verification
            .addCase(completeEmailVerification.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(completeEmailVerification.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(completeEmailVerification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    login,
    logout,
    setUser,
    setAuthStatus,
    setIsLoading,
    setIsLoadingInitial,
    setError,
} = authSlice.actions;

export default authSlice.reducer;
