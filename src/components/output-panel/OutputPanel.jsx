/**
 * OutputPanel component for displaying stdout from code execution.
 * @param {string} output - The output to display.
 * @returns {JSX.Element} The output panel.
 */
export default function OutputPanel({ output }) {
    return (
        <section
            className="h-full overflow-auto rounded bg-gray-800 p-4 text-white"
            aria-label="Output panel"
        >
            <h3 className="mb-2 text-lg font-semibold">Output</h3>
            <pre
                className="break-words whitespace-pre-wrap"
                aria-live="polite"
                aria-label="Code execution output"
            >
                {output || 'Run your code to see the output here.'}
            </pre>
        </section>
    );
}
