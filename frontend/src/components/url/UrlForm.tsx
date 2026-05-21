import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import LinkIcon from '@mui/icons-material/Link';
import ContentCutIcon from '@mui/icons-material/ContentCut';

interface UrlFormProps {
  onSubmit: (url: string, expiresAt?: string) => void;
  loading: boolean;
}

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);

  const validateAndNormalizeUrl = (value: string): string | null => {
    let normalized = value.trim();
    if (!normalized) return null;
    // Auto-add https:// if no scheme present
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    try {
      new URL(normalized);
      return normalized;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    const normalized = validateAndNormalizeUrl(url);
    if (!normalized) {
      setUrlError('Please enter a valid URL (e.g. https://example.com)');
      return;
    }

    onSubmit(normalized, expiresAt || undefined);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        label="Enter your long URL"
        placeholder="https://example.com/very/long/url..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setUrlError('');
        }}
        error={!!urlError}
        helperText={urlError}
        variant="filled"
        fullWidth
        slotProps={{
          input: {
            startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
        sx={{ mb: 2 }}
        disabled={loading}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          size="small"
          variant="text"
          onClick={() => setShowExpiry((prev) => !prev)}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          {showExpiry ? '- Hide expiration date' : '+ Set expiration date (optional)'}
        </Button>
      </Box>

      <Collapse in={showExpiry}>
        <TextField
          label="Expiration date & time"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          fullWidth
          variant="filled"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: new Date().toISOString().slice(0, 16) },
          }}
          sx={{ mb: 2 }}
          disabled={loading}
        />
      </Collapse>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading || !url.trim()}
        startIcon={<ContentCutIcon />}
        sx={{ py: 1.5 }}
      >
        {loading ? 'Shortening...' : 'Shorten URL'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        By using this service you agree to our terms of service.
      </Typography>
    </Box>
  );
};

export default UrlForm;
