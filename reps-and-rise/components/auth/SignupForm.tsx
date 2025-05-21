import React, { useState } from 'react';

interface SignupFormProps {
    onSignup?: (email: string, password: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSignup) {
            onSignup(email, password);
        }
        // Add your signup logic here
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '0 auto' }}>
            <h2>Sign Up</h2>
            <div style={{ marginBottom: 12 }}>
                <label htmlFor="signup-email">Email:</label>
                <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%' }}
                />
            </div>
            <div style={{ marginBottom: 12 }}>
                <label htmlFor="signup-password">Password:</label>
                <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: '100%' }}
                />
            </div>
            <button type="submit" style={{ width: '100%' }}>Sign Up</button>
        </form>
    );
};

export default SignupForm;