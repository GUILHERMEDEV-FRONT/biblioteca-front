import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LogoImg from '../assets/Logo.avif';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signed, logout, user } = useContext(AuthContext);

  if (!signed) return null; // Não mostra a barra se não estiver logado

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="./">
        <img src={LogoImg} style={{ width: '70px', height: 'auto' }} alt="📚 Borrachalioteca"  /></Link>
      </div>

      <div className={styles.links}>
        {/* --- LINKS PARA QUEM ESTÁ LOGADO --- */}
        {signed ? (
          <>
            <Link to="/Catalogo">Acervo</Link>
            <Link to="/perfil">Meu Perfil</Link>
            
            {/* ── LINKS EXTRAS APENAS PARA BIBLIOTECÁRIOS ───────────────── */}
            {user?.role === 'librarian' && (
              <>
                <Link to="/admin/reservas" className={styles.adminLink}>
                  📋 Aprovar Reservas
                </Link>
                <Link to="/admin/novo-bibliotecario" className={styles.adminLink}>
                  Painel Admin
                </Link>
              </>
            )}

            <span className={styles.welcome}>Olá, {user?.name.split(' ')[0]}!</span>
            <button onClick={logout} className={styles.btnLogout}>Sair</button>
          </>
        ) : (
          /* --- LINKS PARA QUEM NÃO ESTÁ LOGADO --- */
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register" className={styles.btnRegister}>Criar Conta</Link>
          </>
        )}
      </div>
    </nav>
  );
}