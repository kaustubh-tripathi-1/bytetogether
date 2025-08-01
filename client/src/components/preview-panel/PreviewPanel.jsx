import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';

import {
    clearConsoleLogs,
    setConsoleLogs,
    setIsConsoleVisible,
} from '../../store/slices/previewSlice';
import { Clear } from '../componentsIndex';

export default function PreviewPanel({
    handleVerticalMouseDown,
    ref: previewContainerRef,
}) {
    const dispatch = useDispatch();
    const { html, css, js, consoleLogs, isConsoleVisible } = useSelector(
        (state) => state.preview
    );
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const allowedOrigins = [
            'http://localhost:5173',
            'https://bytetogether.vercel.app', //TODO Update prod URL
        ];

        const isProduction = import.meta.env.PROD;

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');
        const scriptsInHTML = htmlDoc.scripts;
        let jsInScripts = '';

        for (let i = 0; i < scriptsInHTML.length; i++) {
            jsInScripts += scriptsInHTML[i].innerHTML;
        }

        const sanitizedHTMLInsideBody = DOMPurify.sanitize(html || '');
        const sanitizedCSS = DOMPurify.sanitize(css || '');
        const sanitizedJS = DOMPurify.sanitize(js || '');
        const sanitizedJsInScripts = DOMPurify.sanitize(jsInScripts || '');

        const content = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                        <title>Live Preview</title>
                        <style>${sanitizedCSS}</style>
                        </head>
                        <body>
                        ${sanitizedHTMLInsideBody}
                        <script>
                            ['log', 'warn', 'error'].forEach((method) => {
                                const originalConsoleMethod = console[method];
                                console[method] = (...args) => {
                                    const newArgs = args.map((arg) => {

                                        if(typeof arg === 'object') {
                                            return JSON.stringify(arg);
                                        } else if(typeof arg === 'function') {
                                            return arg.toString(); 
                                        }

                                        return arg;
                                    });
                                    window.parent.postMessage({ customType: 'CONSOLE', payload: {id: crypto.randomUUID() , message: newArgs.join(' '), logLevel: method} }, "${isProduction ? allowedOrigins[1] : allowedOrigins[0]}");
                                    originalConsoleMethod.apply(console, args);
                                };
                            });
                            window.onerror = (msg) => {
                                window.parent.postMessage({ customType: 'ERROR', payload: {id: crypto.randomUUID() , message: msg, logLevel: 'error'} }, "${isProduction ? allowedOrigins[1] : allowedOrigins[0]}");
                            };
                            try {
                                ${sanitizedJS}
                                ${sanitizedJsInScripts}
                            } catch (e) {
                                window.parent.postMessage({ customType: 'ERROR', payload: {id: crypto.randomUUID(), message: e.message, logLevel: 'error'} }, "${isProduction ? allowedOrigins[1] : allowedOrigins[0]}");
                            }
                        </script>
                        </body>
                    </html>
                    `;

        dispatch(clearConsoleLogs());

        // Set srcdoc to avoid cross-origin issues
        const timerId = setTimeout(() => {
            requestAnimationFrame(() => {
                iframe.srcdoc = content;
            });

            // Another way but Costly for each update
            /* const blob = new Blob([content], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob); */
        }, 0);

        return () => {
            clearTimeout(timerId);
        };
    }, [html, css, js, dispatch]);

    useEffect(() => {
        function handleMessage(event) {
            if (event.origin !== 'null' || !iframeRef.current?.srcdoc) return;

            if (
                !event.data ||
                typeof event.data !== 'object' ||
                !event.data?.customType
            )
                return;

            dispatch(setConsoleLogs(event.data.payload));
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch]);

    const consoleCSSClasses = {
        warn: 'bg-yellow-400/50 dark:bg-yellow-400/30',
        error: 'bg-[#c03e3a] dark:bg-[#9e3e3a] text-white',
    };

    function handleClearConsole() {
        dispatch(clearConsoleLogs());
    }

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
                    sandbox="allow-scripts allow-forms"
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
                    <div className="h-0.25 w-full bg-gray-500 md:hidden"></div>
                    <div
                        className="relative min-h-20 w-full overflow-auto bg-gray-100 p-2 md:h-[calc(var(--console-height))] md:min-h-10 dark:bg-[#222233]"
                        aria-label="JavaScript console output"
                        aria-live="polite"
                    >
                        <p className="pb-2 text-sm font-bold">Console:</p>
                        <div className="flex flex-col gap-1">
                            {consoleLogs.map((log) => {
                                return (
                                    <div
                                        key={log.id}
                                        className="flex flex-col gap-1"
                                    >
                                        <p
                                            className={`rounded-md px-2 py-1 font-mono wrap-break-word whitespace-pre-wrap ${consoleCSSClasses[log.logLevel]}`}
                                        >
                                            {log.message}
                                        </p>
                                        <div className="h-0.25 w-full bg-gray-500"></div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            className="absolute top-1.5 right-1 rounded-full p-1 hover:bg-gray-700 focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-blue-400"
                            onClick={handleClearConsole}
                            aria-label="Clear Console"
                            title="Clear Console"
                        >
                            <Clear width={1} height={1} />
                        </button>
                    </div>
                </>
            )}
            <div className="flex w-full justify-center bg-inherit p-1">
                <button
                    className="w-1/2 cursor-pointer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline focus:outline-offset-2 focus:outline-blue-500 md:w-full"
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
