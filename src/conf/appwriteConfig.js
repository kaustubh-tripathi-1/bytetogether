const appwriteConfig = {
    appwriteEndpoint: String(import.meta.env.VITE_APPWRITE_PROJECT_ENDPOINT),
    appwriteProjectID: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseID: String(import.meta.env.VITE_APPWRITE_DB_ID),
    appwriteProjectsCollectionID: String(
        import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID
    ),
    appwriteUsernamesCollectionID: String(
        import.meta.env.VITE_APPWRITE_USERNAMES_COLLECTION_ID
    ),
    appwriteCodeSnippetsCollectionID: String(
        import.meta.env.VITE_APPWRITE_CODE_SNIPPETS_COLLECTION_ID
    ),
    appwriteChatMessagesCollectionID: String(
        import.meta.env.VITE_APPWRITE_CHAT_MESSAGES_COLLECTION_ID
    ),
    appwriteErrorLogsCollectionID: String(
        import.meta.env.VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID
    ),
    appwriteBucketID: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
};

export default appwriteConfig;
