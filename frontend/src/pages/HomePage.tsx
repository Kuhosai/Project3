import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import UrlForm from '../components/url/UrlForm';
import UrlCard from '../components/url/UrlCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import apiService from '../services/apiService';
import type { UrlResponse } from '../types/api.types';

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<UrlResponse | null>(null);

  const handleSubmit = async (url: string, expiresAt?: string) => {
    setLoading(true);
    setError(null);
    setCreatedUrl(null);

    try {
      const result = await apiService.createUrl({ originalUrl: url, expiresAt });
      setCreatedUrl(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to shorten URL. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #FFFBFE 0%, #F3EDF7 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            color="primary"
            gutterBottom
            sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Shorten Your URLs
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto' }}>
            Create short, memorable links in seconds. Track clicks, analyze traffic, and share
            anywhere.
          </Typography>
        </Box>

        {/* Form card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            mb: 4,
          }}
        >
          <UrlForm onSubmit={handleSubmit} loading={loading} />
        </Paper>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {/* Result */}
        {createdUrl && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Your short URL is ready
              </Typography>
            </Divider>
            <UrlCard url={createdUrl} />
          </>
        )}

        {/* Feature highlights */}
        {!createdUrl && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
              mt: 6,
            }}
          >
            {[
              { title: 'Lightning Fast', desc: 'Shorten any URL in under a second.' },
              { title: 'Click Analytics', desc: 'Track daily clicks, countries, and browsers.' },
              { title: 'Expiration Dates', desc: 'Set links to expire automatically.' },
            ].map((f) => (
              <Paper
                key={f.title}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
