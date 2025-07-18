import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Popover panel for inviter to manage live session.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is visible.
 * @param {Function} props.onClose - Callback to close the panel.
 * @param {Object} props.awareness - Yjs awareness object to read connected users.
 * @param {Function} props.onEndSession - Callback to disconnect from Yjs and end room.
 * @param {Function} props.onCopyLink - Callback to copy invite link.
 * @param {React.RefObject} props.anchorRef - Ref to the Invite button for positioning.
 */
export default function InviteAdminPanel({
    isOpen,
    onClose,
    awareness,
    onEndSession,
    onCopyLink,
    anchorRef,
}) {
    const panelRef = useRef(null);
    const [position, setPosition] = useState(null);

    // Calculate position relative to anchor (Invite button)
    useEffect(() => {
        if (!isOpen) return;

        if (isOpen && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8, // 8px below
                left: rect.left,
            });
        }
    }, [isOpen, anchorRef]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current?.contains(e.target)) {
                onClose();
            }
        }

        function handleKeydownClose(e) {
            if (e.key === `Escape`) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleKeydownClose);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeydownClose);
        };
    }, [isOpen, onClose]);

    const connectedUsers = useMemo(() => {
        if (!awareness) return [];
        return [...(awareness?.getStates()?.entries() || [])].map(
            ([clientId, state]) => ({
                clientId,
                name: state.user?.name || `User ${clientId}`,
            })
        );
    }, [awareness]);

    if (!isOpen || !position) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            ref={panelRef}
            className="absolute z-50 w-64 -translate-x-5/6 transform rounded-md border border-gray-300 bg-white p-3 shadow-md md:translate-0 dark:border-gray-600 dark:bg-[#1e1e2e]"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {awareness ? 'Room Controls' : 'Create Room'}
                </h3>
                <button
                    onClick={onClose}
                    aria-label="Close room controls"
                    className="cursor-pointer text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-2 text-sm">
                <button
                    onClick={onCopyLink}
                    className="w-full cursor-pointer rounded bg-blue-100 px-3 py-1.5 text-left text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                    🔗 Copy Invite Link
                </button>

                {awareness && (
                    <button
                        onClick={onEndSession}
                        className="w-full cursor-pointer rounded bg-red-100 px-3 py-1.5 text-left text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                        🛑 End Session
                    </button>
                )}

                {awareness && (
                    <div className="mt-2">
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Connected Users
                        </h4>
                        <ul className="mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {connectedUsers.map((user) => (
                                <li key={user.clientId}>• {user.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
