import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppThemeProvider } from './core/theme/ThemeContext';
import { AuthProvider } from './features/auth/context/AuthContext';
import { QueryProvider } from './core/query/QueryProvider';
import { AppRouter } from './core/router';
import './core/i18n';

export default function App() {
  const { i18n } = useTranslation();
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  return (
    <AppThemeProvider direction={direction}>
      <AuthProvider>
        <QueryProvider>
          <AppRouter />
        </QueryProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
