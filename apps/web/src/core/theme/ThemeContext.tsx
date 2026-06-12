import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { storage } from '../utils/storage';
import { THEME_MODE_KEY } from '../constants';

type ThemeMode = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeCtx = createContext<ThemeContextValue>({ mode: 'light', toggleTheme: () => {} });

export function AppThemeProvider({ children, direction }: { children: ReactNode; direction: Direction }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = storage.get(THEME_MODE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      storage.set(THEME_MODE_KEY, next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          mode,
          primary: { main: '#4F46E5', light: '#6366F1', dark: '#3730A3', contrastText: '#ffffff' },
          secondary: { main: '#7C3AED', light: '#8B5CF6', dark: '#5B21B6', contrastText: '#ffffff' },
          success: { main: '#10B981', light: '#34D399', dark: '#059669' },
          warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
          error: { main: '#EF4444', light: '#F87171', dark: '#B91C1C' },
          info: { main: '#0EA5E9', light: '#38BDF8', dark: '#0369A1' },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F172A',
            paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F1F5F9',
            secondary: mode === 'light' ? '#475569' : '#94A3B8',
          },
          divider: mode === 'light' ? '#E2E8F0' : '#334155',
        },
        shape: { borderRadius: 8 },
        typography: {
          fontFamily: direction === 'rtl'
            ? '"Cairo", "Plus Jakarta Sans", "Inter", sans-serif'
            : '"Plus Jakarta Sans", "Inter", sans-serif',
          h1: { fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          h2: { fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          h3: { fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          h4: { fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          h5: { fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          h6: { fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' },
          body1: { fontFamily: '"Inter", sans-serif', fontSize: '0.9375rem' },
          body2: { fontFamily: '"Inter", sans-serif', fontSize: '0.875rem' },
          caption: { fontFamily: '"Inter", sans-serif', fontSize: '0.75rem' },
          button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 8, fontWeight: 600, textTransform: 'none', boxShadow: 'none',
                '&:hover': { boxShadow: 'none' } },
              sizeLarge: { height: 44, fontSize: '0.9375rem' },
              sizeMedium: { height: 38 },
              sizeSmall: { height: 32 },
              startIcon: {
                marginRight: direction === 'rtl' ? -4 : 8,
                marginLeft: direction === 'rtl' ? 8 : -4,
                '&.MuiButton-iconSizeSmall': {
                  marginRight: direction === 'rtl' ? -2 : 4,
                  marginLeft: direction === 'rtl' ? 4 : -2,
                },
              },
              endIcon: {
                marginLeft: direction === 'rtl' ? -4 : 8,
                marginRight: direction === 'rtl' ? 8 : -4,
                '&.MuiButton-iconSizeSmall': {
                  marginLeft: direction === 'rtl' ? -2 : 4,
                  marginRight: direction === 'rtl' ? 4 : -2,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#334155'}`,
                boxShadow: mode === 'light'
                  ? '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)'
                  : '0 1px 3px 0 rgba(0,0,0,0.3)',
              },
            },
          },
          MuiTextField: {
            defaultProps: { size: 'small', variant: 'outlined' },
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5', borderWidth: 2 },
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
          MuiChip: { styleOverrides: { root: { fontWeight: 500, fontFamily: '"Inter", sans-serif' } } },
          MuiTableCell: {
            styleOverrides: {
              head: { fontWeight: 600, fontSize: '0.8125rem', color: mode === 'light' ? '#475569' : '#94A3B8',
                fontFamily: '"Inter", sans-serif' },
              body: { fontSize: '0.875rem', fontFamily: '"Inter", sans-serif' },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#1E1B4B' : '#0F0E2E',
                color: '#ffffff',
                borderRight: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1E293B',
                color: mode === 'light' ? '#0F172A' : '#F1F5F9',
                boxShadow: 'none',
                borderBottom: `1px solid ${mode === 'light' ? '#E2E8F0' : '#334155'}`,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
        },
      }),
    [mode, direction]
  );

  return (
    <ThemeCtx.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeCtx);
