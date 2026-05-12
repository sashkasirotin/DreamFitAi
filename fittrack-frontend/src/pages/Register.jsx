import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Anchor, Alert, Paper } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 70% 40%, rgba(53, 221, 180, 0.12) 0%, #0B0A10 70%)',
        }}>
            <Paper
                p="xl"
                radius="xl"
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: 'rgba(25, 20, 35, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <Stack spacing="lg">
                    <div style={{ textAlign: 'center' }}>
                        <Title order={2} mb={4} className="gradient-text">Create Account</Title>
                        <Text c="dimmed" size="sm">Join DreamFitAI today</Text>
                    </div>

                    {error && (
                        <Alert color="red" radius="md" title="Error">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing="md">
                            <TextInput
                                label="Name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                id="register-name"
                            />
                            <TextInput
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="register-email"
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                id="register-password"
                            />
                            <PasswordInput
                                label="Confirm Password"
                                placeholder="Repeat password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                id="register-confirm"
                            />
                            <Button
                                type="submit"
                                color="violet"
                                fullWidth
                                loading={loading}
                                radius="md"
                                id="register-submit"
                            >
                                Create Account
                            </Button>
                        </Stack>
                    </form>

                    <Text ta="center" size="sm">
                        Already have an account?{' '}
                        <Anchor component={Link} to="/login" c="violet">
                            Sign in
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </div>
    );
};

export default Register;
