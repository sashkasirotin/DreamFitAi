import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Title, Text, Anchor, Alert, Paper } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            try {
                const roadmapRes = await api.get('/roadmap/latest');
                if (!roadmapRes.data) {
                    navigate('/roadmap');
                } else {
                    navigate('/');
                }
            } catch (err) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            background: 'radial-gradient(circle at 30% 40%, rgba(111, 8, 201, 0.15) 0%, #0B0A10 70%)',
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
                        <Title order={2} mb={4} className="gradient-text">Welcome Back</Title>
                        <Text c="dimmed" size="sm">Sign in to DreamFitAI</Text>
                    </div>

                    {error && (
                        <Alert color="red" radius="md" title="Error">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing="md">
                            <TextInput
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="login-email"
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                id="login-password"
                            />
                            <Button
                                type="submit"
                                color="violet"
                                fullWidth
                                loading={loading}
                                radius="md"
                                id="login-submit"
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </form>

                    <Text ta="center" size="sm">
                        Don't have an account?{' '}
                        <Anchor component={Link} to="/register" c="violet">
                            Register
                        </Anchor>
                    </Text>
                </Stack>
            </Paper>
        </div>
    );
};

export default Login;
