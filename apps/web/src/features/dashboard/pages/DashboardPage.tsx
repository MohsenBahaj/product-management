import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Skeleton, IconButton, alpha,
} from '@mui/material';
import {
  Inventory2, Category, Star, Warning, Add,
  ArrowForward, MoreVert, TrendingUp,
} from '@mui/icons-material';
import { productsApi } from '@/features/products/api/productsApi';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { formatDate } from '@/core/utils/format';
import StockChip from '@/shared/components/StockChip';
import PriceDisplay from '@/shared/components/PriceDisplay';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function StatCard({ title, value, icon, color, sub }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
            {sub && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">{sub}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(color, 0.12) }}>
            <Box sx={{ color }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => productsApi.getAll({ limit: 8, sortBy: 'created_at', order: 'desc' }),
  });

  const { data: productsTotal } = useQuery({
    queryKey: ['products', 'total'],
    queryFn: () => productsApi.getAll({ limit: 1 }),
  });

  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured-count'],
    queryFn: () => productsApi.getAll({ featured: 'true', limit: 1 }),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['products', 'low-stock-count'],
    queryFn: () => productsApi.getAll({ minQuantity: 1, maxQuantity: 5, limit: 1 }),
  });

  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const total = productsTotal?.pagination.total ?? 0;
  const featured = featuredData?.pagination.total ?? 0;
  const lowStock = lowStockData?.pagination.total ?? 0;
  const recentProducts = productsData?.data ?? [];
  const catList = categories ?? [];

  const stats = [
    { title: t('dashboard.totalProducts'), value: total, icon: <Inventory2 />, color: '#4F46E5',
      sub: `${recentProducts.length} ${t('dashboard.addedRecently')}` },
    { title: t('dashboard.totalCategories'), value: catList.length, icon: <Category />, color: '#7C3AED',
      sub: `${t('dashboard.viewAllCategories')}` },
    { title: t('dashboard.featuredProducts'), value: featured, icon: <Star />, color: '#F59E0B',
      sub: t('dashboard.highlighted') },
    { title: t('dashboard.lowStock'), value: lowStock,
      icon: <Warning />, color: '#EF4444', sub: t('dashboard.itemsNeedAttention') },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{t('dashboard.title')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatDate(new Date().toISOString())}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/products/create')}>
          {t('dashboard.addProduct')}
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.title}>
            {loadingProducts || loadingCats
              ? <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
              : <StatCard {...s} />}
          </Grid>
        ))}
      </Grid>

      {/* Categories strip */}
      <Card sx={{ mb: 3.5 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('dashboard.browseCategories')}</Typography>
            <Button size="small" endIcon={<ArrowForward fontSize="small" />}
              onClick={() => navigate('/categories')} sx={{ fontWeight: 600 }}>
              {t('common.viewAll')}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {loadingCats
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" width={120} height={36} />)
              : catList.length === 0
                ? <Typography variant="body2" color="text.secondary">{t('dashboard.noCategories')}</Typography>
                : catList.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                    avatar={cat.image_url
                      ? <Avatar src={cat.image_url} sx={{ width: 24, height: 24 }} />
                      : <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
                          {cat.name[0].toUpperCase()}
                        </Avatar>}
                    sx={{ fontWeight: 500, cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}
                  />
                ))
            }
          </Box>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <Grid container spacing={2.5}>
        {/* Recent products table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ pb: '0 !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('dashboard.recentlyAdded')}</Typography>
                <Button size="small" endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/products')} sx={{ fontWeight: 600 }}>
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('products.name')}</TableCell>
                    <TableCell>{t('products.category')}</TableCell>
                    <TableCell>{t('products.price')}</TableCell>
                    <TableCell>{t('products.quantity')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingProducts
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_c, j) => (
                          <TableCell key={j}><Skeleton variant="text" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                    : recentProducts.length === 0
                      ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">{t('dashboard.noProducts')}</Typography>
                          </TableCell>
                        </TableRow>
                      )
                      : recentProducts.map((product) => (
                        <TableRow key={product.id} hover sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product.id}`)}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={product.thumbnail_image_url ?? undefined}
                                variant="rounded"
                                sx={{ width: 36, height: 36, bgcolor: 'action.hover' }}
                              >
                                <Inventory2 fontSize="small" sx={{ color: 'text.secondary' }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 500, maxWidth: 160 }}>
                                  {product.name}
                                </Typography>
                                {product.is_featured && (
                                  <Star sx={{ fontSize: 12, color: '#F59E0B' }} />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {product.category_name
                              ? <Chip label={product.category_name} size="small" variant="outlined" />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} color="primary.main">
                              <PriceDisplay price={product.price} />
                            </Typography>
                          </TableCell>
                          <TableCell><StockChip quantity={product.quantity} /></TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/edit`); }}>
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Quick actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{t('dashboard.quickActions')}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button variant="contained" fullWidth startIcon={<Add />} size="large"
                  onClick={() => navigate('/products/create')}>
                  {t('dashboard.addProduct')}
                </Button>
                <Button variant="outlined" color="secondary" fullWidth startIcon={<Add />} size="large"
                  onClick={() => navigate('/categories/create')}>
                  {t('dashboard.addCategory')}
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Inventory2 />} size="large"
                  onClick={() => navigate('/products')}>
                  {t('dashboard.viewAllProducts')}
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Category />} size="large"
                  onClick={() => navigate('/categories')}>
                  {t('dashboard.viewAllCategories')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
