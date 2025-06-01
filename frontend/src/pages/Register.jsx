import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import OtpDialog from '../components/OtpDialog';

const Register = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
  });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const captureImage = useCallback(async () => {
    try {
      if (!webcamRef.current) {
        setError('Webcam is not initialized yet. Please wait a moment.');
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Failed to capture image from webcam.');
        return;
      }
      setCapturedImage(imageSrc);
      setError('');
    } catch (err) {
      setError('Error capturing image. Please try again.');
      console.error('Error:', err);
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.phoneNumber?.trim()) {
      setError('Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (!formData.dateOfBirth) {
      setError('Date of Birth is required');
      return;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }
    if (!capturedImage) {
      setError('Please capture your face image');
      return;
    }

    // Validate age
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setError('You must be at least 18 years old to register.');
      return;
    }



    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate face image
    if (!capturedImage) {
      setError('Please capture your face image.');
      return;
    }

    try {
      // Create registration data with trimmed values
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        gender: formData.gender,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        faceImage: capturedImage
      };

      console.log('Sending registration data:', registrationData);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // Open OTP dialog
      setPendingUserId(data.user.id);
      setOtpDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // OTP Verification handler
  const handleOtpVerify = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUserId, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      // Save token and user data (if returned)
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setOtpDialogOpen(false);
      navigate('/voter/dashboard');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpDialogClose = () => {
    setOtpDialogOpen(false);
    setOtpError('');
  };

  return (
    <>
      <OtpDialog
        open={otpDialogOpen}
        onClose={handleOtpDialogClose}
        onVerify={handleOtpVerify}
        loading={otpLoading}
        error={otpError}
      />
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      }}>
        <div style={{
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          padding: 32,
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Voter Registration</h1>
        {error && (
          <div style={{ background: '#ffeaea', color: '#b71c1c', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            gap: 32,
            alignItems: 'stretch',
            justifyContent: 'center',
          }}>
            {/* Left: Form Fields */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Full Name</label>
              <input
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                placeholder="Enter your full name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
              />
              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Email</label>
              <input
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                placeholder="Enter your email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Phone Number</label>
              <input
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                placeholder="10-digit number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
              />


              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Password</label>
              <input
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                placeholder="Enter your password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Confirm Password</label>
              <input
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                placeholder="Re-enter your password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Date of Birth</label>
              <input
                required
                type="date"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
              />

              <label style={{ width: '100%', margin: '0 0 4px 0', fontWeight: 600 }}>Gender</label>
              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  color: '#000',
                }}
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16, width: '100%' }}>
                <button
                  type="button"
                  style={{
                    background: '#f0f4f8', // faded blue/gray
                    color: '#1976d2',
                    border: '1.5px solid #90caf9', // lighter blue border
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#64b5f6', // lighter blue
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  Register
                </button>
              </div>
            </div>
            {/* Right: Face Capture */}
            <div style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: window.innerWidth < 900 ? 'none' : '1px solid #e0e0e0',
              paddingLeft: window.innerWidth < 900 ? 0 : 32,
              marginTop: window.innerWidth < 900 ? 32 : 0,
            }}>
              <h4 style={{ marginBottom: 16 }}>Face Capture</h4>
              {!capturedImage ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={320}
                    height={240}
                    style={{ borderRadius: 12, border: '1px solid #bbb' }}
                  />
                  <button
                    type="button"
                    style={{
                      background: '#64b5f6', // slightly darker faded blue
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '10px 24px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginTop: 16,
                    }}
                    onClick={captureImage}
                  >
                    Capture Image
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    style={{ width: 320, height: 240, borderRadius: 12, border: '1px solid #bbb', marginBottom: 8 }}
                  />
                  <button
                    type="button"
                    style={{
                      background: '#64b5f6', // slightly darker faded blue
                      color: '#1976d2',
                      border: '1.5px solid #64b5f6', // slightly darker faded blue border
                      borderRadius: 6,
                      padding: '10px 24px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                    onClick={() => setCapturedImage(null)}
                  >
                    Retake Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  </>
  );
};

export default Register;
