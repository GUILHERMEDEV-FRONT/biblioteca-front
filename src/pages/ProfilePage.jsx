import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { loanService } from "../api/api";
import styles from './ProfilePage.module.css';

function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [myLoans, setMyLoans] = useState([]);
    const [loadingLoans, setLoadingLoans] = useState(true);

    // ── Estados para controle de Paginação ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreItems, setHasMoreItems] = useState(false);

    // 🔥 AJUSTE 1: Mudamos o limite da API para 5, batendo com o que você quer exibir na tela
    const limitPerPage = 10;

    useEffect(() => {
        async function fetchMyLoans() {
            if (!user) return;
            try {
                setLoadingLoans(true);

                const params = {
                    page: currentPage,
                    limit: limitPerPage
                };

                if (user.role?.toLowerCase() === 'member') {
                    params.member_id = user.id;
                }

                const response = await loanService.listLoans(params);

                // 🔍 INSPEÇÃO MANUAL: Abre o console do navegador (F12) para ver esses logs!
                console.log("=== DEBUG PAGINAÇÃO ===");
                console.log("Resposta bruta do backend:", response);

                const allLoans = response.loans || (Array.isArray(response) ? response : []);
                console.log("Quantidade de registros encontrados (allLoans.length):", allLoans.length);
                console.log("Limite por página esperado no front (limitPerPage):", limitPerPage);

                let filteredLoans = [];
                if (user.role?.toLowerCase() === 'librarian') {
                    filteredLoans = allLoans;
                } else {
                    filteredLoans = allLoans.filter(loan => {
                        const loanUserId = loan.member_id || loan.user_id || loan.userId;
                        return String(loanUserId) === String(user.id);
                    });
                }

                setMyLoans(filteredLoans);

                if (response.totalPages) {
                    console.log("Backend enviou totalPages:", response.totalPages);
                    setHasMoreItems(currentPage < response.totalPages);
                } else {
                    console.log("Backend não enviou totalPages. Usando fallback de tamanho.");
                    setHasMoreItems(allLoans.length >= limitPerPage);
                }
                console.log("Resultado final -> O botão Próxima deve ficar ativo? ", allLoans.length >= limitPerPage || (response.totalPages && currentPage < response.totalPages));
                console.log("=======================");

            } catch (error) {
                console.error("Erro ao buscar histórico de empréstimos:", error);
                setMyLoans([]);
                setHasMoreItems(false);
            } finally {
                setLoadingLoans(false);
            }
        }
        fetchMyLoans();
    }, [user?.id, user?.role, currentPage]);

    const renderStatusBadge = (status) => {
        const currentStatus = status?.toLowerCase();
        if (currentStatus === 'pending') return <span className={`${styles.badge} ${styles.pending}`}>Pendente</span>;
        if (currentStatus === 'active') return <span className={`${styles.badge} ${styles.active}`}>Ativo</span>;
        if (currentStatus === 'returned') return <span className={`${styles.badge} ${styles.returned}`}>Devolvido</span>;
        if (currentStatus === 'overdue') return <span className={`${styles.badge} ${styles.overdue}`}>Atrasado ⚠️</span>;
        return <span className={styles.badge}>{status}</span>;
    };

    const handleReturnLoan = async (loanId) => {
        const confirmReturn = window.confirm("Deseja confirmar a devolução deste livro?");
        if (!confirmReturn) return;

        try {
            const response = await loanService.returnLoan(loanId);
            alert(response.data?.message || response.message || "Devolução registrada com sucesso!");

            setMyLoans(prevLoans =>
                prevLoans.map(loan =>
                    loan.id === loanId ? { ...loan, status: 'returned' } : loan
                )
            );
        } catch (error) {
            console.error("Erro ao registrar devolução:", error);
            alert(error.response?.data?.error || "Erro ao registrar devolução.");
        }
    };

    if (!user) return <p className={styles.loading}>Carregando perfil...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <h2>Meu Perfil</h2>
                <p><strong>Nome:</strong> {user.name}</p>
                <p><strong>E-mail:</strong> {user.email}</p>
                <p><strong>Cargo:</strong> {user.role === 'librarian' ? 'Bibliotecário' : 'Leitor'}</p>
            </div>

            <div className={styles.loansSection}>
                <h3>
                    {user.role === 'librarian' ? '📋 Painel Geral de Empréstimos & Reservas' : '📚 Meus Empréstimos & Reservas'}
                </h3>

                {loadingLoans ? (
                    <p className={styles.loading}>Carregando histórico...</p>
                ) : myLoans.length === 0 ? (
                    <p className={styles.emptyText}>
                        {user.role === 'librarian' ? 'Nenhum empréstimo registrado no sistema.' : 'Você ainda não solicitou nenhum livro.'}
                    </p>
                ) : (
                    <>
                        <table className={styles.loansTable}>
                            <thead>
                                <tr>
                                    <th>Livro</th>
                                    {user.role === 'librarian' && <th>Usuário</th>}
                                    <th>Data de Retirada</th>
                                    <th>Prazo de Devolução</th>
                                    <th>Status</th>
                                    {user.role === 'librarian' && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {/* 🔥 AJUSTE 2: MAPEANDO DIRETO O 'myLoans' SEM FAZER SLICE NO FRONT */}
                                {myLoans.map((loan) => {
                                    const dataRetirada = loan.loan_date;
                                    const dataDevolucao = loan.return_date;
                                    const nomeUsuario = loan.user_name || `ID: ${loan.user_id || loan.member_id}`;
                                    const currentStatus = loan.status?.toLowerCase();

                                    return (
                                        <tr key={loan.id} className={currentStatus === 'overdue' ? styles.overdueRow : ''}>
                                            <td className={styles.bookTitle}>{loan.book_title}</td>

                                            {user.role === 'librarian' && <td>{nomeUsuario}</td>}

                                            <td>{dataRetirada ? new Date(dataRetirada).toLocaleDateString('pt-BR') : '---'}</td>
                                            <td>{dataDevolucao ? new Date(dataDevolucao).toLocaleDateString('pt-BR') : '---'}</td>
                                            <td>{renderStatusBadge(loan.status)}</td>

                                            {user.role === 'librarian' && (
                                                <td>
                                                    {currentStatus === 'active' || currentStatus === 'overdue' ? (
                                                        <button
                                                            className={styles.returnBtn}
                                                            onClick={() => handleReturnLoan(loan.id)}
                                                        >
                                                            ↩ Devolver
                                                        </button>
                                                    ) : (
                                                        <span className={styles.disabledText}>Sem ações</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className={styles.paginationContainer}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                ◀ Anterior
                            </button>

                            <span className={styles.pageText}>
                                Página <strong>{currentPage}</strong>
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={!hasMoreItems}
                                className={styles.pageBtn}
                            >
                                Próxima ▶
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;