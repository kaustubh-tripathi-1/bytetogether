import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';

import { updateFile } from '../../store/slices/filesSlice';
import { setSelectedFile } from '../../store/slices/editorSlice';
import { setModalType } from '../../store/slices/uiSlice';
import {
    AddFile,
    Cross,
    Delete,
    DeleteFile,
    Modal,
    CreateFile,
    Rename,
    RenameFile,
} from '../componentsIndex';

/**
 * FileExplorer component for managing project files.
 * @param {Object} props
 * @param {Function} props.toggleFileExplorer - Function to toggle the file explorer.
 * @returns {JSX.Element} The file explorer UI.
 */
function FileExplorer({ toggleFileExplorer }) {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { files } = useSelector((state) => state.files);
    const { selectedFile } = useSelector((state) => state.editor);
    const { executionMode } = useSelector((state) => state.execution);

    const fileExplorerRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);
    const triggerRef = useRef(null);
    const fileToRenameRef = useRef(null);
    const fileToDeleteRef = useRef(null);

    const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
    const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
    const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);

    useEffect(() => {
        if (!fileExplorerRef.current) return;

        triggerRef.current = document.activeElement;
        const explorer = fileExplorerRef.current;

        // Function to update focusable elements
        function updateFocusableElements() {
            const activeBeforeUpdate = document.activeElement; // store current focus

            const focusableElements = explorer.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            firstFocusableRef.current = focusableElements[0];
            lastFocusableRef.current =
                focusableElements[focusableElements.length - 1];

            // Set initial focus only if not already inside the modal
            if (!explorer.contains(activeBeforeUpdate)) {
                firstFocusableRef.current?.focus();
            }
        }

        // Initial setup of focusable elements
        updateFocusableElements();

        // Focus trapping and keyboard handling
        const handleKeydown = (event) => {
            const isTabPressed = event.key === 'Tab';
            if (!isTabPressed && event.key !== 'Escape') return;

            const activeElement = document.activeElement;

            if (event.key === 'Escape') {
                event.preventDefault();
                toggleFileExplorer();
                return;
            }

            if (isTabPressed) {
                if (
                    event.shiftKey &&
                    activeElement === firstFocusableRef.current
                ) {
                    event.preventDefault(); // Prevent default tab behavior
                    lastFocusableRef.current?.focus();
                } else if (
                    !event.shiftKey &&
                    activeElement === lastFocusableRef.current
                ) {
                    event.preventDefault(); // Prevent default tab behavior
                    firstFocusableRef.current?.focus();
                } else if (!explorer.contains(activeElement)) {
                    firstFocusableRef.current?.focus();
                }
            }
        };

        explorer.addEventListener('keydown', handleKeydown);

        // Hide background content
        const mainContent = document.querySelector('main') || document.body;
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');

        // Observe changes to the modal content to update focusable elements
        const observer = new MutationObserver(() => {
            updateFocusableElements();
        });

        observer.observe(explorer, { childList: true, subtree: true });

        return () => {
            explorer.removeEventListener('keydown', handleKeydown);
            mainContent.removeAttribute('aria-hidden');
            mainContent.removeAttribute('inert');
            observer.disconnect();
            if (triggerRef.current) {
                triggerRef.current?.focus();
            }
        };
    }, [toggleFileExplorer]);

    const openCreateFileModal = useCallback(
        (event) => {
            event.stopPropagation();
            dispatch(setModalType('create-new-file'));
            setIsCreateFileModalOpen(true);
        },
        [dispatch]
    );

    const closeCreateFileModal = useCallback(() => {
        dispatch(setModalType(null));
        setIsCreateFileModalOpen(false);
    }, [dispatch]);

    const openRenameFileModal = useCallback(() => {
        dispatch(setModalType('rename-file'));
        setIsRenameFileModalOpen(true);
    }, [dispatch]);

    const closeRenameFileModal = useCallback(() => {
        dispatch(setModalType(null));
        setIsRenameFileModalOpen(false);
    }, [dispatch]);

    const openDeleteFileModal = useCallback(() => {
        dispatch(setModalType('delete-file'));
        setIsDeleteFileModalOpen(true);
    }, [dispatch]);

    const closeDeleteFileModal = useCallback(() => {
        dispatch(setModalType(null));
        setIsDeleteFileModalOpen(false);
    }, [dispatch]);

    return createPortal(
        // Overlay
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-800 flex items-center justify-center bg-black/60"
            role="none"
            onClick={toggleFileExplorer}
        >
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                ref={fileExplorerRef}
                className="fixed top-0 left-0 z-700 h-full w-64 bg-white text-gray-900 shadow-lg dark:bg-[#222233] dark:text-white"
                role="dialog"
                aria-modal="true"
                aria-label="File Explorer"
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="flex items-center justify-between gap-2 border-b border-gray-700 p-2">
                    <p className="text-sm">EXPLORER</p>
                    <div className="flex gap-1">
                        {executionMode === 'judge0' && (
                            <button
                                onClick={openCreateFileModal}
                                className="flex cursor-pointer items-center justify-center rounded-xl px-1.5 py-1 text-gray-400 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                                aria-label="Create new file"
                            >
                                <AddFile width={1.2} height={1.2} />
                            </button>
                        )}
                        <button
                            onClick={toggleFileExplorer}
                            className="flex cursor-pointer items-center justify-center rounded-xl p-1 text-gray-400 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44]"
                            aria-label="Close file explorer"
                        >
                            <Cross width={1.2} height={1.2} />
                        </button>
                    </div>
                </div>
                <ul className={`flex flex-col gap-0.5 p-1`}>
                    {files.map((file) => (
                        <li
                            key={file.$id}
                            className={`group flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-300 focus:bg-gray-300 focus:outline-1 focus:outline-offset-1 focus:outline-gray-500 dark:hover:bg-[#2b2b44] dark:focus:bg-[#2b2b44] ${
                                selectedFile?.fileName === file.fileName
                                    ? 'bg-gray-200 dark:bg-[#141429]'
                                    : ''
                            }`}
                            onClick={(event) => {
                                event.stopPropagation();
                                dispatch(updateFile(selectedFile));
                                dispatch(setSelectedFile(file));
                            }}
                            onKeyDown={(event) => {
                                event.stopPropagation();
                                if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {
                                    dispatch(updateFile(selectedFile));
                                    dispatch(setSelectedFile(file));
                                }
                            }}
                            tabIndex={0}
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                            role="button"
                            aria-label={`${file.fileName}`}
                        >
                            <span
                                className={
                                    selectedFile?.fileName === file.fileName
                                        ? 'font-bold'
                                        : ''
                                }
                            >
                                {file.fileName}
                            </span>
                            {/* <span className="hidden gap-2 group-hover:flex group-focus:flex"> */}
                            {user?.$id === file?.ownerId &&
                                executionMode === 'judge0' && (
                                    <span className="flex gap-2">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                fileToRenameRef.current = file;
                                                openRenameFileModal();
                                            }}
                                            onKeyDown={(event) => {
                                                event.stopPropagation();

                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    fileToRenameRef.current =
                                                        file;
                                                    openRenameFileModal();
                                                }
                                            }}
                                            className="cursor-pointer rounded-md p-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#3e3e52] dark:focus:bg-[#3e3e52]"
                                            aria-label={`Rename ${file.fileName}`}
                                        >
                                            <Rename width={1.2} height={1.2} />
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                fileToDeleteRef.current = file;
                                                openDeleteFileModal();
                                            }}
                                            onKeyDown={(event) => {
                                                event.stopPropagation();

                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    fileToDeleteRef.current =
                                                        file;
                                                    openDeleteFileModal();
                                                }
                                            }}
                                            className="cursor-pointer rounded-md p-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-1 focus:outline-offset-2 focus:outline-gray-500 dark:hover:bg-[#3e3e52] dark:focus:bg-[#3e3e52]"
                                            aria-label={`Delete ${file.fileName}`}
                                        >
                                            <Delete width={1.2} height={1.2} />
                                        </button>
                                    </span>
                                )}
                        </li>
                    ))}
                </ul>
                <AnimatePresence>
                    {isCreateFileModalOpen && (
                        <Modal
                            key="create-new-file"
                            isOpen={isCreateFileModalOpen}
                            onClose={closeCreateFileModal}
                        >
                            <CreateFile
                                onConfirm={closeCreateFileModal}
                                onClose={closeCreateFileModal}
                            />
                        </Modal>
                    )}
                    {isRenameFileModalOpen && (
                        <Modal
                            key="rename-file"
                            isOpen={isRenameFileModalOpen}
                            onClose={closeRenameFileModal}
                        >
                            <RenameFile
                                onConfirm={closeRenameFileModal}
                                onClose={closeRenameFileModal}
                                file={fileToRenameRef.current}
                            />
                        </Modal>
                    )}
                    {isDeleteFileModalOpen && (
                        <Modal
                            key="delete-file"
                            isOpen={isDeleteFileModalOpen}
                            onClose={closeDeleteFileModal}
                        >
                            <DeleteFile
                                onConfirm={closeDeleteFileModal}
                                onClose={closeDeleteFileModal}
                                file={fileToDeleteRef.current}
                            />
                        </Modal>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>,
        document.getElementById(`root`)
    );
}

export default memo(FileExplorer);
