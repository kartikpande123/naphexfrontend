import React, { useEffect, useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
import payBgImage from '../images/pay-bg.png';

const AddTokens = ({ onClose, onTokensUpdated }) => {
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [cashfreeInstance, setCashfreeInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [userTokens, setUserTokens] = useState(0);

  // Get user data from localStorage
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const phoneNo = userData?.phoneNo || "";

  // Token price (₹1 per token)
  const TOKEN_PRICE = 1;

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfree = await load({ mode: 'sandbox' }); // change to 'production' in prod
        setCashfreeInstance(cashfree);
        setCashfreeReady(true);
      } catch (err) {
        console.error("SDK Load Error:", err);
        setPaymentStatus("❌ Failed to load payment SDK");
      }
    };

    initializeCashfree();
    
    // Load current user tokens
    if (userData?.tokens) {
      setUserTokens(userData.tokens);
    }
  }, []);

  const handleTokenAmountChange = (e) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setTokenAmount(value);
      setPaymentStatus('');
    }
  };

  const handlePurchase = async () => {
    const tokens = parseInt(tokenAmount);
    
    if (!tokens || tokens < 1) {
      setPaymentStatus("❌ Please enter a valid token amount (minimum 1)");
      return;
    }

    if (tokens > 10000) {
      setPaymentStatus("❌ Maximum 10,000 tokens allowed per transaction");
      return;
    }

    if (!phoneNo) {
      setPaymentStatus("❌ Phone number not found");
      return;
    }

    if (!cashfreeInstance || !cashfreeReady) {
      setPaymentStatus("❌ Payment system not ready");
      return;
    }

    setLoading(true);
    setPaymentStatus("Creating payment order...");

    try {
      const amount = tokens * TOKEN_PRICE;

      // Step 1: Create Order
      const createOrderRes = await fetch(`${API_BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phoneNo, 
          amount, 
          orderNote: `Purchase ${tokens} tokens`
        })
      });

      const orderData = await createOrderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { paymentSessionId, orderId } = orderData;
      setPaymentStatus("Opening payment window...");

      // Step 2: Open Cashfree Checkout
      const result = await cashfreeInstance.checkout({
        paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result.error) {
        throw new Error(`Payment failed: ${result.error.message || result.error}`);
      }

      setPaymentStatus("Verifying payment...");

      // Step 3: Verify Payment
      const verifyRes = await fetch(`${API_BASE_URL}/verify-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success || verifyData.status !== 'PAID') {
        throw new Error(`Payment verification failed: ${verifyData.status}`);
      }

      setPaymentStatus("Adding tokens to your account...");

      // Step 4: Add Tokens
      const addTokensRes = await fetch(`${API_BASE_URL}/add-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo,
          orderId,
          amount: tokens
        })
      });

      const tokensData = await addTokensRes.json();
      if (!tokensData.success) {
        throw new Error("Failed to add tokens to account");
      }

      // Update local state and localStorage
      const newTokenBalance = tokensData.tokens;
      setUserTokens(newTokenBalance);
      
      // Update localStorage
      const updatedUserData = { ...userData, tokens: newTokenBalance };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      setPaymentStatus(`✅ Success! ${tokens} tokens added to your account!`);
      
      // Clear input after successful payment
      setTokenAmount('');
      
      // Notify parent component
      if (onTokensUpdated) {
        onTokensUpdated(newTokenBalance);
      }

      // Auto close after 3 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

    } catch (err) {
      console.error("Purchase Error:", err);
      setPaymentStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    const tokens = parseInt(tokenAmount);
    return tokens ? tokens * TOKEN_PRICE : 0;
  };



  return (
    <>
      {/* Background Image with Blur */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${payBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          zIndex: 9998,
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose && !loading) onClose();
        }}
      >
        {/* Main Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '650px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto'
          }}
        >
          {/* Header - Fixed */}
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              padding: '1.5rem',
              color: 'white',
              position: 'relative',
              textAlign: 'center',
              flexShrink: 0
            }}
          >
            {/* Back Button */}
            <button
              onClick={() => window.location.href = '/home'}
              disabled={loading}
              style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                background: 'rgba(255, 255, 255, 0.25)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                height: '40px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              <span>Back</span>
            </button>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '18px',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseOver={(e) => !loading && (e.target.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseOut={(e) => !loading && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
              >
                ✕
              </button>
            )}

            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🪙</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Add Tokens
            </h2>
          </div>

          {/* Scrollable Content */}
          <div 
            style={{ 
              padding: '1.5rem', 
              overflowY: 'auto',
              flexGrow: 1,
              minHeight: 0
            }}
          >
            {/* Current Balance */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Current Balance
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b'
                }}
              >
                {userTokens.toLocaleString()} tokens
              </div>
            </div>

            {/* Token Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}
              >
                Enter Token Amount
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={tokenAmount}
                  onChange={handleTokenAmountChange}
                  placeholder="e.g., 100"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: loading ? '#f9fafb' : '#ffffff'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '0.95rem'
                  }}
                >
                  tokens
                </div>
              </div>
            </div>

            {/* Price Display */}
            {tokenAmount && !isNaN(parseInt(tokenAmount)) && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ color: '#065f46', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Total Amount
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#065f46'
                  }}
                >
                  ₹{calculateAmount().toLocaleString()}
                </div>
                <div style={{ color: '#047857', fontSize: '0.8rem' }}>
                  ₹{TOKEN_PRICE} per token
                </div>
              </div>
            )}

            {/* Tax Information */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📋 Important Tax Information
              </div>
              <div style={{ color: '#92400e', fontSize: '0.8rem', lineHeight: '1.4' }}>
                • <strong>GST:</strong> 28% GST is applicable on all token purchases as per Indian tax regulations
                <br />
                • <strong>Processing Fee:</strong> Cashfree may charge up to 2% processing fee depending on your payment method
                <br />
                • <strong>Final Amount:</strong> The exact total will be confirmed at checkout
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus && (
              <div
                style={{
                  background: paymentStatus.includes('❌') 
                    ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                    : paymentStatus.includes('✅')
                    ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                    : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  border: `2px solid ${
                    paymentStatus.includes('❌') 
                      ? '#f87171'
                      : paymentStatus.includes('✅')
                      ? '#10b981'
                      : '#3b82f6'
                  }`,
                  borderRadius: '12px',
                  padding: '0.875rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: paymentStatus.includes('❌') 
                    ? '#dc2626'
                    : paymentStatus.includes('✅')
                    ? '#065f46'
                    : '#1e40af',
                  textAlign: 'center'
                }}
              >
                {paymentStatus}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '2px solid #d1d5db',
                    color: '#6b7280',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  Cancel
                </button>
              )}
              
              <button
                onClick={handlePurchase}
                disabled={loading || !tokenAmount || !cashfreeReady || !parseInt(tokenAmount)}
                style={{
                  flex: 2,
                  background: (tokenAmount && parseInt(tokenAmount) > 0)
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : '#9ca3af',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (tokenAmount && parseInt(tokenAmount) > 0 && !loading) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: (tokenAmount && parseInt(tokenAmount) > 0)
                    ? '0 4px 20px rgba(37, 99, 235, 0.3)'
                    : 'none'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    Processing...
                  </span>
                ) : tokenAmount && parseInt(tokenAmount) > 0 ? (
                  `Proceed to Pay`
                ) : (
                  'Enter Amount'
                )}
              </button>
            </div>

            {/* Security Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#64748b'
              }}
            >
              <div style={{ fontSize: '1rem' }}>🔒</div>
              <div>
                <strong>Secure Payment</strong> powered by Cashfree Payments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AddTokens;