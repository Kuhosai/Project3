import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await apiService.signup({ email: email.trim(), password });
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' },
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #FFFBFE 0%, #F3EDF7 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={loading}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
              helperText="Minimum 8 characters"
              autoComplete="new-password"
              error={password.length > 0 && password.length < 8}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
              autoComplete="new-password"
              error={confirmPassword.length > 0 && confirmPassword !== password}
              helperText={
                confirmPassword.length > 0 && confirmPassword !== password
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', textAlign: 'center' }}>
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: '#6750A4', fontWeight: 600 }}>
              Login
            </RouterLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
