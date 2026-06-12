import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, CardMedia, CardActions,
  Typography, Button, Chip, IconButton, Tooltip, Skeleton, Alert,
} from '@mui/material';
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import { categoriesApi } from '../api/categoriesApi';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageHeader from '@/shared/components/PageHeader';
import { formatDate } from '@/core/utils/format';
import { getApiErrorMessage } from '@/core/api/client';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
  });

  const catList = categories ?? [];

  return (
    <Box>
      <PageHeader
        title={t('categories.title')}
        subtitle={`${catList.length} ${t('common.items')}`}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/categories/create')}>
            {t('categories.create')}
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{getApiErrorMessage(error)}</Alert>}

      <Grid container spacing={2.5}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
          : catList.length === 0
            ? (
              <Grid size={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CategoryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">{t('categories.noCategories')}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('categories.noCategoriesDesc')}</Typography>
                  <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }}
                    onClick={() => navigate('/categories/create')}>
                    {t('categories.create')}
                  </Button>
                </Box>
              </Grid>
            )
            : catList.map((cat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cat.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column',
                  '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                  {cat.image_url
                    ? <CardMedia component="img" image={cat.image_url} alt={cat.name}
                        sx={{ height: 140, objectFit: 'cover' }} />
                    : <Box sx={{ height: 140, bgcolor: 'primary.main', display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                        <CategoryIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
                      </Box>
                  }
                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{cat.name}</Typography>
                    {cat.description && (
                      <Typography variant="caption" color="text.secondary"
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cat.description}
                      </Typography>
                    )}
                    <Chip label={formatDate(cat.created_at)} size="small" variant="outlined"
                      sx={{ mt: 1, fontSize: '0.7rem' }} />
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                    <Tooltip title={t('common.edit')}>
                      <IconButton size="small" onClick={() => navigate(`/categories/${cat.id}/edit`)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(cat.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))
        }
      </Grid>

      <ConfirmDialog
        open={!!deleteId}
        title={t('categories.deleteConfirm')}
        description={t('categories.deleteConfirmDesc')}
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
