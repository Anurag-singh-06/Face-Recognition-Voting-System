import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert } from '@mui/material';

const FaceVerificationDialog = ({ open, onClose, onVerified, party, electionId }) => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const captureAndVerify = async () => {
    setError('');
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    try {
      if (!party || !party._id) {
        throw new Error('No party selected. Please try again.');
      }
      if (!electionId) {
        throw new Error('No election selected. Please try again.');
      }

      const response = await fetch('http://localhost:5000/api/voter/verify-and-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          faceImage: imageSrc, 
          candidateId: party._id,
          electionId: electionId
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification or voting failed');
      }
      onVerified(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Face Verification Required</DialogTitle>
      <DialogContent>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
          style={{ display: 'block', margin: '0 auto' }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', margin: '16px auto' }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={captureAndVerify} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          Verify & Vote
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceVerificationDialog;