import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CompetitionList from './pages/CompetitionList';
import CompetitionDetail from './pages/CompetitionDetail';
import CompetitionForm from './pages/CompetitionForm';
import MatchDetail from './pages/MatchDetail';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      加载中...
    </Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <Register />
        } />
        <Route path="/" element={
          user ? <CompetitionList /> : <Navigate to="/login" />
        } />
        <Route path="/competitions/new" element={
          user ? <CompetitionForm /> : <Navigate to="/login" />
        } />
        <Route path="/competitions/:id" element={
          user ? <CompetitionDetail /> : <Navigate to="/login" />
        } />
        <Route path="/competitions/:id/edit" element={
          user ? <CompetitionForm /> : <Navigate to="/login" />
        } />
        <Route path="/matches/:id" element={
          user ? <MatchDetail /> : <Navigate to="/login" />
        } />
      </Routes>
    </Box>
  );
}

export default App; 