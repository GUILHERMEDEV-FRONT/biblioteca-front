import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getMe = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data); // Atualiza o estado com os dados vindos do servidor
        } catch (error) {
            console.error("Token inválido ou expirado");
            logout(); // Se der erro (401), desloga o usuário por segurança
        }
    };

    useEffect(() => {
        // Ao carregar o app, verifica se tem um token no localStorage
        const savedUser = localStorage.getItem('@Library:user');
        const savedToken = localStorage.getItem('@Library:token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            // Aqui você poderia configurar o header do axios automaticamente
        }
        setLoading(false);
    }, []);
    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
           
            
            const { user, token } = response.data;

            localStorage.setItem('@Library:user', JSON.stringify(user));
            localStorage.setItem('@Library:token', token);
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error("Erro no login:", error);
            return {
                success: false,
                message: error.response?.data?.error || "Falha ao conectar com o servidor"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('@Library:user');
        localStorage.removeItem('@Library:token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, login, logout, getMe, loading }}>
            {children}
        </AuthContext.Provider>
    );
}