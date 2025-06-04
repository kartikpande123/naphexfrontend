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

const generateUserId = () => {
  return 'USER' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
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

  const createAccount = async () => {
    setIsLoading(true);
    const newUserId = generateUserId();
    const newReferralId = generateReferralId();

    try {
        // Get signup data
        const signupData = JSON.parse(localStorage.getItem('signupData')) || {};

        if (!signupData?.name) {
            throw new Error('Required signup data is missing');
        }

        // First, register the user in the binary system using /registerUser API
        const binaryResponse = await fetch(`${API_BASE_URL}/registerUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: newUserId,
                name: signupData.name,
                referralId: signupData.referralId || 'root',
                myrefrelid: newReferralId // Sending myrefrelid instead of state
            })
        });

        const binaryResult = await binaryResponse.json();
        if (!binaryResponse.ok) {
            throw new Error(binaryResult.error || 'Failed to register binary user.');
        }

        // Then create the regular user account
        const userData = {
            name: signupData.name,
            phoneNo: signupData.phoneNo,
            password: signupData.password,
            myuserid: newUserId,
            myrefrelid: newReferralId,
            email: signupData.email?.trim() || '',
            city: signupData.city?.trim() || '',
            state: signupData.state?.trim() || ''
        };

        const userResponse = await fetch(`${API_BASE_URL}/add-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!userResponse.ok) {
            throw new Error('Failed to add user.');
        }

        // Update state and show success message
        setUserId(newUserId);
        setReferralId(newReferralId);
        setShowPopup(true);
        setAlert({
            show: true,
            message: 'Account created successfully! You received 200 tokens.',
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

  return (
    <div className="payment-container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">Payment Gateway</h1>
          <p className="subtitle">Create your account to get started</p>
        </div>

        <button 
          className="create-account-btn" 
          onClick={createAccount} 
          disabled={isLoading || !signupData}
        >
          <WalletIcon />
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        {showPopup && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">
                Account Created Successfully! 🎉
              </h2>
              
              <p className="tokens-info ti">
                You've received 200 tokens! 🪙
              </p>

              <div className="id-container">
                <label className="id-label">Your User ID</label>
                <div className="id-content">
                  <code className="id-code">{userId}</code>
                  <button
                    onClick={() => copyToClipboard(userId, 'userId')}
                    className="copy-button"
                  >
                    {copiedUserId ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              </div>

              <div className="id-container">
                <label className="id-label">Your Referral ID</label>
                <div className="id-content">
                  <code className="id-code">{referralId}</code>
                  <button
                    onClick={() => copyToClipboard(referralId, 'refId')}
                    className="copy-button"
                  >
                    {copiedRefId ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              </div>

              <button className="continue-btn" onClick={goToLogin}>
                Please Login
              </button>
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