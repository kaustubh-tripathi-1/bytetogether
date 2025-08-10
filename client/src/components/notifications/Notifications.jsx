import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

import NotificationItem from './NotificationItem.jsx';

/**
 * Notification component for the whole app
 * @returns {JSX.Element} A animated compo for notifications
 */
export default function Notifications() {
    const { activeNotifications } = useSelector((state) => state.ui);

    return (
        <div className="fixed right-4 bottom-16 z-1200 flex w-full max-w-xs flex-col gap-2 sm:max-w-sm">
            <AnimatePresence>
                {activeNotifications.map((noti) => (
                    <NotificationItem key={noti.id} notification={noti} />
                ))}
            </AnimatePresence>
        </div>
    );
}
