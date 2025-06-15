import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setFiles } from '../../store/slices/filesSlice';
import { EditorLayout } from '../../components/componentsIndex';

export default function NewProject() {
    const dispatch = useDispatch();

    // Initialize default file for new project
    useEffect(() => {
        const defaultFile = [
            {
                $id: 'default',
                name: 'index.js',
                content: 'console.log("Hello world");',
            },
        ];
        dispatch(setFiles(defaultFile));
    }, [dispatch]);

    return <EditorLayout isNewProject={true} />;
}
