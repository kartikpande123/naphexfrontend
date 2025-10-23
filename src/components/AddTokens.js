import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
import payBgImage from '../images/pay-bg.png';

const AddTokens = ({ onClose, onTokensUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showPaymentIdInput, setShowPaymentIdInput] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('');
  const [userTokens, setUserTokens] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Get user data from localStorage
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const phoneNo = userData?.phoneNo || "";

  // Token price (₹1 per token)
  const TOKEN_PRICE = 1;
  const GST_RATE = 0.28; // 28% GST
  const PAYMENT_GATEWAY_FEE = 0.025; // 2.5% Razorpay fee

  // Payment link - Razorpay payment link
  const RAZORPAY_PAYMENT_LINK = "https://razorpay.me/@mohammedadilbetageri?amount=tEDHZxxCtz0rKFL9kTzhOw%3D%3D";

  // Toast notification function
  const showToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
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

  const calculateGST = () => {
    const tokens = parseInt(tokenAmount);
    if (!tokens) return 0;
    return parseFloat((tokens * GST_RATE).toFixed(2));
  };

  const calculatePaymentGatewayFee = () => {
    const tokens = parseInt(tokenAmount);
    if (!tokens) return 0;
    const amount = tokens * TOKEN_PRICE;
    return parseFloat((amount * PAYMENT_GATEWAY_FEE).toFixed(2));
  };

  const calculateNetTokens = () => {
    const tokens = parseInt(tokenAmount);
    if (!tokens) return 0;
    // Net tokens = Total - GST - Gateway Fee
    const gst = calculateGST();
    const gatewayFee = calculatePaymentGatewayFee();
    return parseFloat((tokens - gst - gatewayFee).toFixed(2));
  };

  const calculateTotalAmount = () => {
    // User wants to recharge for X tokens
    // They need to pay X amount (₹1 per token)
    const tokens = parseInt(tokenAmount);
    if (!tokens) return 0;
    return tokens * TOKEN_PRICE;
  };

  const handlePayNow = () => {
    const tokens = parseInt(tokenAmount);
    
    if (!tokens || tokens < 1) {
      showToast("Please enter a valid token amount (minimum 1)", "error");
      return;
    }

    if (!phoneNo) {
      showToast("Phone number not found", "error");
      return;
    }

    // Open Razorpay payment link in new tab
    window.open(RAZORPAY_PAYMENT_LINK, '_blank');
    
    // Show payment ID input after opening payment link
    setShowPaymentIdInput(true);
    setPaymentStatus('Please complete the payment and copy your Payment ID from Razorpay');
  };

  const handleSubmitPaymentId = async () => {
    if (!paymentId.trim()) {
      showToast("Please enter the Payment ID", "error");
      return;
    }

    if (!phoneNo) {
      showToast("Phone number not found", "error");
      return;
    }

    const tokens = parseInt(tokenAmount);
    if (!tokens) {
      showToast("Invalid token amount", "error");
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('Submitting token request for verification...');

    try {
      const res = await fetch(`${API_BASE_URL}/submit-token-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phoneNo, 
          paymentId: paymentId.trim(),
          requestedTokens: tokens,
          netTokens: calculateNetTokens(),
          amountPaid: calculateTotalAmount(),
          gstAmount: calculateGST(),
          gatewayFee: calculatePaymentGatewayFee()
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Show success toast with detailed info
        showToast(
          `Token Request Submitted! Your payment is under verification. Admin will add ${calculateNetTokens().toLocaleString()} tokens to your account within 24-48 hours. Payment ID: ${paymentId.trim()}`,
          "success",
          8000
        );
        
        setShowPaymentIdInput(false);
        setTokenAmount('');
        setPaymentId('');
        setPaymentStatus('');

        // Close modal after short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to submit token request');
      }
    } catch (err) {
      console.error("Error submitting payment ID:", err);
      showToast(err.message, "error");
      setPaymentStatus('');
    } finally {
      setIsSubmitting(false);
    }
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
              <span>Back</span>
            </button>

            {/* View Old Token Requests Button */}
            <button
              onClick={() => window.location.href = '/usertokenrequest'}
              disabled={loading}
              style={{
                position: 'absolute',
                top: '15px',
                right: '10px',
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
                fontSize: '13px',
                fontWeight: 'bold',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                }
              }}
            >
              <span>Previous Requests</span>
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

            {!showPaymentIdInput ? (
              <>
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
                    Enter Token Amount to Purchase
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

                {/* Price Breakdown */}
                {tokenAmount && !isNaN(parseInt(tokenAmount)) && (
                  <>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ color: '#1e40af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Total Amount to Pay
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: '#1e40af'
                        }}
                      >
                        ₹{calculateTotalAmount().toLocaleString()}
                      </div>
                      <div style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        for {parseInt(tokenAmount).toLocaleString()} tokens recharge
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        border: '2px solid #10b981',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', color: '#065f46', marginBottom: '0.75rem' }}>
                        <strong>💰 Breakdown (from ₹{calculateTotalAmount().toLocaleString()})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#065f46' }}>Base Recharge</span>
                        <span style={{ fontWeight: '600', color: '#065f46' }}>₹{calculateTotalAmount().toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#dc2626' }}>- GST (28%)</span>
                        <span style={{ fontWeight: '600', color: '#dc2626' }}>-₹{calculateGST().toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#dc2626' }}>- Gateway Fee (2.5%)</span>
                        <span style={{ fontWeight: '600', color: '#dc2626' }}>-₹{calculatePaymentGatewayFee().toLocaleString()}</span>
                      </div>
                      <div style={{ borderTop: '2px solid #10b981', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span style={{ color: '#065f46', fontWeight: '700' }}>You Will Get</span>
                          <span style={{ fontWeight: '700', color: '#065f46', fontSize: '1.2rem' }}>{calculateNetTokens().toLocaleString()} tokens</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Important Information */}
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
                    📋 Important Information
                  </div>
                  <div style={{ color: '#92400e', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    • Payment will be verified by admin within 4-24 hours
                    <br />
                    • You will receive tokens after successful verification
                    <br />
                    • Keep your Payment ID safe for reference
                    <br />
                    • 28% GST + 2.5% gateway fee will be deducted from recharge amount
                    <br />
                    • Example: ₹100 recharge = ₹100 - ₹28 (GST) - ₹2.5 (fee) = ~69.5 tokens
                    <br />
                    • No maximum limit - you can purchase any amount of tokens
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
                    onClick={handlePayNow}
                    disabled={loading || !tokenAmount || !parseInt(tokenAmount)}
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
                    {tokenAmount && parseInt(tokenAmount) > 0 ? (
                      `💳 Pay ₹${calculateTotalAmount().toLocaleString()}`
                    ) : (
                      'Enter Amount'
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Payment ID Input Section
              <div>
                <div
                  className="alert alert-warning text-start"
                  style={{
                    fontSize: '0.85rem',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffc107',
                    marginBottom: '1rem'
                  }}
                >
                  <strong>⚠️ Important:</strong> After completing payment on Razorpay, copy the <strong>Payment ID</strong> and paste it below.
                </div>

                <label style={{ 
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Enter Payment ID <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="e.g., pay_ABC123xyz"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    fontSize: '1rem',
                    border: '2px solid #2563eb',
                    borderRadius: '12px',
                    outline: 'none',
                    marginBottom: '1rem'
                  }}
                />

                <div style={{ 
                  background: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#065f46'
                }}>
                  <div><strong>Requested Tokens:</strong> {parseInt(tokenAmount).toLocaleString()}</div>
                  <div><strong>You Will Get:</strong> {calculateNetTokens().toLocaleString()} tokens</div>
                  <div><strong>Amount Paid:</strong> ₹{calculateTotalAmount().toLocaleString()}</div>
                </div>

                {paymentStatus && (
                  <div
                    style={{
                      background: paymentStatus.includes('❌') 
                        ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                        : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                      border: `2px solid ${paymentStatus.includes('❌') ? '#f87171' : '#10b981'}`,
                      borderRadius: '12px',
                      padding: '0.875rem',
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                      color: paymentStatus.includes('❌') ? '#dc2626' : '#065f46',
                      textAlign: 'center'
                    }}
                  >
                    {paymentStatus}
                  </div>
                )}

                <button
                  onClick={handleSubmitPaymentId}
                  disabled={isSubmitting || !paymentId.trim()}
                  style={{
                    width: '100%',
                    background: (paymentId.trim() && !isSubmitting)
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : '#9ca3af',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (paymentId.trim() && !isSubmitting) ? 'pointer' : 'not-allowed',
                    marginBottom: '0.5rem',
                    boxShadow: (paymentId.trim() && !isSubmitting)
                      ? '0 4px 20px rgba(16, 185, 129, 0.3)'
                      : 'none'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : '✅ Submit Payment ID'}
                </button>

                <button
                  onClick={() => {
                    setShowPaymentIdInput(false);
                    setPaymentId('');
                    setPaymentStatus('');
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '2px solid #d1d5db',
                    color: '#6b7280',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Token Selection
                </button>
              </div>
            )}

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
                color: '#64748b',
                marginTop: '1rem'
              }}
            >
              <div style={{ fontSize: '1rem' }}>🔒</div>
              <div>
                <strong>Secure Payment</strong> powered by Razorpay
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

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>

      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'success' 
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : toast.type === 'error'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideIn 0.3s ease-out',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}
          >
            <div style={{ flexShrink: 0, fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div style={{ flex: 1 }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                flexShrink: 0,
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AddTokens;