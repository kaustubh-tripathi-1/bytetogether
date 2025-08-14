import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import { updateFileDB } from '../../../store/slices/filesSlice';
import { addNotification } from '../../../store/slices/uiSlice';
import { getLanguageFromFileName } from '../../../utils/getLanguageFromFileName';
import { setSelectedFile } from '../../../store/slices/editorSlice';
import { Spinner } from '../../componentsIndex';

/** A component to render inside rename file modal with a form
 * @param {Object} props RenameFile component props
 * @param {Function} props.onClose Function to close the rename file modal
 * @param {Function} props.onConfirm Function to confirm the rename action
 * @param {Object} props.file The file object to rename
 */
export default function RenameFile({ onClose, onConfirm, file }) {
    const dispatch = useDispatch();
    const { selectedFile } = useSelector((state) => state.editor);
    const { error } = useSelector((state) => state.files);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues: { fileName: file.fileName },
    });

    async function handleRename(data) {
        const language = getLanguageFromFileName(data.fileName);

        const updatedFile = {
            ...file,
            fileId: file.$id,
            fileName: data.fileName,
            language,
        };
        try {
            await dispatch(updateFileDB(updatedFile)).unwrap();

            if (selectedFile?.$id !== updatedFile.$id) {
                dispatch(setSelectedFile(updatedFile));
            }

            dispatch(
                addNotification({
                    message: `File renamed to "${data.fileName}" successfully`,
                    type: 'success',
                })
            );
            onConfirm();
            reset({ fileName: data.fileName });
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to rename file: ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    }

    function handleCancel() {
        reset({ fileName: file.fileName });
        onClose();
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
                Rename File
            </h2>
            <form
                onSubmit={handleSubmit(handleRename)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                        Old File Name :{' '}
                        <code className="font-bold">{file.fileName}</code>
                    </p>

                    {/* <label
                        htmlFor="oldFileName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Old File Name
                    </label>
                    <input
                        id="oldFileName"
                        type="text"
                        value={file.fileName}
                        disabled
                        className="min-h-10 w-full rounded-md bg-gray-300 px-2 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    /> */}
                </div>
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="fileName"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        New File Name
                    </label>
                    <input
                        id="fileName"
                        type="text"
                        {...register('fileName', {
                            required: 'New file name is required',
                            pattern: {
                                value: /^[a-zA-Z0-9-_]+(\.[cppjstavpyhmls]+)?$/,
                                message: 'Invalid file name format/extension',
                            },
                            validate: (value) =>
                                value !== file.fileName ||
                                'New name must differ from old name',
                        })}
                        className={`min-h-10 w-full rounded-md bg-gray-300 px-2 text-gray-800 ${
                            errors.fileName
                                ? 'border border-red-500 dark:border-red-400'
                                : 'focus:ring-2 focus:ring-blue-500'
                        } transition-all duration-300 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                        placeholder="e.g. myfile.js"
                        aria-placeholder="e.g. myfile.js"
                        disabled={isSubmitting}
                        aria-disabled={isSubmitting}
                        aria-invalid={errors.fileName ? 'true' : 'false'}
                        aria-describedby={
                            errors.fileName ? 'file-name-error' : undefined
                        }
                        aria-required="true"
                    />
                    {errors.fileName && (
                        <p
                            id="file-name-error"
                            className="text-sm text-red-600/70 dark:text-red-400"
                            role="alert"
                        >
                            {errors.fileName.message}
                        </p>
                    )}

                    {/* Redux Errors */}
                    {error && (
                        <p
                            className="text-center text-red-500/70 dark:text-red-400"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </div>
                <div className="flex justify-center gap-3 sm:justify-end">
                    <motion.button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        aria-disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400/60 focus:bg-gray-400/60 focus:outline-2 focus:outline-offset-2 focus:outline-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus:outline-gray-600"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        aria-disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                        <p className="flex items-center justify-center gap-1">
                            <span>
                                {isSubmitting ? 'Renaming...' : 'Confirm'}
                            </span>
                            {isSubmitting && <Spinner />}
                        </p>
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
