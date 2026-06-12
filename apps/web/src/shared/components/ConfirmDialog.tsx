import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box,
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel, loading, onConfirm, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'error.light', p: 1, borderRadius: '50%', display: 'flex' }}>
            <WarningAmber sx={{ color: 'error.dark', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
      </DialogTitle>
      {description && (
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>{t('common.cancel')}</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          {loading ? t('common.loading') : (confirmLabel ?? t('common.delete'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
