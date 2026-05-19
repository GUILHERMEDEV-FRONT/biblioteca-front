import axios from 'axios';


const baseURL = import.meta.env?.VITE_API_URL 
  || process.env.EXPO_PUBLIC_API_URL         
  || 'http://localhost:3000';                

const api = axios.create({
    baseURL: baseURL, 
    timeout: 10000, 
});
// Interceptor para injetar o Token JWT automaticamente em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Library:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
    return Promise.reject(error);
});


export const loanService = {
  // ── Buscar todos os empréstimos (🔥 CORRIGIDO AQUI)
  listLoans: async (params) => {
    // Passamos o params envelopado em um objeto de configuração do Axios
    const response = await api.get('/loans', { params }); 
    return response.data;
  },

  // ── Aprovar uma reserva pendente
  approveLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/approve`);
    return response.data;
  },

  // ── Recusar/Rejeitar uma reserva pendente
  rejectLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/reject`);
    return response.data;
  },

  // ── Registrar a devolução de um livro
  returnLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/return`);
    return response.data; 
  }
};

export default api;
