import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';

import '@mantine/core/styles.css';
import './index.css';

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AuthProvider>
      <MantineProvider defaultColorScheme="dark" theme={{ primaryColor: 'violet', fontFamily: 'Inter, sans-serif' }}>
        <BrowserRouter>
          <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
          >
            <AppShell.Header className="app-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Group h="100%" px="md">
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                <Title order={3} className="gradient-text">DreamFitAI</Title>
              </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" className="app-navbar" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <Navigation />
            </AppShell.Navbar>

            <AppShell.Main className="app-main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/log-meal" element={<LogMeal />} />
                <Route path="/log-workout" element={<LogWorkout />} />
                <Route path="/progress" element={<Progress />} />
              </Routes>
            </AppShell.Main>
          </AppShell>
        </BrowserRouter>
      </MantineProvider>
    </AuthProvider>
  );
}

export default App;
