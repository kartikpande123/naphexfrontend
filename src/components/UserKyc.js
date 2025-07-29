import React, { useState, useEffect } from 'react';
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

const generateUserId = () => {
  return 'USER' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// File validation function
const validateFile = (file) => {
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

  // KYC State
  const [kycData, setKycData] = useState({
    aadharCard: null,
    panCard: null,
    bankPassbook: null
  });

  const [kycErrors, setKycErrors] = useState({
    aadharCard: '',
    panCard: '',
    bankPassbook: ''
  });

  const [uploadProgress, setUploadProgress] = useState({
    aadharCard: false,
    panCard: false,
    bankPassbook: false
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

  const handleFileUpload = (event, documentType) => {
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

  const handleKYCSubmit = () => {
    // Validate all documents are uploaded
    const { aadharCard, panCard, bankPassbook } = kycData;

    if (!aadharCard || !panCard || !bankPassbook) {
      setAlert({
        show: true,
        message: 'Please upload all required documents',
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

      // Validate KYC documents
      if (!kycData.aadharCard || !kycData.panCard || !kycData.bankPassbook) {
        throw new Error('All KYC documents are required');
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

      // Add KYC files
      formData.append('aadharCard', kycData.aadharCard);
      formData.append('panCard', kycData.panCard);
      formData.append('bankPassbook', kycData.bankPassbook);

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
    navigate("/login");
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

            <button
              className="submit-kyc-btn"
              onClick={handleKYCSubmit}
              disabled={!kycData.aadharCard || !kycData.panCard || !kycData.bankPassbook}
            >
              Submit KYC Documents
            </button>
          </div>
        )}

        {/* Create Account Button - Only shown after KYC completion */}
        {kycCompleted && (
          <div className="account-creation">
            <div className="kyc-success">
              <CheckIcon />
              <h3>KYC Submission Completed!</h3>
              <p>Your documents have been uploaded successfully. You can now create your account.</p>
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

        {/* {/* Admin Verification Popup with User ID * used inline css for/} */}
        {showPopup && (
          <div
            className="kyc-popup-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
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
                    Your account is now under admin verification. We're reviewing your KYC details and documents.
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
                        backgroundColor: '#e6f7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-check-circle-fill" style={{
                          fontSize: '24px',
                          color: '#28a745'
                        }}></i>
                      </div>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#28a745'
                      }}>
                        Account Created
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