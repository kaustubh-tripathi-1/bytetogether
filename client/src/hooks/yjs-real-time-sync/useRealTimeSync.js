import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
    connectYjsForFile,
    disconnectYjsForFile,
    getOrCreateYDoc,
} from '../../lib/yjs';
import { setCodeContent, setLanguage } from '../../store/slices/editorSlice';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';
import { addNotification } from '../../store/slices/uiSlice';
// import { addNotification } from '../../store/slices/uiSlice';

/**
 * Custom hook to handle real-time collaboration Yjs setup, switching, and cleanup.
 * @param {Object} config Parameters for real time sync logic.
 * @param {React.ComponentState<Object>} config.selectedFile The selected file data
 * @param {React.ComponentState<boolean>} config.isYjsConnected State indicating if yjs is connected
 * @param {React.ComponentState<boolean>} config.isAdmin State indicating if the client is the isInviteradmin
 * @param {React.ComponentState<Object>} config.yjsResources State containing YJS resources like Doc, CRDT and Awareness
 * @param {React.SetStateAction<Function>} config.setYjsResources State setter to update YJS resources
 * @param {React.MutableRefObject<string>} config.currentConnectedFileIdRef Ref containing the file id of the current file
 */
export function useRealTimeSync({
    selectedFile,
    isYjsConnected,
    isAdmin,
    yjsResources,
    currentConnectedFileIdRef,
    setYjsResources,
    // isNewProject,
    // projectId,
    // setIsYjsConnected,
}) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!selectedFile?.$id) {
            // No file selected, disconnect if anything was connected
            if (currentConnectedFileIdRef.current) {
                disconnectYjsForFile(currentConnectedFileIdRef.current);
                currentConnectedFileIdRef.current = null;
            }
            return; // Nothing to do if no file is selected.
        }

        // Don't connect if not in collab mode
        if (!isYjsConnected) {
            return;
        }

        try {
            const newFileId = selectedFile.$id;

            // Disconnect the previous file's Yjs if the file has changed
            if (
                currentConnectedFileIdRef.current &&
                currentConnectedFileIdRef.current !== newFileId
            ) {
                disconnectYjsForFile(currentConnectedFileIdRef.current);
            }

            //TODO enable this after testing
            /* if (isNewProject || !projectId) {
            dispatch(
                addNotification({
                    message:
                        'Save your current project before joining a room to prevent loss of unsaved work',
                    type: 'warn',
                    timeout: 6000,
                })
            );
            setIsYjsConnected(false);
            return;
        } */

            const { yDoc, yText, awareness, wsProvider } =
                getOrCreateYDoc(newFileId);
            // Update yjs resources
            setYjsResources({ yDoc, yText, awareness, wsProvider });

            // Connect to room for the new file if not already connected or if invited
            if (isYjsConnected) {
                connectYjsForFile(newFileId);
                currentConnectedFileIdRef.current = newFileId; // Mark this file as currently connected
            } else {
                // Ensure disconnect for the current file if yjs is not connected
                disconnectYjsForFile(newFileId);
                currentConnectedFileIdRef.current = null; // No file is actively connected via Yjs
            }

            // Set initial content for the Y.Text if it's empty, otherwise use Yjs content
            if (
                isAdmin &&
                yText.length === 0 &&
                selectedFile.content.length > 0
            ) {
                yText.insert(0, selectedFile.content);
            }

            // Dispatch the content from yText to Redux.
            dispatch(setCodeContent(yText.toString()));
            dispatch(
                setLanguage(getLanguageFromFileName(selectedFile.fileName))
            );

            // Observer for Y.Text changes to keep Redux in sync
            const observer = () => {
                if (yjsResources.yText && isYjsConnected) {
                    dispatch(setCodeContent(yjsResources.yText.toString()));
                }
            };

            yText.observe(observer);
            return () => {
                yText.unobserve(observer);
            };
        } catch (err) {
            dispatch(
                addNotification({ message: 'Failed to connect', type: 'error' })
            );
        }
    }, [
        selectedFile,
        dispatch,
        isYjsConnected,
        isAdmin,
        yjsResources.yText,
        currentConnectedFileIdRef,
        setYjsResources,
        // isNewProject,
        // projectId,
        // setIsYjsConnected,
    ]);
}
