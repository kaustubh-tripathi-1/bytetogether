/**
 * InputPanel component for providing stdin for code execution.
 * @param {string} input - The current input vaue.
 * @param {Function} onInputChange - Callback for input changes.
 * @returns {JSX.Element} The input panel.
 */
export default function InputPanel({ input, onInputChange }) {
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
                onChange={(e) => onInputChange(e.target.value)}
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
