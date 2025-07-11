import { memo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import {
    createRelativePositionFromTypeIndex,
    createAbsolutePositionFromRelativePosition,
} from 'yjs';

import { setCodeContent } from '../../store/slices/editorSlice';
import { Spinner } from '../componentsIndex';

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
function CodeEditor({
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
    // const awarenessTimerRef = useRef(null); // To debounce the awareness update rendering
    const heartbeatInterval = useRef(null); // To clear heartbeat interval
    const clientDecorations = useRef(new Map()); // Map to store decorations for each client

    // Distinct cursor colors for each collaborator
    const cursorColors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ff00ff',
        '#00ffff',
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

        // Set initial user awareness state for this client
        awareness.setLocalStateField('user', {
            name: 'User' + Math.floor(Math.random() * 100), // Unique username
            color: cursorColors[
                Math.floor(Math.random() * cursorColors.length)
            ],
        });

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

        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            console.warn(`leaking interval cleared`);
        }
        heartbeatInterval.current = setInterval(() => {
            let date = new Date();
            date = date.toLocaleTimeString();
            awareness.setLocalStateField('heartbeat', date);
        }, 2000);

        // --- Yjs Awareness (Cursor & Selection Sync) ---
        awareness.on('update', ({ added, updated, removed }) => {
            /* if (awarenessTimerRef.current)
                    clearTimeout(awarenessTimerRef.current); */
            // awarenessTimerRef.current = setTimeout(() => {

            // For heavy rendering work (decorations + tooltips)
            requestAnimationFrame(() => {
                const editorDomNode = editor.getDomNode();
                const model = editor.getModel();
                if (!model) return;

                // Process added and updated clients
                [...added, ...updated].forEach((clientId) => {
                    const state = awareness.getStates().get(clientId); // Use getStates() to get all states
                    console.log(
                        `client id for this client - ${clientId} and state `,
                        state
                    );

                    if (!state || !state.selection || !state.user) {
                        // If state is incomplete, clean up any existing decorations/tooltips for this client
                        console.warn(
                            `Incomplete awareness state for client ${clientId}. Cleaning up.`
                        );
                        const tooltipElement = document.querySelector(
                            `.collaborator-tooltip-${clientId}`
                        );
                        if (tooltipElement) {
                            tooltipElement.remove();
                        }
                        if (clientDecorations.current.has(clientId)) {
                            editor.createDecorationsCollection([]);
                            clientDecorations.current.delete(clientId);
                        }
                        return;
                    }

                    const { user, selection } = state;
                    const colorIndex = clientId % cursorColors.length;
                    const color = cursorColors[colorIndex];

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
                    console.error(`headPos`, headPos);

                    const anchorPos = model.getPositionAt(anchorAbs);
                    console.error(`anchorPos`, anchorPos);

                    const decorationsForClient = [];

                    // Create decorations for selections (if any)
                    if (
                        headPos.lineNumber !== anchorPos.lineNumber ||
                        headPos.column !== anchorPos.column
                    ) {
                        // Head and anchor are not equal so it's a selection, not just a cursor
                        const [start, end] = [headPos, anchorPos].sort(
                            (a, b) => a - b
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
                                inlineClassName: `collaborator-selection-${colorIndex}`,
                                stickiness:
                                    monaco.editor.TrackedRangeStickiness
                                        .NeverGrowsWhenTyping,
                                // Ensure these don't interfere with the cursor line highlight
                                /* overviewRuler: {
                                    color: color,
                                    position:
                                        monaco.editor.OverviewRulerLane.Center,
                                }, */
                            },
                        });
                    }

                    // Create decoration for cursor
                    const cursorPosition = {
                        lineNumber: anchorPos.lineNumber,
                        column: anchorPos.column,
                    };
                    console.group();
                    console.log(
                        'absoluteHead',
                        headAbs,
                        'anchorPos',
                        anchorPos
                    );
                    console.log(`cursorPosition`, cursorPosition);
                    console.groupEnd();

                    decorationsForClient.push({
                        range: new monaco.Range(
                            cursorPosition.lineNumber,
                            cursorPosition.column,
                            cursorPosition.lineNumber,
                            cursorPosition.column
                        ),
                        options: {
                            className: `collaborator-cursor`, // Class for the cursor line
                            inlineClassName: `collaborator-cursor-${colorIndex}`, // Specific color class for the cursor
                            // `beforeContent` and `afterContent` can be used for custom cursor shapes/blinking
                            // For a simple vertical line, `className` on a zero-width range is often enough.
                            // This will create a thin line (cursor)
                            isWholeLine: false, // Apply only to the cursor position, not the whole line
                            // `cursor` is not directly controllable via decorations for custom shapes that easily.
                            // A better approach for the actual blinking cursor is to use `inlineClassName`
                            // and manipulate its CSS for `:after` or `:before` pseudo-elements.
                        },
                    });

                    // Update decorations for this specific client
                    if (clientDecorations.current.has(clientId)) {
                        console.warn(clientDecorations.current.get(clientId));
                        clientDecorations.current.delete(clientId);
                    }
                    const newIds =
                        editor.createDecorationsCollection(
                            decorationsForClient
                        );
                    clientDecorations.current.set(clientId, newIds);
                    console.warn(clientDecorations.current);

                    // Create or update tooltip (label above cursor)
                    let tooltipElement = document.querySelector(
                        `.collaborator-tooltip-${colorIndex}`
                    );
                    if (!tooltipElement) {
                        tooltipElement = document.createElement('div');
                        tooltipElement.className = `collaborator-tooltip collaborator-tooltip-${colorIndex}`;
                        tooltipElement.style.backgroundColor = color;
                        if (!editorDomNode.contains(tooltipElement)) {
                            editorDomNode.appendChild(tooltipElement);
                        }
                    }
                    tooltipElement.textContent = user.name || 'Anonymous';

                    // Position the tooltip relative to the editor content
                    // Monaco provides `getScrolledVisiblePosition` which gives pixel coords
                    const targetPixelPosition =
                        editor.getScrolledVisiblePosition(cursorPosition);
                    // Also get the overall editor position for relative positioning
                    const _editorContainer = editor
                        .getContainerDomNode()
                        .getBoundingClientRect();
                    const _viewZoneContainer =
                        editor.getDomNode().querySelector('.lines-content') ||
                        editor.getDomNode(); // Target the visible lines container for more accurate relative positioning

                    if (targetPixelPosition) {
                        // Get the bounding rectangle of the editor's main DOM node
                        const editorRect = editor
                            .getDomNode()
                            .getBoundingClientRect();

                        // The targetPixelPosition is relative to the editor's *content area*.
                        // We need to position the tooltip absolutely relative to the document or a positioned parent.
                        // If your CodeEditor section has `position: relative`, then you can position relative to it.
                        // Assuming the 'section' parent of MonacoEditor has 'position: relative':
                        // Get the bounding box of the CodeEditor's containing <section>
                        const codeEditorSection = closestSectionRef.current;

                        const _sectionRect = codeEditorSection
                            ? codeEditorSection.getBoundingClientRect()
                            : { left: 0, top: 0 };

                        console.log('targetPixelPosition', targetPixelPosition);

                        // Calculate absolute position on the page
                        // The `targetPixelPosition.left` and `targetPixelPosition.top` are relative to the
                        // scrollable content viewport. We need to add the offset of the editor itself
                        // relative to the document's viewport.
                        const _editorOffsetLeft =
                            editorRect.left + window.scrollX;
                        const _editorOffsetTop =
                            editorRect.top + window.scrollY;

                        // Position tooltip relative to its parent (`domNode` which is part of editor container)
                        // targetPixelPosition is already relative to the editor's content view.
                        // So, `targetPixelPosition.left` and `targetPixelPosition.top` should work directly
                        // if `domNode` (where tooltip is appended) is the editor's root, AND it's positioned.

                        // Simpler approach (relative to editor domNode, which is usually `position:relative`)
                        tooltipElement.style.left = `${targetPixelPosition.left}px`;
                        tooltipElement.style.top = `${targetPixelPosition.top - tooltipElement.offsetHeight - 3}px`; // 5px above cursor

                        tooltipElement.style.display = 'block';
                    } else {
                        tooltipElement.style.display = 'none';
                    }
                });

                // Clean up removed clients' tooltips
                removed.forEach((clientId) => {
                    const tooltipElement = document.querySelector(
                        `.collaborator-tooltip-${clientId % cursorColors.length}`
                    );
                    if (tooltipElement) {
                        tooltipElement.remove();
                    }

                    // Clear decorations for the removed client
                    if (clientDecorations.current.has(clientId)) {
                        editor.createDecorationsCollection([]);
                        clientDecorations.current.delete(clientId);
                    }
                });
            });
        });
        //     },
        //     100 // debounce awareness updates
        // );
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
            }

            // Clear all remaining decorations from clientDecorations map
            if (editorRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                clientDecorations.current.forEach(() => {
                    editorRef.current.createDecorationsCollection([]);
                });
            }
            clientDecorations.current?.clear(); // Clear the map

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

