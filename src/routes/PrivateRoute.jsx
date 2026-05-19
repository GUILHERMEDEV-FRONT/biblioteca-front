
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function PrivateRoute({ children }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) return <div>Carregando...</div>;

  return signed ? children : <Navigate to="/login" />;
}