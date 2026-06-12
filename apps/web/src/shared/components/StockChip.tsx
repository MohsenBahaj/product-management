import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getStockStatus } from '@/core/utils/format';

export default function StockChip({ quantity }: { quantity: number }) {
  const { t } = useTranslation();
  const status = getStockStatus(quantity);
  const map = {
    ok:  { label: t('products.inStock'),    color: 'success' },
    low: { label: t('products.lowStock'),   color: 'warning' },
    out: { label: t('products.outOfStock'), color: 'error'   },
  } as const;
  const { label, color } = map[status];
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}
