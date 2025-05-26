import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';

// Persist config
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist the auth slice for now
};

// Combined reducers
const rootReducer = {
    auth: persistReducer(persistConfig, authReducer),
};

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
