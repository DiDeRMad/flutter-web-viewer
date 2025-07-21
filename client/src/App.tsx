import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Fade, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Hooks and Context
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudio } from '@/contexts/AudioContext';
import { useGame } from '@/contexts/GameContext';

// Components
import { Navbar } from '@/components/Layout/Navbar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Footer } from '@/components/Layout/Footer';
import { LoadingScreen } from '@/components/Common/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';
import { ChatWidget } from '@/components/Chat/ChatWidget';
import { MatchmakingOverlay } from '@/components/Game/MatchmakingOverlay';
import { GameHUD } from '@/components/Game/GameHUD';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import { FriendsList } from '@/components/Social/FriendsList';
import { GuildPanel } from '@/components/Guild/GuildPanel';
import { PartyWidget } from '@/components/Party/PartyWidget';
import { UpdateNotification } from '@/components/Common/UpdateNotification';
import { MaintenanceMode } from '@/components/Common/MaintenanceMode';

// Lazy loaded pages
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/Auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/Auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('@/pages/Profile/ProfilePage'));
const GameLobbyPage = React.lazy(() => import('@/pages/Game/GameLobbyPage'));
const GameMatchPage = React.lazy(() => import('@/pages/Game/GameMatchPage'));
const LeaderboardPage = React.lazy(() => import('@/pages/Leaderboard/LeaderboardPage'));
const InventoryPage = React.lazy(() => import('@/pages/Inventory/InventoryPage'));
const MarketplacePage = React.lazy(() => import('@/pages/Marketplace/MarketplacePage'));
const GuildPage = React.lazy(() => import('@/pages/Guild/GuildPage'));
const TournamentPage = React.lazy(() => import('@/pages/Tournament/TournamentPage'));
const NewsPage = React.lazy(() => import('@/pages/News/NewsPage'));
const HelpPage = React.lazy(() => import('@/pages/Help/HelpPage'));
const SettingsPage = React.lazy(() => import('@/pages/Settings/SettingsPage'));
const AdminPanelPage = React.lazy(() => import('@/pages/Admin/AdminPanelPage'));
const NotFoundPage = React.lazy(() => import('@/pages/Error/NotFoundPage'));

// Types
interface AppState {
  isLoading: boolean;
  isMaintenance: boolean;
  isGameActive: boolean;
  showSidebar: boolean;
  showSettings: boolean;
  isFullscreen: boolean;
}

