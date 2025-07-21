import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { store, persistor } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameProvider } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import { PerformanceMonitor } from './components/PerformanceMonitor';

import './styles/index.css';
import 'virtual:windi.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create Material-UI theme for gaming interface
const gameTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ecdc4',
      light: '#7df3eb',
      dark: '#1e9e9a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9999',
      dark: '#cc3333',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0277bd',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Exo 2", "Roboto", "Arial", sans-serif',
    h1: {
      fontFamily: '"Orbitron", monospace',
      fontWeight: 900,
      fontSize: '3.5rem',
      background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontFamily: '"Orbitron", monospace',
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h3: {
      fontFamily: '"Orbitron", monospace',
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          padding: '12px 24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.6s ease',
          },
          '&:hover::before': {
            transform: 'translateX(100%)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
          boxShadow: '0 4px 20px rgba(78, 205, 196, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5fd4cd, #4ec5d8)',
            boxShadow: '0 6px 30px rgba(78, 205, 196, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff7979, #fd6c6c)',
            boxShadow: '0 6px 30px rgba(255, 107, 107, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(78, 205, 196, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(78, 205, 196, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(78, 205, 196, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(78, 205, 196, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4ecdc4',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(15, 15, 35, 0.95), rgba(26, 26, 46, 0.95))',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(78, 205, 196, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(78, 205, 196, 0.3)',
        },
      },
    },
  },
});

// Loading component for PersistGate
const LoadingComponent = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e)',
    color: '#4ecdc4',
    fontSize: '1.2rem',
    fontFamily: '"Exo 2", sans-serif',
  }}>
    <div>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(78, 205, 196, 0.3)',
          borderTop: '3px solid #4ecdc4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }}></div>
        Loading Game Data...
      </div>
    </div>
  </div>
);

// Performance monitoring
const enablePerformanceMonitoring = import.meta.env.DEV;

// Initialize app
function initializeApp() {
  // Hide loading screen
  if (typeof window !== 'undefined' && window.hideLoadingScreen) {
    setTimeout(() => {
      window.hideLoadingScreen();
    }, 100);
  }

  // Initialize game analytics
  if (typeof window !== 'undefined' && window.gameAnalytics) {
    window.gameAnalytics.initialized = true;
    window.gameAnalytics.track('app_initialized', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
      },
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingComponent />} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={gameTheme}>
                <CssBaseline />
                <AudioProvider>
                  <GameProvider>
                    <BrowserRouter>
                      {enablePerformanceMonitoring && <PerformanceMonitor />}
                      <App />
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
                            color: '#ffffff',
                            border: '1px solid rgba(78, 205, 196, 0.3)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '8px',
                            fontFamily: '"Exo 2", sans-serif',
                          },
                          success: {
                            iconTheme: {
                              primary: '#66bb6a',
                              secondary: '#ffffff',
                            },
                          },
                          error: {
                            iconTheme: {
                              primary: '#f44336',
                              secondary: '#ffffff',
                            },
                          },
                        }}
                      />
                    </BrowserRouter>
                  </GameProvider>
                </AudioProvider>
              </ThemeProvider>
              {import.meta.env.DEV && (
                <ReactQueryDevtools 
                  initialIsOpen={false}
                  position="bottom-right"
                />
              )}
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize app after render
initializeApp();

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept();
}