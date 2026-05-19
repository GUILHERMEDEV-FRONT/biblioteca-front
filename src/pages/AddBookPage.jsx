import { useState } from 'react';
import api from '../api/api';
import styles from './AddBookPage.module.css';

export default function AddBookPage() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        image_url: '',
        isbn: '', // ✨ CORRIGIDO: de 'isnb' para 'isbn'
        total_copies: 1
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // ✨ BOA PRÁTICA: Garante que a quantidade vai como número para o back-end
            const payload = {
                ...formData,
                total_copies: Number(formData.total_copies)
            };

            await api.post('/books', payload);
            setMessage({ type: 'success', text: 'Livro cadastrado com sucesso!' });
            
            // Limpa o formulário resetando o estado corretamente
            setFormData({ title: '', author: '', description: '', image_url: '', isbn: '', total_copies: 1 });
        } catch (error) {
            console.error(error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Erro ao cadastrar livro. Verifique os dados.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Cadastrar Novo Livro</h2>

            {message.text && (
                <p className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </p>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Título do Livro</label>
                    <input
                        type="text" required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Autor</label>
                    <input
                        type="text" required
                        value={formData.author}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>URL da Capa (Imagem)</label>
                    <input
                        type="text"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>ISBN</label>
                    <input
                        type="text"
                        placeholder="Ex: 978-85..."
                        // ✨ CORRIGIDO: Agora aponta para a propriedade certa do estado
                        value={formData.isbn || ''} 
                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Quantidade de Exemplares</label>
                    <input
                        type="number" min="1" required
                        value={formData.total_copies}
                        onChange={e => setFormData({ ...formData, total_copies: e.target.value })}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Descrição / Sinopse</label>
                    <textarea
                        rows="4"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <button type="submit" disabled={loading} className={styles.btnSubmit}>
                    {loading ? 'Salvando...' : 'Cadastrar Livro'}
                </button>
            </form>
        </div>
    );
}