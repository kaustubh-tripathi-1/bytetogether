import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import { setExecutionMode } from '../../store/slices/executionSlice';
import { setIsPreviewVisible } from '../../store/slices/previewSlice';
import { addNotification } from '../../store/slices/uiSlice';

/**
 * ModeSelector component for selecting execution mode between Judge0 and Web(HTML, CSS and JS)Preview.
 * @returns {JSX.Element} The mode selection dropdown.
 */
export default function ModeSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const { executionMode } = useSelector((state) => state.execution);
    const { areFilesSaved } = useSelector((state) => state.files);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        // Attach to a parent container (e.g., EditorLayout) instead of document for better performance
        const parentContainer = dropdownRef.current?.closest(
            '.editor-layout-container'
        );
        parentContainer?.addEventListener('mousedown', handleClickOutside);
        return () =>
            parentContainer?.removeEventListener(
                'mousedown',
                handleClickOutside
            );
    }, []);

    // Handle keyboard navigation
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }

    function toggleExecutionModeSelector() {
        setIsOpen((isOpen) => !isOpen);
    }

    return (
        <div
            className="relative inline-block"
            ref={dropdownRef}
            role="none"
            onKeyDown={handleKeyDown}
        >
            <button
                onClick={toggleExecutionModeSelector}
                className="flex w-fit min-w-30 cursor-pointer items-center justify-center rounded border border-gray-400/90 bg-gray-300 px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-800 focus:outline-1 focus:outline-offset-2 focus:outline-gray-400 dark:bg-[#222233] dark:text-white dark:hover:bg-[#2e3044] dark:focus:bg-[#2e3044]"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select execution mode"
            >
                {executionMode === 'judge0' ? 'Compiler' : 'Web Preview'}
                <svg
                    className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute z-10 mt-1 w-6/6 rounded border border-gray-400 bg-gray-300 shadow-lg dark:border-gray-300 dark:bg-[#222233]"
                        role="listbox"
                        aria-label="Programming languages"
                    >
                        <li
                            key={'judge0'}
                            onClick={() => {
                                if (
                                    !areFilesSaved &&
                                    executionMode !== 'judge0'
                                ) {
                                    dispatch(
                                        addNotification({
                                            message: `Save your file(s) first...`,
                                            type: 'warn',
                                        })
                                    );
                                    return;
                                }

                                dispatch(setExecutionMode('judge0'));
                                dispatch(setIsPreviewVisible(false));
                                setIsOpen(false);
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter' || e.key === ' ') {
                                    if (
                                        !areFilesSaved &&
                                        executionMode !== 'judge0'
                                    ) {
                                        dispatch(
                                            addNotification({
                                                message: `Save your file(s) first...`,
                                                type: 'warn',
                                            })
                                        );
                                        return;
                                    }

                                    dispatch(setExecutionMode('judge0'));
                                    dispatch(setIsPreviewVisible(false));
                                    setIsOpen(false);
                                }
                            }}
                            className={`cursor-pointer px-3 py-2 text-sm focus:outline-1 focus:-outline-offset-1 focus:outline-gray-800 dark:hover:bg-[#1A1B26] dark:focus:outline-white ${executionMode === 'judge0' ? '' : 'bg-gray-400 dark:bg-[#2e3044]'}`}
                            role="option"
                            aria-selected={executionMode === 'judge0'}
                            tabIndex={0}
                        >
                            {'Compiler'}
                        </li>
                        <li
                            key={'preview'}
                            onClick={() => {
                                if (
                                    !areFilesSaved &&
                                    executionMode !== 'preview'
                                ) {
                                    dispatch(
                                        addNotification({
                                            message: `Save your file(s) first...`,
                                            type: 'warn',
                                        })
                                    );
                                    return;
                                }

                                dispatch(setExecutionMode('preview'));
                                dispatch(setIsPreviewVisible(true));
                                setIsOpen(false);
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter' || e.key === ' ') {
                                    if (
                                        !areFilesSaved &&
                                        executionMode !== 'preview'
                                    ) {
                                        dispatch(
                                            addNotification({
                                                message: `Save your file(s) first...`,
                                                type: 'warn',
                                            })
                                        );
                                        return;
                                    }

                                    dispatch(setExecutionMode('preview'));
                                    dispatch(setIsPreviewVisible(true));
                                    setIsOpen(false);
                                }
                            }}
                            className={`cursor-pointer px-3 py-2 text-sm focus:outline-1 focus:-outline-offset-1 focus:outline-gray-800 dark:hover:bg-[#1A1B26] dark:focus:outline-white ${executionMode === 'preview' ? '' : 'bg-gray-400 dark:bg-[#2e3044]'}`}
                            role="option"
                            aria-selected={executionMode === 'preview'}
                            tabIndex={0}
                        >
                            {'Web Preview'}
                        </li>
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
