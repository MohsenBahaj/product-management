import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Inventory2 } from '@mui/icons-material';

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50%',
          background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 40%, #4F46E5 100%)',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: -40, width: 200, height: 200,
          borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.3)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1.5, borderRadius: 2, display: 'flex' }}>
              <Inventory2 sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {t('app.name')}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.3 }}>
            {t('app.tagline')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Streamline your inventory, track products effortlessly, and manage categories with precision.
          </Typography>

          <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '📦', text: 'Full product lifecycle management' },
              { icon: '🏷️', text: 'Smart category organization' },
              { icon: '🔍', text: 'Instant search with history' },
              { icon: '🌐', text: 'Arabic & English support' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, px: 2, py: 1.25 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{icon}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 5 },
          bgcolor: 'background.default',
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
          <Inventory2 sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">{t('app.name')}</Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
