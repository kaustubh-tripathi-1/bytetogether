import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import { removeNotification } from '../../store/slices/uiSlice';

/**
 * Notification Item component for each notification
 * @param {Object} props Props for the component
 * @param {Object} props.notification  The notification object with id, message, type and timeout
 * @returns {JSX.Element} A animated compo for each notification
 */
export default function NotificationItem({ notification }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeNotification(notification.id));
        }, notification.timeout || 3000);

        return () => clearTimeout(timer);
    }, [notification, dispatch]);

    const typeClasses = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warn: 'bg-yellow-400 text-black',
        info: 'bg-blue-500 text-white',
    };

    return (
        <motion.div
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.8}
            dragSnapToOrigin
            whileDrag={{ scale: 0.95, opacity: 0.9 }}
            onDragEnd={(e, info) => {
                const offsetX = Math.abs(info.offset.x);
                const offsetY = Math.abs(info.offset.y);

                const swipeThreshold = 100;

                if (offsetX > swipeThreshold || offsetY > swipeThreshold) {
                    dispatch(removeNotification(notification.id));
                }
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 70, x: 70, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between rounded-lg p-3 shadow-md ${
                typeClasses[notification.type] || typeClasses.info
            }`}
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
        >
            <p className="text-sm font-medium">{notification.message}</p>
            <button
                className="ml-3 cursor-pointer text-white hover:text-gray-200"
                onClick={() => dispatch(removeNotification(notification.id))}
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </motion.div>
    );
}
