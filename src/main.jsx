import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';

import './index.css';
import App from './App.jsx';
import { store, persistor } from './store/index.js';
import { ErrorBoundary } from './components/componentsIndex.js';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </ErrorBoundary>
    </StrictMode>
);
