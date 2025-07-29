import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';

import { addNotification } from '../../store/slices/uiSlice';
import {
    setConsoleLogs,
    setIsConsoleVisible,
} from '../../store/slices/previewSlice';

export default function PreviewPanel({
    handleVerticalMouseDown,
    ref: previewContainerRef,
}) {
    const dispatch = useDispatch();
    const { codeContent } = useSelector((state) => state.editor);
    const { html, css, js, consoleLogs, isConsoleVisible } = useSelector(
        (state) => state.preview
    );
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const sanitizedHTML = DOMPurify.sanitize(html || '');
        const sanitizedCSS = DOMPurify.sanitize(css || '');
        const sanitizedJS = DOMPurify.sanitize(js || '');

        const _content = `
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
            iframeRef.current.srcdoc = codeContent;
        }
    }, [html, css, js, codeContent]);

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
                dispatch(setConsoleLogs(`Error: ${event.data.message}`));
            } else if (event.data.type === 'console') {
                dispatch(setConsoleLogs(event.data.message));
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch]);

    return (
        <section
            className={`flex h-full w-full flex-col bg-white md:min-w-64 dark:bg-[#222233]`}
            aria-label="Code preview output"
            ref={previewContainerRef}
        >
            <div className="w-full flex-1 rounded-md border-none p-1 md:h-[calc(100%-var(--console-height))] md:p-0">
                <iframe
                    ref={iframeRef}
                    title="Live Preview"
                    sandbox="allow-scripts"
                    className="h-screen w-full flex-1 rounded-md border-none md:h-full md:rounded-none"
                    aria-label="Live code preview"
                />
            </div>
            {isConsoleVisible && (
                <>
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                    <div
                        className="hidden h-1 cursor-ns-resize bg-gray-300 hover:bg-blue-600 active:bg-blue-600 md:block dark:bg-gray-500"
                        onMouseDown={handleVerticalMouseDown}
                        role="separator"
                        aria-label="Resize console panel"
                    />
                    <div
                        className="min-h-20 w-full overflow-auto bg-gray-100 p-2 md:h-[calc(var(--console-height))] md:min-h-10 dark:bg-[#222233]"
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
            <div className="flex w-full justify-center bg-inherit p-1">
                <button
                    className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700 md:w-full"
                    onClick={() =>
                        dispatch(setIsConsoleVisible(!isConsoleVisible))
                    }
                    aria-label={
                        isConsoleVisible ? 'Hide console' : 'Show console'
                    }
                >
                    {isConsoleVisible ? 'Hide Console' : 'Show Console'}
                </button>
            </div>
        </section>
    );
}