const App: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Global state
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const { playSound, setMasterVolume } = useAudio();
  const { currentMatch, isInGame, gameState } = useGame();
  
  // Local state
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    isMaintenance: false,
    isGameActive: false,
    showSidebar: true,
    showSettings: false,
    isFullscreen: false,
  });

  // Redux state
  const { 
    notifications,
    systemHealth,
    userPreferences,
    networkStatus
  } = useAppSelector(state => ({
    notifications: state.notifications,
    systemHealth: state.system.health,
    userPreferences: state.user.preferences,
    networkStatus: state.network.status
  }));

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check system status
        const response = await fetch('/api/system/status');
        const systemStatus = await response.json();
        
        if (systemStatus.maintenance) {
          setAppState(prev => ({ ...prev, isMaintenance: true, isLoading: false }));
          return;
        }

        // Load user preferences
        if (isAuthenticated) {
          await loadUserPreferences();
        }

        // Initialize audio system
        await initializeAudio();

        // Mark app as ready
        setAppState(prev => ({ ...prev, isLoading: false }));
        
        // Play startup sound
        playSound('ui_startup');
        
        // Track app startup
        if (window.gameAnalytics) {
          window.gameAnalytics.track('app_started', {
            userId: user?.id,
            timestamp: Date.now(),
            route: location.pathname
          });
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeApp();
  }, [isAuthenticated, user?.id]);

  // Handle route changes
  useEffect(() => {
    const isGameRoute = location.pathname.startsWith('/game');
    const shouldShowSidebar = !isGameRoute && !location.pathname.includes('/auth');
    
    setAppState(prev => ({
      ...prev,
      isGameActive: isGameRoute,
      showSidebar: shouldShowSidebar
    }));

    // Play navigation sound
    playSound('ui_navigate');
    
    // Track page views
    if (window.gameAnalytics) {
      window.gameAnalytics.track('page_view', {
        page: location.pathname,
        userId: user?.id,
        timestamp: Date.now()
      });
    }
  }, [location.pathname]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setAppState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Global shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            // Open command palette
            break;
          case ',':
            event.preventDefault();
            setAppState(prev => ({ ...prev, showSettings: true }));
            break;
          case 'Enter':
            if (event.altKey) {
              event.preventDefault();
              toggleFullscreen();
            }
            break;
        }
      }

      // Game shortcuts
      if (appState.isGameActive) {
        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            // Toggle scoreboard
            break;
          case 'Enter':
            // Open chat
            break;
          case 'Escape':
            // Open pause menu
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appState.isGameActive]);

  // Helper functions
  const loadUserPreferences = async () => {
    try {
      // Load and apply user preferences
      const prefs = userPreferences;
      
      // Apply audio settings
      setMasterVolume(prefs.audio?.masterVolume || 0.7);
      
      // Apply graphics settings
      if (prefs.graphics?.quality) {
        document.documentElement.setAttribute('data-quality', prefs.graphics.quality);
      }
      
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const initializeAudio = async () => {
    try {
      // Initialize audio context
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  // Loading screen
  if (appState.isLoading || authLoading) {
    return <LoadingScreen />;
  }

  // Maintenance mode
  if (appState.isMaintenance) {
    return <MaintenanceMode />;
  }

  // Protected route wrapper
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>;
  };

  // Auth route wrapper
  const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Epic Battle Arena - Multiplayer Battle Game</title>
        <meta name="description" content="Join epic multiplayer battles in real-time!" />
      </Helmet>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: theme.palette.background.default,
          overflow: 'hidden'
        }}
      >
        {/* Main Navigation */}
        {!appState.isGameActive && (
          <Navbar 
            showSidebar={appState.showSidebar}
            onToggleSidebar={() => setAppState(prev => ({ 
              ...prev, 
              showSidebar: !prev.showSidebar 
            }))}
          />
        )}

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <AnimatePresence>
            {appState.showSidebar && !appState.isGameActive && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Sidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Suspense fallback={
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%' 
                }}
              >
                <CircularProgress />
              </Box>
            }>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{ height: '100%', overflow: 'auto' }}
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/help" element={<HelpPage />} />

                    {/* Auth Routes */}
                    <Route path="/auth/login" element={
                      <AuthRoute>
                        <LoginPage />
                      </AuthRoute>
                    } />
                    <Route path="/auth/register" element={
                      <AuthRoute>
                        <RegisterPage />
                      </AuthRoute>
                    } />

                    {/* Protected Routes */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:userId" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/marketplace" element={
                      <ProtectedRoute>
                        <MarketplacePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/guild" element={
                      <ProtectedRoute>
                        <GuildPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/guild/:guildId" element={
                      <ProtectedRoute>
                        <GuildPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/tournaments" element={
                      <ProtectedRoute>
                        <TournamentPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />

                    {/* Game Routes */}
                    <Route path="/game/lobby" element={
                      <ProtectedRoute>
                        <GameLobbyPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/game/match/:matchId" element={
                      <ProtectedRoute>
                        <GameMatchPage />
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={
                      <ProtectedRoute>
                        <AdminPanelPage />
                      </ProtectedRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </Box>
        </Box>

        {/* Footer */}
        {!appState.isGameActive && <Footer />}

        {/* Game HUD */}
        {appState.isGameActive && isInGame && (
          <GameHUD 
            match={currentMatch}
            gameState={gameState}
          />
        )}

        {/* Global Overlays */}
        <NotificationCenter notifications={notifications.items} />
        
        {/* Chat Widget */}
        {isAuthenticated && !appState.isGameActive && (
          <ChatWidget />
        )}

        {/* Matchmaking Overlay */}
        {/* {matchmakingState.isSearching && (
          <MatchmakingOverlay 
            gameMode={matchmakingState.gameMode}
            estimatedTime={matchmakingState.estimatedTime}
            playersInQueue={matchmakingState.playersInQueue}
          />
        )} */}

        {/* Social Widgets */}
        {isAuthenticated && (
          <>
            <FriendsList />
            <PartyWidget />
            {user?.guild && <GuildPanel />}
          </>
        )}

        {/* Settings Modal */}
        {appState.showSettings && (
          <SettingsModal 
            open={appState.showSettings}
            onClose={() => setAppState(prev => ({ ...prev, showSettings: false }))}
          />
        )}

        {/* Update Notification */}
        <UpdateNotification />

        {/* Connection Status */}
        {!isConnected && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: 20,
              backgroundColor: 'error.main',
              color: 'error.contrastText',
              padding: '8px 16px',
              borderRadius: 1,
              zIndex: 9999
            }}
          >
            Connecting... ({connectionStatus})
          </Box>
        )}

        {/* Performance Monitor (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px',
              borderRadius: 1,
              fontSize: '12px',
              fontFamily: 'monospace',
              zIndex: 9999
            }}
          >
            FPS: {/* Add FPS counter */}<br />
            Ping: {networkStatus.ping}ms<br />
            Players: {networkStatus.onlinePlayers}
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default App;