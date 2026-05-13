import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, AppShell, Burger, Group, Title, Avatar, Menu, Text, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';
import AIRoadmap from './pages/AIRoadmap';

import '@mantine/core/styles.css';
import './index.css';

function ColorSchemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

    return (
        <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
            radius="md"
        >
            {computedColorScheme === 'light' ? <IconMoon size={20} stroke={1.5} /> : <IconSun size={20} stroke={1.5} />}
        </ActionIcon>
    );
}

// Layout for authenticated users
function AppLayout() {
    const [opened, { toggle }] = useDisclosure();
    const { user, logout } = useAuth();

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header className="app-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Title order={3} className="gradient-text">DreamFitAI</Title>
                    </Group>
                    <Group>
                        <ColorSchemeToggle />
                        <Menu withinPortal position="bottom-end" shadow="xl">
                            <Menu.Target>
                                <Avatar
                                    color="violet"
                                    radius="xl"
                                    style={{ cursor: 'pointer' }}
                                    title={user?.name}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </Menu.Target>
                            <Menu.Dropdown style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Menu.Item disabled>
                                    <Text size="sm" fw={600}>{user?.name}</Text>
                                    <Text size="xs" c="dimmed">{user?.email}</Text>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" onClick={logout}>
                                    Sign Out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" className="app-navbar" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,10,16,0.95)' }}>
                <Navigation onNavItemClick={toggle} />
            </AppShell.Navbar>

            <AppShell.Main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/log-meal" element={<LogMeal />} />
                    <Route path="/log-workout" element={<LogWorkout />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/roadmap" element={<AIRoadmap />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    );
}

// Auth-guarded route wrapper
function ProtectedApp() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0B0A10' }}>
                <Title order={3} className="gradient-text">DreamFitAI</Title>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
            <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <MantineProvider defaultColorScheme="dark" theme={{ primaryColor: 'violet', fontFamily: 'Inter, sans-serif' }}>
                <AuthProvider>
                    <ProtectedApp />
                </AuthProvider>
            </MantineProvider>
        </BrowserRouter>
    );
}

export default App;
