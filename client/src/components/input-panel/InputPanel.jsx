import { memo } from 'react';
import DOMPurify from 'dompurify';

/**
 * InputPanel component for providing stdin for code execution.
 * @param {Object} props - The component props.
 * @param {React.ComponentState<string>} props.input - The current input state value.
 * @param {React.SetStateAction<Function>} props.setInput - State setter for input.
 * @returns {JSX.Element} The input panel.
 */
function InputPanel({ input, setInput }) {
    function handleInputChange(event) {
        const sanitizedInput = DOMPurify.sanitize(event.target.value);

        setInput(sanitizedInput);
    }

    return (
        <div
            className="flex h-full max-h-full flex-col gap-1 p-4 text-gray-800 dark:bg-[#222233] dark:text-gray-200"
            role="region"
            aria-label="Input panel"
        >
            <label htmlFor="stdin" className="mb-2 text-lg font-semibold">
                Input
            </label>
            <textarea
                id="stdin"
                value={input}
                onChange={handleInputChange}
                className="h-24 min-h-11 w-full rounded border border-gray-500 bg-gray-100 p-2 transition-shadow duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-[#2b2b44] dark:text-white"
                placeholder="Enter input for your code (stdin)..."
                aria-label="Enter input for code execution"
            />
            <p className="mt-2 rounded bg-gray-100 p-2 text-xs dark:bg-[#2b2b44]">
                If your code takes input, add it above before running.
            </p>
        </div>
    );
}

export default memo(InputPanel);
