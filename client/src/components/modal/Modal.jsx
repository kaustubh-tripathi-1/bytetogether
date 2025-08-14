import { motion } from 'framer-motion';
import { useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';

import { Cross } from '../componentsIndex';

/**
 * Generic Modal component for displaying content with focus trapping.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {React.ReactNode} props.children - Content to display inside the modal.
 * @returns {React.ReactElement | null} Modal portal or null if not open.
 */
function Modal({ isOpen, onClose, children }) {
    const { modalType } = useSelector((state) => state.ui);
    const modalRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        // Store the trigger element
        triggerRef.current = document.activeElement;

        const modal = modalRef.current;

        // Function to update focusable elements
        function updateFocusableElements() {
            const activeBeforeUpdate = document.activeElement; // store current focus

            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable =
                focusableElements[focusableElements.length - 1];

            firstFocusableRef.current = firstFocusable;
            lastFocusableRef.current = lastFocusable;

            // If previously focused element is still in modal, restore focus
            if (activeBeforeUpdate && modal.contains(activeBeforeUpdate)) {
                activeBeforeUpdate?.focus();
            } else {
                // Only focus first element when nothing else was focused
                firstFocusable?.focus();
            }
        }

        // Initial setup of focusable elements
        updateFocusableElements();

        function handleKeyDown(event) {
            if (event.key === 'Tab') {
                const activeElement = document.activeElement;

                if (
                    event.shiftKey &&
                    activeElement === firstFocusableRef.current
                ) {
                    event.preventDefault();
                    lastFocusableRef.current?.focus();
                } else if (
                    !event.shiftKey &&
                    activeElement === lastFocusableRef.current
                ) {
                    event.preventDefault();
                    firstFocusableRef.current?.focus();
                }
            } else if (event.key === 'Escape') {
                onClose();
            }
        }

        modal.addEventListener('keydown', handleKeyDown);

        // Hide background content
        const mainContent = document.querySelector('main');
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');

        // Observe changes to the modal content to update focusable elements
        const observer = new MutationObserver(() => {
            /* if (modalType === 'search') {
                const activeBeforeUpdate = modal.activeElement;
                updateFocusableElements();

                if (!modal.contains(activeBeforeUpdate)) {
                    firstFocusableRef.current?.focus();
                }
            } */
            updateFocusableElements();
        });

        observer.observe(modal, { childList: true, subtree: true });

        return () => {
            modal.removeEventListener('keydown', handleKeyDown);
            mainContent.removeAttribute('aria-hidden');
            mainContent.removeAttribute('inert');
            observer.disconnect();
            // Restore focus
            if (triggerRef.current) {
                triggerRef.current?.focus();
            }
        };
    }, [isOpen, modalType, onClose]);

    if (!isOpen) return null;

    return createPortal(
        // Overlay
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed inset-0 z-1100 flex items-center justify-center bg-black/60 backdrop-blur-xs"
            role="none"
            onClick={onClose}
        >
            {/* Dialog (interactive) */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                ref={modalRef}
                className="relative max-h-[90dvh] max-w-[80dvh] min-w-1/2 overflow-y-auto rounded-lg bg-white p-8 shadow-lg dark:bg-[#222233]"
                role="dialog"
                aria-modal="true"
                aria-label="Modal dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileFocus={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2 right-2 cursor-pointer rounded-full text-gray-500 hover:text-gray-900 focus:text-gray-900 focus:outline-1 focus:outline-offset-4 focus:outline-gray-600 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:text-gray-200"
                    aria-label="Close modal"
                >
                    <Cross />
                </motion.button>
                {children}
            </motion.div>
        </motion.div>,
        document.getElementById(`root`)
    );
}

export default memo(Modal);
