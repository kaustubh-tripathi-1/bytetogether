/**
 * InputPanel component for providing stdin for code execution.
 * @param {string} input - The current input value.
 * @param {Function} onInputChange - Callback for input changes.
 * @returns {JSX.Element} The input panel.
 */
export default function InputPanel({ input, onInputChange }) {
    return (
        <div
            className="flex h-full flex-col gap-2 rounded bg-gray-800 p-4 text-white"
            role="region"
            aria-label="Input panel"
        >
            <label htmlFor="input" className="mb-2 text-lg font-semibold">
                Input
            </label>
            <textarea
                id="input"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                className="h-32 w-full rounded border border-gray-700 bg-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter input for your code (stdin)..."
                aria-label="Enter input for code execution"
            />
            <p className="rounded bg-gray-700 p-2">
                If your code takes input, add it in the above box before
                running.
            </p>
        </div>
    );
}
