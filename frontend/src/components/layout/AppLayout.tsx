import { Box, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import LogoutIcon from '@mui/icons-material/Logout';
import { selectAuth, clearCredentials } from '../../store/slices/auth.slice';
import { resetCheckout } from '../../store/slices/checkout.slice';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearCredentials());
    dispatch(resetCheckout());
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Typography
            variant="h6"
            fontWeight={700}
            letterSpacing="-0.02em"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Vertex Store
          </Typography>
          {auth.isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {auth.customer?.fullName}
              </Typography>
              <IconButton onClick={handleLogout} size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          maxWidth: { xs: '100%', sm: 480, md: 960 },
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;