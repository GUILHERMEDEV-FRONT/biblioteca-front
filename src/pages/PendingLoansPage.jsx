import React, { useEffect, useState } from "react";
import { loanService } from "../api/api";
import styles from "./PendingLoansPage.module.css"; 

function PendingLoansPage() {
    const [pendingLoans, setPendingLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPendingLoans = async () => {
        try {
            setLoading(true);
            
            // 1. Traz a primeira página (com limite alto para gerenciar as pendências em massa)
            const response = await loanService.listLoans({ page: 1, limit: 50 });
            
            // CORREÇÃO DA PAGINAÇÃO: Pega de response.loans se existir, senão usa fallback do array
            const allLoans = response.loans || (Array.isArray(response) ? response : []);
            
            // Filtra o que está pendente de forma segura
            const pending = allLoans.filter(loan => 
                loan.status?.toLowerCase() === 'pending'
            );
            
            setPendingLoans(pending);
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            alert("Não foi possível carregar a lista de reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPendingLoans();
    }, []);

    // ── AÇÃO: Aprovar Empréstimo ───────────────────────────────────────────
    const handleApprove = async (loanId) => {
        if (!window.confirm("Tem certeza que deseja aprovar e ativar este empréstimo?")) {
            return;
        }

        try {
            await loanService.approveLoan(loanId);
            alert("Reserva aprovada e empréstimo ativado com sucesso!");
            setPendingLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
        } catch (error) {
            console.error("Erro ao aprovar:", error);
            const msg = error.response?.data?.error || "Erro ao aprovar o empréstimo.";
            alert(msg);
        }
    };

    // ── 🔥 NOVA AÇÃO: Recusar Empréstimo ──────────────────────────────────────
    const handleReject = async (loanId) => {
        if (!window.confirm("Tem certeza que deseja RECUSAR esta solicitação de reserva?")) {
            return;
        }

        try {
            await loanService.rejectLoan(loanId);
            alert("Solicitação de reserva recusada com sucesso.");
            // Remove da lista em tempo real para sumir da tela do bibliotecário
            setPendingLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
        } catch (error) {
            console.error("Erro ao recusar reserva:", error);
            const msg = error.response?.data?.error || "Erro ao recusar a reserva.";
            alert(msg);
        }
    };

    if (loading) {
        return <div className={styles.textCenter} style={{ padding: '20px' }}>Carregando reservas pendentes...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📋 Solicitações de Reserva Pendentes</h2>
            
            {pendingLoans.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhuma reserva aguardando aprovação no momento.</p>
                </div>
            ) : (
                <table className={styles.tableContainer}>
                    <thead>
                        <tr className={styles.tableHeader}>
                            <th>ID</th>
                            <th>Livro</th>
                            <th>Membro / Usuário</th>
                            <th>Data do Pedido</th>
                            <th className={styles.textCenter}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingLoans.map((loan) => (
                            <tr key={loan.id} className={styles.tableRow}>
                                <td className={styles.tableCell}>{loan.id}</td>
                                <td className={`${styles.tableCell} ${styles.bookTitle}`}>
                                    {loan.book_title || loan.Book?.title || `Livro ID: ${loan.book_id}`}
                                </td>
                                <td className={styles.tableCell}>
                                    {loan.user_name || loan.member_name || loan.Member?.name || `Membro ID: ${loan.member_id}`}
                                </td>
                                <td className={styles.tableCell}>
                                    {/* Mapeia as opções possíveis de data que vêm tratadas do seu backend */}
                                    {loan.loan_date || loan.created_at || loan.createdAt 
                                        ? new Date(loan.loan_date || loan.created_at || loan.createdAt).toLocaleDateString('pt-BR') 
                                        : '---'}
                                </td>
                                <td className={`${styles.tableCell} ${styles.textCenter}`}>
                                    {/* 📦 Agrupador de botões mantendo o padrão do seu CSS Modules */}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleApprove(loan.id)}
                                            className={styles.approveButton}
                                        >
                                            ✓ Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleReject(loan.id)}
                                            className={styles.rejectButton || styles.approveButton} // Fallback se não tiver estilo próprio ainda
                                            style={{ backgroundColor: '#e74c3c' }} // Força um vermelho caso queira estilizar inline rápido
                                        >
                                            ✕ Recusar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PendingLoansPage;