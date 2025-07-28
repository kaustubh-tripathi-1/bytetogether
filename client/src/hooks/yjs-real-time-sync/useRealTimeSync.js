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
    setIsYjsConnected,
    isAdmin,
    setIsAdmin,
    yjsResources,
    currentConnectedFileIdRef,
    setYjsResources,
    // isNewProject,
    // projectId,
    username,
    navigate,
    location,
}) {
    const dispatch = useDispatch();

    useEffect(() => {
        try {
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

            const newFileId = selectedFile?.$id;

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

            const { yDoc, yText, awareness, wsProvider } = getOrCreateYDoc(
                newFileId,
                username,
                isAdmin
            );
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

            setTimeout(() => {
                if (wsProvider?.ws?.readyState === wsProvider?.ws?.OPEN) {
                    wsProvider?.ws?.send(
                        JSON.stringify({
                            type: 'client-joined',
                            //TODO replace this with projectId
                            room: `bytetogether-${currentConnectedFileIdRef.current}`,
                            clientId: yjsResources.yDoc?.clientID,
                            username,
                        })
                    );
                }
            }, 800);

            // Set initial content for the Y.Text if it's empty, otherwise use Yjs content
            //TODO fix this condition for duplicate code insertion
            if (
                isAdmin &&
                yText.length === 0 &&
                selectedFile?.content.length > 0
            ) {
                yText.insert(0, selectedFile?.content);
            }

            // Dispatch the content from yText to Redux.
            dispatch(setCodeContent(yText.toString()));
            dispatch(
                setLanguage(getLanguageFromFileName(selectedFile?.fileName))
            );

            // Observer for Y.Text changes to keep Redux in sync
            function observer() {
                if (yjsResources.yText && isYjsConnected) {
                    dispatch(setCodeContent(yjsResources.yText.toString()));
                }
            }

            yText.observe(observer);

            // Handle server messages
            function handleMessage(event) {
                if (
                    event.data instanceof ArrayBuffer ||
                    ArrayBuffer.isView(event.data)
                ) {
                    return; // Skip Yjs protocol sync messages. Skip parsing as JSON
                }
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'room-ended') {
                        dispatch(
                            addNotification({
                                message: message.message,
                                type: 'info',
                                timeout: 4000,
                            })
                        );
                        disconnectYjsForFile(newFileId);
                        setYjsResources({
                            yDoc: null,
                            yText: null,
                            awareness: null,
                            wsProvider: null,
                        });
                        setIsYjsConnected(false);
                        setIsAdmin(true);
                    } else if (message.type === 'client-left') {
                        dispatch(
                            addNotification({
                                message: message.message,
                                type: 'info',
                                timeout: 4000,
                            })
                        );
                    } else if (message.type === 'client-update') {
                        // Update UI if needed
                        console.log(
                            'Connected clients:',
                            message.connectedClients
                        );
                    } else if (message.type === 'room-full') {
                        dispatch(
                            addNotification({
                                message: message.error,
                                type: 'error',
                                timeout: 4000,
                            })
                        );
                        disconnectYjsForFile(newFileId);
                        setYjsResources({
                            yDoc: null,
                            yText: null,
                            awareness: null,
                            wsProvider: null,
                        });
                        setIsYjsConnected(false);
                        setIsAdmin(true);
                        if (!isAdmin) {
                            const path = location.pathname;
                            navigate(`${path}`);
                        }
                    } else if (message.type === 'client-joined') {
                        dispatch(
                            addNotification({
                                message: message.message,
                                type: 'info',
                                timeout: 4000,
                            })
                        );
                    }
                } catch (error) {
                    console.error(`WebSocket error: ${error.message}`);

                    dispatch(
                        addNotification({
                            message: `WebSocket error: ${error.message}`,
                            type: 'error',
                            timeout: 4000,
                        })
                    );
                }
            }

            // wsProvider.ws?.addEventListener('message', handleMessage);

            // Override WebSocket onmessage to filter messages
            const originalOnMessage = wsProvider.ws?.onmessage;
            if (wsProvider.ws) {
                wsProvider.ws.onmessage = (event) => {
                    if (!(event.data instanceof ArrayBuffer)) {
                        handleMessage(event); // Process JSON messages
                        return; // Prevent Yjs from processing JSON
                    }
                    if (originalOnMessage) {
                        originalOnMessage.call(wsProvider.ws, event); // Pass ArrayBuffer to Yjs
                    }
                };
            }

            return () => {
                yText.unobserve(observer);
                // wsProvider.ws?.removeEventListener('message', handleMessage);
                if (wsProvider.ws) {
                    wsProvider.ws.onmessage = originalOnMessage; // Restore original handler
                }
            };
        } catch (error) {
            dispatch(
                addNotification({
                    message: `Failed to connect with error:${error}`,
                    type: 'error',
                })
            );
        }
    }, [
        selectedFile,
        dispatch,
        isYjsConnected,
        isAdmin,
        yjsResources.yText,
        yjsResources.yDoc,
        currentConnectedFileIdRef,
        setYjsResources,
        username,
        setIsYjsConnected,
        setIsAdmin,
        location,
        navigate,
    ]);
}
