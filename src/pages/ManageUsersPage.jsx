import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import styles from "./ManageUsersPage.module.css";

function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [selectedUserLoans, setSelectedUserLoans] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);

    // 1. Carrega todos os usuários ao abrir a página (GET /users)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao carregar lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Carrega o histórico utilizando a rota de loans com filtros
    const handleViewLoans = async (id, name) => {
        try {
            setModalLoading(true);
            setSelectedUserName(name);
            setSelectedUserLoans([]); // Limpa o estado anterior para não piscar dados antigos
            
            const response = await api.get(`/loans`, { params: { member_id: id, limit: 100 } });
            const loansList = response.data.loans || (Array.isArray(response.data) ? response.data : []);
            setSelectedUserLoans(loansList);
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao buscar histórico.");
            setSelectedUserLoans(null);
        } finally {
            setModalLoading(false);
        }
    };

    // 3. Atualiza o cargo do usuário no sistema (PUT /users/:id)
    const handleUpdateRole = async (id, currentRole, name) => {
        const newRole = currentRole === "member" ? "librarian" : "member";
        const roleText = newRole === "member" ? "Leitor" : "Bibliotecário";
        
        if (!window.confirm(`Tem certeza que deseja alterar o cargo de ${name} para "${roleText}"?`)) return;

        try {
            const response = await api.put(`/users/${id}`, { role: newRole });
            alert(response.data.message || "Cargo updated com sucesso!");
            
            setUsers(prevUsers => 
                prevUsers.map(user => user.id === id ? { ...user, role: newRole } : user)
            );
        } catch (error) {
            alert(error.response?.data?.error || "Não foi possível atualizar o cargo do usuário.");
        }
    };

    // 4. Remove o usuário do sistema (DELETE /users/:id)
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${name}?`)) return;

        try {
            const response = await api.delete(`/users/${id}`);
            alert(response.data.message || "Usuário removido com sucesso!");
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Não foi possível remover o usuário.");
        }
    };

    if (loading) return <div className={styles.loading}>Carregando usuários...</div>;

    return (
        <div className={styles.container}>
            <h2>Gerenciamento de Usuários</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Cargo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                {/* 🔥 ALTERADO AQUI: Tradução visual mantendo as classes CSS originais do backend */}
                                <span className={user.role === "admin" || user.role === "librarian" ? styles.badgeStaff : styles.badgeMember}>
                                    {user.role === "librarian" ? "Bibliotecário" : user.role === "member" ? "Leitor" : user.role}
                                </span>
                            </td>
                            <td>
                                <div className={styles.actionGroup}>
                                    <button 
                                        className={styles.btnInfo} 
                                        onClick={() => handleViewLoans(user.id, user.name)}
                                        title="Ver Histórico de Empréstimos"
                                    >
                                        🔍 Histórico
                                    </button>
                                    
                                    <button 
                                        className={styles.btnEdit} 
                                        onClick={() => handleUpdateRole(user.id, user.role, user.name)}
                                        title="Alternar Permissão do Usuário"
                                    >
                                        🔄 Cargo
                                    </button>

                                    <button 
                                        className={styles.btnDelete} 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        title="Excluir Usuário"
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL DE HISTÓRICO DE EMPRÉSTIMOS */}
            {selectedUserLoans !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Histórico de {selectedUserName}</h3>
                        <button className={styles.btnCloseModal} onClick={() => setSelectedUserLoans(null)}>❌ Fechar</button>
                        
                        {modalLoading ? (
                            <p>Carregando histórico...</p>
                        ) : selectedUserLoans.length === 0 ? (
                            <p className={styles.noLoans}>Este usuário nunca pegou livros emprestados.</p>
                        ) : (
                            <div className={styles.modalTableContainer}>
                                <table className={styles.modalTable}>
                                    <thead>
                                        <tr>
                                            <th>Livro</th>
                                            <th>Data Empréstimo</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedUserLoans.map((loan) => {
                                            const bookTitle = loan.book_title || `Livro ID: ${loan.book_id}`;
                                            const loanDate = loan.loan_date;
                                            const statusLower = loan.status?.toLowerCase();

                                            return (
                                                <tr key={loan.id}>
                                                    <td>{bookTitle}</td>
                                                    <td>{loanDate ? new Date(loanDate).toLocaleDateString('pt-BR') : '---'}</td>
                                                    <td>
                                                        <span className={
                                                            statusLower === 'active' ? styles.statusActive : 
                                                            statusLower === 'overdue' ? styles.statusOverdue : 
                                                            styles.statusReturned
                                                        }>
                                                            {statusLower === 'active' && 'Em aberto'}
                                                            {statusLower === 'overdue' && 'Atrasado ⚠️'}
                                                            {statusLower === 'returned' && 'Devolvido'}
                                                            {statusLower === 'pending' && 'Pendente'}
                                                            {statusLower === 'rejected' && 'Recusado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsersPage;