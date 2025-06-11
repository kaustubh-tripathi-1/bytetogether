/**
 * Component for the project editor page.
 * @returns {JSX.Element} The project editor interface.
 */
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { databaseService } from '../../appwrite-services/database';
import { EditorLayout, Spinner } from '../../components/componentsIndex';

export default function ProjectEditor() {
    const { projectId } = useParams();

    const {
        data: _project,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => databaseService.getDocument('projects', projectId),
    });

    if (isLoading)
        return (
            <div className="p-4">
                <Spinner size="4" />
            </div>
        );
    if (error) return <div className="p-4">Error: {error.message}</div>;

    return <EditorLayout projectId={projectId} />;
}
