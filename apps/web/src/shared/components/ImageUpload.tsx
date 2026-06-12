import { useRef, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { CloudUpload, Close, Image as ImageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  label?: string;
  currentUrl?: string | null;
  onChange: (file: File) => void;
  onRemove?: () => void;
  loading?: boolean;
  accept?: string;
  hint?: string;
}

export default function ImageUpload({ label, currentUrl, onChange, onRemove, loading, hint }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const displayUrl = preview ?? currentUrl;

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
      )}
      {displayUrl ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Box
            component="img"
            src={displayUrl}
            alt="preview"
            sx={{ width: '100%', maxWidth: 280, height: 180, objectFit: 'cover', borderRadius: 2,
              border: '1px solid', borderColor: 'divider', display: 'block' }}
          />
          {(onRemove ?? true) && (
            <IconButton
              size="small"
              onClick={() => { setPreview(null); if (onRemove) onRemove(); }}
              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper',
                border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'error.light' } }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
          <Box
            sx={{ mt: 1, cursor: 'pointer', color: 'primary.main', fontSize: '0.8rem', fontWeight: 500 }}
            onClick={() => inputRef.current?.click()}
          >
            {t('profile.changePhoto')}
          </Box>
        </Box>
      ) : (
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: dragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: dragging ? 'action.hover' : 'transparent',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          {loading ? (
            <CircularProgress size={32} />
          ) : (
            <>
              <Box sx={{ mb: 1, color: 'text.secondary' }}>
                {displayUrl ? <ImageIcon sx={{ fontSize: 40 }} /> : <CloudUpload sx={{ fontSize: 40 }} />}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('products.dragDropThumbnail')}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {hint ?? t('products.imageFormats')}
              </Typography>
            </>
          )}
        </Box>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </Box>
  );
}
