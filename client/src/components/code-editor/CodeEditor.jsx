import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import {
    createRelativePositionFromTypeIndex,
    createAbsolutePositionFromRelativePosition,
} from 'yjs';

import { setCodeContent } from '../../store/slices/editorSlice';
import { Spinner } from '../componentsIndex';
import { addNotification } from '../../store/slices/uiSlice';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';
import './CodeEditor.css';

/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {Object} props The props object for CodeEditor component
 * @param {string} props.language The programming language for the editor.
 * @param {string} props.codeContent The current code content to display.
 * @param {React.RefObject} editorRef The react ref for monaco editor.
 * @param {import('yjs').Text} props.yText - The Y.Text instance for the current file.
 * @param {import('y-websocket').Awareness} props.awareness - The Awareness instance for the current provider.
 * @param {boolean} props.isInvited - Whether the session is invited for collaboration.
 * @returns {JSX.Element} The Monaco Editor.
 */
export default function CodeEditor({
    language,
    codeContent,
    ref: editorRef,
    yDoc,
    yText,
    awareness,
    isInvited,
}) {
    const dispatch = useDispatch();
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);

    const bindingRef = useRef(null); // To store the MonacoBinding instance for cleanup
    const closestSectionRef = useRef(null); // To store the parent section of Monaco for relative postioning of tooltips
    const awarenessTimerRef = useRef(null); // To debounce the awareness update rendering
    const heartbeatIntervalRef = useRef(null); // To clear heartbeat interval
    const clientDecorationsRef = useRef(new Map()); // Map to store decorations for each client

    // Distinct cursor colors for each collaborator
    const cursorColors = [
        '#b40000',
        '#00b100',
        '#000061',
        '#9c009c',
        '#009191',
    ];

    function handleContentChange(value) {
        if (!yText) {
            dispatch(setCodeContent(value));
        }
    }

    /**
     * Defines custom themes and compiler options before the editor mounts.
     * @param {Monaco} monaco - Monaco instance
     */
    function handleEditorWillMount(monaco) {
        monaco.editor.defineTheme('night-owl', nightOwlTheme);
        monaco.editor.defineTheme('vs-light', vsLight);

        // Ensure TypeScript compiler options are set for IntelliSense
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution:
                monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            typeRoots: ['node_modules/@types'],
        });

        // Basic completion provider for Python, C++, C, Java
        const languagesToEnhance = ['python', 'cpp', 'c', 'java'];
        languagesToEnhance.forEach((lang) => {
            monaco.languages.registerCompletionItemProvider(lang, {
                provideCompletionItems: () => {
                    const suggestions = [
                        {
                            label: 'if',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText:
                                lang === 'python'
                                    ? 'if ${1:condition}:\n    $0'
                                    : 'if (${1:condition}) {\n    $0\n}',
                            insertTextRules:
                                monaco.languages.CompletionItemInsertTextRule
                                    .InsertAsSnippet,
                            documentation: 'If statement',
                        },
                        {
                            label: 'for',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText:
                                lang === 'python'
                                    ? 'for ${1:item} in ${2:iterable}:\n    $0'
                                    : 'for (${1:init}; ${2:condition}; ${3:update}) {\n    $0\n}',
                            insertTextRules:
                                monaco.languages.CompletionItemInsertTextRule
                                    .InsertAsSnippet,
                            documentation: 'For loop',
                        },
                    ];
                    return { suggestions };
                },
            });
        });
    }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editorRef.current?.focus();

        // Ensure yText and awareness are available before attempting binding
        // This check is crucial if props can be null/undefined initially
        if (!yText || !awareness) {
            console.warn(
                'yText or awareness is not available on editor mount. Skipping MonacoBinding.',
                yText,
                awareness
            );
            return;
        }

        if (awareness.getStates().size > 5) {
            dispatch(
                addNotification({
                    message:
                        "Can't join the collaborative room as it's full. Please try again after some time...",
                    type: 'error',
                    timeout: 10000,
                })
            );
            return;
        }

        // Yjs-Monaco Binding
        // Create the Monaco Editor model that y-monaco will bind to
        const model = editor.getModel();

        if (model) {
            // Destroy any existing binding before creating a new one
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }

            // Bind the Y.Text to the Monaco Editor model
            bindingRef.current = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                awareness
            );
        }

        // Initialize or update awareness state with unique color index
        const localState = awareness.getLocalState();
        if (!localState?.user?.cursorColorIndex) {
            const usedIndices = new Set();

            for (const [, state] of awareness.getStates()) {
                if (state?.user?.cursorColorIndex !== undefined) {
                    usedIndices.add(state.user.cursorColorIndex);
                }
            }

            let availableIndex = -1;
            for (let i = 0; i < cursorColors.length; i++) {
                if (!usedIndices.has(i)) {
                    availableIndex = i;
                    break;
                }
            }

            awareness.setLocalStateField('user', {
                ...localState?.user,
                name: `User${Math.floor(Math.random() * 100)}`,
                cursorColorIndex: availableIndex,
            });
        }

        // Update awareness on local cursor movement and selection change
        editor.onDidChangeCursorSelection((e) => {
            if (!yText || !awareness) return;

            const model = editor.getModel();
            const anchorIndex = model.getOffsetAt(
                e.selection.getStartPosition()
            );
            const headIndex = model.getOffsetAt(e.selection.getEndPosition());

            const anchor = createRelativePositionFromTypeIndex(
                yText,
                anchorIndex
            );
            const head = createRelativePositionFromTypeIndex(yText, headIndex);

            awareness.setLocalStateField('selection', { anchor, head });
        });

        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = setInterval(() => {
            let date = new Date();
            date = date.toLocaleTimeString();
            awareness.setLocalStateField('heartbeat', date);
        }, 60000);

        let decorationUpdateScheduled = false;
        // --- Yjs Awareness (Cursor & Selection Sync) ---
        awareness.on('update', ({ added, updated, removed }) => {
            if (!decorationUpdateScheduled) {
                decorationUpdateScheduled = true;
                if (awarenessTimerRef.current) {
                    clearTimeout(awarenessTimerRef.current);
                }
                awarenessTimerRef.current = setTimeout(() => {
                    // For heavy rendering work (decorations + tooltips)
                    requestAnimationFrame(() => {
                        // decorationUpdateScheduled = false;
                        const editorDomNode = editor.getDomNode();
                        const model = editor.getModel();
                        if (
                            !model ||
                            !editorDomNode /* || !editor.hasTextFocus() */
                        )
                            return;

                        // Collect decorations for all active clients
                        const batchedDecorationsMap = new Map();

                        // Process added and updated clients
                        [...added, ...updated].forEach((clientId) => {
                            const state = awareness.getStates().get(clientId); // Use getStates() to get all states

                            if (!state || !state.selection || !state.user) {
                                // If state is incomplete, clean up any existing decorations/tooltips for this client
                                console.warn(
                                    `Incomplete awareness states for client ${clientId}. Cleaning up.`
                                );
                                const tooltipElement = document.querySelector(
                                    `.collaborator-tooltip-${clientId}`
                                );
                                if (tooltipElement) {
                                    tooltipElement.remove();
                                }
                                const decorationCollection =
                                    clientDecorationsRef.current.get(clientId);
                                if (decorationCollection) {
                                    decorationCollection.clear();
                                    clientDecorationsRef.current.clear();
                                }
                                return;
                            }

                            const { user, selection } = state;

                            const cursorColorIndex = user.cursorColorIndex;
                            const color = cursorColors[cursorColorIndex];

                            const headAbs =
                                createAbsolutePositionFromRelativePosition(
                                    selection.head,
                                    yDoc
                                )?.index ?? 0;
                            const anchorAbs =
                                createAbsolutePositionFromRelativePosition(
                                    selection.anchor,
                                    yDoc
                                )?.index ?? 0;

                            const headPos = model.getPositionAt(headAbs);
                            const anchorPos = model.getPositionAt(anchorAbs);

                            const decorationsForClient = [];

                            // Create decorations for selections (if any)
                            if (
                                headPos.lineNumber !== anchorPos.lineNumber ||
                                headPos.column !== anchorPos.column
                            ) {
                                // Head and anchor are not equal so it's a selection, not just a cursor
                                const [start, end] = [headPos, anchorPos].sort(
                                    (a, b) => {
                                        if (a.lineNumber !== b.lineNumber)
                                            return a.lineNumber - b.lineNumber;
                                        return a.column - b.column;
                                    }
                                );
                                const range = new monaco.Range(
                                    start.lineNumber,
                                    start.column,
                                    end.lineNumber,
                                    end.column
                                );
                                decorationsForClient.push({
                                    range: range,
                                    options: {
                                        className: `collaborator-selection`,
                                        inlineClassName: `collaborator-selection-${cursorColorIndex}`,
                                        stickiness:
                                            monaco.editor.TrackedRangeStickiness
                                                .NeverGrowsWhenTyping,
                                        // Ensure these don't interfere with the cursor line highlight
                                        overviewRuler: {
                                            color: color,
                                            position:
                                                monaco.editor.OverviewRulerLane
                                                    .Center,
                                        },
                                    },
                                });
                            }

                            // Create decoration for cursor
                            const cursorPosition = {
                                lineNumber: anchorPos.lineNumber,
                                column: anchorPos.column,
                            };

                            decorationsForClient.push({
                                range: new monaco.Range(
                                    cursorPosition.lineNumber,
                                    cursorPosition.column,
                                    cursorPosition.lineNumber,
                                    cursorPosition.column
                                ),
                                options: {
                                    className: `collaborator-cursor collaborator-cursor-${cursorColorIndex}`, // Class for the cursor line
                                    isWholeLine: false, // Apply only to the cursor position, not the whole line
                                },
                            });

                            // Update decorations for this specific client
                            /* let decorationCollection =
                                clientDecorationsRef.current.get(clientId);
                            if (!decorationCollection) {
                                decorationCollection =
                                    editor.createDecorationsCollection();
                                clientDecorationsRef.current.set(
                                    clientId,
                                    decorationCollection
                                );
                            } */

                            batchedDecorationsMap.set(
                                clientId,
                                decorationsForClient
                            );

                            /* setTimeout(() => {
                                requestIdleCallback(() => {
                                    decorationCollection.clear();
                                    decorationCollection.set(
                                        decorationsForClient
                                    );
                                    console.clear();
                                });
                            }, 0); */

                            // Create or update tooltip (label above cursor)
                            const overlayContainer = editor
                                .getDomNode()
                                ?.querySelector('.view-overlays');
                            let tooltipElement = document.querySelector(
                                `.collaborator-tooltip-${clientId}`
                            );
                            if (!tooltipElement) {
                                tooltipElement = document.createElement('div');
                                tooltipElement.className = `collaborator-tooltip collaborator-tooltip-${cursorColorIndex} collaborator-tooltip-${clientId} `;
                                tooltipElement.style.backgroundColor = color;
                                tooltipElement.style.width = 'fit-content'; // Set width explicitly
                                tooltipElement.style.maxWidth = '200px'; // Optional safety limit width
                                if (
                                    !overlayContainer.contains(tooltipElement)
                                ) {
                                    overlayContainer?.appendChild(
                                        tooltipElement
                                    );
                                }
                            }
                            tooltipElement.textContent =
                                user.name || 'Anonymous';

                            // Position the tooltip relative to the editor content
                            // Monaco provides `getScrolledVisiblePosition` which gives pixel coords
                            const targetPixelPosition =
                                editor.getScrolledVisiblePosition(
                                    cursorPosition
                                );

                            if (targetPixelPosition) {
                                // Get the scroll offsets to position the tooltips absolutely inside the editor
                                const scrollTop = editor.getScrollTop();
                                const scrollLeft = editor.getScrollLeft();

                                const leftPos =
                                    targetPixelPosition.left +
                                    scrollLeft; /*  - 63 */

                                const topPos =
                                    targetPixelPosition.top +
                                    scrollTop -
                                    tooltipElement.offsetHeight -
                                    3; // 3px above cursor

                                tooltipElement.style.left = `${leftPos}px`;
                                tooltipElement.style.top = `${topPos}px`;
                                tooltipElement.style.display = 'block';
                            } else {
                                tooltipElement.style.display = 'none';
                            }
                        });

                        // Try applying decorations after ALL clients have been processed:
                        setTimeout(() => {
                            requestIdleCallback(() => {
                                for (const [
                                    clientId,
                                    decorationsForClient,
                                ] of batchedDecorationsMap.entries()) {
                                    let decorationCollection =
                                        clientDecorationsRef.current.get(
                                            clientId
                                        );
                                    if (!decorationCollection) {
                                        decorationCollection =
                                            editor.createDecorationsCollection();
                                        clientDecorationsRef.current.set(
                                            clientId,
                                            decorationCollection
                                        );
                                    }
                                    decorationCollection.set(
                                        decorationsForClient
                                    );
                                }
                            });
                            decorationUpdateScheduled = false;
                        }, 0);

                        // Clean up removed clients' tooltips
                        removed.forEach((clientId) => {
                            const tooltipElement = document.querySelector(
                                `.collaborator-tooltip-${clientId}`
                            );
                            if (tooltipElement) {
                                tooltipElement.remove();
                            }

                            // Clear decorations for the removed client
                            let decorationCollection =
                                clientDecorationsRef.current.get(clientId);
                            decorationCollection?.clear();
                            clientDecorationsRef.current.delete(clientId);
                        });
                    });
                }, 30); // debounce awareness update 1 frame
            }
        });
    }

    // Effect to clean up the MonacoBinding and awareness listeners when CodeEditor unmounts
    // or when yText/awareness props change (indicating a file switch, requiring re-binding)
    useEffect(() => {
        // This runs on initial mount and whenever yText or awareness props change
        // The cleanup function runs before the effect re-runs or component unmounts
        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
            if (awareness) {
                // Clear local awareness state when editor unmounts or file changes
                awareness.setLocalStateField('selection', null);
                awareness.setLocalStateField('user', null);
                awareness.setLocalStateField('usedColorIndices', []);
                awareness.destroy();
            }

            // Clear all remaining decorations from clientDecorations map
            if (editorRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                clientDecorationsRef.current.forEach(() => {
                    editorRef.current.createDecorationsCollection([]);
                });
            }
            clientDecorationsRef.current?.clear(); // Clear the map

            // Clean up any remaining tooltips from this client if it was the last one
            document
                .querySelectorAll('.collaborator-tooltip')
                .forEach((el) => el.remove());
        };
    }, [yText, awareness, editorRef]); // Re-run effect when yText or awareness instances change (i.e., file switch)

    const editorSectionProps = {
        className:
            'relative flex h-[calc(100%-4rem)] flex-col text-gray-800 dark:text-gray-200',
        'aria-label': 'Code editor',
        ref: closestSectionRef,
    };

    const editorProps = {
        height: '91vh',
        width: '100%',
        language,
        value: !yText ? codeContent : undefined,
        onChange: handleContentChange,
        theme: theme === 'dark' ? 'night-owl' : 'vs-light',
        beforeMount: handleEditorWillMount,
        onMount: handleEditorDidMount,
        loading: <Spinner size="4" />,
        options: {
            fontSize: settings.fontSize,
            wordWrap: settings.wordWrap,
            minimap: {
                enabled: settings.minimap,
                autohide: true,
                renderCharacters: true,
                showSlider: 'mouseover',
            },
            tabSize: settings.tabSize,
            stickyScroll: { enabled: settings.stickyScroll },
            insertSpaces: true,
            accessibilitySupport: 'auto',
            lineNumbers: 'on',
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            suggest: { showSnippets: true, showWords: true },
            smoothScrolling: true,
            hover: { delay: 500 },
            scrollbar: {
                alwaysConsumeMouseWheel: false,
            },
        },
    };

    // Only render MonacoEditor if yText and awareness are provided
    if (!isInvited) {
        return (
            <section {...editorSectionProps}>
                <MonacoEditor {...editorProps} />
            </section>
        );
    }

    // Only render MonacoEditor if yText and awareness are provided
    if (!yText || !awareness) {
        return <Spinner size="4" />; // Or some other placeholder/loading indicator
    }

    return (
        <section {...editorSectionProps}>
            <MonacoEditor {...editorProps} />
        </section>
    );
}
