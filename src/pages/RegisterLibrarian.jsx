import React, { useState } from "react";
import { Link } from "react-router-dom"; // 1. IMPORTADO O LINK AQUI
import api from "../api/api"; 
import styles from './RegisterLibrarian.module.css'

function RegisterLibrarian() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register-librarian', formData);
            alert('Novo bibliotecário cadastrado com sucesso!');
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao cadastrar. Você tem permissão de admin?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Cadastrar Novo Bibliotecário</h2>
            
            {/* 2. ADICIONADO O ATALHO PARA ADICIONAR LIVRO AQUI */}
            <div className={styles.adminActions}>
                <Link to="/adicionar-livro" className={styles.btnLink}>
                    ➕ Adicionar Novo Livro
                </Link>
                <Link to="/gerenciar-usuarios" className={styles.btnLinkSecondary}>
                    👥 Gerenciar Usuários
                </Link>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                    type="text" placeholder="Nome" required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                /><br/>
                <input 
                    type="email" placeholder="E-mail" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                /><br/>
                <input 
                    type="password" placeholder="Senha" required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                /><br/>
                <button type="submit" disabled={loading}  className={styles.btnSubmit}>
                    {loading ? 'Cadastrando...' : 'Registrar Bibliotecário'}
                </button>
            </form>
        </div>
    );
}

export default RegisterLibrarian;