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

const ClockIcon = () => (
  <i className="bi bi-clock" style={{ fontSize: '24px' }}></i>
);

const AdminIcon = () => (
  <i className="bi bi-person-check" style={{ fontSize: '24px' }}></i>
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

  // KYC State - Added selfie
  const [kycData, setKycData] = useState({
    aadharCard: null,
    panCard: null,
    bankPassbook: null,
    selfie: null // Added selfie
  });

  const [kycErrors, setKycErrors] = useState({
    aadharCard: '',
    panCard: '',
    bankPassbook: '',
    selfie: '' // Added selfie error
  });

  const [uploadProgress, setUploadProgress] = useState({
    aadharCard: false,
    panCard: false,
    bankPassbook: false,
    selfie: false // Added selfie progress
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
    // Validate all documents are uploaded including selfie
    const { aadharCard, panCard, bankPassbook, selfie } = kycData;

    if (!aadharCard || !panCard || !bankPassbook || !selfie) {
      setAlert({
        show: true,
        message: 'Please upload all required documents including selfie',
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

      // Validate KYC documents including selfie
      if (!kycData.aadharCard || !kycData.panCard || !kycData.bankPassbook || !kycData.selfie) {
        throw new Error('All KYC documents including selfie are required');
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

      // Add KYC files including selfie
      formData.append('aadharCard', kycData.aadharCard);
      formData.append('panCard', kycData.panCard);
      formData.append('bankPassbook', kycData.bankPassbook);
      formData.append('selfie', kycData.selfie); // Added selfie

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
          <div style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffeaa7',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{
              fontSize: '24px',
              color: '#856404',
              flexShrink: 0
            }}></i>
            <div style={{
              color: '#856404',
              fontSize: '16px',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              <strong>Important:</strong> Please do not go back or refresh this page during the KYC process. Your progress will be lost and you'll need to start over.
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <h3 style={{
                margin: '0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CameraIcon />
                Take Your Selfie
              </h3>
              
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '3px solid #007bff'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '320px',
                    height: '240px',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button
                  onClick={capturePhoto}
                  style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                  }}
                >
                  <i className="bi bi-camera-fill" style={{ fontSize: '18px' }}></i>
                  Capture Photo
                </button>

                <button
                  onClick={closeCamera}
                  style={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '18px' }}></i>
                  Cancel
                </button>
              </div>

              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#6c757d',
                textAlign: 'center',
                maxWidth: '300px'
              }}>
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

            {/* Aadhar Card Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-person-badge"></i>
                Aadhar Card
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
                PAN Card
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

            {/* Bank Passbook Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-bank"></i>
                Bank Passbook
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
                      Click to upload Bank Passbook
                    </div>
                  )}
                </label>
                {kycErrors.bankPassbook && (
                  <p className="error-text">{kycErrors.bankPassbook}</p>
                )}
              </div>
            </div>

            {/* Selfie Upload */}
            <div className="document-upload">
              <label className="document-label">
                <i className="bi bi-person-circle"></i>
                Selfie Photo
              </label>
              <div className="upload-area">
                {/* Selfie Capture Area */}
                {!kycData.selfie ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={uploadProgress.selfie}
                      style={{
                        background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease',
                        opacity: uploadProgress.selfie ? 0.6 : 1,
                        width: '100%',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadProgress.selfie) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadProgress.selfie) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.3)';
                        }
                      }}
                    >
                      {uploadProgress.selfie ? (
                        <>
                          <i className="bi bi-arrow-clockwise spin" style={{ fontSize: '20px' }}></i>
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
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '13px',
                      color: '#6c757d',
                      lineHeight: '1.4',
                      width: '100%'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#17a2b8',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        <i className="bi bi-info-circle-fill" style={{ fontSize: '16px' }}></i>
                        Selfie Guidelines
                      </div>
                      <ul style={{
                        margin: '0',
                        paddingLeft: '18px',
                        fontSize: '12px'
                      }}>
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
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      border: '2px solid #28a745',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #dee2e6',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white'
                      }}>
                        {kycData.selfie && (
                          <img
                            src={URL.createObjectURL(kycData.selfie)}
                            alt="Captured Selfie"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <CheckIcon />
                          <span style={{
                            fontWeight: '600',
                            color: '#155724',
                            fontSize: '16px'
                          }}>
                            Selfie Captured Successfully
                          </span>
                        </div>
                        
                        <div style={{
                          fontSize: '14px',
                          color: '#6c757d',
                          marginBottom: '12px'
                        }}>
                          {kycData.selfie.name || 'selfie.jpg'} 
                          <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                            ({(kycData.selfie.size / 1024).toFixed(1)} KB)
                          </span>
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
                          style={{
                            background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <i className="bi bi-arrow-clockwise" style={{ fontSize: '14px' }}></i>
                          Retake Photo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {kycErrors.selfie && (
                  <p className="error-text" style={{
                    color: '#dc3545',
                    fontSize: '14px',
                    marginTop: '8px',
                    marginBottom: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '16px' }}></i>
                    {kycErrors.selfie}
                  </p>
                )}
              </div>
            </div>

            <button
              className="submit-kyc-btn"
              onClick={handleKYCSubmit}
              disabled={!kycData.aadharCard || !kycData.panCard || !kycData.bankPassbook || !kycData.selfie}
            >
              Submit KYC Documents
            </button>
          </div>
        )}

        {/* Create Account Button - Only shown after KYC completion */}
        {kycCompleted && !showPopup && (
          <div className="account-creation">
            <div className="kyc-success">
              <CheckIcon />
              <h3>KYC Submission Completed!</h3>
              <p>Your documents including selfie have been uploaded successfully. You can now create your account.</p>
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

        {/* Admin Verification Popup with User ID */}
        {showPopup && (
          <div
            className="kyc-popup-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ffffff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div
              className="kyc-popup-container"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Header Section */}
              <div
                className="kyc-popup-header"
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  padding: '32px',
                  borderRadius: '24px 24px 0 0',
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>

                <div style={{
                  fontSize: '64px',
                  marginBottom: '20px',
                  display: 'inline-block',
                  animation: 'bounceIn 0.8s ease-out 0.2s both'
                }}>
                  <i className="bi bi-shield-check" style={{
                    color: '#ffffff',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}></i>
                </div>

                <h2 style={{
                  margin: '0',
                  fontSize: '32px',
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.5px',
                  marginBottom: '8px'
                }}>
                  KYC Submission Successfully!
                </h2>

                <p style={{
                  margin: '0',
                  fontSize: '18px',
                  opacity: '0.95',
                  fontWeight: '400'
                }}>
                  Your account is currently under admin verification
                </p>
              </div>

              {/* Content Section */}
              <div
                className="kyc-popup-content"
                style={{
                  padding: '40px 32px'
                }}
              >
                {/* User ID Display */}
                <div
                  className="kyc-user-id-box"
                  style={{
                    backgroundColor: '#f8fffe',
                    border: '3px solid #28a745',
                    borderRadius: '18px',
                    padding: '28px',
                    marginBottom: '32px',
                    textAlign: 'center',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%)',
                    boxShadow: '0 5px 15px rgba(40, 167, 69, 0.1)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    background: 'linear-gradient(45deg, #28a745, #20c997, #28a745)',
                    borderRadius: '20px',
                    zIndex: -1,
                    opacity: '0.1'
                  }}></div>

                  <h3 style={{
                    color: '#155724',
                    marginBottom: '20px',
                    fontSize: '22px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <i className="bi bi-person-badge-fill" style={{ fontSize: '26px' }}></i>
                    Your User ID
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '14px',
                    border: '2px solid #dee2e6',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#2c3e50',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                      letterSpacing: '1.5px',
                      padding: '10px 16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef',
                      minWidth: '140px'
                    }}>
                      {userId}
                    </span>

                    <button
                      onClick={() => copyToClipboard(userId, 'userId')}
                      style={{
                        background: copiedUserId
                          ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                          : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                        transform: copiedUserId ? 'scale(1.05)' : 'scale(1)',
                        minWidth: '120px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!copiedUserId) {
                          e.target.style.transform = 'translateY(-2px) scale(1.02)';
                          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!copiedUserId) {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
                        }
                      }}
                    >
                      {copiedUserId ? (
                        <>
                          <i className="bi bi-check-lg" style={{ fontSize: '18px' }}></i>
                          Copied!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-clipboard" style={{ fontSize: '18px' }}></i>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p style={{
                    marginTop: '20px',
                    fontSize: '15px',
                    color: '#6c757d',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    lineHeight: '1.6'
                  }}>
                    <i className="bi bi-info-circle-fill" style={{ color: '#17a2b8', fontSize: '18px' }}></i>
                    Use this ID to check your account status on the login page
                  </p>
                </div>

                {/* Status Section */}
                <div
                  className="kyc-status-section"
                  style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                  }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '14px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '18px 28px',
                    borderRadius: '50px',
                    border: '2px solid #ffeaa7',
                    marginBottom: '24px',
                    fontSize: '20px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)'
                  }}>
                    <i className="bi bi-clock-history" style={{ fontSize: '24px', animation: 'pulse 2s infinite' }}></i>
                    Under Admin Review
                  </div>

                  <p style={{
                    color: '#495057',
                    fontSize: '17px',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    Your account is now under admin verification. We're reviewing your KYC details, documents, and selfie photo.
                  </p>
                </div>

                {/* Timeline */}
                <div
                  className="kyc-timeline"
                  style={{
                    marginBottom: '32px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '18px',
                      padding: '14px 0'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#fff8e6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-clock-fill" style={{
                          fontSize: '24px',
                          color: '#ffc107',
                          animation: 'pulse 2s infinite'
                        }}></i>
                      </div>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#856404'
                      }}>
                        Admin Verification (Up to 24 hours)
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '18px',
                      padding: '14px 0'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-circle" style={{
                          fontSize: '24px',
                          color: '#6c757d'
                        }}></i>
                      </div>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#6c757d'
                      }}>
                        Account Activation
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Information */}
                <div
                  className="kyc-important-info"
                  style={{
                    backgroundColor: '#e7f3ff',
                    border: '2px solid #b3d7ff',
                    borderRadius: '18px',
                    padding: '28px',
                    marginBottom: '32px'
                  }}
                >
                  <h4 style={{
                    color: '#0056b3',
                    marginBottom: '20px',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '22px' }}></i>
                    Important Information
                  </h4>

                  <div style={{ color: '#495057', fontSize: '16px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '20px', minWidth: '24px' }}>⏰</span>
                      <span>Verification process takes up to <strong>24 hours</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '20px', minWidth: '24px' }}>🔐</span>
                      <span>Try logging in after 24 hours</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '20px', minWidth: '24px' }}>📋</span>
                      <span>Save your User ID for status checking</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <span style={{ fontSize: '20px', minWidth: '24px' }}>❓</span>
                      <span>No response? Contact admin through help section</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="kyc-action-buttons"
                  style={{
                    display: 'flex',
                    gap: '18px',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    className="kyc-status-btn"
                    onClick={goToLogin}
                    style={{
                      flex: '1',
                      minWidth: '220px',
                      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '18px 24px',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 5px 20px rgba(0, 123, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0, 123, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 20px rgba(0, 123, 255, 0.3)';
                    }}
                  >
                    <i className="bi bi-search" style={{ fontSize: '20px' }}></i>
                    Check Status on Login
                  </button>

                  <button
                    className="kyc-help-btn"
                    onClick={goToHelp}
                    style={{
                      flex: '1',
                      minWidth: '220px',
                      background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '18px 24px',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 5px 20px rgba(108, 117, 125, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(108, 117, 125, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 20px rgba(108, 117, 125, 0.3)';
                    }}
                  >
                    <i className="bi bi-question-circle" style={{ fontSize: '20px' }}></i>
                    Help & Support
                  </button>
                </div>
              </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(40px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes bounceIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @media (max-width: 768px) {
        .kyc-popup-container {
          margin: 10px;
          border-radius: 20px;
        }
        
        .kyc-popup-header {
          padding: 28px 24px;
          border-radius: 20px 20px 0 0;
        }
        
        .kyc-popup-header h2 {
          font-size: 28px;
        }
        
        .kyc-popup-content {
          padding: 32px 24px;
        }
        
        .kyc-user-id-box {
          padding: 24px 20px;
        }
        
        .kyc-action-buttons {
          flex-direction: column;
        }
        
        .kyc-status-btn,
        .kyc-help-btn {
          min-width: auto;
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .kyc-popup-header h2 {
          font-size: 24px;
        }
        
        .kyc-popup-header p {
          font-size: 16px;
        }
        
        .kyc-popup-content {
          padding: 24px 20px;
        }
        
        .kyc-user-id-box {
          padding: 20px;
        }
        
        .kyc-important-info {
          padding: 24px 20px;
        }
      }
    `}</style>
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