import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Alert, InputAdornment, Skeleton, Divider,
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

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: String(product.price),
        quantity: String(product.quantity),
        description: product.description ?? '',
        categoryId: product.category_id ?? '',
        is_featured: product.is_featured,
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (form: FormData) => {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('quantity', form.quantity);
      if (form.description) fd.append('description', form.description);
      if (form.categoryId) fd.append('categoryId', form.categoryId);
      fd.append('is_featured', String(form.is_featured));
      if (thumbnail) fd.append('thumbnail_image', thumbnail);
      return productsApi.update(id!, fd);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      navigate(`/products/${id}`);
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err)),
  });

  if (isLoading) return <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />;

  return (
    <Box>
      <PageHeader
        title={t('products.edit')}
        actions={
          <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
        }
      />

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>{t('products.details')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField label={t('products.name')} fullWidth required
                    {...register('name')} error={!!errors.name}
                    helperText={errors.name && t(`validation.${errors.name.message}`)} />

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
                    {...register('description')} />

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
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} color="primary" />}
                        label={t('products.featured')}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{t('products.thumbnailImage')}</Typography>
                <ImageUpload
                  currentUrl={product?.thumbnail_image_url}
                  onChange={(f) => setThumbnail(f)}
                  onRemove={() => setThumbnail(null)}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={mutation.isPending} size="large">
            {mutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
