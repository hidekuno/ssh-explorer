import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
        // Dark Mode Palette
        background: {
          default: '#0a1929',
          paper: '#132f4c',
        },
        primary: {
          main: '#3399ff',
          light: '#66b2ff',
          dark: '#0059b2',
          contrastText: '#fff',
        },
        text: {
          primary: '#fff',
          secondary: 'rgba(255, 255, 255, 0.7)',
        },
      }
      : {
        // Light Mode Palette
        background: {
          default: '#f3f6f9',
          paper: '#ffffff',
        },
        primary: {
          main: '#007FFF',
          light: '#66b2ff',
          dark: '#0059b2',
          contrastText: '#fff',
        },
        text: {
          primary: '#1a2027',
          secondary: '#3e5060',
        },
      }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? alpha('#132f4c', 0.6) : '#ffffff',
          backdropFilter: mode === 'dark' ? 'blur(10px)' : 'none',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: mode === 'dark' ? undefined : '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? '#3399ff' : '#007FFF',
            },
          },
        },
      },
    },
  },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
