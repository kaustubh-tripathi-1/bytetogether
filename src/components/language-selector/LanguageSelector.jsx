import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'java', label: 'Java' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
];

/**
 * LanguageSelector component for selecting programming languages with animation.
 * @param {string} selectedLanguage - The currently selected language.
 * @param {Function} onLanguageChange - Callback to handle language changes.
 * @returns {JSX.Element} The language selection dropdown.
 */
export default function LanguageSelector({
    selectedLanguage,
    onLanguageChange,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    function toggleLanguageSelector() {
        setIsOpen((isOpen) => !isOpen);
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleLanguageSelector}
                onKeyDown={handleKeyDown}
                className="flex min-w-30 cursor-pointer items-center justify-center rounded border border-gray-400/90 bg-gray-300 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-1 focus:outline-offset-2 focus:outline-gray-400 dark:bg-[#222233] dark:text-white dark:hover:bg-[#1A1B26] dark:focus:bg-[#1A1B26]"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select programming language"
            >
                {languages.find((lang) => lang.value === selectedLanguage)
                    ?.label || 'Select Language'}
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
                        {languages.map((language) => (
                            <li
                                key={language.value}
                                onClick={() => {
                                    onLanguageChange(language.value);
                                    setIsOpen(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onLanguageChange(language.value);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`cursor-pointer px-3 py-2 text-sm focus:outline-1 focus:-outline-offset-1 focus:outline-gray-800 dark:hover:bg-[#1A1B26] dark:focus:outline-white ${selectedLanguage === language.value ? 'bg-gray-400 dark:bg-[#1A1B26]' : ''}`}
                                role="option"
                                aria-selected={
                                    selectedLanguage === language.value
                                }
                                tabIndex={0}
                            >
                                {language.label}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
