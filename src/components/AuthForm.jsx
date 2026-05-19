import React, { useState } from "react";
import styles from './AuthForm.module.css'

function AuthForm({ title, isRegister, onSubmitButton}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // A lógica do IF/ELSE precisa ficar AQUI DENTRO.
        // Assim, ela só roda quando o usuário clica no botão de enviar.
        if(isRegister) {
            onSubmitButton({ name, email, password })
        } else { 
            onSubmitButton({ email, password })
        }
    } // <--- O handleSubmit fecha aqui!

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>

            <form onSubmit={handleSubmit}>
                {/* Se for Registro (isRegister === true ), renderiza o campo nome */}
                {isRegister && (
                    <div className={styles.formGroup}>
                        <label>Nome:</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>E-mail:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Corrigido para P maiúsculo (setPassword)
                        required
                    />
                </div>

                <button type="submit" className={styles.button}>
                    {isRegister ? 'Cadastrar' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}

export default AuthForm;
