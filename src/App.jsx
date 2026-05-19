import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

// Importe suas páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Catalogo from './pages/CatalogoPage';
import RegisterLibrarian from './pages/RegisterLibrarian';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import BookDetailsPage from './pages/BookDetailsPage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import PendingLoansPage from './pages/PendingLoansPage';
import ManageUsersPage from './pages/ManageUsersPage';

// 1. Atualizamos o PrivateRoute para checar o cargo (role) também
const PrivateRoute = ({ children, roleRequired }) => {
  const { signed, loading, user } = useContext(AuthContext); // Puxamos o 'user' do contexto

  if (loading) return <div>Carregando...</div>;
  
  // Se não estiver logado, vai para o login
  if (!signed) return <Navigate to="/login" />;

  // Se a rota exigir um cargo específico e o usuário logado não for esse cargo, manda pro catálogo
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/catalogo" />;
  }

  return children;
};

function App() {
  return ( 
    <>
      <Navbar />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rotas Protegidas Comuns (Qualquer usuário logado acessa) */}
        <Route path="/catalogo" element={<PrivateRoute><Catalogo /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/livro/:id" element={<PrivateRoute><BookDetailsPage /></PrivateRoute>} />

        {/* 🔐 Rotas Administrativas Protegidas por Cargo (Apenas 'librarian') */}
        <Route path="/admin/novo-bibliotecario" element={<PrivateRoute roleRequired="librarian"><RegisterLibrarian /></PrivateRoute>} />
        <Route path="/adicionar-livro" element={<PrivateRoute roleRequired="librarian"><AddBookPage /></PrivateRoute>} />
        <Route path="/editar-livro/:id" element={<PrivateRoute roleRequired="librarian"><EditBookPage /></PrivateRoute>} />
        <Route path="/admin/reservas" element={<PrivateRoute roleRequired="librarian"><PendingLoansPage /></PrivateRoute>} />
        <Route path="/gerenciar-usuarios" element={<PrivateRoute><ManageUsersPage /></PrivateRoute>} />

        {/* Rota de "Segurança" (Sempre por último) */}
        <Route path="*" element={<Navigate to="/catalogo" />} />
      </Routes>
    </>
  );
}

export default App;