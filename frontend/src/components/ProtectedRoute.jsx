import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protège les routes côté interface. La vraie sécurité reste appliquée par l'API Laravel :
 * cette garde ne fait qu'éviter d'afficher des pages inutilisables.
 */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
