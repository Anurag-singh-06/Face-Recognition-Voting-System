import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Alert } from '@mui/material';

const OtpDialog = ({ open, onClose, onVerify, loading, error }) => {
  const [otp, setOtp] = useState('');

  const handleChange = (e) => setOtp(e.target.value);

  const handleVerify = () => {
    onVerify(otp);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>OTP Verification</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Please enter the 6-digit OTP sent to your email.
        </Typography>
        <TextField
          label="OTP"
          variant="outlined"
          fullWidth
          value={otp}
          onChange={handleChange}
          margin="normal"
          inputProps={{ maxLength: 6 }}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleVerify} disabled={loading || otp.length !== 6}>
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpDialog;
