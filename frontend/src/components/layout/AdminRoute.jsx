import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute({ children }) {
  const { adminToken } = useAuth();
  if (!adminToken) return <Navigate to="/admin/login" replace />;
  return children;
}
