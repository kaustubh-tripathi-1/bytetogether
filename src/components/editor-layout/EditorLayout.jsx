/**
 * Layout component for the editor interface.
 * @param {string} projectId - The ID of the active project.
 * @returns {JSX.Element} The editor layout with CodeEditor and OutputPanel.
 */
import CodeEditor from '../code-editor/CodeEditor.jsx';

// import OutputPanel from './OutputPanel';

export default function EditorLayout({ projectId }) {
    return (
        <div className="flex h-screen flex-col md:flex-row">
            <div className="w-full p-4 md:w-2/3">
                <CodeEditor projectId={projectId} />
            </div>
            <div className="w-full border-t p-4 md:w-1/3 md:border-t-0 md:border-l">
                {/* <OutputPanel /> */}
            </div>
        </div>
    );
}
