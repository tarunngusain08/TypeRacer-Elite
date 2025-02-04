import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { NavBar } from './components/ui/NavBar';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Game from './pages/Game';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <NavBar />
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Home /> : <Landing />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/game/:id" 
          element={isAuthenticated ? <Game /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </div>
  );
};

export default App;