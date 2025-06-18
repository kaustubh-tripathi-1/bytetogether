import { useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';

import { Spinner } from '../componentsIndex';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';

/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {string} projectId - The ID of the active project.
 * @returns {JSX.Element} The Monaco Editor with file selector.
 */
export default function CodeEditor({
    language,
    codeContent,
    onChange,
    onMount,
}) {
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);

    // Defines custom themes and compiler options before the editor mounts.
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
                onChange={onChange}
                theme={theme === 'dark' ? 'night-owl' : 'vs-light'}
                beforeMount={handleEditorWillMount}
                onMount={onMount}
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
