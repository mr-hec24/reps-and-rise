import React, { useState } from 'react';

interface LoginFormProps {
    onLogin?: (email: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onLogin) {
            onLogin(email, password);
        }
        // Reset fields or handle further logic here
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto' }}>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                />
            </div>
            <div style={{ marginTop: 12 }}>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
            </div>
            <button type="submit" style={{ marginTop: 16 }}>
                Login
            </button>
        </form>
    );
};

export default LoginForm;