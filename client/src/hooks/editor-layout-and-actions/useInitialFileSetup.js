import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setSelectedFile, setLanguage } from '../../store/slices/editorSlice';
import { getLanguageFromFileName } from '../../utils/getLanguageFromFileName';

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
                    content: initialFile.content,
                })
            );
            dispatch(
                setLanguage(getLanguageFromFileName(initialFile.fileName))
            );
        }
    }, [dispatch, files, selectedFile]);
}
