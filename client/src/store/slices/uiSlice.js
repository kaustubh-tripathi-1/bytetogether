import { createSlice, nanoid } from '@reduxjs/toolkit';

/**
 * Initial State for the UI slice
 */
const initialState = {
    theme: localStorage.getItem('theme') || 'dark',
    isModalOpen: false,
    modalType: null,
    modalData: null,
    notifications: [],
    activeNotifications: [],
    notificationQueue: [],
};

const MAX_ACTIVE_NOTIFICATIONS = 3;

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
            localStorage.setItem('theme', action.payload);
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
         * Sets the modal type.
         * @param {Object} state - The current state.
         * @param {Object} action.payload - The modal type.
         */
        setModalType: (state, action) => {
            state.modalType = action.payload;
        },
        /**
         * Adds a notification with a unique ID and auto-dismiss timeout.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {Object} action.payload - The notification details.
         * @param {string} action.payload.message - The notification message.
         * @param {string} [action.payload.type="info"] - The notification type ("success", "error", "info").
         * @param {number} [action.payload.timeout=3000] - The auto-dismiss timeout in milliseconds.
         */
        addNotification: (state, action) => {
            // Prevent duplicate notifications
            const exists = state.notifications.some(
                (notification) =>
                    notification.message === action.payload.message
            );
            if (!exists) {
                const notification = {
                    id: nanoid(),
                    message: action.payload.message,
                    type: action.payload.type || 'info',
                    timeout: action.payload.timeout || 3000,
                };
                state.notifications.push(notification);
                if (
                    state.activeNotifications.length < MAX_ACTIVE_NOTIFICATIONS
                ) {
                    state.activeNotifications.push(notification);
                } else {
                    state.notificationQueue.push(notification);
                }
            }
        },
        /**
         * Removes a notification by its ID.
         * @param {Object} state - The current state.
         * @param {Object} action - The action with payload.
         * @param {string} action.payload - The ID of the notification to remove.
         */
        removeNotification: (state, action) => {
            const id = action.payload;
            state.notifications = state.notifications.filter(
                (n) => n.id !== id
            );
            state.activeNotifications = state.activeNotifications.filter(
                (n) => n.id !== id
            );

            // Promote next in queue if any
            if (state.notificationQueue.length > 0) {
                const next = state.notificationQueue.shift();
                state.activeNotifications.push(next);
            }
        },
        /**
         * Clears all notifications.
         * @param {Object} state - The current state.
         */
        clearNotifications: (state) => {
            state.notifications = [];
            state.activeNotifications = [];
            state.notificationQueue = [];
        },
    },
});

export const {
    setTheme,
    setModalType,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
