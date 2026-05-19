import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './BookDetailsPage.module.css';

export default function BookDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados do Livro e UI
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para o Autocomplete de Usuários (Librarian)
    const [searchTerm, setSearchTerm] = useState(''); 
    const [usersList, setUsersList] = useState([]);     
    const [showDropdown, setShowDropdown] = useState(false); 
    const [selectedMemberId, setSelectedMemberId] = useState(''); 

    const user = JSON.parse(localStorage.getItem('@Library:user')) || {};

    // 1. Busca os detalhes do livro ao montar o componente
    useEffect(() => {
        api.get(`/books/${id}`)
            .then(res => setBook(res.data))
            .catch(err => console.error("Erro ao buscar livro:", err));
    }, [id]);

    // 2. Efeito de Busca Preditiva (Autocomplete) por Nome
    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setUsersList([]);
            setShowDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get('/users');
                const filtered = response.data.filter(u =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setUsersList(filtered);
                setShowDropdown(true);
            } catch (err) {
                console.error("Erro ao buscar usuários por nome:", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Tem certeza que deseja remover este livro do acervo?");
        if (confirmDelete) {
            try {
                await api.delete(`/books/${id}`);
                alert("Livro removido com sucesso!");
                navigate('/catalogo');
            } catch (err) {
                const errorMsg = err.response?.data?.error || "Erro ao remover o livro.";
                alert(errorMsg);
                console.error("Erro ao deletar:", err);
            }
        }
    };

    // ── 🔥 FUNÇÃO DE EMPRÉSTIMO / RESERVA CORRIGIDA ──────────────────────────
    const handleLoan = async () => {
        try {
            setLoading(true);

            // ── FLUXO 1: SE FOR LEITOR (MEMBER) ──
            if (user.role?.toLowerCase() === 'member') {
                const payload = {
                    book_id: Number(id),
                    days: 14 // Prazo padrão de reserva
                };

                const response = await api.post('/loans', payload);
                alert(response.data?.message || 'Solicitação de reserva enviada com sucesso!');
                window.location.reload();
                return;
            }

            // ── FLUXO 2: SE FOR BIBLIOTECÁRIO (LIBRARIAN) ──
            if (user.role?.toLowerCase() === 'librarian') {
                if (!selectedMemberId) {
                    alert('Por favor, selecione um membro válido da lista sugerida antes de prosseguir.');
                    setLoading(false);
                    return;
                }

                const payload = {
                    book_id: Number(id),
                    bookId: Number(id),
                    user_id: Number(selectedMemberId),
                    userId: Number(selectedMemberId),
                    member_id: Number(selectedMemberId)
                };

                const response = await api.post('/loans', payload);
                alert(response.data?.message || 'Empréstimo registrado com sucesso!');
                window.location.reload();
            }

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Erro ao processar a requisição.');
        } finally {
            setLoading(false);
        }
    };

    if (!book) return <p className={styles.loading}>Carregando...</p>;

    const isLibrarian = user?.role?.toLowerCase() === 'librarian';

    return (
        <div className={styles.container}>
            <div className={styles.imageSection}>
                <img src={book.image_url || 'https://placehold.co/400x600'} alt={book.title} />
            </div>

            <div className={styles.infoSection}>
                <h1>{book.title}</h1>
                <p className={styles.author}>por {book.author}</p>

                <div className={styles.metadata}>
                    <div className={styles.metaItem}>
                        <strong>Status</strong>
                        <span className={book.available > 0 ? styles.available : styles.unavailable}>
                            {book.available > 0 ? 'Disponível para empréstimo' : 'Indisponível (Fila de Espera Ativa)'}
                        </span>
                    </div>
                    <div className={styles.metaItem}>
                        <strong>Exemplares</strong>
                        <span>{book.available} unidades</span>
                    </div>
                </div>

                <div className={styles.description}>
                    {book.description || "Nenhuma descrição disponível para este livro."}
                </div>

                {/* CAMPO DE SELEÇÃO POR NOME (Apenas para o Librarian) */}
                {isLibrarian && (
                    <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 'bold', color: '#4a5568' }}>Nome do Membro / Aluno:</label>
                        <input
                            type="text"
                            placeholder="Digite o nome para buscar..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedMemberId(''); 
                            }}
                            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                            style={{
                                padding: '0.6rem',
                                border: '1px solid #cbd5e0',
                                borderRadius: '4px',
                                width: '100%',
                                maxWidth: '300px'
                            }}
                        />

                        {/* Dropdown de sugestões */}
                        {showDropdown && usersList.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                width: '100%',
                                maxWidth: '300px',
                                backgroundColor: '#fff',
                                border: '1px solid #cbd5e0',
                                borderRadius: '4px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 10,
                                maxHeight: '150px',
                                overflowY: 'auto',
                                listStyle: 'none',
                                padding: '0',
                                margin: '4px 0 0 0'
                            }}>
                                {usersList.map((u) => (
                                    <li
                                        key={u.id}
                                        onClick={() => {
                                            setSelectedMemberId(u.id); 
                                            setSearchTerm(u.name);     
                                            setShowDropdown(false);    
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #edf2f7',
                                            color: '#2d3748',
                                            backgroundColor: '#fff'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f7fafc'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                                    >
                                        {u.name} <span style={{ fontSize: '0.8rem', color: '#718096' }}>(ID: {u.id})</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Alerta de nenhum resultado encontrado */}
                        {showDropdown && searchTerm.length >= 2 && usersList.length === 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                width: '100%',
                                maxWidth: '300px',
                                backgroundColor: '#fff',
                                border: '1px solid #cbd5e0',
                                padding: '0.5rem 0.75rem',
                                color: '#718096',
                                fontSize: '0.9rem',
                                borderRadius: '4px',
                                zIndex: 10
                            }}>
                                Nenhum usuário encontrado
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button
                        className={styles.btnLoan}
                        /* 
                          CORREÇÃO: O botão só fica desativado para o bibliotecário se o estoque for 0.
                          Para o leitor comum, ele continua clicável mesmo se for 0, permitindo entrar na fila de reserva!
                        */
                        disabled={loading || (isLibrarian && book.available <= 0)}
                        onClick={handleLoan}
                    >
                        {loading ? 'Processando...' : (
                            isLibrarian
                                ? 'Efetivar Empréstimo Físico'
                                : 'Solicitar Livro (Entrar na Fila)'
                        )}
                    </button>

                    {isLibrarian && (
                        <button
                            className={styles.btnDelete}
                            onClick={handleDelete}
                        >
                            Remover Livro
                        </button>
                    )}

                    {isLibrarian && (
                        <button
                            className={styles.btnEdit}
                            onClick={() => navigate(`/editar-livro/${id}`)}
                        >
                            Editar Livro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}