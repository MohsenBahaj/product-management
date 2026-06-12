import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, TextField, Typography, Alert,
  InputAdornment, IconButton, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authApi } from '../api/authApi';
import { useAuthContext } from '../context/AuthContext';
import { queryClient } from '@/core/query/QueryProvider';
import { PROFILE_KEY } from '@/features/profile/hooks/useCurrentUser';
import { getApiErrorMessage } from '@/core/api/client';

const schema = z.object({
  email: z.string().min(1, 'required').email('invalidEmail'),
  password: z.string().min(1, 'required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await authApi.login(data);
      setAuth(res.user, res.accessToken, res.refreshToken);
      queryClient.setQueryData(PROFILE_KEY, res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{t('auth.welcome')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>{t('auth.signInSubtitle')}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('auth.email')}</Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="you@company.com"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email && t(`validation.${errors.email.message}`)}
            slotProps={{ htmlInput: { 'aria-label': t('auth.email') } }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('auth.password')}</Typography>
            <Typography component="span" variant="caption"
              sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>
              {t('auth.forgotPassword')}
            </Typography>
          </Box>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password && t(`validation.${errors.password.message}`)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 0.5 }}
        >
          {isSubmitting ? t('common.loading') : t('auth.signIn')}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>or</Typography>
      </Divider>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {t('auth.noAccount')}{' '}
        <Typography component="span" variant="body2"
          onClick={() => navigate('/register')}
          sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          {t('auth.createOne')}
        </Typography>
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {['en', 'ar'].map((lang) => (
          <Typography
            key={lang}
            variant="caption"
            sx={{ cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase',
              color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            onClick={() => { void (async () => { const { default: i18n } = await import('@/core/i18n'); i18n.changeLanguage(lang); })(); }}
          >
            {lang === 'en' ? 'EN' : 'AR'}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
