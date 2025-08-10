import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setSelectedFile } from '../../store/slices/editorSlice';
import { getOrCreateYDoc } from '../../lib/yjs';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';
import {
    saveAllFilesForNewProject,
    updateAllFilesForExistingProject,
} from '../../store/slices/filesSlice';
import { addNotification } from '../../store/slices/uiSlice';

export function useFileActions({
    files,
    username,
    isAdmin,
    selectedFile,
    isYjsConnected,
    isNewProject,
    setIsFileExplorerOpen,
}) {
    const dispatch = useDispatch();

    // Set initial file and language
    useEffect(() => {
        if (files.length > 0 && !selectedFile) {
            const initialFile = files[0];
            dispatch(
                setSelectedFile({
                    $id: initialFile.$id,
                    fileName: initialFile.fileName,
                    codeContent: initialFile.codeContent,
                })
            );
        }
    }, [dispatch, files, selectedFile]);

    /**
     * Toggle File Explorer
     */
    const toggleFileExplorer = useCallback(() => {
        setIsFileExplorerOpen((prev) => !prev);
    }, [setIsFileExplorerOpen]);

    /**
     * Saves the current file content and metadata to Appwrite.
     */
    const handleSaveAllFiles = useCallback(async () => {
        try {
            const filesToSave = files.map((file) => {
                const { yText } = getOrCreateYDoc(file.$id, username, isAdmin);
                return {
                    $id: file.$id,
                    name: file.fileName,
                    language: getLanguageFromFileName(file.fileName),
                    content:
                        file.$id === selectedFile?.$id && isYjsConnected
                            ? yText.toString()
                            : file.content || '', // Save yText content for selected file
                };
            });

            if (isNewProject) {
                await dispatch(
                    saveAllFilesForNewProject({
                        projectName: 'default',
                        files: filesToSave.filter((file) => !file.$id), // Only new files
                    })
                ).unwrap();
            } else {
                await dispatch(
                    updateAllFilesForExistingProject(
                        filesToSave.filter((file) => file.$id) // Only existing files
                    )
                ).unwrap();
            }

            dispatch(
                addNotification({
                    message: `${files.length > 1 ? 'Files' : 'File'} saved successfully`,
                    type: 'success',
                })
            );
        } catch (error) {
            console.error(error);

            dispatch(
                addNotification({
                    message: `Failed to save with error: ${error}! Please try again...`,
                    type: 'error',
                })
            );
        }
    }, [
        dispatch,
        files,
        isAdmin,
        isNewProject,
        isYjsConnected,
        selectedFile,
        username,
    ]);

    return {
        handleSaveAllFiles,
        toggleFileExplorer,
    };
}
