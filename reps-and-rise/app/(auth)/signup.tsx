import React, { useState } from "react";

const Signup: React.FC = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Add your signup logic here
    };

    return (
        <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="email">Email</label>
                    <input
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="password">Password</label>
                    <input
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" style={{ width: "100%", padding: 10 }}>
                    Sign Up
                </button>
                {submitted && (
                    <div style={{ marginTop: 16, color: "green" }}>
                        Submitted! (Implement signup logic)
                    </div>
                )}
            </form>
        </div>
    );
};

export default Signup;