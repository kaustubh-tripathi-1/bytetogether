import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { ID } from 'appwrite';

import { setActiveProject } from '../../../store/slices/projectSlice';
import { addNotification } from '../../../store/slices/uiSlice';

/** A component to render inside create project modal
 * @param {Object} props CreateProject component props
 * @param {Function} props.onClose Function to close the create project modal
 * @param {Function} props.onConfirm Function to confirm project creation
 */
export default function CreateProject({ onClose, onConfirm }) {
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: 'onChange',
        defaultValues: { name: 'New Project' },
    });

    const handleCreateProject = async (data) => {
        const projectId = ID.unique();
        try {
            dispatch(setActiveProject({ projectId, name: data.projectName }));
            dispatch(
                addNotification({
                    message: `Project "${data.name}" created successfully`,
                    type: 'success',
                })
            );
            onConfirm();
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to create project: ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-md rounded-lg bg-gray-100 p-4 shadow-2xl dark:bg-[#222233]"
        >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Create New Project
            </h2>
            <form
                onSubmit={handleSubmit(handleCreateProject)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="project-name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Project Name
                    </label>
                    <input
                        id="project-name"
                        type="text"
                        {...register('projectName', {
                            required: 'Project name is required',
                            pattern: {
                                value: /^[a-zA-Z0-9-_ ]+$/,
                                message: 'Invalid project name',
                            },
                        })}
                        className={`min-h-10 w-full rounded-md bg-gray-300 px-2 text-gray-800 ${
                            errors.projectName
                                ? 'border border-red-500 dark:border-red-400'
                                : 'focus:ring-2 focus:ring-blue-500'
                        } transition-all duration-300 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                        disabled={isSubmitting}
                        aria-disabled={isSubmitting}
                        aria-invalid={errors.projectName ? 'true' : 'false'}
                        aria-describedby={
                            errors.projectName ? 'name-error' : undefined
                        }
                        aria-required="true"
                    />
                    {errors.projectName && (
                        <p
                            id="name-error"
                            className="text-sm text-red-600/70 dark:text-red-400"
                            role="alert"
                        >
                            {errors.projectName.message}
                        </p>
                    )}
                    <label
                        htmlFor="project-description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Project Name (Optional)
                    </label>
                    <textarea
                        id="project-description"
                        type="text"
                        {...register('projectDescription')}
                        className={`min-h-10 w-full resize-y rounded-md bg-gray-300 px-2 text-gray-800 ${
                            errors.projectDescription
                                ? 'border border-red-500 dark:border-red-400'
                                : 'focus:ring-2 focus:ring-blue-500'
                        } transition-all duration-300 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                        disabled={isSubmitting}
                        aria-disabled={isSubmitting}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <motion.button
                        type="button"
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:bg-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:focus:outline-gray-600"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Creating...' : 'Confirm'}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
