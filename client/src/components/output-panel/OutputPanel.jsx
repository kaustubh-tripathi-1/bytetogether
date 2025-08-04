import { memo } from 'react';
import { useSelector } from 'react-redux';

import { Spinner } from '../componentsIndex';
import { judge0Verdicts } from '../../conf/judge0Config';

/**
 * OutputPanel component for displaying stdout from code execution.
 * @returns {JSX.Element} The output panel.
 */
function OutputPanel() {
    const { output, error, isRunning, status, time, memory } = useSelector(
        (state) => state.execution
    );

    if (isRunning) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Spinner size="4" />
            </div>
        );
    }

    return (
        <div
            className="flex h-full max-h-full flex-col overflow-auto p-4 dark:bg-[#222233]"
            role="region"
            aria-label="Output panel"
        >
            <h3 className="mb-2 text-sm font-semibold">Output</h3>

            {output || error || status ? (
                <div className="flex flex-col gap-4 rounded-md border border-gray-600 p-2">
                    <p
                        className={`rounded-md p-2 ${output ? 'bg-green-400/40' : error ? 'bg-red-500/40' : 'bg-gray-100 dark:bg-[#2b2b44]'}`}
                        aria-live={status?.id === 3 ? 'polite' : 'assertive'}
                        aria-label="Executed code status"
                    >
                        <span className="text-xl font-bold">Status: </span>{' '}
                        {judge0Verdicts[status?.id] ?? status?.description}
                    </p>

                    {(output || status) && (
                        <div
                            className="flex"
                            aria-live="polite"
                            aria-label="Executed code parameters"
                        >
                            {time && (
                                <div className="flex flex-col border-r border-r-gray-600 px-2">
                                    <p className="font-bold">Time:</p>
                                    <p>{`${time} seconds`}</p>
                                </div>
                            )}
                            {memory && (
                                <div className="flex flex-col px-2">
                                    <p className="font-bold">Memory:</p>
                                    <p>{`${(memory / 1024).toFixed(3)} MB`}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <p className="font-bold">
                            {output ? 'Your output:' : 'Error:'}
                        </p>
                        <pre
                            className={`max-h-full min-h-8 flex-1 rounded-md bg-gray-100 p-2 break-words whitespace-pre-wrap dark:bg-[#2b2b44]`}
                            aria-live="polite"
                            aria-label="Code execution output"
                            lang="en"
                        >
                            {output || error || 'No output to show'}
                        </pre>
                    </div>
                </div>
            ) : (
                <p className="font-mono">
                    Run your code to see the output here.
                </p>
            )}
        </div>
    );
}

export default memo(OutputPanel);
