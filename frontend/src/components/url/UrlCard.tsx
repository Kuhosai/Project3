import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BarChartIcon from '@mui/icons-material/BarChart';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link as RouterLink } from 'react-router-dom';
import type { UrlResponse } from '../../types/api.types';

interface UrlCardProps {
  url: UrlResponse;
}

const UrlCard: React.FC<UrlCardProps> = ({ url }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setSnackbarOpen(true);
    } catch {
      // Fallback for non-HTTPS contexts
      const el = document.createElement('textarea');
      el.value = url.shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setSnackbarOpen(true);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateUrl = (u: string, maxLen = 60) =>
    u.length > maxLen ? `${u.slice(0, maxLen)}...` : u;

  return (
    <>
      <Card
        sx={{
          width: '100%',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: 4 },
        }}
      >
        <CardContent>
          {/* Short URL row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <Typography
              variant="subtitle1"
              color="primary"
              component="a"
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {url.shortUrl}
            </Typography>
            <Tooltip title="Copy short URL">
              <IconButton size="small" onClick={handleCopy} color="primary">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Original URL */}
          <Tooltip title={url.originalUrl} arrow>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {truncateUrl(url.originalUrl)}
            </Typography>
          </Tooltip>

          {/* Chips row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={<BarChartIcon />}
              label={`${url.clickCount} click${url.clickCount !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<CalendarTodayIcon />}
              label={`Created ${formatDate(url.createdAt)}`}
              size="small"
              variant="outlined"
            />
            {url.expiresAt && (
              <Chip
                label={`Expires ${formatDate(url.expiresAt)}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            component={RouterLink}
            to={`/urls/${url.id}`}
          >
            View Details
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message="Short URL copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default UrlCard;
