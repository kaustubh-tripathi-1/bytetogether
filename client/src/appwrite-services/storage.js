import { Client, Storage, ID } from 'appwrite';

import appwriteConfig from '../conf/appwriteConfig';

/**
 * Custom error class for storage-related errors.
 */
class StorageError extends Error {
    /**
     * @param {string} message - The error message.
     * @param {number} code - The error code.
     * @param {string} type - The error type.
     */
    constructor(message, code, type) {
        super(message);
        this.name = 'StorageError';
        this.code = code;
        this.type = type;
    }
}

/**
 * Service for handling file storage operations with Appwrite.
 */
class StorageService {
    #client;
    #storage;

    /**
     * Initializes the Appwrite client and Storage service.
     * @throws {StorageError} If the Appwrite client fails to initialize.
     */
    constructor() {
        this.#client = new Client();

        this.#client
            .setEndpoint(appwriteConfig.appwriteEndpoint)
            .setProject(appwriteConfig.appwriteProjectID);

        this.#storage = new Storage(this.#client);
    }

    /**
     * Uploads a file to the Appwrite storage bucket.
     * @param {File} file - The file to upload (must be a File object).
     * @returns {Promise<object>} Returns a promise that resolves to the created file object (e.g., { $id: "file-id", name: "filename", ... }).
     * @throws {StorageError} If validation fails.
     */
    async uploadFile(file) {
        if (!file) {
            throw new StorageError(
                'No file provided for upload',
                3001,
                'missing_file'
            );
        }

        if (!(file instanceof File)) {
            throw new StorageError(
                'File must be a valid File object',
                3002,
                'invalid_file_type'
            );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            throw new StorageError(
                'File size exceeds the maximum allowed limit of 10MB',
                3003,
                'file_too_large'
            );
        }

        return this.#storage.createFile(
            appwriteConfig.appwriteBucketID,
            ID.unique(),
            file
        );
    }

    /**
     * Generates a view URL for a file in the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to generate a view for.
     * @returns {object} Returns the raw file data without transformations.
     * @throws {StorageError} If validation fails.
     */
    getFileView(fileID) {
        if (!fileID || typeof fileID !== 'string') {
            throw new StorageError(
                'File ID must be a non-empty string',
                3004,
                'invalid_file_id'
            );
        }
        return this.#storage.getFileView(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Retrieves metadata for a file in the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to retrieve.
     * @returns {Promise<object>} Returns a promise that resolves to the file metadata object (e.g., { $id: "file-id", name: "filename", ... }).
     * @throws {StorageError} If validation fails.
     */
    async getFileData(fileID) {
        if (!fileID || typeof fileID !== 'string') {
            throw new StorageError(
                'File ID must be a non-empty string',
                3004,
                'invalid_file_id'
            );
        }

        return this.#storage.getFile(appwriteConfig.appwriteBucketID, fileID);
    }

    /**
     * Downloads a file from the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to download.
     * @returns {Promise<Blob>} Returns a promise that resolves to the file content as a Blob.
     * @throws {StorageError} If validation fails.
     */
    async downloadFile(fileID) {
        if (!fileID || typeof fileID !== 'string') {
            throw new StorageError(
                'File ID must be a non-empty string',
                3004,
                'invalid_file_id'
            );
        }

        return this.#storage.getFileDownload(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Deletes a file from the Appwrite storage bucket.
     * @param {string} fileID - The ID of the file to delete.
     * @returns {Promise<void>} Returns a promise that resolves when the file is deleted.
     * @throws {StorageError} If validation fails.
     */
    async deleteFile(fileID) {
        if (!fileID || typeof fileID !== 'string') {
            throw new StorageError(
                'File ID must be a non-empty string',
                3004,
                'invalid_file_id'
            );
        }

        return this.#storage.deleteFile(
            appwriteConfig.appwriteBucketID,
            fileID
        );
    }

    /**
     * Lists all files in the Appwrite storage bucket.
     * @returns {Promise<object>} Returns a promise that resolves to a list of file metadata objects.
     */
    async listFiles() {
        return this.#storage.listFiles(appwriteConfig.appwriteBucketID);
    }
}

// Singleton export
export const storageService = new StorageService();
