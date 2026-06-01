import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DailyClicksChart from '../components/charts/DailyClicksChart';
import CountryDistributionChart from '../components/charts/CountryDistributionChart';
import BrowserDistributionChart from '../components/charts/BrowserDistributionChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import apiService, { mockApiService } from '../services/apiService';
import type {
  UrlResponse,
  DailyClickStatsDto,
  CountryStatsDto,
  BrowserStatsDto,
} from '../types/api.types';

const UrlDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [urlData, setUrlData] = useState<UrlResponse | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyClickStatsDto[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStatsDto[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStatsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id || isNaN(Number(id))) {
      setError('Invalid URL ID.');
      setLoading(false);
      return;
    }

    const urlId = Number(id);

    const fetchAll = async () => {
      try {
        const [url, daily, country, browser] = await Promise.all([
          apiService.getUrlDetails(urlId),
          apiService.getDailyStats(urlId),
          apiService.getCountryStats(urlId),
          apiService.getBrowserStats(urlId),
        ]);
        setUrlData(url);
        setDailyStats(daily);
        setCountryStats(country);
        setBrowserStats(browser);
      } catch {
        // Fallback to mock data
        try {
          const [mockUrls, daily, country, browser] = await Promise.all([
            mockApiService.getMockUrls(),
            mockApiService.getMockDailyStats(),
            mockApiService.getMockCountryStats(),
            mockApiService.getMockBrowserStats(),
          ]);
          const found = mockUrls.find((u) => u.id === urlId) ?? mockUrls[0];
          setUrlData(found);
          setDailyStats(daily);
          setCountryStats(country);
          setBrowserStats(browser);
        } catch (mockErr: unknown) {
          setError(
            mockErr instanceof Error ? mockErr.message : 'Failed to load URL details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'background.default', py: 5 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/my-urls"
          sx={{ mb: 3 }}
        >
          Back to My URLs
        </Button>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && urlData && (
          <>
            {/* URL Info Card */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                mb: 4,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary" gutterBottom>
                URL Analytics
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Short URL
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="a"
                    href={urlData.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {urlData.shortUrl}
                  </Typography>
                </Box>
                <Box sx={{ flex: 2, minWidth: 240 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Original URL
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-all',
                      color: 'text.primary',
                    }}
                  >
                    {urlData.originalUrl}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip
                  icon={<BarChartIcon />}
                  label={`${urlData.clickCount} total clicks`}
                  color="primary"
                  size="medium"
                />
                <Chip label={`Created ${formatDate(urlData.createdAt)}`} size="medium" variant="outlined" />
                {urlData.expiresAt && (
                  <Chip
                    label={`Expires ${formatDate(urlData.expiresAt)}`}
                    size="medium"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Paper>

            {/* Charts */}
            <Grid container spacing={4}>
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                    Daily Clicks (Last 7 Days)
                  </Typography>
                  {dailyStats.length > 0 ? (
                    <DailyClicksChart data={dailyStats} />
                  ) : (
                    <Typography color="text.secondary">No data available.</Typography>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                    Traffic by Country
                  </Typography>
                  {countryStats.length > 0 ? (
                    <CountryDistributionChart data={countryStats} />
                  ) : (
                    <Typography color="text.secondary">No data available.</Typography>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                    Traffic by Browser
                  </Typography>
                  {browserStats.length > 0 ? (
                    <BrowserDistributionChart data={browserStats} />
                  ) : (
                    <Typography color="text.secondary">No data available.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default UrlDetailPage;
