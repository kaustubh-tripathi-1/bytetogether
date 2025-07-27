import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';

import { addNotification } from '../../store/slices/uiSlice';

export default function PreviewPanel({
    html,
    css,
    js,
    consoleLogs,
    consoleHeight,
    handleVerticalMouseDown,
    setPreviewOutput,
}) {
    const dispatch = useDispatch();
    const { codeContent, language } = useSelector((state) => state.editor);

    const [showConsole, setShowConsole] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (language !== 'html' && language !== 'javascript') return;

        const iframe = iframeRef.current;
        if (!iframe) return;

        const sanitizedHTML = DOMPurify.sanitize(/* html */ codeContent || '');
        const sanitizedCSS = DOMPurify.sanitize(css || '');
        const sanitizedJS = DOMPurify.sanitize(js || '');

        const content = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                        <style>${sanitizedCSS}</style>
                        </head>
                        <body>
                        ${sanitizedHTML}
                        <script>
                            const originalConsoleLog = console.log;
                            console.log = (...args) => {
                            window.parent.postMessage({ type: 'console', message: args.join(' ') }, '*');
                            originalConsoleLog.apply(console, args);
                            };
                            window.onerror = (msg) => {
                            window.parent.postMessage({ type: 'error', message: msg }, '*');
                            };
                            try {
                            ${sanitizedJS}
                            } catch (e) {
                            window.parent.postMessage({ type: 'error', message: e.message }, '*');
                            }
                        </script>
                        </body>
                    </html>
                    `;

        // Set srcdoc to avoid cross-origin issues
        if (iframeRef.current) {
            iframeRef.current.srcdoc = content;
        }
    }, [html, css, js, language, codeContent]);

    useEffect(() => {
        function handleMessage(event) {
            // Optional: Validate origin for security
            const allowedOrigins = [
                'http://localhost:5173',
                'https://bytetogether.vercel.app',
            ];

            if (event.origin && !allowedOrigins.includes(event.origin)) {
                return;
            }

            if (event.data.type === 'error') {
                dispatch(
                    addNotification({
                        message: `JavaScript error: ${event.data.message}`,
                        type: 'error',
                        timeout: 4000,
                    })
                );
                setPreviewOutput((prev) => ({
                    ...prev,
                    consoleLogs: [
                        ...(prev.consoleLogs || []),
                        `Error: ${event.data.message}`,
                    ],
                }));
            } else if (event.data.type === 'console') {
                setPreviewOutput((prev) => ({
                    ...prev,
                    consoleLogs: [
                        ...(prev.consoleLogs || []),
                        event.data.message,
                    ],
                }));
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, setPreviewOutput]);

    return (
        <div
            className={`flex h-full w-full flex-col border-l border-gray-300 bg-white md:w-[calc(100%-var(--editor-width))] md:min-w-64 dark:border-gray-500`}
            aria-label="Code preview output"
        >
            {(language === 'html' || language === 'javascript') && (
                <>
                    <iframe
                        ref={iframeRef}
                        title="Live Preview"
                        sandbox="allow-scripts"
                        className="w-full flex-1 border-none"
                        aria-label="Live code preview"
                    />
                    {showConsole && (
                        <>
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <div
                                className="h-1 cursor-ns-resize bg-gray-300 hover:bg-blue-600 active:bg-blue-600 dark:bg-gray-500"
                                onMouseDown={handleVerticalMouseDown}
                                role="separator"
                                aria-label="Resize console panel"
                            />
                            <div
                                className="w-full overflow-auto bg-gray-100 p-2 dark:bg-[#2b2b44]"
                                style={{ height: `${consoleHeight}px` }}
                                aria-label="JavaScript console output"
                                aria-live="polite"
                            >
                                <p className="text-sm font-bold">Console:</p>
                                {consoleLogs.map((log, index) => (
                                    <p
                                        key={index} //TODO optimize this
                                        className="font-mono text-gray-800 dark:text-gray-200"
                                    >
                                        {log}
                                    </p>
                                ))}
                            </div>
                        </>
                    )}
                    <button
                        className="bg- m-2 cursor-pointer rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                        onClick={() => setShowConsole((prev) => !prev)}
                        aria-label={
                            showConsole ? 'Hide console' : 'Show console'
                        }
                    >
                        {showConsole ? 'Hide Console' : 'Show Console'}
                    </button>
                </>
            )}
        </div>
    );
}
