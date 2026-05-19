import api from "../api/api";

export const authService = {
    // 1. Alterado para receber um objeto desestruturado
    register: async (userData) => {
        // Envia os dados (como name, email, password) para o backend
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async ({ email, password }) => {
        // O axios vai enviar exatamente { "email": "...", "password": "..." }
        const response = await api.post('auth/login', { email, password });
        return response; // Retorne a response inteira para o Contexto tratar
    },

    getMe: async () => {
        // Se o seu api.js já tem o interceptor, você não precisa passar o header manualmente aqui!
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('@Library:token'); // Use o mesmo nome que definiu no Contexto
        localStorage.removeItem('@Library:user');
    }
}