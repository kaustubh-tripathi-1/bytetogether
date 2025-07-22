import { Client, Account, ID } from 'appwrite';

import appwriteConfig from '../conf/appwriteConfig';

import { databaseService } from './database.js';

/**
 * Custom error class for authentication-related errors.
 */
class AuthError extends Error {
    /**
     * @param {string} message - The error message.
     * @param {number} code - The numeric error code for programmatic handling.
     * @param {string} type - The type of error (e.g., "username_already_exists", "invalid_email").
     */
    constructor(message, code, type) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
        this.type = type;
    }
}

/**
 * Service for handling user authentication with Appwrite.
 */
class AuthService {
    #client;
    #account;

    constructor() {
        this.#client = new Client();
        try {
            this.#client
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectID);

            this.#account = new Account(this.#client);
        } catch (error) {
            throw new AuthError(
                `Failed to initialize Appwrite client - ${error.message}`,
                1000,
                'initialization_failed'
            );
        }
    }

    /**
     * Validates email, password, username, and name.
     * @param {string} email - User's email address.
     * @param {string} password - User's password (optional if only validating email).
     * @param {string|null} [username=null] - User's username (optional, for signup).
     * @param {string|null} [name=null] - User's display name (optional, for signup).
     * @throws {AuthError} If validation fails.
     */
    #validateCredentials(email, password = null, username = null, name = null) {
        if (
            !email ||
            (password !== null && !password) ||
            (username !== null && !username) ||
            (name !== null && !name)
        ) {
            throw new AuthError(
                username !== null && name !== null
                    ? 'Email, password, username, and name are required'
                    : username !== null
                      ? 'Email, password, and username are required'
                      : name !== null
                        ? 'Email, password, and name are required'
                        : password !== null
                          ? 'Email and password are required'
                          : 'Email is required',
                1001,
                'missing_fields'
            );
        }
        if (
            typeof email !== 'string' ||
            (password !== null && typeof password !== 'string') ||
            (username !== null && typeof username !== 'string') ||
            (name !== null && typeof name !== 'string')
        ) {
            throw new AuthError(
                username !== null && name !== null
                    ? 'Email, password, username, and name must be strings'
                    : username !== null
                      ? 'Email, password, and username must be strings'
                      : name !== null
                        ? 'Email, password, and name must be strings'
                        : password !== null
                          ? 'Email and password must be strings'
                          : 'Email must be a string',
                1002,
                'invalid_types'
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new AuthError('Invalid email format', 1003, 'invalid_email');
        }

        if (username !== null) {
            if (username.length < 3 || username.length > 30) {
                throw new AuthError(
                    'Username must be between 3 and 30 characters',
                    1004,
                    'invalid_username_length'
                );
            }
            if (!/^[\w]+$/.test(username)) {
                throw new AuthError(
                    'Username can only contain letters, numbers, and underscores',
                    1005,
                    'invalid_username_format'
                );
            }
        }

        if (name !== null) {
            if (name.length < 1 || name.length > 127) {
                throw new AuthError(
                    'Name must be between 1 and 127 characters',
                    1006,
                    'invalid_name_length'
                );
            }
        }
    }

    /**
     * Signs up a new user, stores username, and requests email verification.
     * @param {string} email - User's email address.
     * @param {string} password - User's password (minimum 8 characters).
     * @param {string} username - User's username.
     * @param {string} name - User's display name.
     * @returns {Promise<object>} The created user object.
     * @throws {AuthError} If validation fails or username is taken.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async signUp(email, password, username, name) {
        email = email.trim().toLowerCase();
        username = username.trim();
        name = name.trim();
        this.#validateCredentials(email, password, username, name);

        if (password.length < 8 || password.length > 256) {
            throw new AuthError(
                'Password must be between 8 to 256 characters',
                1007,
                'invalid_password_length'
            );
        }

        // Check if username is taken
        if (await databaseService.checkUsernameExists(username)) {
            throw new AuthError(
                'Username is already taken',
                1008,
                'username_already_exists'
            );
        }

        // Create user
        const user = await this.#account.create(
            ID.unique(),
            email,
            password,
            name
        );

        // Create a temporary session to request email verification
        await this.createSession(email, password);
        await this.requestEmailVerification();
        // Set preferences with username
        await this.#account.updatePrefs({
            username: username,
            theme: 'dark', // Default theme (updated as per your change)
            fontSize: 14, // Default font size
        });
        await this.deleteSession();

        // Store username in usernames collection
        await databaseService.createUsername(user.$id, username);

        return user;
    }

    /**
     * Logs in a user with email and password.
     * @param {string} email - User's email address.
     * @param {string} password - User's password.
     * @returns {Promise<object>} The session object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async login(email, password) {
        email = email.trim().toLowerCase();
        this.#validateCredentials(email, password);
        return this.#account.createEmailPasswordSession(email, password);
    }

    /**
     * Logs out the current user.
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async logout() {
        return this.#account.deleteSession('current');
    }

    /**
     * Creates a user session.
     * @param {string} email - User's email address.
     * @param {string} password - User's password.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async createSession(email, password) {
        email = email.trim();
        this.#validateCredentials(email, password);
        await this.#account.createEmailPasswordSession(
            email.toLowerCase(),
            password
        );
    }

    /**
     * Deletes the current user session.
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteSession() {
        await this.#account.deleteSession('current');
    }

    /**
     * Gets the current logged-in user.
     * @returns {Promise<object>} The user object.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getCurrentUser() {
        return this.#account.get();
    }

    /**
     * Requests a password reset for the provided email address.
     * @param {string} email - The user's email address.
     * @param {string} [resetURL] - The URL to redirect the user to for resetting their password.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async requestPasswordReset(
        email,
        resetURL = `${window.location.origin}/reset-password`
    ) {
        email = email.trim();
        this.#validateCredentials(email);
        return this.#account.createRecovery(email.toLowerCase(), resetURL);
    }

    /**
     * Completes the password reset process.
     * @param {string} userId - The user ID from the recovery email.
     * @param {string} secretKey - The secret key from the recovery email.
     * @param {string} newPassword - The new password.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async completePasswordReset(userId, secretKey, newPassword) {
        if (!userId || !secretKey || !newPassword) {
            throw new AuthError(
                'User ID, secret key, and new password are required to complete the password reset process',
                1001,
                'missing_fields'
            );
        }
        if (
            typeof userId !== 'string' ||
            typeof secretKey !== 'string' ||
            typeof newPassword !== 'string'
        ) {
            throw new AuthError(
                'User ID, secret key, and new password must be strings',
                1002,
                'invalid_types'
            );
        }
        if (newPassword.length < 8 || newPassword.length > 256) {
            throw new AuthError(
                'Password must be between 8 to 256 characters',
                1007,
                'invalid_password_length'
            );
        }
        return this.#account.updateRecovery(userId, secretKey, newPassword);
    }

    /**
     * Requests an email verification link for the current user.
     * @param {string} [verifyURL] - The URL to redirect the user to for verifying their email.
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async requestEmailVerification(
        verifyURL = `${window.location.origin}/verify-email`
    ) {
        return this.#account.createVerification(verifyURL);
    }

    /**
     * Completes the email verification process.
     * @param {string} userId - The user ID from the verification email.
     * @param {string} secretKey - The secret key from the verification email.
     * @returns {Promise<void>}
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async completeEmailVerification(userId, secretKey) {
        if (!userId || !secretKey) {
            throw new AuthError(
                'User ID and secret key are required to complete email verification',
                1001,
                'missing_fields'
            );
        }
        if (typeof userId !== 'string' || typeof secretKey !== 'string') {
            throw new AuthError(
                'User ID and secret key must be strings',
                1002,
                'invalid_types'
            );
        }
        return this.#account.updateVerification(userId, secretKey);
    }

    /**
     * Checks if the current user’s email is verified.
     * @returns {Promise<boolean>} True if email is verified, false otherwise.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async checkEmailVerification() {
        const user = await this.#account.get();
        return user.emailVerification;
    }

    /**
     * Updates the email of the current user.
     * @param {string} email - The new email address.
     * @param {string} currentPassword - The user's current password.
     * @returns {Promise<object>} The updated user object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateEmail(email, currentPassword) {
        email = email.trim().toLowerCase();
        this.#validateCredentials(email);
        if (!currentPassword || typeof currentPassword !== 'string') {
            throw new AuthError(
                'Current password is required to update the email and must be a string',
                1001,
                'missing_fields'
            );
        }
        const updatedUser = await this.#account.updateEmail(
            email,
            currentPassword
        );
        await this.requestEmailVerification();
        return updatedUser;
    }

    /**
     * Updates the username of the current user.
     * @param {string} newUsername - The new username.
     * @returns {Promise<object>} The updated user object.
     * @throws {AuthError} If validation fails or username is taken.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateUsername(newUsername) {
        newUsername = newUsername.trim();
        this.#validateCredentials(null, null, newUsername);

        if (await databaseService.checkUsernameExists(newUsername)) {
            throw new AuthError(
                'Username is already taken',
                1008,
                'username_already_exists'
            );
        }

        const user = await this.#account.get();
        await databaseService.updateUsername(user.$id, newUsername);

        const prefs = await this.#account.getPrefs();
        await this.#account.updatePrefs({ ...prefs, username: newUsername });

        return user;
    }

    /**
     * Updates the display name of the current user.
     * @param {string} newName - The new display name.
     * @returns {Promise<object>} The updated user object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateName(newName) {
        newName = newName.trim();
        this.#validateCredentials(null, null, null, newName);
        return this.#account.updateName(newName);
    }

    /**
     * Updates the password of the current user.
     * @param {string} newPassword - The new password.
     * @param {string} currentPassword - The current password.
     * @returns {Promise<object>} The updated user object.
     * @throws {AuthError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updatePassword(newPassword, currentPassword) {
        if (!newPassword || typeof newPassword !== 'string') {
            throw new AuthError(
                'New password is required to update password',
                1001,
                'missing_fields'
            );
        }
        if (!currentPassword || typeof currentPassword !== 'string') {
            throw new AuthError(
                'Current password is required to update password',
                1001,
                'missing_fields'
            );
        }
        if (newPassword.length < 8 || newPassword.length > 256) {
            throw new AuthError(
                'Password must be between 8 to 256 characters',
                1007,
                'invalid_password_length'
            );
        }
        return this.#account.updatePassword(newPassword, currentPassword);
    }

    /**
     * Checks if the current session is valid.
     * @returns {Promise<boolean>} True if the session is valid, false otherwise.
     */
    async checkSession() {
        try {
            await this.#account.getSession('current');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * Updates the preferences of the current user.
     * @param {Object} preferences - The preferences to update (e.g., { theme: "dark", fontSize: 14 }).
     * @returns {Promise<object>} The updated preferences object.
     * @throws {AuthError} If preferences are invalid.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updatePreferences(preferences) {
        if (!preferences || typeof preferences !== 'object') {
            throw new AuthError(
                'Preferences must be a non-empty object',
                1009,
                'invalid_preferences'
            );
        }
        if (
            preferences.theme &&
            !['light', 'dark'].includes(preferences.theme)
        ) {
            throw new AuthError(
                "Theme must be 'light' or 'dark'",
                1010,
                'invalid_theme'
            );
        }
        if (
            preferences.fontSize &&
            (preferences.fontSize < 10 || preferences.fontSize > 24)
        ) {
            throw new AuthError(
                'Font size must be between 10 and 24',
                1011,
                'invalid_font_size'
            );
        }
        return this.#account.updatePrefs(preferences);
    }

    /**
     * Gets the preferences of the current user.
     * @returns {Promise<object>} The user's preferences object.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getPreferences() {
        return this.#account.getPrefs();
    }

    /**
     * Deletes the user account and associated data.
     * @returns {Promise<void>}
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteAccount() {
        const user = await this.#account.get();
        await databaseService.deleteUsername(user.$id);
        await this.#account.deleteSessions();
        throw new AuthError(
            'Account deletion must be implemented server-side',
            1012,
            'server_side_required'
        );
    }
}

export const authService = new AuthService();
