import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function PrivateRoute({ children, roleRequired }) {
  const { signed, user, loading } = useContext(AuthContext);

  // Se o contexto ainda estiver carregando os dados do localStorage, exibe um loading
  if (loading) {
    return <div style={{ textCenter: 'center', padding: '20px' }}>Carregando...</div>;
  }

  // 1. Se não estiver logado, manda direto para a tela de login
  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se exigir um cargo específico (ex: 'librarian') e o usuário não tiver, manda para o catálogo
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/Catalogo" replace />;
  }

  // Se passou em todos os testes, renderiza a página protegida
  return children;
}