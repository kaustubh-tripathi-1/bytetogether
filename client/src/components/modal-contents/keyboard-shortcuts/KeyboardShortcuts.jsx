export default function KeyboardShortcuts() {
    return (
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
                    : Move focus out of editor
                </li>
                <li className="py-2">
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Alt
                    </span>{' '}
                    +{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Click
                    </span>{' '}
                    : Add multi-cursor
                </li>
                <li className="py-2">
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Ctrl
                    </span>{' '}
                    +{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Alt
                    </span>{' '}
                    +{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Up/Down
                    </span>{' '}
                    : Add cursor above/below
                </li>
                <li className="py-2">
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Ctrl
                    </span>{' '}
                    +{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Space
                    </span>{' '}
                    : Trigger Intellisense
                </li>
                <li className="py-2">
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        Ctrl
                    </span>{' '}
                    +{' '}
                    <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                        F
                    </span>{' '}
                    : Open Find and Replace
                </li>
            </ul>
            <p className="py-4">
                Mac Users: Replace{' '}
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
                </span>
            </p>
            <p className="text-xs text-pretty">
                For more shortcuts, press{' '}
                <span className="rounded-md bg-gray-300 px-2 py-1 dark:bg-gray-600">
                    F1
                </span>{' '}
                while in editor
            </p>
        </div>
    );
}
