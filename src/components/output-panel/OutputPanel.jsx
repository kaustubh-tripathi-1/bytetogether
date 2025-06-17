/**
 * OutputPanel component for displaying stdout from code execution.
 * @param {string} output - The output to display.
 * @returns {JSX.Element} The output panel.
 */
export default function OutputPanel({ output }) {
    return (
        <div
            className="flex h-full flex-col overflow-auto p-4 dark:bg-[#222233]"
            role="region"
            aria-label="Output panel"
        >
            <h3 className="mb-2 text-lg font-semibold">Output</h3>
            <pre
                className="flex-1 break-words whitespace-pre-wrap"
                aria-live="polite"
                aria-label="Code execution output"
            >
                {output || 'Run your code to see the output here.'}
            </pre>
        </div>
    );
}
