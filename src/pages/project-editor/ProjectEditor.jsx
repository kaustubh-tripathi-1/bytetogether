/**
 * Component for the project editor page.
 * @returns {JSX.Element} The project editor interface.
 */
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { databaseService } from '../../appwrite-services/database';
import { EditorLayout, Spinner } from '../../components/componentsIndex';
import {
    setError as setFilesError,
    setFiles,
    setIsLoading as setFilesLoading,
} from '../../store/slices/filesSlice';
import { setActiveProject } from '../../store/slices/editorSlice';

export default function ProjectEditor() {
    const { projectId } = useParams();
    const dispatch = useDispatch();

    // Fetch project details (name, ownerId, collaborators)
    const {
        data: project,
        isLoading: isProjectLoading,
        error: projectError,
    } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => databaseService.getDocument('projects', projectId),
        enabled: !!projectId,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch project files
    const {
        data: files = [],
        isLoading: isFilesLoading,
        error: filesError,
    } = useQuery({
        queryKey: ['files', projectId],
        queryFn: async () => {
            const fileList = await databaseService.listDocuments('files', [
                `projectId=${projectId}`,
            ]);
            return fileList.documents;
        },
        enabled: !!projectId,
        retry: 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Update Redux state for project details
    useEffect(() => {
        if (project) {
            dispatch(
                setActiveProject({
                    name: project.name,
                    ownerId: project.ownerId,
                    collaborators: project.collaborators,
                })
            );
        }
    }, [dispatch, project]);

    // Update Redux state for files
    useEffect(() => {
        dispatch(setFiles(files));
        dispatch(setFilesLoading(isFilesLoading));
        dispatch(setFilesError(filesError ? filesError.message : null));
    }, [dispatch, files, isFilesLoading, filesError]);

    // Combine loading and error states
    const isLoading = isProjectLoading || isFilesLoading;
    const error = projectError || filesError;

    if (isLoading)
        return (
            <section className="p-4" role="status">
                <Spinner size="4" />
            </section>
        );
    if (error)
        return (
            <section className="p-4" role="alert">
                Error: {error.message}
            </section>
        );

    return <EditorLayout projectId={projectId} isNewProject={false} />;
}
