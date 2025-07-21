import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Box, CircularProgress } from '@mui/material';

import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GameLayout } from './components/layout/GameLayout';
import { MainMenu } from './components/layout/MainMenu';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CharacterSelectPage = lazy(() => import('./pages/CharacterSelectPage'));
const CharacterCreatePage = lazy(() => import('./pages/CharacterCreatePage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LeaderboardsPage = lazy(() => import('./pages/LeaderboardsPage'));
const StorePage = lazy(() => import('./pages/StorePage'));

const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

const App: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { connect, disconnect } = useSocket();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainMenu />}>
              <Route index element={<Navigate to="/characters" replace />} />
              <Route path="characters" element={<CharacterSelectPage />} />
              <Route path="characters/create" element={<CharacterCreatePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="leaderboards" element={<LeaderboardsPage />} />
              <Route path="store" element={<StorePage />} />
            </Route>
            
            {/* Game route */}
            <Route path="/game" element={<GameLayout />}>
              <Route index element={<GamePage />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default App;