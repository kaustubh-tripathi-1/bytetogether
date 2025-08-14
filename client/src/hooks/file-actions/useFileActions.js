import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ID } from 'appwrite';

import { setSelectedFile } from '../../store/slices/editorSlice';
import { getOrCreateYDoc } from '../../lib/yjs';
import {
    saveAllFilesForNewProject,
    setFiles,
    updateAllFilesForExistingProject,
} from '../../store/slices/filesSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { getDefaultCodeForLanguage } from '../../utils/getDefaultCodeForLanguage';
import { setCss, setHtml, setJs } from '../../store/slices/previewSlice';

export function useFileActions({
    files,
    profile,
    isAdmin,
    selectedFile,
    isYjsConnected,
    // isNewProject,
    activeProject,
    setIsFileExplorerOpen,
}) {
    const dispatch = useDispatch();

    // Set initial file and language
    useEffect(() => {
        if (files.length > 0 && !selectedFile) {
            const initialFile = files[0];
            dispatch(setSelectedFile(initialFile));
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
                const { yText } = getOrCreateYDoc(
                    file.$id,
                    profile?.username,
                    isAdmin
                );
                return {
                    ...file,
                    codeContent:
                        file.$id === selectedFile?.$id && isYjsConnected
                            ? yText.toString()
                            : file.codeContent || '', // Save yText content for selected file
                };
            });

            await dispatch(
                updateAllFilesForExistingProject(filesToSave)
            ).unwrap();

            /* if (isNewProject) {
                await dispatch(
                    saveAllFilesForNewProject({
                        projectId: activeProject?.$id || 'defaultProject',
                        files: filesToSave.filter((file) => !file.$id), // Only new files
                    })
                ).unwrap();
            } else {
                await dispatch(
                    updateAllFilesForExistingProject(
                        filesToSave.filter((file) => file.$id) // Only existing files
                    )
                ).unwrap();
            } */

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
        // isNewProject,
        isYjsConnected,
        selectedFile,
        profile,
        // activeProject,
    ]);

    const setFilesForWebMode = useCallback(async () => {
        try {
            const defaultHtmlCode = getDefaultCodeForLanguage('html');
            const defaultCssCode = getDefaultCodeForLanguage('css');
            const defaultJsCode = getDefaultCodeForLanguage('javascript');

            const webModeFiles = [
                {
                    $id: ID.unique(),
                    projectId: activeProject?.$id || 'defaultProject',
                    fileName: 'index.html',
                    language: 'html',
                    codeContent: defaultHtmlCode,
                    ownerId: profile?.$id,
                },
                {
                    $id: ID.unique(),
                    projectId: activeProject?.$id || 'defaultProject',
                    fileName: 'style.css',
                    language: 'css',
                    codeContent: defaultCssCode,
                    ownerId: profile?.$id,
                },
                {
                    $id: ID.unique(),
                    projectId: activeProject?.$id || 'defaultProject',
                    fileName: 'script.js',
                    language: 'javascript',
                    codeContent: defaultJsCode,
                    ownerId: profile?.$id,
                },
            ];

            dispatch(setFiles(webModeFiles));
            dispatch(setHtml(defaultHtmlCode));
            dispatch(setCss(defaultCssCode));
            dispatch(setJs(defaultJsCode));

            await dispatch(
                saveAllFilesForNewProject({
                    projectId: activeProject?.$id || 'defaultProject',
                    files: webModeFiles,
                })
            ).unwrap();
        } catch (error) {
            console.error(error);

            dispatch(
                addNotification({
                    message: error,
                    type: 'error',
                })
            );
        }
    }, [activeProject, dispatch, profile]);

    return {
        handleSaveAllFiles,
        toggleFileExplorer,
        setFilesForWebMode,
    };
}
