import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Alert, InputAdornment, Divider,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import ImageUpload from '@/shared/components/ImageUpload';
import PageHeader from '@/shared/components/PageHeader';
import RiyalIcon from '@/shared/components/RiyalIcon';
import { getApiErrorMessage } from '@/core/api/client';

const schema = z.object({
  name: z.string().min(1, 'required').max(255, 'maxLength'),
  price: z.string().min(1, 'required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'nonNegative'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'nonNegative'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  is_featured: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function CreateProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [thumbnailError, setThumbnailError] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: '0', is_featured: false },
  });

  const mutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      navigate(`/products/${product.id}`);
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err)),
  });

  const onSubmit = (data: FormData) => {
    if (!thumbnail) { setThumbnailError(true); return; }
    setThumbnailError(false);
    setSubmitError('');
    const form = new FormData();
    form.append('name', data.name);
    form.append('price', data.price);
    form.append('quantity', data.quantity);
    if (data.description) form.append('description', data.description);
    if (data.categoryId) form.append('categoryId', data.categoryId);
    form.append('is_featured', String(data.is_featured));
    form.append('thumbnail_image', thumbnail);
    mutation.mutate(form);
  };

  return (
    <Box>
      <PageHeader
        title={t('products.create')}
        actions={
          <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
        }
      />

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Details */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
                  {t('products.details')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField label={t('products.name')} fullWidth required
                    {...register('name')} error={!!errors.name}
                    helperText={errors.name && t(`validation.${errors.name.message}`, { count: 255 })} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label={t('products.price')} fullWidth required type="number"
                        {...register('price')} error={!!errors.price}
                        helperText={errors.price && t(`validation.${errors.price.message}`)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><RiyalIcon size={14} /></InputAdornment> } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label={t('products.quantity')} fullWidth type="number"
                        {...register('quantity')} error={!!errors.quantity}
                        helperText={errors.quantity && t(`validation.${errors.quantity.message}`)} />
                    </Grid>
                  </Grid>

                  <TextField label={t('products.description')} fullWidth multiline rows={4}
                    {...register('description')} placeholder="Optional product description…" />

                  <FormControl fullWidth>
                    <InputLabel>{t('products.category')}</InputLabel>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label={t('products.category')} value={field.value ?? ''}>
                          <MenuItem value=""><em>{t('common.optional')}</em></MenuItem>
                          {(categories ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                      )}
                    />
                  </FormControl>

                  <Divider />

                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <FormControlLabel
                          control={<Switch checked={field.value} onChange={field.onChange} color="primary" />}
                          label={<Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('products.featured')}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('products.featuredDesc')}</Typography>
                          </Box>}
                          sx={{ alignItems: 'flex-start', ml: 0 }}
                        />
                      </Box>
                    )}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Images */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{t('products.thumbnailImage')} *</Typography>
                {thumbnailError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{t('products.thumbnailRequired')}</Alert>
                )}
                <ImageUpload
                  onChange={(f) => { setThumbnail(f); setThumbnailError(false); }}
                  onRemove={() => setThumbnail(null)}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={mutation.isPending} size="large">
            {mutation.isPending ? t('common.loading') : t('products.create')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
