import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

import App from './App';
import { store } from './store';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import './locales/i18n';
import './styles/global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b6b',
      light: '#ff9999',
      dark: '#cc5555',
    },
    secondary: {
      main: '#4ecdc4',
      light: '#7edddd',
      dark: '#3ea49d',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ff4444',
    },
    warning: {
      main: '#ffaa00',
    },
    info: {
      main: '#00aaff',
    },
    success: {
      main: '#00ff88',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// Root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              autoHideDuration={5000}
            >
              <AudioProvider>
                <SocketProvider>
                  <GameProvider>
                    <App />
                  </GameProvider>
                </SocketProvider>
              </AudioProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);