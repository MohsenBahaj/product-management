import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Card, CardContent, Typography, Button, Avatar,
  Divider, Chip, Skeleton,
} from '@mui/material';
import { Edit, Email, CalendarToday } from '@mui/icons-material';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { formatDate } from '@/core/utils/format';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{t('profile.title')}</Typography>
        <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate('/profile/edit')}>
          {t('profile.edit')}
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Avatar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user?.profile_image_url ?? undefined}
              sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2rem', mb: 1.5 }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
            <Chip label="Member" size="small" color="primary" variant="outlined" sx={{ mt: 0.75 }} />
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1.5, display: 'flex' }}>
                <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('profile.email')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{user?.email}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1.5, display: 'flex' }}>
                <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{t('profile.joined')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user?.created_at ? formatDate(user.created_at) : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Button variant="contained" fullWidth onClick={() => navigate('/profile/edit')} startIcon={<Edit />}>
            {t('profile.edit')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
