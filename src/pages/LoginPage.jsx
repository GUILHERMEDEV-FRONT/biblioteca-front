import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from '../components/AuthForm';
import { AuthContext } from "../contexts/AuthContext";

function LoginPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const hanldelogin = async (data) => {
        try {
            await login({ email: data.email, password: data.password });
            alert('Login feito com sucesso!');
            navigate('/catalogo');
        } catch(error) {
            alert('Erro ao fazer login. Verifique suas credenciais.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            {/* O formulário precisa fechar com /> exatamente assim */}
            <AuthForm  
                title="Acessar Biblioteca"
                isRegister={false}
                onSubmitButton={hanldelogin}
            />
            
            {/* Bloco da âncora isolado dentro da div principal */}
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
                <span>Não tem uma conta? </span>
                <Link 
                    to="/register" 
                    style={{ 
                        color: '#007bff', 
                        textDecoration: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    Cadastre-se aqui
                </Link>
            </div>
        </div>
    );
}

export default LoginPage;
