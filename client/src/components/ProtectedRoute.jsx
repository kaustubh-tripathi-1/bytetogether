import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

export default function ProtectedRoute({ children }) {
    const { authStatus } = useSelector((state) => state.auth);

    if (!authStatus) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
