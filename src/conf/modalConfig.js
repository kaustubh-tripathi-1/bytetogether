/**
 * Configuration object for different modal types.
 * @type {Object}
 */
export const modalConfigs = {
    settings: {
        title: 'Settings',
        content: (
            <div>
                <label>
                    Font Size:
                    <input
                        type="number"
                        defaultValue="14"
                        className="ml-2 rounded border p-1"
                    />
                </label>
                <button className="mt-2 rounded bg-blue-500 p-2 text-white">
                    Toggle Theme
                </button>
            </div>
        ),
    },
    shortcuts: {
        title: 'Keyboard Shortcuts',
        content: (
            <ul className="list-disc pl-5">
                <li>Ctrl + M: Move focus</li>
                <li>Alt + Click: Add multi-cursor</li>
            </ul>
        ),
    },
};
