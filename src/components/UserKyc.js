import React, { useState, useEffect, useRef } from 'react';
import './UserKyc.css';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from './ApiConfig';

// Custom Alert Component
const CustomAlert = ({ children, isError }) => (
  <div className={`custom-alert ${isError ? 'error' : 'success'}`}>
    {children}
  </div>
);

// Icons
const CopyIcon = () => (
  <i className="bi bi-clipboard" style={{ fontSize: '20px' }}></i>
);

const CheckIcon = () => (
  <i className="bi bi-check-lg" style={{ fontSize: '20px' }}></i>
);

const WalletIcon = () => (
  <i className="bi bi-wallet2" style={{ fontSize: '20px' }}></i>
);

const UploadIcon = () => (
  <i className="bi bi-cloud-upload" style={{ fontSize: '20px' }}></i>
);

const DocumentIcon = () => (
  <i className="bi bi-file-earmark-text" style={{ fontSize: '20px' }}></i>
);

const CameraIcon = () => (
  <i className="bi bi-camera" style={{ fontSize: '20px' }}></i>
);

const generateUserId = () => {
  return 'USER' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// File validation function
const validateFile = (file, fileType = 'document') => {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be under 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, JPG, PNG, and WebP files are allowed' };
  }

  return { isValid: true, error: null };
};

