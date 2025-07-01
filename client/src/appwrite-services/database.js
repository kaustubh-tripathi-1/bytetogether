import { Client, Databases, Query, ID } from 'appwrite';

import appwriteConfig from '../conf/appwriteConfig';

/**
 * Custom error class for database-related errors.
 */
class DatabaseError extends Error {
    /**
     * @param {string} message - The error message.
     * @param {number} code - The numeric error code for programmatic handling.
     * @param {string} type - The type of error (e.g., "missing_fields", "invalid_document_id").
     */
    constructor(message, code, type) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.type = type;
    }
}

/**
 * Service for handling database operations with Appwrite.
 */
class DatabaseService {
    #client;
    #databases;

    /**
     * Initializes the Appwrite client and Databases service.
     * @throws {DatabaseError} If the Appwrite client fails to initialize.
     */
    constructor() {
        this.#client = new Client();
        try {
            this.#client
                .setEndpoint(appwriteConfig.appwriteEndpoint)
                .setProject(appwriteConfig.appwriteProjectID);

            this.#databases = new Databases(this.#client);
        } catch (error) {
            throw new DatabaseError(
                `Failed to initialize Appwrite client - ${error.message}`,
                2000,
                'initialization_failed'
            );
        }
    }

    /**
     * Validates that a value is a non-empty string.
     * @param {string} value - The value to validate.
     * @param {string} fieldName - The name of the field being validated (for error messaging).
     * @throws {DatabaseError} If the value is not a non-empty string.
     */
    #validateString(value, fieldName) {
        if (!value || typeof value !== 'string') {
            throw new DatabaseError(
                `${fieldName} must be a non-empty string`,
                2001,
                'invalid_types'
            );
        }
    }

    /**
     * Validates a document ID (e.g., Appwrite document ID or slug).
     * @param {string} documentId - The document ID to validate.
     * @throws {DatabaseError} If the document ID is invalid.
     */
    #validateDocumentId(documentId) {
        this.#validateString(documentId, 'Document ID');
        if (documentId.length > 36) {
            throw new DatabaseError(
                'Document ID must be less than 37 characters',
                2002,
                'invalid_document_id'
            );
        }
    }

    /**
     * Checks if a username already exists in the usernames collection.
     * @param {string} username - The username to check.
     * @returns {Promise<boolean>} True if the username exists, false otherwise.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async checkUsernameExists(username) {
        this.#validateString(username, 'Username');

        const response = await this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            [Query.equal('username', username)]
        );

        return response.total > 0;
    }

    /**
     * Creates a username document in the usernames collection.
     * @param {string} userId - The ID of the user.
     * @param {string} username - The username to create.
     * @returns {Promise<object>} The created username document.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async createUsername(userId, username) {
        this.#validateString(userId, 'User ID');
        this.#validateString(username, 'Username');

        return this.#databases.createDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            ID.unique(),
            {
                userId,
                username,
            }
        );
    }

    /**
     * Updates the username for a given user in the usernames collection.
     * @param {string} userId - The ID of the user.
     * @param {string} newUsername - The new username to set.
     * @returns {Promise<object>} The updated username document.
     * @throws {DatabaseError} If validation fails or the username record is not found.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateUsername(userId, newUsername) {
        this.#validateString(userId, 'User ID');
        this.#validateString(newUsername, 'New Username');

        const response = await this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            [Query.equal('userId', userId)]
        );

        if (response.total === 0) {
            throw new DatabaseError(
                'Username record not found for this user',
                2003,
                'username_not_found'
            );
        }

        const usernameDoc = response.documents[0];
        return this.#databases.updateDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            usernameDoc.$id,
            { username: newUsername }
        );
    }

    /**
     * Deletes the username document for a given user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<void>}
     * @throws {DatabaseError} If validation fails or the username record is not found.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteUsername(userId) {
        this.#validateString(userId, 'User ID');

        const response = await this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            [Query.equal('userId', userId)]
        );

        if (response.total === 0) {
            throw new DatabaseError(
                'Username record not found for this user',
                2003,
                'username_not_found'
            );
        }

        const usernameDoc = response.documents[0];
        await this.#databases.deleteDocument(
            appwriteConfig.appwriteDatabaseID,
            appwriteConfig.appwriteUsernamesCollectionID,
            usernameDoc.$id
        );
    }

    /**
     * Creates a new document in the specified collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {Object} data - The data to store in the document.
     * @param {string} [documentId] - Optional document ID (defaults to a unique ID).
     * @returns {Promise<object>} The created document.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async createDocument(collectionId, data) {
        this.#validateString(collectionId, 'Collection ID');

        if (!data || typeof data !== 'object') {
            throw new DatabaseError(
                'Data must be a non-empty object',
                2004,
                'invalid_data'
            );
        }

        return this.#databases.createDocument(
            appwriteConfig.appwriteDatabaseID,
            collectionId,
            ID.unique(),
            data
        );
    }

    /**
     * Updates an existing document in the specified collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} documentId - The ID of the document to update.
     * @param {Object} data - The data to update in the document.
     * @returns {Promise<object>} The updated document.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async updateDocument(collectionId, documentId, data) {
        this.#validateString(collectionId, 'Collection ID');
        this.#validateDocumentId(documentId);

        if (!data || typeof data !== 'object') {
            throw new DatabaseError(
                'Data must be a non-empty object',
                2004,
                'invalid_data'
            );
        }

        return this.#databases.updateDocument(
            appwriteConfig.appwriteDatabaseID,
            collectionId,
            documentId,
            data
        );
    }

    /**
     * Retrieves a document by its ID from the specified collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} documentId - The ID of the document to retrieve.
     * @returns {Promise<object>} The document.
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async getDocument(collectionId, documentId) {
        this.#validateString(collectionId, 'Collection ID');
        this.#validateDocumentId(documentId);

        return this.#databases.getDocument(
            appwriteConfig.appwriteDatabaseID,
            collectionId,
            documentId
        );
    }

    /**
     * Deletes a document by its ID from the specified collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} documentId - The ID of the document to delete.
     * @returns {Promise<void>}
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async deleteDocument(collectionId, documentId) {
        this.#validateString(collectionId, 'Collection ID');
        this.#validateDocumentId(documentId);

        await this.#databases.deleteDocument(
            appwriteConfig.appwriteDatabaseID,
            collectionId,
            documentId
        );
    }

    /**
     * Lists documents from the specified collection with optional queries.
     * @param {string} collectionId - The ID of the collection.
     * @param {string[]} [queries=[]] - Optional Appwrite query strings.
     * @returns {Promise<object>} An object containing the list of documents (e.g., { documents: [...] }).
     * @throws {DatabaseError} If validation fails.
     * @throws {AppwriteException} If the Appwrite API call fails.
     */
    async listDocuments(collectionId, queries = []) {
        this.#validateString(collectionId, 'Collection ID');

        return this.#databases.listDocuments(
            appwriteConfig.appwriteDatabaseID,
            collectionId,
            queries
        );
    }
}

export const databaseService = new DatabaseService();
