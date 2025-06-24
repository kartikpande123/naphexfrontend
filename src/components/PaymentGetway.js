import React, { useState, useEffect } from 'react';
import './Paymentgetway.css';
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

const PaymentGateway = () => {
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
        <div className="header">
          <h1 className="title">Payment Gateway</h1>
          <p className="subtitle">Complete KYC verification to create your account</p>
        </div>

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

        {/* Admin Verification Popup with User ID */}
        {showPopup && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="verification-header">
                <AdminIcon />
                <h2 className="modal-title">
                  Account Created Successfully! 🎉
                </h2>
              </div>
              
              {/* User ID Display Section */}
              <div className="user-id-section" style={{
                backgroundColor: '#f8f9fa',
                border: '2px solid #28a745',
                borderRadius: '10px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#28a745', marginBottom: '15px' }}>
                  <i className="bi bi-person-badge" style={{ marginRight: '10px' }}></i>
                  Your User ID
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#495057',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}>
                    {userId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(userId, 'userId')}
                    style={{
                      background: copiedUserId ? '#28a745' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    title="Copy User ID"
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
                <p style={{
                  marginTop: '15px',
                  fontSize: '14px',
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  <i className="bi bi-info-circle" style={{ marginRight: '5px' }}></i>
                  With this ID you can see your account acceptance status on the login page
                </p>
              </div>
              
              <div className="verification-content">
                <div className="verification-status">
                  <ClockIcon />
                  <h3>Under Admin Review</h3>
                </div>
                
                <div className="verification-info">
                  <p>Your account has been created and is now under admin verification.</p>
                  <p>We are reviewing your KYC details and documents to ensure everything is in order.</p>
                </div>

                <div className="timeline-info">
                  <div className="timeline-item">
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>Account Created</span>
                  </div>
                  <div className="timeline-item">
                    <i className="bi bi-clock text-warning"></i>
                    <span>Admin Verification (Up to 24 hours)</span>
                  </div>
                  <div className="timeline-item">
                    <i className="bi bi-circle text-muted"></i>
                    <span>Account Activation</span>
                  </div>
                </div>
Sign Up Pa
                <div className="important-note">
                  <h4>Important Information:</h4>
                  <ul>
                    <li>⏰ Verification process takes up to <strong>24 hours</strong></li>
                    <li>🔐 Try logging in after 24 hours</li>
                    <li>📋 Save your User ID for status checking</li>
                    <li>❓ No response? Contact admin through help section</li>
                  </ul>
                </div>
              </div>

              <div className="action-buttons">
                <button className="help-btn" onClick={goToLogin}>
                  <i className="bi bi-search"></i>
                  Check Status on Login
                </button>
                <button className="help-btn" onClick={goToHelp}>
                  <i className="bi bi-question-circle"></i>
                  Help & Support
                </button>
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

export default PaymentGateway;