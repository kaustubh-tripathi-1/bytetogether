import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import {
    createRelativePositionFromTypeIndex,
    createAbsolutePositionFromRelativePosition,
} from 'yjs';

import {
    setCodeContent,
    setSelectedFileContent,
} from '../../store/slices/editorSlice';
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
    yjsResources,
    isYjsConnected,
}) {
    const dispatch = useDispatch();
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);
    const { yDoc, yText, awareness } = yjsResources;

    const bindingRef = useRef(null); // To store the MonacoBinding instance for cleanup
    const closestSectionRef = useRef(null); // To store the parent section of Monaco for relative postioning of tooltips
    const awarenessTimerRef = useRef(null); // To debounce the awareness update rendering
    const clientDecorationsRef = useRef(new Map()); // Map to store decorations for each client
    const lastHeartbeatTimeRef = useRef(0); // To store last time heartbeat state is updated for throttling

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
            dispatch(setSelectedFileContent(value));
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

        function sendThrottledHeartbeat() {
            const now = Date.now();
            if (now - lastHeartbeatTimeRef.current >= 5000) {
                // 5 seconds
                awareness.setLocalStateField('heartbeat', now);
                lastHeartbeatTimeRef.current = now;
            }
        }

        editor.onDidChangeCursorPosition(() => {
            sendThrottledHeartbeat();
        });

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

                            const { user, selection /* , heartbeat */ } = state;

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

                            batchedDecorationsMap.set(
                                clientId,
                                decorationsForClient
                            );

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
                            const targetPixelPosition =
                                editor.getScrolledVisiblePosition(
                                    cursorPosition
                                );

                            if (targetPixelPosition) {
                                // Get the scroll offsets to position the tooltips absolutely inside the editor
                                const scrollTop = editor.getScrollTop();
                                const scrollLeft = editor.getScrollLeft();

                                const leftPos =
                                    targetPixelPosition.left + scrollLeft;

                                const topPos =
                                    targetPixelPosition.top +
                                    scrollTop -
                                    tooltipElement.offsetHeight -
                                    0; // Tooltip offset from the cursor

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
                awareness.setLocalState(null);
                awareness.getStates()?.delete(awareness.clientID);
            }

            // Clear all remaining decorations from clientDecorations map
            if (editorRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                clientDecorationsRef.current.forEach((decorations) => {
                    decorations.clear();
                });
            }
            clientDecorationsRef.current?.clear(); // Clear the map

            // Clean up any remaining tooltips from this client if it was the last one
            document
                .querySelectorAll('.collaborator-tooltip')
                .forEach((el) => el.remove());
        };
    }, [yText, awareness, editorRef]); // Re-run effect on file switches

    useEffect(() => {
        if (!awareness || awareness.getStates()?.size < 2) return;

        const afkCheckInterval = setInterval(() => {
            const states = awareness.getStates();

            states.forEach((state, clientId) => {
                if (clientId === awareness.clientID) return; // skip self

                const tooltip = document.querySelector(
                    `.collaborator-tooltip-${clientId}`
                );
                if (!tooltip || !state.user || !state.heartbeat) return;

                const minutesIdle =
                    (Date.now() - state.heartbeat) / (60 * 1000);

                tooltip.classList.toggle('tooltip-afk', minutesIdle >= 2);
            });
        }, 30 * 1000); // check AFK every 30 sec

        return () => {
            clearInterval(afkCheckInterval);
        };
    }, [awareness]);

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
    if (!isYjsConnected) {
        return (
            <section {...editorSectionProps}>
                <MonacoEditor {...editorProps} />
            </section>
        );
    }

    // Only render MonacoEditor if yText and awareness are provided
    if (!yText || !awareness) {
        console.log(yText, awareness);

        return <Spinner size="4" />;
    }

    return (
        <section {...editorSectionProps}>
            <MonacoEditor {...editorProps} />
        </section>
    );
}
