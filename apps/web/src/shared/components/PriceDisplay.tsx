import { Box } from '@mui/material';
import { formatPrice } from '@/core/utils/format';
import RiyalIcon from './RiyalIcon';

interface Props {
  price: number;
}

export default function PriceDisplay({ price }: Props) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <RiyalIcon />
      {formatPrice(price)}
    </Box>
  );
}