const UserKyc = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [userId, setUserId] = useState('');
  const [referralId, setReferralId] = useState('');
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedRefId, setCopiedRefId] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [showKYC, setShowKYC] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // PAN Number state
  const [panNumber, setPanNumber] = useState('');
  const [panNumberError, setPanNumberError] = useState('');
  const [isPanChecking, setIsPanChecking] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // KYC State - Added cancelledCheque
  const [kycData, setKycData] = useState({
    aadharCard: null,
    panCard: null,
    bankPassbook: null,
    cancelledCheque: null,
    selfie: null
  });

  const [kycErrors, setKycErrors] = useState({
    aadharCard: '',
    panCard: '',
    bankPassbook: '',
    cancelledCheque: '',
    selfie: ''
  });

  const [uploadProgress, setUploadProgress] = useState({
    aadharCard: false,
    panCard: false,
    bankPassbook: false,
    cancelledCheque: false,
    selfie: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('signupData');
    if (storedData) {
      setSignupData(JSON.parse(storedData));
    } else {
      setAlert({
        show: true,
        message: 'No signup data found. Please sign up first.',
        isError: true
      });
      setTimeout(() => navigate('/signup'), 2000);
    }

    // Set up SSE connection to fetch all users
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.success && response.data) {
          setAllUsers(response.data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [navigate]);

  // Prevent going back when KYC process has started
  useEffect(() => {
    if (showKYC || kycCompleted) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };

      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, null, window.location.pathname);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      // Push current state to prevent back navigation
      window.history.pushState(null, null, window.location.pathname);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showKYC, kycCompleted]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Validate PAN number format
  const validatePanNumber = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  // Check if PAN number already exists
  const checkPanExists = (pan) => {
    if (!pan || allUsers.length === 0) return false;
    
    return allUsers.some(user => 
      user.panNumber && user.panNumber.toUpperCase() === pan.toUpperCase()
    );
  };

  const handlePanNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPanNumber(value);
    
    if (!value) {
      setPanNumberError('');
      return;
    }

    // Check format first
    if (!validatePanNumber(value)) {
      setPanNumberError('Invalid PAN format. Example: ABCDE1234F');
      return;
    }

    // Check if PAN already exists
    setIsPanChecking(true);
    setTimeout(() => {
      if (checkPanExists(value)) {
        setPanNumberError('This PAN number is already registered. Please use a different PAN number.');
      } else {
        setPanNumberError('');
      }
      setIsPanChecking(false);
    }, 300);
  };

  const handleFileUpload = async (event, documentType) => {
    // Only handle non-selfie documents since selfie is camera-only
    if (documentType === 'selfie') return;

    const file = event.target.files[0];
    const validation = validateFile(file);

    if (!validation.isValid) {
      setKycErrors(prev => ({
        ...prev,
        [documentType]: validation.error
      }));
      return;
    }

    // Clear previous error
    setKycErrors(prev => ({
      ...prev,
      [documentType]: ''
    }));

    // Set upload progress
    setUploadProgress(prev => ({
      ...prev,
      [documentType]: true
    }));

    // Simulate upload delay
    setTimeout(() => {
      setKycData(prev => ({
        ...prev,
        [documentType]: file
      }));

      setUploadProgress(prev => ({
        ...prev,
        [documentType]: false
      }));

      setAlert({
        show: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} uploaded successfully!`,
        isError: false
      });

      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 2000);
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front camera for selfie
        }
      });
      setStream(mediaStream);
      setShowCamera(true);

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setAlert({
        show: true,
        message: 'Unable to access camera. Please use file upload instead.',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

        // Set upload progress
        setUploadProgress(prev => ({
          ...prev,
          selfie: true
        }));

        // Simulate processing time
        setTimeout(() => {
          setKycData(prev => ({
            ...prev,
            selfie: file
          }));

          setUploadProgress(prev => ({
            ...prev,
            selfie: false
          }));

          setAlert({
            show: true,
            message: 'Selfie captured successfully!',
            isError: false
          });
          setTimeout(() => setAlert({ show: false, message: '', isError: false }), 2000);
        }, 1000);

        closeCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleKYCSubmit = () => {
    // Validate PAN number
    if (!panNumber) {
      setAlert({
        show: true,
        message: 'Please enter your PAN number',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
      return;
    }

    if (!validatePanNumber(panNumber)) {
      setAlert({
        show: true,
        message: 'Please enter a valid PAN number (Format: ABCDE1234F)',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
      return;
    }

    // Check if PAN already exists
    if (checkPanExists(panNumber)) {
      setAlert({
        show: true,
        message: 'This PAN number is already registered. Please use a different PAN number.',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
      return;
    }

    // Validate only required documents (aadharCard, panCard, selfie) - bankPassbook and cancelledCheque are optional
    const { aadharCard, panCard, selfie } = kycData;

    if (!aadharCard || !panCard || !selfie) {
      setAlert({
        show: true,
        message: 'Please upload all required documents (Aadhar Card, PAN Card, and Selfie)',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
      return;
    }

    // Mark KYC as completed
    setKycCompleted(true);
    setAlert({
      show: true,
      message: 'KYC verification completed successfully!',
      isError: false
    });
    setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
  };

  const startKYC = () => {
    setShowKYC(true);
  };

  const createAccount = async () => {
    setIsLoading(true);
    const newUserId = generateUserId();
    const newReferralId = generateReferralId();

    try {
      // Get signup data
      const signupData = JSON.parse(localStorage.getItem('signupData')) || {};

      if (!signupData?.name || !signupData?.phoneNo || !signupData?.password || !signupData?.city || !signupData?.state) {
        throw new Error('Required signup data is missing');
      }

      // Validate required KYC documents (aadharCard, panCard, selfie) - bankPassbook and cancelledCheque are optional
      if (!kycData.aadharCard || !kycData.panCard || !kycData.selfie) {
        throw new Error('Required KYC documents (Aadhar Card, PAN Card, and Selfie) are required');
      }

      // Validate PAN number
      if (!panNumber || !validatePanNumber(panNumber)) {
        throw new Error('Valid PAN number is required');
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Add text fields
      formData.append('userId', newUserId);
      formData.append('name', signupData.name);
      formData.append('referralId', signupData.referralId || 'root');
      formData.append('myrefrelid', newReferralId);
      formData.append('phoneNo', signupData.phoneNo);
      formData.append('password', signupData.password);
      formData.append('email', signupData.email?.trim() || '');
      formData.append('city', signupData.city?.trim() || '');
      formData.append('state', signupData.state?.trim() || '');
      formData.append('panNumber', panNumber);

      // Add required KYC files
      formData.append('aadharCard', kycData.aadharCard);
      formData.append('panCard', kycData.panCard);
      formData.append('selfie', kycData.selfie);

      // Add optional files only if they exist
      if (kycData.bankPassbook) {
        formData.append('bankPassbook', kycData.bankPassbook);
      }

      if (kycData.cancelledCheque) {
        formData.append('cancelledCheque', kycData.cancelledCheque);
      }

      // Make API call to the updated endpoint
      const response = await fetch(`${API_BASE_URL}/registerUser`, {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create account.');
      }

      // Extract user IDs from the response
      const responseUserId = result.userIdsData?.myuserid || newUserId;
      const responseReferralId = result.userIdsData?.myrefrelid || newReferralId;

      // Update state and show success message with user ID
      setUserId(responseUserId);
      setReferralId(responseReferralId);
      setShowPopup(true);
      setAlert({
        show: true,
        message: 'Account submitted for verification!',
        isError: false
      });

      // Clear signup data
      localStorage.removeItem('signupData');

    } catch (error) {
      console.error('Error creating account:', error);
      setAlert({
        show: true,
        message: error.message || 'Failed to create account. Please try again.',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'userId') {
        setCopiedUserId(true);
        setTimeout(() => setCopiedUserId(false), 2000);
      } else {
        setCopiedRefId(true);
        setTimeout(() => setCopiedRefId(false), 2000);
      }

      setAlert({
        show: true,
        message: 'Copied to clipboard!',
        isError: false
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
      setAlert({
        show: true,
        message: 'Failed to copy to clipboard',
        isError: true
      });
      setTimeout(() => setAlert({ show: false, message: '', isError: false }), 2000);
    }
  };

  const goToLogin = () => {
    navigate("/");
  };

  const goToHelp = () => {
    // Navigate to help section - adjust route as needed
    navigate("/help");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="payment-container">
      <div className="content-wrapper">
        {/* Important Notice */}
        {(showKYC || kycCompleted) && (
          <div className="important-notice">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <strong>Important:</strong> Please do not go back or refresh this page during the KYC process. Your progress will be lost and you'll need to start over.
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="camera-modal-overlay">
            <div className="camera-modal">
              <h3>
                <CameraIcon />
                Take Your Selfie
              </h3>

              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                />
              </div>

              <div className="camera-buttons">
                <button
                  onClick={capturePhoto}
                  className="capture-btn"
                >
                  <i className="bi bi-camera-fill"></i>
                  Capture Photo
                </button>

                <button
                  onClick={closeCamera}
                  className="cancel-camera-btn"
                >
                  <i className="bi bi-x-lg"></i>
                  Cancel
                </button>
              </div>

              <p className="camera-guideline">
                Position your face in the center and ensure good lighting for the best photo quality.
              </p>
            </div>

            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* KYC Section */}
        {!showKYC && !kycCompleted && (
          <div className="kyc-intro">
            <div className="kyc-intro-content">
              <DocumentIcon />
              <h3>KYC Verification Required</h3>
              <p>Please complete your KYC verification to create your account and start trading.</p>
              <button className="start-kyc-btn" onClick={startKYC}>
                Start KYC Verification
              </button>
            </div>
          </div>
        )}

        {/* KYC Form */}
        {showKYC && !kycCompleted && (
          <div className="kyc-form">
            <h3 className="kyc-title">KYC Document Verification</h3>
            <p className="kyc-subtitle">Please upload the following document Images (Max 5MB each)</p>

            {/* PAN Number Input */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-credit-card-2-front"></i>
                PAN Number *
              </label>
              <div className="upload-area" style={{ padding: '0' }}>
                <input
                  type="text"
                  value={panNumber}
                  onChange={handlePanNumberChange}
                  placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                  maxLength="10"
                  disabled={isPanChecking}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: panNumberError ? '2px solid #DC2626' : '2px solid #D1D5DB',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    backgroundColor: isPanChecking ? '#F3F4F6' : 'white',
                    outline: 'none',
                    letterSpacing: '1px',
                    cursor: isPanChecking ? 'wait' : 'text'
                  }}
                />
                {isPanChecking && (
                  <p style={{
                    color: '#4F46E5',
                    fontSize: '13px',
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <i className="bi bi-arrow-clockwise spin"></i>
                    Checking PAN number...
                  </p>
                )}
                {panNumberError && !isPanChecking && (
                  <p className="error-text" style={{ marginTop: '8px' }}>{panNumberError}</p>
                )}
                {!panNumberError && !isPanChecking && panNumber && validatePanNumber(panNumber) && (
                  <p style={{
                    color: '#059669',
                    fontSize: '13px',
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <i className="bi bi-check-circle-fill"></i>
                    PAN number is available
                  </p>
                )}
                {!panNumber && (
                  <p style={{
                    color: '#6B7280',
                    fontSize: '13px',
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '0'
                  }}>
                    Format: 5 letters, 4 digits, 1 letter (Example: ABCDE1234F)
                  </p>
                )}
              </div>
            </div>

            {/* Aadhar Card Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-person-badge"></i>
                Aadhar Card *
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="aadhar"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'aadharCard')}
                  className="file-input"
                />
                <label htmlFor="aadhar" className="upload-label">
                  {uploadProgress.aadharCard ? (
                    <div className="upload-progress">
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Uploading...
                    </div>
                  ) : kycData.aadharCard ? (
                    <div className="upload-success">
                      <CheckIcon />
                      {kycData.aadharCard.name}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <UploadIcon />
                      Click to upload Aadhar Card
                    </div>
                  )}
                </label>
                {kycErrors.aadharCard && (
                  <p className="error-text">{kycErrors.aadharCard}</p>
                )}
              </div>
            </div>

            {/* PAN Card Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-credit-card"></i>
                PAN Card *
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="pan"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'panCard')}
                  className="file-input"
                />
                <label htmlFor="pan" className="upload-label">
                  {uploadProgress.panCard ? (
                    <div className="upload-progress">
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Uploading...
                    </div>
                  ) : kycData.panCard ? (
                    <div className="upload-success">
                      <CheckIcon />
                      {kycData.panCard.name}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <UploadIcon />
                      Click to upload PAN Card
                    </div>
                  )}
                </label>
                {kycErrors.panCard && (
                  <p className="error-text">{kycErrors.panCard}</p>
                )}
              </div>
            </div>

            {/* Bank Passbook Upload - Optional */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-bank"></i>
                Bank Passbook (Optional)
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="passbook"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'bankPassbook')}
                  className="file-input"
                />
                <label htmlFor="passbook" className="upload-label">
                  {uploadProgress.bankPassbook ? (
                    <div className="upload-progress">
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Uploading...
                    </div>
                  ) : kycData.bankPassbook ? (
                    <div className="upload-success">
                      <CheckIcon />
                      {kycData.bankPassbook.name}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <UploadIcon />
                      Click to upload Bank Passbook (Optional)
                    </div>
                  )}
                </label>
                {kycErrors.bankPassbook && (
                  <p className="error-text">{kycErrors.bankPassbook}</p>
                )}
              </div>
            </div>

            {/* Cancelled Cheque Upload - Optional */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-file-earmark-check"></i>
                Cancelled Cheque (Optional)
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="cancelledCheque"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'cancelledCheque')}
                  className="file-input"
                />
                <label htmlFor="cancelledCheque" className="upload-label">
                  {uploadProgress.cancelledCheque ? (
                    <div className="upload-progress">
                      <i className="bi bi-arrow-clockwise spin"></i>
                      Uploading...
                    </div>
                  ) : kycData.cancelledCheque ? (
                    <div className="upload-success">
                      <CheckIcon />
                      {kycData.cancelledCheque.name}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <UploadIcon />
                      Click to upload Cancelled Cheque (Optional)
                    </div>
                  )}
                </label>
                {kycErrors.cancelledCheque && (
                  <p className="error-text">{kycErrors.cancelledCheque}</p>
                )}
              </div>
            </div>

            {/* Selfie Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-person-circle"></i>
                Selfie Photo *
              </label>
              <div className="upload-area">
                {/* Selfie Capture Area */}
                {!kycData.selfie ? (
                  <div className="selfie-capture-container">
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={uploadProgress.selfie}
                      className={`selfie-capture-btn ${uploadProgress.selfie ? 'disabled' : ''}`}
                    >
                      {uploadProgress.selfie ? (
                        <>
                          <i className="bi bi-arrow-clockwise spin"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CameraIcon />
                          Take Selfie Photo
                        </>
                      )}
                    </button>

                    {/* Selfie Guidelines */}
                    <div className="selfie-guidelines">
                      <div className="guidelines-header">
                        <i className="bi bi-info-circle-fill"></i>
                        Selfie Guidelines
                      </div>
                      <ul>
                        <li>Face should be clearly visible and centered</li>
                        <li>Ensure good lighting with no shadows</li>
                        <li>Look directly at the camera</li>
                        <li>Remove sunglasses, hat, or face coverings</li>
                        <li>Use a plain background if possible</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Show captured selfie preview
                  <div className="selfie-preview">
                    <div className="selfie-preview-content">
                      <div className="selfie-image-container">
                        {kycData.selfie && (
                          <img
                            src={URL.createObjectURL(kycData.selfie)}
                            alt="Captured Selfie"
                          />
                        )}
                      </div>

                      <div className="selfie-info">
                        <div className="selfie-success">
                          <CheckIcon />
                          <span>Selfie Captured Successfully</span>
                        </div>

                        <div className="selfie-details">
                          {kycData.selfie.name || 'selfie.jpg'}
                          <span>({(kycData.selfie.size / 1024).toFixed(1)} KB)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setKycData(prev => ({
                              ...prev,
                              selfie: null
                            }));
                            setKycErrors(prev => ({
                              ...prev,
                              selfie: ''
                            }));
                          }}
                          className="retake-selfie-btn"
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                          Retake Photo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {kycErrors.selfie && (
                  <p className="error-text">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {kycErrors.selfie}
                  </p>
                )}
              </div>
            </div>

            <button
              className="submit-kyc-btn"
              onClick={handleKYCSubmit}
              disabled={!kycData.aadharCard || !kycData.panCard || !kycData.selfie || !panNumber || panNumberError || isPanChecking}
            >
              {isPanChecking ? 'Validating PAN...' : 'Submit KYC Documents'}
            </button>
          </div>
        )}

        {/* Create Account Button - Only shown after KYC completion */}
        {kycCompleted && !showPopup && (
          <div className="account-creation">
            <div className="kyc-success">
              <CheckIcon />
              <h3>KYC Submission Completed!</h3>
              <p>Your documents including selfie and PAN number have been uploaded successfully. You can now create your account.</p>
            </div>

            <button
              className="create-account-btn"
              onClick={createAccount}
              disabled={isLoading || !signupData}
            >
              <WalletIcon />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        )}

        {/* Admin Verification Popup with User ID and Referral ID */}
        {showPopup && (
          <div className="kyc-popup-overlay">
            <div className="kyc-popup-container">
              {/* Header Section */}
              <div className="kyc-popup-header">
                <div className="header-background"></div>

                <div className="header-icon">
                  <i className="bi bi-shield-check"></i>
                </div>

                <h2>KYC Submission Successfully!</h2>
                <p>Your account is currently under admin verification</p>
              </div>

              {/* Content Section */}
              <div className="kyc-popup-content">
                {/* User ID Display */}
                <div className="kyc-user-id-box">
                  <div className="box-background"></div>

                  <h3>
                    <i className="bi bi-person-badge-fill"></i>
                    Your User ID
                  </h3>

                  <div className="id-display-container">
                    <span className="id-text">
                      {userId}
                    </span>

                    <button
                      onClick={() => copyToClipboard(userId, 'userId')}
                      className={`copy-btn ${copiedUserId ? 'copied' : ''}`}
                    >
                      {copiedUserId ? (
                        <>
                          <i className="bi bi-check-lg"></i>
                          Copied!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clipboard"></i>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p className="id-info">
                    <i className="bi bi-info-circle-fill"></i>
                    Use this ID to check your account status on the login page
                  </p>
                </div>

                {/* Referral ID Display */}
                <div className="kyc-referral-id-box">
                  <div className="box-background"></div>

                  <h3>
                    <i className="bi bi-people-fill"></i>
                    Your Referral ID
                  </h3>

                  <div className="id-display-container">
                    <span className="id-text">
                      {referralId}
                    </span>

                    <button
                      onClick={() => copyToClipboard(referralId, 'referralId')}
                      className={`copy-btn ${copiedRefId ? 'copied' : ''}`}
                    >
                      {copiedRefId ? (
                        <>
                          <i className="bi bi-check-lg"></i>
                          Copied!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clipboard"></i>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p className="id-info">
                    <i className="bi bi-share-fill"></i>
                    Share this referral ID with friends to earn rewards
                  </p>
                </div>

                {/* Status Section */}
                <div className="kyc-status-section">
                  <div className="status-badge">
                    <i className="bi bi-clock-history"></i>
                    Under Admin Review
                  </div>

                  <p>
                    Your account is now under admin verification. We're reviewing your KYC details, documents, and selfie photo.
                  </p>
                </div>

                {/* Timeline */}
                <div className="kyc-timeline">
                  <div className="timeline-items">
                    <div className="timeline-item">
                      <div className="timeline-icon">
                        <i className="bi bi-clock-fill"></i>
                      </div>
                      <span>Admin Verification (Up to 24 hours)</span>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-icon">
                        <i className="bi bi-circle"></i>
                      </div>
                      <span>Account Activation</span>
                    </div>
                  </div>
                </div>

                {/* Important Information */}
                <div className="kyc-important-info">
                  <h4>
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    Important Information
                  </h4>

                  <div className="important-list">
                    <div className="important-item">
                      <span>⏰</span>
                      <span>Verification process takes up to <strong>24 hours</strong></span>
                    </div>
                    <div className="important-item">
                      <span>🔐</span>
                      <span>Try logging in after 24 hours</span>
                    </div>
                    <div className="important-item">
                      <span>📋</span>
                      <span>Save your User ID and Referral ID for future use</span>
                    </div>
                    <div className="important-item">
                      <span>👥</span>
                      <span>Share your Referral ID to earn rewards when friends join</span>
                    </div>
                    <div className="important-item">
                      <span>❓</span>
                      <span>No response? Contact admin through help section</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="kyc-action-buttons">
                  <button
                    className="kyc-status-btn"
                    onClick={goToLogin}
                  >
                    <i className="bi bi-search"></i>
                    Check Status on Login
                  </button>

                  <button
                    className="kyc-help-btn"
                    onClick={goToHelp}
                  >
                    <i className="bi bi-question-circle"></i>
                    Help & Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {alert.show && (
          <CustomAlert isError={alert.isError}>
            {alert.message}
          </CustomAlert>
        )}
      </div>
    </div>
  );
};

export default UserKyc;