/**
 * CodeEditor component for rendering Monaco Editor with file selection.
 * @param {string} projectId - The ID of the active project.
 * @returns {JSX.Element} The Monaco Editor with file selector.
 */
import { useSelector } from 'react-redux';
import MonacoEditor from '@monaco-editor/react';

import { Spinner } from '../componentsIndex';
// import { setTheme } from '../../store/slices/uiSlice';

import nightOwlTheme from './themes/night-owl.json';
import vsLight from './themes/custom-light.json';

export default function CodeEditor({
    language,
    codeContent,
    onChange,
    onMount,
}) {
    const { settings } = useSelector((state) => state.editor);
    const { theme } = useSelector((state) => state.ui);

    // Define custom Night Owl theme
    function handleEditorWillMount(monaco) {
        monaco.editor.defineTheme('night-owl', nightOwlTheme);
        monaco.editor.defineTheme('vs-light', vsLight);
    }

    return (
        <section className="flex h-full flex-col" aria-label="Code editor">
            <MonacoEditor
                height="80vh"
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
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    suggest: { showSnippets: true, showWords: true },
                    stickyScroll: { enabled: false },
                    smoothScrolling: true,
                    hover: { delay: 500 },
                }}
            />
        </section>
    );
}
