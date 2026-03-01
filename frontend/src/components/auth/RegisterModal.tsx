import {
  Dialog, DialogTitle, DialogContent, TextField,
  Button, Box, Typography, CircularProgress, Alert,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../store/api/auth.api';
import { setCredentials } from '../../store/slices/auth.slice';

interface RegisterModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSwitchToLogin: () => void;
  readonly onSuccess: () => void;
}

const RegisterModal = ({ open, onClose, onSwitchToLogin, onSuccess }: RegisterModalProps) => {
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    documentNumber: '',
    password: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (Object.values(form).some((v) => !v)) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      const result = await register(form).unwrap();
      dispatch(setCredentials({
        accessToken: result.data.accessToken,
        customer: result.data.customer,
      }));
      onSuccess();
    } catch {
      setError('Email is already registered');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.4rem', pb: 0 }}>
        Create account
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          <TextField label="Full name" fullWidth value={form.fullName} onChange={handleChange('fullName')} />
          <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} />
          <TextField label="Phone number" fullWidth value={form.phoneNumber} onChange={handleChange('phoneNumber')} />
          <TextField label="Document number" fullWidth value={form.documentNumber} onChange={handleChange('documentNumber')} />
          <TextField label="Password" type="password" fullWidth value={form.password} onChange={handleChange('password')} />
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
          </Button>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Already have an account?{' '}
            <Box
              component="span"
              sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
              onClick={onSwitchToLogin}
            >
              Sign in
            </Box>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;