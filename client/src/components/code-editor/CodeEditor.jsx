import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';

import { setCodeContent } from '../../store/slices/editorSlice';
import { Spinner } from '../componentsIndex';
import {
    yText,
    /* yDoc, awareness, connectYjs, */ wsProvider,
} from '../../../lib/yjs';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';
import './CodeEditor.css';

/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {Object} props The props object for CodeEditor component
 * @param {string} props.language The programming language for the editor.
 * @param {string} props.codeContent The current code content to display.
 * @param {React.RefObject} editorRef The react ref for monaco editor.
 * @returns {JSX.Element} The Monaco Editor.
 */
export default function CodeEditor({ language, codeContent, ref: editorRef }) {
    const dispatch = useDispatch();
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);
    const { collaborators } = useSelector((state) => state.editor); // { id, username, position: { line, column } }
    /* const { $id: projectId = 'bytetogetherPID' } = useSelector(
        (state) => state.editor.activeProject
    ); */

    const bindingRef = useRef(null); // To store the MonacoBinding instance for cleanup

    // Distinct cursor colors for each collaborator
    const cursorColors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ff00ff',
        '#00ffff',
    ];

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

    // Handles editor mount and sets up multi-cursor decorations for collaborators.
    // function handleEditorDidMount(editor, monaco) {
    //     editorRef.current = editor;
    //     editor.focus();

    //     // Placeholder for collaborator cursors (Will implement with Yjs in Phase 5)
    //     if (collaborators.length > 0) {
    //         let color;
    //         const decorations = collaborators.map((collaborator, index) => {
    //             color = cursorColors[index % cursorColors.length];
    //             return {
    //                 range: new monaco.Range(
    //                     collaborator.position.line || 1,
    //                     collaborator.position.column || 1,
    //                     collaborator.position.line || 1,
    //                     collaborator.position.column || 1
    //                 ),
    //                 options: {
    //                     className: `collaborator-cursor collaborator-cursor-${index}`,
    //                     stickiness:
    //                         monaco.editor.TrackedRangeStickiness
    //                             .NeverGrowsWhenTyping,
    //                 },
    //             };
    //         });
    //         editor.deltaDecorations([], decorations);

    //         // Add username tooltips
    //         collaborators.forEach((collaborator, index) => {
    //             const domNode = editor.getDomNode();
    //             const cursorElement = document.createElement('div');
    //             cursorElement.className = `collaborator-tooltip collaborator-tooltip-${index}`;
    //             cursorElement.textContent = collaborator.username;
    //             cursorElement.style.position = 'absolute';
    //             cursorElement.style.backgroundColor = color;
    //             cursorElement.style.color = '#fff';
    //             cursorElement.style.padding = '2px 4px';
    //             cursorElement.style.borderRadius = '3px';
    //             cursorElement.style.zIndex = '1000';
    //             domNode.appendChild(cursorElement);

    //             // Update tooltip position (placeholder logic, refine with Yjs)
    //             const _position = editor.getPosition();
    //             const pixelPosition = editor
    //                 .getDomNode()
    //                 .getBoundingClientRect();
    //             cursorElement.style.left = `${pixelPosition.left + 10}px`; // Offset from editor edge
    //             cursorElement.style.top = `${pixelPosition.top - 20}px`; // Above cursor
    //         });
    //     }
    // }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.focus();

        // // Bind Yjs to Monaco Editor
        // const type = yDoc.getText('monaco');
        // binding = new MonacoBinding(type, editor.getModel(), awareness, {
        //     yDoc,
        // });
        // connectYjs(projectId); // Connect Yjs when editor mounts

        // // Update collaborator cursors
        // awareness.on('update', ({ added, updated, removed }) => {
        //     const decorations = [];
        //     const tooltips = [];

        //     [...added, ...updated].forEach((clientId) => {
        //         const state = awareness.getLocalState().get(clientId);
        //         if (state) {
        //             const { user, selection } = state;
        //             const index = clientId % cursorColors.length;
        //             const color = cursorColors[index];
        //             if (selection && selection.length > 0) {
        //                 const position = editor
        //                     .getModel()
        //                     .getPositionAt(selection[0].anchor);
        //                 decorations.push({
        //                     range: new monaco.Range(
        //                         position.lineNumber,
        //                         position.column,
        //                         position.lineNumber,
        //                         position.column
        //                     ),
        //                     options: {
        //                         className: `collaborator-cursor collaborator-cursor-${index}`,
        //                         stickiness:
        //                             monaco.editor.TrackedRangeStickiness
        //                                 .NeverGrowsWhenTyping,
        //                     },
        //                 });
        //                 tooltips.push({ clientId, user, color, position });
        //             }
        //         }
        //     });

        //     removed.forEach((clientId) => {
        //         // Clean up removed cursor decorations
        //         const cursorClass = `.collaborator-cursor-${clientId % cursorColors.length}`;
        //         const elements = document.querySelectorAll(cursorClass);
        //         elements.forEach((el) => el.remove());
        //     });

        //     editor.deltaDecorations([], decorations);

        //     // Update or create tooltips
        //     const domNode = editor.getDomNode();
        //     tooltips.forEach(({ clientId, user, color, position }) => {
        //         let cursorElement = document.querySelector(
        //             `.collaborator-tooltip-${clientId}`
        //         );
        //         if (!cursorElement) {
        //             cursorElement = document.createElement('div');
        //             cursorElement.className = `collaborator-tooltip collaborator-tooltip-${clientId}`;
        //             cursorElement.style.position = 'absolute';
        //             cursorElement.style.backgroundColor = color;
        //             cursorElement.style.color = '#fff';
        //             cursorElement.style.padding = '2px 4px';
        //             cursorElement.style.borderRadius = '3px';
        //             cursorElement.style.zIndex = '1000';
        //             domNode.appendChild(cursorElement);
        //         }
        //         const pixelPosition =
        //             editor.getTopForLineNumber(position.lineNumber) +
        //             editor.getScrollTop();
        //         cursorElement.textContent = user?.name || 'Anonymous';
        //         cursorElement.style.left = `${editor.getOffsetForColumn(position.lineNumber, position.column) + 10}px`;
        //         cursorElement.style.top = `${pixelPosition - 20}px`;
        //     });
        // });

        // // Set initial user awareness state
        // awareness.setLocalStateField('user', {
        //     name: 'User' + Math.floor(Math.random() * 1000), // Unique username
        //     color: cursorColors[
        //         Math.floor(Math.random() * cursorColors.length)
        //     ],
        // });

        // // Update awareness on local cursor movement
        // editor.onDidChangeCursorPosition((e) => {
        //     const selection = editor.getSelection();
        //     awareness.setLocalStateField('selection', [
        //         {
        //             anchor: model.getOffsetAt(selection.getPosition()),
        //             head: model.getOffsetAt(selection.getEndPosition()),
        //         },
        //     ]);
        //     // Update awareness on local cursor movement
        //     editor.onDidChangeCursorPosition((e) => {
        //         const selection = editor.getSelection();
        //         awareness.setLocalStateField('selection', [
        //             {
        //                 anchor: model.getOffsetAt(selection.getPosition()),
        //                 head: model.getOffsetAt(selection.getEndPosition()),
        //             },
        //         ]);
        //     });
        // });

        // **Yjs-Monaco Binding**
        // Create the Monaco Editor model that y-monaco will bind to
        const model = editor.getModel();

        if (model) {
            // Bind the Y.Text to the Monaco Editor model
            bindingRef.current = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                wsProvider.awareness
            );
            // Optionally, you can handle the binding's destruction on unmount
            // if you were dynamically creating/destroying editors.
            // For a single editor, this isn't strictly necessary unless you want
            // to re-bind for different files later.

            // Set initial content from Yjs document if it's not empty,
            // otherwise, set the content from Redux.
            // This ensures that when the editor loads, it gets content from the shared Yjs doc first.
            if (yText.length > 0 && model.getValue() !== yText.toString()) {
                model.setValue('');
                model.setValue(yText.toString());
            } else if (model.getValue() !== codeContent) {
                // If Yjs doc is empty or current model content doesn't match Redux
                // This ensures initial file content from Redux is pushed to Yjs.
                yText.insert(0, codeContent);
            }
        }

        // This effect will react to changes in `yText` and update Redux
        // This is crucial because `onChange` is no longer dispatching to Redux.
        function observer(yDelta, transaction) {
            if (editorRef.current && transaction.local) {
                // If the change was local (from this editor), Redux is already updated
                // by the yText.insert() or yText.delete() operations which reflect in Monaco.
                // However, for other scenarios where yText changes (e.g. initial load
                // or changes from other sources), you might want to sync.
                // For now, let's dispatch on any change to keep Redux in sync.
                // Note: This could cause unnecessary re-renders if not optimized.
                dispatch(setCodeContent(yText.toString()));
            } else if (editorRef.current) {
                // If the change came from a remote source, update Redux
                dispatch(setCodeContent(yText.toString()));
            }
        }
        yText.observe(observer);

        // --- Existing multi-cursor/tooltip placeholder logic. This will need significant changes with Yjs ---
        // Placeholder for collaborator cursors (Will implement with Yjs in Phase 5)
        // This section will be replaced by y-websocket's awareness state.
        if (collaborators.length > 0) {
            let color;
            const decorations = collaborators.map((collaborator, index) => {
                color = cursorColors[index % cursorColors.length];
                return {
                    range: new monaco.Range(
                        collaborator.position.line || 1,
                        collaborator.position.column || 1,
                        collaborator.position.line || 1,
                        collaborator.position.column || 1
                    ),
                    options: {
                        className: `collaborator-cursor collaborator-cursor-${index}`,
                        stickiness:
                            monaco.editor.TrackedRangeStickiness
                                .NeverGrowsWhenTyping,
                    },
                };
            });
            editor.deltaDecorations([], decorations);

            collaborators.forEach((collaborator, index) => {
                const domNode = editor.getDomNode();
                const cursorElement = document.createElement('div');
                cursorElement.className = `collaborator-tooltip collaborator-tooltip-${index}`;
                cursorElement.textContent = collaborator.username;
                cursorElement.style.position = 'absolute';
                cursorElement.style.backgroundColor = color;
                cursorElement.style.color = '#fff';
                cursorElement.style.padding = '2px 4px';
                cursorElement.style.borderRadius = '3px';
                cursorElement.style.zIndex = '1000';
                domNode.appendChild(cursorElement);

                const _position = editor.getPosition();
                const pixelPosition = editor
                    .getDomNode()
                    .getBoundingClientRect();
                cursorElement.style.left = `${pixelPosition.left + 10}px`;
                cursorElement.style.top = `${pixelPosition.top - 20}px`;
            });
        }

        // Cleanup observer on unmount
        return () => {
            yText.unobserve(observer);
            // Optionally unbind monaco if you were dealing with multiple dynamic editors
            // binding.destroy();
        };
    }

    // Use an effect to manage the Yjs binding cleanup
    useEffect(() => {
        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, []);

    return (
        <section
            className="flex h-[calc(100%-4rem)] flex-col text-gray-800 dark:text-gray-200"
            aria-label="Code editor"
        >
            <MonacoEditor
                height="91vh"
                width="100%"
                language={language}
                value={codeContent}
                theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                loading={<Spinner size="4" />}
                options={{
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
                        alwaysConsumeMouseWheel: false, // Allow scroll propagation
                    },
                }}
            />
        </section>
    );
}