export default memo(CodeEditor);

// import { memo, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import MonacoEditor from '@monaco-editor/react';
// import { MonacoBinding } from 'y-monaco';
// import {
//     createRelativePositionFromTypeIndex,
//     createAbsolutePositionFromRelativePosition,
// } from 'yjs';

// import { setCodeContent } from '../../store/slices/editorSlice';
// import { Spinner } from '../componentsIndex';

// import nightOwlTheme from './themes/night-owl.json';
// import vsLight from './themes/custom-light.json';
// import './CodeEditor.css';

// function CodeEditor({
//     language,
//     codeContent,
//     ref: editorRef,
//     yDoc,
//     yText,
//     awareness,
//     isInvited,
// }) {
//     const dispatch = useDispatch();
//     const { settings } = useSelector((state) => state.editor);
//     const { theme } = useSelector((state) => state.ui);

//     const bindingRef = useRef(null);
//     const closestSectionRef = useRef(null);
//     const awarenessTimerRef = useRef(null);
//     const clientDecorations = useRef(new Map());
//     const lastClientSelections = useRef(new Map());

//     const cursorColors = [
//         '#ff0000',
//         '#00ff00',
//         '#0000ff',
//         '#ff00ff',
//         '#00ffff',
//     ];

//     function handleContentChange(value) {
//         if (!yText) {
//             dispatch(setCodeContent(value));
//         }
//     }

//     function handleEditorWillMount(monaco) {
//         monaco.editor.defineTheme('night-owl', nightOwlTheme);
//         monaco.editor.defineTheme('vs-light', vsLight);

//         monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//             target: monaco.languages.typescript.ScriptTarget.ESNext,
//             allowNonTsExtensions: true,
//             moduleResolution:
//                 monaco.languages.typescript.ModuleResolutionKind.NodeJs,
//             module: monaco.languages.typescript.ModuleKind.ESNext,
//             noEmit: true,
//             typeRoots: ['node_modules/@types'],
//         });

//         const languagesToEnhance = ['python', 'cpp', 'c', 'java'];
//         languagesToEnhance.forEach((lang) => {
//             monaco.languages.registerCompletionItemProvider(lang, {
//                 provideCompletionItems: () => {
//                     const suggestions = [
//                         {
//                             label: 'if',
//                             kind: monaco.languages.CompletionItemKind.Keyword,
//                             insertText:
//                                 lang === 'python'
//                                     ? 'if ${1:condition}:\n    $0'
//                                     : 'if (${1:condition}) {\n    $0\n}',
//                             insertTextRules:
//                                 monaco.languages.CompletionItemInsertTextRule
//                                     .InsertAsSnippet,
//                             documentation: 'If statement',
//                         },
//                         {
//                             label: 'for',
//                             kind: monaco.languages.CompletionItemKind.Keyword,
//                             insertText:
//                                 lang === 'python'
//                                     ? 'for ${1:item} in ${2:iterable}:\n    $0'
//                                     : 'for (${1:init}; ${2:condition}; ${3:update}) {\n    $0\n}',
//                             insertTextRules:
//                                 monaco.languages.CompletionItemInsertTextRule
//                                     .InsertAsSnippet,
//                             documentation: 'For loop',
//                         },
//                     ];
//                     return { suggestions };
//                 },
//             });
//         });
//     }

//     function handleEditorDidMount(editor, monaco) {
//         editorRef.current = editor;
//         editorRef.current?.focus();

//         if (!yText || !awareness) return;

//         const model = editor.getModel();

//         if (model) {
//             if (bindingRef.current) {
//                 bindingRef.current.destroy();
//                 bindingRef.current = null;
//             }

//             bindingRef.current = new MonacoBinding(
//                 yText,
//                 model,
//                 new Set([editor]),
//                 awareness
//             );
//         }

//         awareness.setLocalStateField('user', {
//             name: 'User' + Math.floor(Math.random() * 100),
//             color: cursorColors[
//                 Math.floor(Math.random() * cursorColors.length)
//             ],
//         });

//         editor.onDidChangeCursorSelection((e) => {
//             if (!yText || !awareness) return;

//             const model = editor.getModel();
//             const anchorIndex = model.getOffsetAt(
//                 e.selection.getStartPosition()
//             );
//             const headIndex = model.getOffsetAt(e.selection.getEndPosition());

//             const anchor = createRelativePositionFromTypeIndex(
//                 yText,
//                 anchorIndex
//             );
//             const head = createRelativePositionFromTypeIndex(yText, headIndex);

