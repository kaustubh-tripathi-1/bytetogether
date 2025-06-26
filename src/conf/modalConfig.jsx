/**
 * Configuration object for different modal types.
 * @type {Object}
 */
export const modalConfig = {
    settings: {
        title: 'Settings',
        content: (
            <div className="flex flex-col gap-4 text-gray-800 dark:text-gray-200">
                <h2 className="text-center text-xl font-bold">
                    Editor Settings
                </h2>
                <label className="flex items-center justify-between">
                    Font Size:
                    <input
                        type="number"
                        defaultValue="14"
                        className="ml-2 w-2/6 rounded border p-1"
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
            <div className="flex flex-col gap-4 text-gray-800 dark:text-gray-200">
                <h2 className="text-center text-xl font-bold">
                    Editor Keyboard Shortcuts
                </h2>
                <ul className="list-disc pl-5">
                    <li className="py-2">
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            Alt
                        </span>{' '}
                        +{' '}
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            Shift
                        </span>{' '}
                        +{' '}
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            F
                        </span>{' '}
                        : Format Code
                    </li>
                    <li className="py-2">
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            Ctrl
                        </span>{' '}
                        +{' '}
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            M
                        </span>{' '}
                        : Move focus
                    </li>
                    <li className="py-2">
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            Alt
                        </span>{' '}
                        +
                        <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                            Click
                        </span>{' '}
                        : Add multi-cursor
                    </li>
                </ul>
                <p className="py-4">
                    Mac Users : Replace{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Ctrl
                    </span>{' '}
                    with{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Cmd
                    </span>{' '}
                    and{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Alt
                    </span>{' '}
                    with{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Option
                    </span>{' '}
                </p>
            </div>
        ),
    },
};
