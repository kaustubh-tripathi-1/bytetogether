import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import { deleteFileDB } from '../../../store/slices/filesSlice';
import { addNotification } from '../../../store/slices/uiSlice';
import { setSelectedFile } from '../../../store/slices/editorSlice';
import { Spinner } from '../../componentsIndex';

/** A component to render inside delete file modal with confirmation
 * @param {Object} props DeleteFile component props
 * @param {Function} props.onClose Function to close the delete file modal
 * @param {Function} props.onConfirm Function to confirm the delete action
 * @param {Object} props.file The file object to delete
 */
export default function DeleteFile({ onClose, onConfirm, file }) {
    const dispatch = useDispatch();

    const { isLoading } = useSelector((state) => state.files);
    const { error } = useSelector((state) => state.files);

    async function handleDelete() {
        try {
            await dispatch(deleteFileDB({ fileId: file.$id })).unwrap();
            dispatch(setSelectedFile(null)); // Clear selection after delete
            dispatch(
                addNotification({
                    message: `File "${file.fileName}" deleted successfully`,
                    type: 'success',
                })
            );
            onConfirm();
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to delete file: ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-md rounded-lg bg-gray-100 p-4 shadow-2xl dark:bg-[#222233]"
        >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Delete File
            </h2>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <p className="text-sm whitespace-break-spaces text-gray-700 dark:text-gray-300">
                        Are you sure you want to delete{' '}
                        <code className="mr-1 font-semibold text-gray-900 dark:text-gray-100">
                            {file.fileName}
                        </code>
                        ?
                    </p>
                    <p className="text-sm whitespace-break-spaces text-gray-700 dark:text-gray-300">
                        This action cannot be undone.
                    </p>
                </div>

                {/* Redux Errors */}
                {error && (
                    <p
                        className="text-center text-red-500/70 dark:text-red-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <motion.button
                        type="button"
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400/60 focus:bg-gray-400/60 focus:outline-2 focus:outline-offset-2 focus:outline-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus:outline-gray-600"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="button"
                        onClick={handleDelete}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:bg-red-700 focus:outline-2 focus:outline-offset-2 focus:outline-red-600 disabled:cursor-not-allowed disabled:bg-red-400 dark:bg-red-500/70"
                    >
                        <p className="flex items-center justify-center gap-1">
                            <span>{isLoading ? 'Deleting...' : 'Confirm'}</span>
                            {isLoading && <Spinner />}
                        </p>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