//             awareness.setLocalStateField('selection', { anchor, head });
//         });

//         setInterval(() => {
//             awareness.setLocalStateField('heartbeat', Date.now());
//         }, 10000);

//         awareness.on('update', ({ added, updated, removed }) => {
//             if (awarenessTimerRef.current)
//                 clearTimeout(awarenessTimerRef.current);

//             awarenessTimerRef.current = setTimeout(() => {
//                 requestAnimationFrame(() => {
//                     const domNode = editor.getDomNode();
//                     const model = editor.getModel();
//                     if (!model) return;

//                     [...added, ...updated].forEach((clientId) => {
//                         const state = awareness.getStates().get(clientId);
//                         if (!state || !state.selection || !state.user) {
//                             console.warn(
//                                 `Incomplete awareness state for client ${clientId}`
//                             );
//                         }

//                         const { user, selection } = state;
//                         const absoluteHead =
//                             createAbsolutePositionFromRelativePosition(
//                                 selection.head,
//                                 yDoc
//                             );
//                         const absoluteAnchor =
//                             createAbsolutePositionFromRelativePosition(
//                                 selection.anchor,
//                                 yDoc
//                             );

//                         if (!absoluteHead || !absoluteAnchor) return;

//                         const colorIndex = clientId % cursorColors.length;
//                         const color = cursorColors[colorIndex];

//                         const decorations = [];

//                         if (
//                             absoluteHead.row !== absoluteAnchor.row ||
//                             absoluteHead.column !== absoluteAnchor.column
//                         ) {
//                             const [startOffset, endOffset] = [
//                                 model.getOffsetAt({
//                                     lineNumber: absoluteAnchor.row + 1,
//                                     column: absoluteAnchor.column + 1,
//                                 }),
//                                 model.getOffsetAt({
//                                     lineNumber: absoluteHead.row + 1,
//                                     column: absoluteHead.column + 1,
//                                 }),
//                             ].sort((a, b) => a - b);

//                             const startPos = model.getPositionAt(startOffset);
//                             const endPos = model.getPositionAt(endOffset);

//                             decorations.push({
//                                 range: new monaco.Range(
//                                     startPos.lineNumber,
//                                     startPos.column,
//                                     endPos.lineNumber,
//                                     endPos.column
//                                 ),
//                                 options: {
//                                     className: 'collaborator-selection',
//                                     inlineClassName: `collaborator-selection-${colorIndex}`,
//                                     stickiness:
//                                         monaco.editor.TrackedRangeStickiness
//                                             .NeverGrowsWhenTyping,
//                                 },
//                             });
//                         }

//                         const cursorPosition = {
//                             lineNumber: absoluteHead.row + 1,
//                             column: absoluteHead.column + 1,
//                         };

//                         decorations.push({
//                             range: new monaco.Range(
//                                 cursorPosition.lineNumber,
//                                 cursorPosition.column,
//                                 cursorPosition.lineNumber,
//                                 cursorPosition.column
//                             ),
//                             options: {
//                                 className: 'collaborator-cursor',
//                                 inlineClassName: `collaborator-cursor-${colorIndex}`,
//                             },
//                         });

//                         const existing =
//                             clientDecorations.current.get(clientId) || [];
//                         const newDecorations = editor.deltaDecorations(
//                             existing,
//                             decorations
//                         );
//                         clientDecorations.current.set(clientId, newDecorations);

//                         let tooltip = document.querySelector(
//                             `.collaborator-tooltip-${clientId}`
//                         );
//                         if (!tooltip) {
//                             tooltip = document.createElement('div');
//                             tooltip.className = `collaborator-tooltip collaborator-tooltip-${clientId}`;
//                             tooltip.style.backgroundColor = color;
//                             domNode.appendChild(tooltip);
//                         }

//                         tooltip.textContent = user.name || 'Anonymous';

//                         const pixelPos =
//                             editor.getScrolledVisiblePosition(cursorPosition);
//                         const editorRect = editor
//                             .getDomNode()
//                             .getBoundingClientRect();

//                         if (pixelPos) {
//                             tooltip.style.left = `${pixelPos.left}px`;
//                             tooltip.style.top = `${pixelPos.top - tooltip.offsetHeight - 5}px`;
//                             tooltip.style.display = 'block';
//                         } else {
//                             tooltip.style.display = 'none';
//                         }
//                     });

