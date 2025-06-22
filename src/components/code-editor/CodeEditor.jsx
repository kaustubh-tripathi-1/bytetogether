import { useDispatch, useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';

import { setCodeContent } from '../../store/slices/editorSlice';
import { Spinner } from '../componentsIndex';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';
import './CodeEditor.css';

/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {Object} props - The props object for CodeEditor component
 * @param {string} props.language - The programming language for the editor.
 * @param {string} props.codeContent - The current code content to display.
 * @param {React.RefObject} editorRef - The react ref for monaco editor.
 * @returns {JSX.Element} The Monaco Editor.
 */
export default function CodeEditor({ language, codeContent, ref: editorRef }) {
    const dispatch = useDispatch();
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);
    const { collaborators } = useSelector((state) => state.editor); // { id, username, position: { line, column } }

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

    function handleEditorContentChange(value) {
        dispatch(setCodeContent(value));
    }

    // Handles editor mount and sets up multi-cursor decorations for collaborators.
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.focus();

        // Placeholder for collaborator cursors (Will implement with Yjs in Phase 5)
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

            // Add username tooltips
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

                // Update tooltip position (placeholder logic, refine with Yjs)
                const _position = editor.getPosition();
                const pixelPosition = editor
                    .getDomNode()
                    .getBoundingClientRect();
                cursorElement.style.left = `${pixelPosition.left + 10}px`; // Offset from editor edge
                cursorElement.style.top = `${pixelPosition.top - 20}px`; // Above cursor
            });
        }
    }

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
                onChange={handleEditorContentChange}
                theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                loading={<Spinner size="4" />}
                options={{
                    fontSize: settings.fontSize,
                    wordWrap: settings.wordWrap,
                    minimap: settings.minimap,
                    tabSize: settings.tabSize,
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
                    stickyScroll: { enabled: false },
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
