import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setSelectedFile } from '../../store/slices/editorSlice';

export function useInitialFileStup({ files, selectedFile }) {
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
}
