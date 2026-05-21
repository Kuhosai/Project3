import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinkIcon from '@mui/icons-material/Link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomAppBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        {/* Logo / Title */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 0,
            mr: 3,
          }}
        >
          <LinkIcon />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            URL Shortener
          </Typography>
        </Box>

        {/* Nav links */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          {isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/my-urls">
              My URLs
            </Button>
          )}
        </Box>

        {/* Auth section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Chip
                icon={<AccountCircleIcon />}
                label={user ?? ''}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/signup"
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
