import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import editorReducer from './slices/editorSlice';
import filesReducer from './slices/filesSlice';
import userReducer from './slices/userSlice';

/**
 * Persistence configuration for the auth slice.
 * @type {Object}
 */
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'authStatus'], // Persist only these states
};
/**
 * Persistence configuration for the ui slice.
 * @type {Object}
 */
const uiPersistConfig = {
    key: 'ui',
    storage,
    whitelist: ['theme'], // Persist only theme state
};
/**
 * Persistence configuration for the editor slice.
 * @type {Object}
 */
const editorPersistConfig = {
    key: 'editor',
    storage,
    whitelist: [
        'activeProject',
        'codeContent',
        'language',
        'selectedFile',
        'settings',
    ], // Persist only these states
    throttle: 1000, // Delay storage updates by 1 second
};

/**
 * Persistence configuration for the files slice.
 * @type {Object}
 */
const filesPersistConfig = {
    key: 'files',
    storage,
    whitelist: ['files'], // Persist only files
};

/**
 * Persistence configuration for the user slice.
 * @type {Object}
 */
const userPersistConfig = {
    key: 'user',
    storage,
    whitelist: ['profile', 'preferences'], // Persist only profile and preferences
};

// Combined reducers
const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
    editor: persistReducer(editorPersistConfig, editorReducer),
    files: persistReducer(filesPersistConfig, filesReducer),
    user: persistReducer(userPersistConfig, userReducer),
});

// Redux Store config
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

// Create and export the persistor
export const persistor = persistStore(store);
