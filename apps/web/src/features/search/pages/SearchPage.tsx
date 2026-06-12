import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, TextField, Typography, InputAdornment,
  IconButton, List, ListItem, ListItemText, ListItemButton,
  Chip, Button, Divider, Skeleton, Alert,
} from '@mui/material';
import { Search as SearchIcon, Close, History, Clear } from '@mui/icons-material';
import { useDebounce } from '@/core/hooks/useDebounce';
import { productsApi } from '@/features/products/api/productsApi';
import { searchApi } from '../api/searchApi';
import ProductCard from '@/features/products/components/ProductCard';
import { getApiErrorMessage } from '@/core/api/client';
import type { SearchHistoryItem } from '@/shared/types';

export default function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const debouncedQuery = useDebounce(input, 400);

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => searchApi.getHistory(),
  });

  const { data: results, isLoading: loadingResults, error } = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => productsApi.getAll({ search: debouncedQuery, limit: 12 }),
    enabled: debouncedQuery.length > 1,
  });

  const clearMutation = useMutation({
    mutationFn: searchApi.clearAll,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['searchHistory'] }),
  });

  const handleHistoryClick = useCallback((term: string) => {
    setInput(term);
  }, []);

  const products = results?.data ?? [];
  const historyList: SearchHistoryItem[] = history ?? [];
  const showResults = debouncedQuery.length > 1;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>{t('search.title')}</Typography>

      {/* Search bar */}
      <Box sx={{ mb: 3, maxWidth: 640 }}>
        <TextField
          fullWidth
          placeholder={t('search.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: input ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setInput('')}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              sx: { borderRadius: 3, bgcolor: 'background.paper' },
            },
          }}
          size="medium"
        />
      </Box>

      {/* Search history */}
      {!showResults && (
        <Box sx={{ maxWidth: 640 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{t('search.recentSearches')}</Typography>
            {historyList.length > 0 && (
              <Button size="small" startIcon={<Clear />} onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}>
                {t('search.clearAll')}
              </Button>
            )}
          </Box>
          {loadingHistory
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={48} />)
            : historyList.length === 0
              ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <History sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">{t('search.noHistory')}</Typography>
                </Box>
              )
              : (
                <List sx={{ p: 0 }}>
                  {historyList.map((item: SearchHistoryItem, idx: number) => (
                    <Box key={item.id}>
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <IconButton size="small" edge="end" onClick={() => setInput('')}>
                            <Close fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemButton onClick={() => handleHistoryClick(item.search_term)}
                          sx={{ borderRadius: 1.5, py: 0.75 }}>
                          <InputAdornment position="start" sx={{ mr: 1.5 }}>
                            <History fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                          <ListItemText
                            primary={item.search_term}
                            slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }}
                          />
                        </ListItemButton>
                      </ListItem>
                      {idx < historyList.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              )
          }
        </Box>
      )}

      {/* Results */}
      {showResults && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {loadingResults ? t('common.loading') : `${results?.pagination.total ?? 0} ${t('search.results')} "${debouncedQuery}"`}
            </Typography>
            {input && (
              <Chip label={input} size="small" onDelete={() => setInput('')} />
            )}
          </Box>

          {error && <Alert severity="error">{getApiErrorMessage(error)}</Alert>}

          <Grid container spacing={2.5}>
            {loadingResults
              ? Array.from({ length: 8 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                  <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
                </Grid>
              ))
              : products.length === 0
                ? (
                  <Grid size={12}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <SearchIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">{t('search.noResults')}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('search.noResultsDesc')}</Typography>
                    </Box>
                  </Grid>
                )
                : products.map((product) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                    <ProductCard
                      product={product}
                      onView={() => navigate(`/products/${product.id}`)}
                      onEdit={() => navigate(`/products/${product.id}/edit`)}
                      onDelete={() => {}}
                    />
                  </Grid>
                ))
            }
          </Grid>
        </Box>
      )}
    </Box>
  );
}
