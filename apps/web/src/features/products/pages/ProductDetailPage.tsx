import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Skeleton, Alert, ImageList, ImageListItem, Divider,
} from '@mui/material';
import { Edit, Delete, ArrowBack, Star, Category } from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import StockChip from '@/shared/components/StockChip';
import { formatDate } from '@/core/utils/format';
import PriceDisplay from '@/shared/components/PriceDisplay';
import { getApiErrorMessage } from '@/core/api/client';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getOne(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/products', { replace: true });
    },
  });

  if (isLoading) return (
    <Box>
      <Skeleton variant="rounded" height={400} sx={{ mb: 2, borderRadius: 3 }} />
      <Grid container spacing={2}><Grid size={{ xs: 12, md: 8 }}>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      </Grid></Grid>
    </Box>
  );

  if (error || !product) return (
    <Alert severity="error">{error ? getApiErrorMessage(error) : t('errors.notFound')}</Alert>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined" size="small">
          {t('common.back')}
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>{product.name}</Typography>
        <Button startIcon={<Edit />} variant="outlined" onClick={() => navigate(`/products/${id}/edit`)}>
          {t('common.edit')}
        </Button>
        <Button startIcon={<Delete />} variant="outlined" color="error" onClick={() => setConfirmDelete(true)}>
          {t('common.delete')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left: image + gallery */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <Box
              component="img"
              src={product.thumbnail_image_url ?? `https://placehold.co/600x400/E2E8F0/94A3B8?text=${product.name[0]}`}
              alt={product.name}
              sx={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
            />
            {product.images && product.images.length > 0 && (
              <CardContent sx={{ pt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  {t('products.gallery')}
                </Typography>
                <ImageList cols={4} gap={6} sx={{ m: 0 }}>
                  {product.images.map((img) => (
                    <ImageListItem key={img.id}>
                      <img src={img.image_url} alt="" style={{ borderRadius: 6, height: 60, objectFit: 'cover' }} />
                    </ImageListItem>
                  ))}
                </ImageList>
              </CardContent>
            )}
          </Card>
        </Grid>

        {/* Right: details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {product.category_name && (
                  <Chip icon={<Category fontSize="small" />} label={product.category_name} size="small" variant="outlined" />
                )}
                {product.is_featured && (
                  <Chip icon={<Star sx={{ fontSize: '0.9rem !important' }} />} label={t('products.featured')}
                    size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
                )}
                <StockChip quantity={product.quantity} />
              </Box>

              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                <PriceDisplay price={product.price} />
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>
                    {t('products.quantity')}
                  </Typography>
                  <Typography variant="body2">{product.quantity} units</Typography>
                </Box>
                {product.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {t('products.description')}
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{product.description}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>
                    {t('common.createdAt')}
                  </Typography>
                  <Typography variant="body2">{formatDate(product.created_at)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>
                    {t('common.updatedAt')}
                  </Typography>
                  <Typography variant="body2">{formatDate(product.updated_at)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmDelete}
        title={t('products.deleteConfirm')}
        description={t('products.deleteConfirmDesc')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setConfirmDelete(false)}
      />
    </Box>
  );
}
