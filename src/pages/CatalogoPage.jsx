import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import api from '../api/api';
import styles from './CatalogoPage.module.css'


function CatalogoPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // 1. Busca os livros no backend
    useEffect(() => {
        async function fetchBooks() {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
            } catch (error) {
                console.error("Erro ao carregar livros:", error);
                alert("Erro ao carregar o acervo.");
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    // 2. Filtro de busca simples
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className={styles.loading}>Carregando acervo...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>📚 Acervo Borrachalioteca</h1>
                <input
                    type="text"
                    placeholder="Pesquisar por título ou autor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchBar}
                />
            </header>

            <div className={styles.grid}>
               {filteredBooks.length > 0 ? (
    filteredBooks.map(book => (
        <div key={book.id} className={styles.card}>
            {/* ENVOLVA A IMAGEM E INFO COM O LINK */}
            <Link to={`/livro/${book.id}`} className={styles.detailsLink}>
                <div className={styles.imageWrapper}>
                    <img
                        src={book.image_url || 'https://picsum.photos/seed/picsum/200/300'}
                        alt={book.title}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x300?text=Sem+Capa';
                        }}
                    />
                </div>
                <div className={styles.info}>
                    <h3>{book.title}</h3>
                    <p className={styles.author}>{book.author}</p>
                </div>
            </Link>

            {/* O STATUS E O BOTÃO FICAM FORA DO LINK DE DETALHES PARA EVITAR CONFLITOS DE CLIQUE */}
            <div className={styles.actions}>
                <p className={styles.status}>
                    Disponível: <span className={book.available > 0 ? styles.inStock : styles.outOfStock}>
                        {book.available} / {book.total_copies}
                    </span>
                </p>
                <button
                    className={styles.btnLoan}
                    disabled={book.available === 0}
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que o clique no botão ative o link do card
                        // aqui vai sua lógica de empréstimo
                    }}
                >
                    {book.available > 0 ? 'Solicitar Empréstimo' : 'Indisponível'}
                </button>
            </div>
        </div>
    ))
) : (
    <p className={styles.empty}>Nenhum livro encontrado.</p>
)}
            </div>
        </div>
    );
}

export default CatalogoPage;