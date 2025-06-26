import { motion } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Generic Modal component for displaying content with focus trapping.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {React.ReactNode} props.children - Content to display inside the modal.
 * @returns {React.ReactElement | null} Modal portal or null if not open.
 */
export default function Modal({ isOpen, onClose, children }) {
    const modalRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);
    const triggerRef = useRef(null);

    // Memoize for useEffect
    const handleClose = useCallback(() => {
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        // Store the trigger element
        triggerRef.current = document.activeElement;

        const modal = modalRef.current;

        // Function to update focusable elements
        const updateFocusableElements = () => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable =
                focusableElements[focusableElements.length - 1];

            firstFocusableRef.current = firstFocusable;
            lastFocusableRef.current = lastFocusable;

            // Set initial focus to the first focusable element (e.g., input in SearchModalContent)
            firstFocusable?.focus();
        };

        // Initial setup of focusable elements
        updateFocusableElements();

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstFocusable = focusableElements[0];
                const lastFocusable =
                    focusableElements[focusableElements.length - 1];

                if (focusableElements.length === 0) return;

                if (
                    event.shiftKey &&
                    document.activeElement === firstFocusable
                ) {
                    event.preventDefault();
                    lastFocusable.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastFocusable
                ) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            } else if (event.key === 'Escape') {
                handleClose();
            }
        };

        modal.addEventListener('keydown', handleKeyDown);

        // Hide background content
        const mainContent = document.querySelector('main') || document.body;
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');

        // Observe changes to the modal content to update focusable elements
        const observer = new MutationObserver(() => {
            updateFocusableElements();
        });

        observer.observe(modal, { childList: true, subtree: true });

        return () => {
            modal.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClose);
            mainContent.removeAttribute('aria-hidden');
            mainContent.removeAttribute('inert');
            observer.disconnect();
            // Restore focus
            if (triggerRef.current) {
                triggerRef.current?.focus();
            }
        };
    }, [isOpen, handleClose, children]);

    if (!isOpen) return null;

    return createPortal(
        // Overlay
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            role="none"
            onClick={onClose}
        >
            {/* Dialog (interactive) */}
            <motion.div
                initial={{ opacity: 0, y: -200, scale: 0 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -200, scale: 0 }}
                transition={{ duration: 0.5 }}
                ref={modalRef}
                className="relative max-h-[90dvh] max-w-[80dvh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-[#222233]"
                role="dialog"
                aria-modal="true"
                aria-label="Modal dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-900 focus:text-gray-900 focus:outline-1 focus:outline-offset-4 focus:outline-gray-600 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:text-gray-200"
                    aria-label="Close modal"
                >
                    ✕
                </button>
                {children}
            </motion.div>
        </motion.div>,
        document.body
    );
}
