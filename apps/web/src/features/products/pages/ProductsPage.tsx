import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Button, TextField, MenuItem, Select, FormControl,
  InputLabel, InputAdornment, Typography, Pagination, Skeleton,
  Alert, Collapse, Chip, Stack,
} from '@mui/material';
import { Add, Search, FilterList, Clear } from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import ProductCard from '../components/ProductCard';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageHeader from '@/shared/components/PageHeader';
import RiyalIcon from '@/shared/components/RiyalIcon';
import { getApiErrorMessage } from '@/core/api/client';
import type { ProductFilters } from '@/shared/types';

const LIMIT = 12;

export default function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get('page') ?? 1);
  const filters: ProductFilters = {
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) ?? 'created_at',
    order: (searchParams.get('order') as 'asc' | 'desc') ?? 'desc',
    featured: searchParams.get('featured') === 'true' ? 'true' : undefined,
    minPrice: searchParams.get('minPrice') ?? undefined,
    maxPrice: searchParams.get('maxPrice') ?? undefined,
    page,
    limit: LIMIT,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: () => productsApi.getAll(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
    },
  });

  const setParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = () => setSearchParams({ page: '1' });

  const activeFilters = [
    filters.search && `"${filters.search}"`,
    filters.categoryId && categories?.find((c) => c.id === filters.categoryId)?.name,
    filters.featured === 'true' && t('products.featuredOnly'),
    (filters.minPrice ?? filters.maxPrice) && `Price: ${filters.minPrice ?? 0}–${filters.maxPrice ?? '∞'}`,
  ].filter(Boolean);

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const sortOptions = [
    { value: 'created_at_desc', label: t('products.sortNewest') },
    { value: 'created_at_asc', label: t('products.sortOldest') },
    { value: 'price_asc', label: t('products.sortPriceLow') },
    { value: 'price_desc', label: t('products.sortPriceHigh') },
    { value: 'name_asc', label: t('products.sortNameAZ') },
  ];
  const currentSort = `${filters.sortBy ?? 'created_at'}_${filters.order ?? 'desc'}`;

  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split('_');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sortBy', sortBy);
      next.set('order', order);
      next.set('page', '1');
      return next;
    });
  };

  return (
    <Box>
      <PageHeader
        title={t('products.title')}
        subtitle={pagination ? `${pagination.total} ${t('common.items')}` : undefined}
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/products/create')}>
            {t('products.create')}
          </Button>
        }
      />

      {/* Search & filter bar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <TextField
          placeholder={t('products.search')}
          size="small"
          value={filters.search ?? ''}
          onChange={(e) => setParam('search', e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('products.allCategories')}</InputLabel>
          <Select
            label={t('products.allCategories')}
            value={filters.categoryId ?? ''}
            onChange={(e) => setParam('categoryId', e.target.value)}
          >
            <MenuItem value="">{t('products.allCategories')}</MenuItem>
            {(categories ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('common.sortBy')}</InputLabel>
          <Select label={t('common.sortBy')} value={currentSort} onChange={(e) => handleSortChange(e.target.value)}>
            {sortOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>

        <Button
          variant={filtersOpen ? 'contained' : 'outlined'}
          startIcon={<FilterList />}
          onClick={() => setFiltersOpen((v) => !v)}
          size="small"
          sx={{ height: 40 }}
        >
          {t('common.filters')}
        </Button>

        {activeFilters.length > 0 && (
          <Button startIcon={<Clear />} size="small" onClick={clearFilters} sx={{ height: 40 }}>
            {t('common.clearFilters')}
          </Button>
        )}
      </Box>

      {/* Extended filters */}
      <Collapse in={filtersOpen}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap', p: 2,
          bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            label={t('products.minPrice')} type="number" size="small" sx={{ width: 140 }}
            value={filters.minPrice ?? ''} onChange={(e) => setParam('minPrice', e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><RiyalIcon size={14} /></InputAdornment> } }}
          />
          <TextField
            label={t('products.maxPrice')} type="number" size="small" sx={{ width: 140 }}
            value={filters.maxPrice ?? ''} onChange={(e) => setParam('maxPrice', e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><RiyalIcon size={14} /></InputAdornment> } }}
          />
          <Button
            variant={filters.featured === 'true' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setParam('featured', filters.featured === 'true' ? '' : 'true')}
            sx={{ height: 40 }}
          >
            ⭐ {t('products.featuredOnly')}
          </Button>
        </Box>
      </Collapse>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {activeFilters.map((f) => (
            <Chip key={String(f)} label={String(f)} size="small" onDelete={clearFilters} />
          ))}
        </Stack>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{getApiErrorMessage(error)}</Alert>
      )}

      {/* Grid */}
      <Grid container spacing={2.5}>
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
          : products.length === 0
            ? (
              <Grid size={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">{t('products.noProducts')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('products.noProductsDesc')}
                  </Typography>
                  <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }}
                    onClick={() => navigate('/products/create')}>
                    {t('products.create')}
                  </Button>
                </Box>
              </Grid>
            )
            : products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <ProductCard
                  product={product}
                  onView={() => navigate(`/products/${product.id}`)}
                  onEdit={() => navigate(`/products/${product.id}/edit`)}
                  onDelete={() => setDeleteId(product.id)}
                />
              </Grid>
            ))
        }
      </Grid>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, p) => setParam('page', String(p))}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t('products.deleteConfirm')}
        description={t('products.deleteConfirmDesc')}
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
