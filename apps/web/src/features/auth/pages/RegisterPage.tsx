import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, TextField, Typography, Alert,
  InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authApi } from '../api/authApi';
import { useAuthContext } from '../context/AuthContext';
import { queryClient } from '@/core/query/QueryProvider';
import { PROFILE_KEY } from '@/features/profile/hooks/useCurrentUser';
import { getApiErrorMessage } from '@/core/api/client';

const schema = z.object({
  name: z.string().min(2, 'minLength').max(100, 'maxLength'),
  email: z.string().min(1, 'required').email('invalidEmail'),
  password: z.string().min(6, 'minLength'),
  confirmPassword: z.string().min(1, 'required'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'passwordMatch', path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthContext();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ name, email, password }: FormData) => {
    setError('');
    try {
      const res = await authApi.register({ name, email, password });
      setAuth(res.user, res.accessToken, res.refreshToken);
      queryClient.setQueryData(PROFILE_KEY, res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{t('auth.createAccount')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>{t('auth.registerSubtitle')}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('auth.name')}</Typography>
          <TextField
            fullWidth placeholder="Alice Johnson"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name && t(`validation.${errors.name.message}`, { count: 2 })}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('auth.email')}</Typography>
          <TextField
            fullWidth type="email" placeholder="you@company.com"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email && t(`validation.${errors.email.message}`)}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('auth.password')}</Typography>
          <TextField
            fullWidth type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password && t(`validation.${errors.password.message}`, { count: 6 })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass((v) => !v)} edge="end">
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('auth.confirmPassword')}</Typography>
          <TextField
            fullWidth type="password" placeholder="Repeat password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword && t(`validation.${errors.confirmPassword.message}`)}
          />
        </Box>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting} sx={{ mt: 0.5 }}>
          {isSubmitting ? t('common.loading') : t('auth.signUp')}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        {t('auth.hasAccount')}{' '}
        <Typography component="span" variant="body2"
          onClick={() => navigate('/login')}
          sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          {t('auth.signInLink')}
        </Typography>
      </Typography>
    </Box>
  );
}
