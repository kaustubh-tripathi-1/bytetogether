import { memo } from 'react';

/**
 * OutputPanel component for displaying stdout from code execution.
 * @param {string} output - The output to display.
 * @returns {JSX.Element} The output panel.
 */
function OutputPanel({ output }) {
    return (
        <div
            className="flex h-full max-h-full flex-col overflow-auto p-4 dark:bg-[#222233]"
            role="region"
            aria-label="Output panel"
        >
            <h3 className="mb-2 text-lg font-semibold">Output</h3>
            <pre
                className="max-h-full flex-1 break-words whitespace-pre-wrap"
                aria-live="polite"
                aria-label="Code execution output"
            >
                {output || 'Run your code to see the output here.'}
            </pre>
        </div>
    );
}

export default memo(OutputPanel);
