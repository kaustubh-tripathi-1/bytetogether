/**
 * Configuration object for different modal types.
 * @type {Object}
 */
export const modalConfig = {
    settings: {
        title: 'Settings',
        content: ({
            fontSize,
            onFontSizeIncrement,
            onFontSizeDecrement,
            wordWrap,
            onWordWrapChange,
            minimapEnabled,
            onMinimapChange,
            stickyScrollEnabled,
            onStickyScrollChange,
            tabSize,
            onTabSizeChange,
        }) => (
            <div className="flex flex-col gap-4 text-gray-800 dark:text-gray-200">
                <h2 className="text-center text-xl font-bold">
                    Editor Settings
                </h2>

                {/* Font Size Counter */}
                <div className="flex items-center justify-between">
                    Font Size:
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onFontSizeDecrement}
                            className="cursor-pointer rounded border border-gray-600 px-3 py-1 text-lg text-gray-800 hover:bg-gray-300 focus:bg-gray-300 focus:outline focus:outline-offset-2 focus:outline-blue-400 dark:text-gray-200 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                            aria-label="Decrease font size"
                        >
                            -
                        </button>
                        <p aria-label="Font Size">{fontSize}</p>
                        <button
                            type="button"
                            onClick={onFontSizeIncrement}
                            className="cursor-pointer rounded border border-gray-600 px-2.5 py-1 text-lg text-gray-800 hover:bg-gray-300 focus:bg-gray-300 focus:outline focus:outline-offset-2 focus:outline-blue-400 dark:text-gray-200 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                            aria-label="Increase font size"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Word Wrap */}
                <div className="flex items-center justify-between">
                    <label htmlFor="word-wrap" aria-label="Word wrap">
                        Word Wrap:
                    </label>
                    <div className="relative inline-flex items-center">
                        <input
                            id="word-wrap"
                            type="checkbox"
                            checked={wordWrap === 'on'}
                            aria-checked={wordWrap === 'on'}
                            onChange={onWordWrapChange}
                            className="peer h-0 w-0 opacity-0"
                        />
                        <label
                            htmlFor="word-wrap"
                            className="relative flex h-7 w-14 cursor-pointer items-center rounded-full bg-red-500/80 p-1 peer-checked:bg-green-600 peer-focus:outline peer-focus:outline-offset-2 peer-focus:outline-blue-400 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-7.5 dark:bg-red-400"
                        >
                            <span
                                className={`${wordWrap === 'on' ? 'opacity-100' : 'opacity-0'} absolute left-1.5 text-xs text-gray-200 transition-opacity duration-500`}
                            >
                                On
                            </span>
                            <span
                                className={`${wordWrap === 'on' ? 'opacity-0' : 'opacity-100'} absolute right-1.5 text-xs text-gray-800 transition-opacity duration-500`}
                            >
                                Off
                            </span>
                        </label>
                    </div>
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between">
                    <label htmlFor="minimap" aria-label="Minimap">
                        Minimap:
                    </label>
                    <div className="relative inline-flex items-center">
                        <input
                            id="minimap"
                            type="checkbox"
                            checked={minimapEnabled}
                            aria-checked={minimapEnabled}
                            onChange={onMinimapChange}
                            className="peer h-0 w-0 opacity-0"
                        />
                        <label
                            htmlFor="minimap"
                            className="relative flex h-7 w-14 cursor-pointer items-center rounded-full bg-red-500/80 p-1 peer-checked:bg-green-600 peer-focus:outline peer-focus:outline-offset-2 peer-focus:outline-blue-400 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-7.5 dark:bg-red-400"
                        >
                            <span
                                className={`${minimapEnabled ? 'opacity-100' : 'opacity-0'} absolute left-1.5 text-xs text-gray-200 transition-opacity duration-500`}
                            >
                                On
                            </span>
                            <span
                                className={`${minimapEnabled ? 'opacity-0' : 'opacity-100'} absolute right-1.5 text-xs text-gray-800 transition-opacity duration-500`}
                            >
                                Off
                            </span>
                        </label>
                    </div>
                </div>

                {/* Sticky Scroll */}
                <div className="flex items-center justify-between">
                    <label htmlFor="stick-scroll" aria-label="Sticky Scroll">
                        Sticky Scroll:
                    </label>
                    <div className="relative inline-flex items-center">
                        <input
                            id="stick-scroll"
                            type="checkbox"
                            checked={stickyScrollEnabled}
                            aria-checked={stickyScrollEnabled}
                            onChange={onStickyScrollChange}
                            className="peer h-0 w-0 opacity-0"
                        />
                        <label
                            htmlFor="stick-scroll"
                            className="relative flex h-7 w-14 cursor-pointer items-center rounded-full bg-red-500/80 p-1 peer-checked:bg-green-600 peer-focus:outline peer-focus:outline-offset-2 peer-focus:outline-blue-400 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-7.5 dark:bg-red-400"
                        >
                            <span
                                className={`${stickyScrollEnabled ? 'opacity-100' : 'opacity-0'} absolute left-1.5 text-xs text-gray-200 transition-opacity duration-500`}
                            >
                                On
                            </span>
                            <span
                                className={`${stickyScrollEnabled ? 'opacity-0' : 'opacity-100'} absolute right-1.5 text-xs text-gray-800 transition-opacity duration-500`}
                            >
                                Off
                            </span>
                        </label>
                    </div>
                </div>

                {/* Tab Size */}
                <div className="flex items-center justify-between">
                    <label htmlFor="tab-size" aria-label="Tab size">
                        Tab Size:
                    </label>
                    <select
                        id="tab-size"
                        value={tabSize}
                        onChange={onTabSizeChange}
                        className="rounded border border-gray-500 bg-white px-2 py-1 text-gray-800 focus:outline focus:outline-offset-2 focus:outline-blue-400 dark:bg-[#2b2b44] dark:text-gray-200"
                    >
                        <option
                            value="2"
                            className="bg-white dark:bg-[#2b2b44]"
                        >
                            2
                        </option>
                        <option
                            value="4"
                            className="bg-white dark:bg-[#2b2b44]"
                        >
                            4
                        </option>
                        <option
                            value="8"
                            className="bg-white dark:bg-[#2b2b44]"
                        >
                            8
                        </option>
                    </select>
                </div>
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
                    </span>
                </p>
            </div>
        ),
    },
};
