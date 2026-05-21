import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UrlCard from '../components/url/UrlCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import apiService, { mockApiService } from '../services/apiService';
import type { UrlResponse } from '../types/api.types';

const MyUrlsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUrls = async () => {
      try {
        const data = await apiService.getUserUrls();
        setUrls(data);
      } catch {
        // Backend not available - use mock data
        try {
          const mockData = await mockApiService.getMockUrls();
          setUrls(mockData);
        } catch (mockErr: unknown) {
          setError(
            mockErr instanceof Error ? mockErr.message : 'Failed to load your URLs.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'background.default', py: 5 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
            My URLs
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddLinkIcon />}
            component={RouterLink}
            to="/"
          >
            Shorten New URL
          </Button>
        </Box>

        {/* States */}
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && urls.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <AddLinkIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              You haven&apos;t created any short URLs yet.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/"
              startIcon={<AddLinkIcon />}
            >
              Create Your First URL
            </Button>
          </Box>
        )}

        {!loading && !error && urls.length > 0 && (
          <Grid container spacing={3}>
            {urls.map((url) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={url.id}>
                <UrlCard url={url} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MyUrlsPage;
