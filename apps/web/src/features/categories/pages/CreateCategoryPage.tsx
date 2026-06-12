import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Alert } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { categoriesApi } from '../api/categoriesApi';
import ImageUpload from '@/shared/components/ImageUpload';
import PageHeader from '@/shared/components/PageHeader';
import { getApiErrorMessage } from '@/core/api/client';

const schema = z.object({
  name: z.string().min(1, 'required').max(255, 'maxLength'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [image, setImage] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
      navigate('/categories');
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => {
    setSubmitError('');
    const form = new FormData();
    form.append('name', data.name);
    if (data.description) form.append('description', data.description);
    if (image) form.append('image', image);
    mutation.mutate(form);
  };

  return (
    <Box>
      <PageHeader
        title={t('categories.create')}
        actions={<Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>{t('common.back')}</Button>}
      />

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>Category Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField label={t('categories.name')} fullWidth required
                    {...register('name')} error={!!errors.name}
                    helperText={errors.name && t(`validation.${errors.name.message}`)} />
                  <TextField label={t('categories.description')} fullWidth multiline rows={4}
                    {...register('description')} placeholder={`${t('common.optional')} — describe this category`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{t('categories.image')}</Typography>
                <ImageUpload onChange={(f) => setImage(f)} onRemove={() => setImage(null)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={mutation.isPending} size="large">
            {mutation.isPending ? t('common.loading') : t('categories.create')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