//                     removed.forEach((clientId) => {
//                         const tooltip = document.querySelector(
//                             `.collaborator-tooltip-${clientId}`
//                         );
//                         if (tooltip) tooltip.remove();
//                         const existing =
//                             clientDecorations.current.get(clientId);
//                         if (existing) editor.deltaDecorations(existing, []);
//                         clientDecorations.current.delete(clientId);
//                     });
//                 });
//             }, 50);
//         });
//     }

//     useEffect(() => {
//         return () => {
//             if (bindingRef.current) {
//                 bindingRef.current.destroy();
//                 bindingRef.current = null;
//             }
//             if (awareness) {
//                 awareness.setLocalStateField('selection', null);
//                 awareness.setLocalStateField('user', null);
//             }
//             if (editorRef.current) {
//                 // eslint-disable-next-line react-hooks/exhaustive-deps
//                 clientDecorations.current.forEach((ids) => {
//                     editorRef.current.deltaDecorations(ids, []);
//                 });
//             }
//             clientDecorations.current.clear();
//             document
//                 .querySelectorAll('.collaborator-tooltip')
//                 .forEach((el) => el.remove());
//         };
//     }, [yText, awareness, editorRef]);

//     if (!isInvited) {
//         return (
//             <section
//                 className="relative flex h-[calc(100%-4rem)] flex-col text-gray-800 dark:text-gray-200"
//                 aria-label="Code editor"
//                 ref={closestSectionRef}
//             >
//                 <MonacoEditor
//                     height="91vh"
//                     width="100%"
//                     language={language}
//                     value={codeContent}
//                     onChange={handleContentChange}
//                     theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
//                     beforeMount={handleEditorWillMount}
//                     onMount={handleEditorDidMount}
//                     loading={<Spinner size="4" />}
//                     options={{
//                         fontSize: settings.fontSize,
//                         wordWrap: settings.wordWrap,
//                         minimap: {
//                             enabled: settings.minimap,
//                             autohide: true,
//                             renderCharacters: true,
//                             showSlider: 'mouseover',
//                         },
//                         tabSize: settings.tabSize,
//                         stickyScroll: { enabled: settings.stickyScroll },
//                         insertSpaces: true,
//                         accessibilitySupport: 'auto',
//                         lineNumbers: 'on',
//                         formatOnPaste: true,
//                         scrollBeyondLastLine: false,
//                         automaticLayout: true,
//                         cursorBlinking: 'smooth',
//                         cursorSmoothCaretAnimation: 'on',
//                         renderLineHighlight: 'all',
//                         bracketPairColorization: { enabled: true },
//                         suggest: { showSnippets: true, showWords: true },
//                         smoothScrolling: true,
//                         hover: { delay: 500 },
//                         scrollbar: {
//                             alwaysConsumeMouseWheel: false,
//                         },
//                     }}
//                 />
//             </section>
//         );
//     }

//     if (!yText || !awareness) {
//         return <Spinner size="4" />;
//     }

//     return (
//         <section
//             className="relative flex h-[calc(100%-4rem)] flex-col text-gray-800 dark:text-gray-200"
//             aria-label="Code editor"
//             ref={closestSectionRef}
//         >
//             <MonacoEditor
//                 height="91vh"
//                 width="100%"
//                 language={language}
//                 value={!yText ? codeContent : undefined}
//                 onChange={handleContentChange}
//                 theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
//                 beforeMount={handleEditorWillMount}
//                 onMount={handleEditorDidMount}
//                 loading={<Spinner size="4" />}
//                 options={{
//                     fontSize: settings.fontSize,
//                     wordWrap: settings.wordWrap,
//                     minimap: {
//                         enabled: settings.minimap,
//                         autohide: true,
//                         renderCharacters: true,
//                         showSlider: 'mouseover',
//                     },
//                     tabSize: settings.tabSize,
//                     stickyScroll: { enabled: settings.stickyScroll },
//                     insertSpaces: true,
//                     accessibilitySupport: 'auto',
//                     lineNumbers: 'on',
//                     formatOnPaste: true,
//                     scrollBeyondLastLine: false,
//                     automaticLayout: true,
//                     cursorBlinking: 'smooth',
//                     cursorSmoothCaretAnimation: 'on',
//                     renderLineHighlight: 'all',
//                     bracketPairColorization: { enabled: true },
//                     suggest: { showSnippets: true, showWords: true },
//                     smoothScrolling: true,
//                     hover: { delay: 500 },
//                     scrollbar: {
//                         alwaysConsumeMouseWheel: false,
//                     },
//                 }}
//             />
//         </section>
//     );
// }

// export default memo(CodeEditor);
