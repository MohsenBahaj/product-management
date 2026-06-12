import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, Avatar, Skeleton,
} from '@mui/material';
import { ArrowBack, Save, PhotoCamera } from '@mui/icons-material';
import { profileApi } from '../api/profileApi';
import { useCurrentUser, PROFILE_KEY } from '../hooks/useCurrentUser';
import { getApiErrorMessage } from '@/core/api/client';

const schema = z.object({
  name: z.string().min(2, 'minLength').max(100, 'maxLength'),
});
type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: profileApi.updateMe,
    onSuccess: (updated) => {
      qc.setQueryData(PROFILE_KEY, updated);
      setSuccess(t('success.profileUpdated'));
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const imageMutation = useMutation({
    mutationFn: profileApi.uploadImage,
    onSuccess: (updated) => {
      qc.setQueryData(PROFILE_KEY, updated);
      setSuccess(t('success.imageUploaded'));
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    imageMutation.mutate(file);
  };

  if (isLoading) return <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3, maxWidth: 560, mx: 'auto' }} />;

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{t('profile.edit')}</Typography>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={imagePreview ?? user?.profile_image_url ?? undefined}
              sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: '1.75rem' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box
              component="label"
              htmlFor="profile-image-input"
              sx={{
                position: 'absolute', bottom: 0, right: 0,
                bgcolor: 'primary.main', borderRadius: '50%', p: 0.6,
                cursor: 'pointer', display: 'flex',
                border: '2px solid', borderColor: 'background.paper',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <PhotoCamera sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <input id="profile-image-input" type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleImageChange} />
          </Box>
          {imageMutation.isPending && (
            <Typography variant="caption" color="text.secondary">{t('common.loading')}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">{t('profile.changePhoto')}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit((d) => updateMutation.mutate(d))} noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('profile.name')}</Typography>
              <TextField fullWidth {...register('name')} error={!!errors.name}
                helperText={errors.name && t(`validation.${errors.name.message}`, { count: 2 })} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t('profile.email')}</Typography>
              <TextField fullWidth value={user?.email ?? ''} disabled />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('common.loading') : t('profile.saveChanges')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
