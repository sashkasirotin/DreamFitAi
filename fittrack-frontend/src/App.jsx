import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, AppShell, Burger, Group, Title, Avatar, Menu, Text, ActionIcon, Modal, Stack, PasswordInput, Button, Alert } from '@mantine/core';
import { IconLock, IconCheck } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import api from './api';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Progress from './pages/Progress';
import AIRoadmap from './pages/AIRoadmap';

import '@mantine/core/styles.css';
import './index.css';



// Layout for authenticated users
function AppLayout() {
    const [opened, { toggle }] = useDisclosure();
    const { user, logout } = useAuth();

    // Change password modal state
    const [pwModalOpen, setPwModalOpen] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    const handleChangePassword = async () => {
        setPwError('');
        if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
        if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
        setPwLoading(true);
        try {
            await api.post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
            setPwSuccess(true);
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            setPwError(err.response?.data?.error || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const openPwModal = () => { setPwModalOpen(true); setPwError(''); setPwSuccess(false); };

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
                                <Menu.Item leftSection={<IconLock size={14} />} onClick={openPwModal}>
                                    Change Password
                                </Menu.Item>
                                <Menu.Item color="red" onClick={logout}>
                                    Sign Out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* Change Password Modal */}
            <Modal
                opened={pwModalOpen}
                onClose={() => setPwModalOpen(false)}
                title={<Group gap={8}><IconLock size={18} /><Text fw={600}>Change Password</Text></Group>}
                centered
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
                <Stack gap="sm">
                    {pwSuccess ? (
                        <Alert color="teal" icon={<IconCheck size={16} />}>
                            Password changed successfully!
                        </Alert>
                    ) : (
                        <>
                            {pwError && <Alert color="red">{pwError}</Alert>}
                            <PasswordInput
                                label="Current Password"
                                placeholder="Enter current password"
                                value={currentPw}
                                onChange={(e) => setCurrentPw(e.target.value)}
                            />
                            <PasswordInput
                                label="New Password"
                                placeholder="At least 6 characters"
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)}
                            />
                            <PasswordInput
                                label="Confirm New Password"
                                placeholder="Repeat new password"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
                            />
                            <Button
                                color="violet"
                                fullWidth
                                mt="sm"
                                loading={pwLoading}
                                onClick={handleChangePassword}
                                disabled={!currentPw || !newPw || !confirmPw}
                            >
                                Update Password
                            </Button>
                        </>
                    )}
                </Stack>
            </Modal>

            <AppShell.Navbar p="md" className="app-navbar" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,10,16,0.95)' }}>
                <Navigation onNavItemClick={toggle} />
            </AppShell.Navbar>

            <AppShell.Main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/log-activity" element={<LogActivity />} />
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
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/roadmap" replace />} />
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
