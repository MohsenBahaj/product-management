import { Card, CardMedia, CardContent, CardActions, Typography, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Visibility, Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/shared/types';
import StockChip from '@/shared/components/StockChip';
import PriceDisplay from '@/shared/components/PriceDisplay';

interface Props {
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProductCard({ product, onView, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={product.thumbnail_image_url ?? `https://placehold.co/400x300/E2E8F0/94A3B8?text=${encodeURIComponent(product.name[0] ?? 'P')}`}
          alt={product.name}
          sx={{ height: 180, objectFit: 'cover', bgcolor: 'action.hover' }}
        />
        {product.is_featured && (
          <Chip
            label={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: '0.8rem' }} />
                {t('products.featuredBadge')}
              </Box>
            }
            size="small"
            sx={{ position: 'absolute', top: 10, left: 10, bgcolor: '#F59E0B', color: '#fff',
              fontWeight: 600, fontSize: '0.7rem',
              '& .MuiChip-label': { display: 'flex', alignItems: 'center', px: 1 } }}
          />
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {product.category_name && (
            <Chip label={product.category_name} size="small" variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }} />
          )}
          <StockChip quantity={product.quantity} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary.main">
            <PriceDisplay price={product.price} />
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('products.quantity')}: {product.quantity}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 1.5, gap: 0.5 }}>
        <Tooltip title={t('products.details')}>
          <IconButton size="small" onClick={onView} color="primary"><Visibility fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('common.edit')}>
          <IconButton size="small" onClick={onEdit}><Edit fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton size="small" onClick={onDelete} color="error"><Delete fontSize="small" /></IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
