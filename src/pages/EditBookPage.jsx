import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './EditBookPage.module.css';

export default function EditBookPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        image_url: '',
        isbn: '', // 🔥 GARANTIDO: limpo de 'isnb' para bater com o banco
        total_copies: 0,
        available: 0
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // 1. Carrega os dados originais do livro
    useEffect(() => {
        api.get(`/books/${id}`)
            .then(res => {
                // 🔥 CORREÇÃO CRUCIAL: Se o banco trouxer chaves como null (ex: image_url ou description),
                // o operador '||' garante que o React receba uma string vazia (''), 
                // mantendo o input controlado e editável!
                const livro = res.data;
                setFormData({
                    title: livro.title || '',
                    author: livro.author || '',
                    description: livro.description || '',
                    image_url: livro.image_url || '',
                    isbn: livro.isbn || '',
                    total_copies: livro.total_copies || 0,
                    available: livro.available || 0
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar livro:", err);
                alert("Erro ao carregar dados do livro.");
                navigate(-1);
            });
    }, [id, navigate]);

    // 2. Envia as alterações
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            // 🔥 CORREÇÃO: Força a conversão de tipos para o Back-end não rejeitar a requisição
            const payload = {
                title: formData.title,
                author: formData.author,
                description: formData.description,
                image_url: formData.image_url.trim() === '' ? null : formData.image_url, // Se tiver vazio, envia null
                isbn: formData.isbn,
                total_copies: Number(formData.total_copies),
                available: Number(formData.available)
            };

            await api.put(`/books/${id}`, payload);
            alert('Livro atualizado com sucesso!');
            navigate(`/books/${id}`); // Redireciona de volta para os detalhes do livro editado
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Erro ao atualizar livro.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p className={styles.loading}>Carregando dados do livro...</p>;

    return (
        <div className={styles.container}>
            <h2>Editar Livro</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Título</label>
                    <input 
                        type="text" required
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Autor</label>
                    <input 
                        type="text" required
                        value={formData.author}
                        onChange={e => setFormData({...formData, author: e.target.value})}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>ISBN</label>
                    <input 
                        type="text"
                        value={formData.isbn}
                        onChange={e => setFormData({...formData, isbn: e.target.value})}
                    />
                </div>

                <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                        <label>Total de Exemplares</label>
                        <input 
                            type="number" min="0"
                            value={formData.total_copies}
                            onChange={e => setFormData({...formData, total_copies: e.target.value})}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Disponíveis</label>
                        <input 
                            type="number" min="0"
                            value={formData.available}
                            onChange={e => setFormData({...formData, available: e.target.value})}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>URL da Capa</label>
                    <input 
                        type="text"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={formData.image_url} // 🔥 Agora o valor está blindado contra null
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Descrição</label>
                    <textarea 
                        rows="5"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate(-1)} className={styles.btnCancel}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={updating} className={styles.btnSave}>
                        {updating ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
}