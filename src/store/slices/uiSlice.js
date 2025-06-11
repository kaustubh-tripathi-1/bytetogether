import { createSlice, nanoid } from '@reduxjs/toolkit';

/**
 * Initial State for the UI slice
 */
const initialState = {
    theme: 'dark',
    isModalOpen: false,
    modalType: null,
    modalData: null,
    notifications: [],
};

/**
 * Redux slice for managing global UI state.
 */
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /**
         * Sets the current theme and persists it to local storage.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string} action.payload - The theme ("light" or "dark").
         */
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        /**
         * Opens a modal with a specific type and data.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The modal details.
         * @param {string} action.payload.type - The modal type (e.g., "delete-post").
         * @param {Object} [action.payload.data] - Optional modal data (e.g., { slug: "my-post" }).
         */
        openModal: (state, action) => {
            state.isModalOpen = true;
            state.modalType = action.payload.type;
            state.modalData = action.payload.data || null;
        },
        /**
         * Closes the modal and resets its type and data.
         * @param {Object} state - The current state.
         */
        closeModal: (state) => {
            state.isModalOpen = false;
            state.modalType = null;
            state.modalData = null;
        },
        /**
         * Adds a notification with a unique ID and auto-dismiss timeout.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The notification details.
         * @param {string} action.payload.message - The notification message.
         * @param {string} [action.payload.type="info"] - The notification type ("success", "error", "info").
         * @param {number} [action.payload.timeout=2500] - The auto-dismiss timeout in milliseconds.
         */
        addNotification: (state, action) => {
            // Prevent duplicate notifications
            const exists = state.notifications.some(
                (notification) =>
                    notification.message === action.payload.message
            );
            if (!exists) {
                const notification = {
                    id: nanoid(), // Use nanoid for unique ID
                    message: action.payload.message,
                    type: action.payload.type || 'info',
                    timeout: action.payload.timeout || 3000,
                };
                state.notifications.push(notification);
            }
        },
        /**
         * Removes a notification by its ID.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string} action.payload - The ID of the notification to remove.
         */
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
        /**
         * Clears all notifications.
         * @param {Object} state - The current state.
         */
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const {
    setTheme,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
