import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';

import '@mantine/core/styles.css';

function App() {
  return (
    <AuthProvider>
      <MantineProvider>
        <BrowserRouter>
          <Navigation />
          <div style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/log-meal" element={<LogMeal />} />
              <Route path="/log-workout" element={<LogWorkout />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </div>
        </BrowserRouter>
      </MantineProvider>
    </AuthProvider>
  );
}

export default App;
