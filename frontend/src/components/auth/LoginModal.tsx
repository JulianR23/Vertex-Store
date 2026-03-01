import {
  Dialog, DialogTitle, DialogContent, TextField,
  Button, Box, Typography, CircularProgress, Alert,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/api/auth.api';
import { setCredentials } from '../../store/slices/auth.slice';

interface LoginModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSwitchToRegister: () => void;
  readonly onSuccess: () => void;
}

const LoginModal = ({ open, onClose, onSwitchToRegister, onSuccess }: LoginModalProps) => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({
        accessToken: result.data.accessToken,
        customer: result.data.customer,
      }));
      onSuccess();
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.4rem', pb: 0 }}>
        Sign in
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
          </Button>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{' '}
            <Box
              component="span"
              sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
              onClick={onSwitchToRegister}
            >
              Sign up
            </Box>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;