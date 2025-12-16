import React, { useEffect, useState, useRef } from 'react';
import API_BASE_URL from './ApiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import upiQrCode from '../images/upi_bar2.jpg';

const EntryFees = ({ onContinue }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [entryFeeStatus, setEntryFeeStatus] = useState('checking');
  
  const qrCodeRef = useRef(null);

  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const phoneNo = userData?.phoneNo || "";

  const UPI_ID = "9019842426-2@ybl";
  
  // Calculate entry fee with 28% tax
  const BASE_AMOUNT = 1171.875; // Base amount before tax (1500 / 1.28)
  const TAX_RATE = 0.28; // 28% tax
  const TAX_AMOUNT = BASE_AMOUNT * TAX_RATE; // 328.125
  const TOTAL_AMOUNT = 1500; // Total amount including tax

  useEffect(() => {
    checkEntryFeeStatus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && entryFeeStatus !== 'paid') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handlePopState = (e) => {
      if (entryFeeStatus !== 'paid') {
        e.preventDefault();
        window.history.pushState(null, null, window.location.pathname);
        alert("🚫 Payment required to continue. Please complete the entry fee.");
      }
    };

    const handleBeforeUnload = (e) => {
      if (entryFeeStatus !== 'paid') {
        e.preventDefault();
        e.returnValue = "Payment is required to continue. Are you sure you want to leave?";
        return "Payment is required to continue. Are you sure you want to leave?";
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, null, window.location.pathname);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [entryFeeStatus]);

  const checkEntryFeeStatus = async () => {
    if (!phoneNo) {
      setEntryFeeStatus('unpaid');
      clearPaymentForm();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/check-entry-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo })
      });

      const data = await res.json();
      
      if (data.success && data.entryFee === 'paid') {
        // Payment verified - proceed to dashboard
        setEntryFeeStatus('paid');
        setTimeout(() => onContinue(), 100);
      } else if (data.success && data.entryFee === 'pending') {
        // Payment under verification
        setEntryFeeStatus('pending');
        setVerificationStatus('Your payment is under verification. Please wait for admin approval.');
      } else if (data.success && data.entryFee === 'unpaid') {
        // Payment unpaid or rejected - clear everything
        setEntryFeeStatus('unpaid');
        clearPaymentForm();
      } else {
        // Default to unpaid
        setEntryFeeStatus('unpaid');
        clearPaymentForm();
      }
    } catch (err) {
      console.error("Error checking entry fee status:", err);
      setEntryFeeStatus('unpaid');
      clearPaymentForm();
    }
  };

  const clearPaymentForm = () => {
    // Clear all payment-related states
    setTransactionId('');
    setPaymentScreenshot(null);
    setScreenshotPreview('');
    setShowPaymentForm(false);
    setVerificationStatus('');
    setPaymentStatus('');
    setIsVerifying(false);
    
    // Clear file input if it exists
    const fileInput = document.getElementById('screenshotInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handlePayNow = () => {
    setShowPaymentForm(true);
    setPaymentStatus('Scan the QR code or use the UPI ID to make payment');
    
    // Scroll to QR code after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (qrCodeRef.current) {
        qrCodeRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ File size should be less than 5MB");
        e.target.value = '';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("❌ Please upload an image file");
        e.target.value = '';
        return;
      }

      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentScreenshot) {
      alert("❌ Please upload payment screenshot");
      return;
    }

    if (!phoneNo) {
      alert("❌ Phone number not found");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('Submitting payment details for verification...');

    try {
      const formData = new FormData();
      formData.append('phoneNo', phoneNo);
      formData.append('transactionId', transactionId.trim() || 'N/A');
      formData.append('amount', TOTAL_AMOUNT);
      formData.append('screenshot', paymentScreenshot);

      const res = await fetch(`${API_BASE_URL}/submit-order-id`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      
      if (data.success) {
        setEntryFeeStatus('pending');
        setVerificationStatus('✅ Payment details submitted successfully! Your payment is under verification. Admin will verify your payment soon.');
        setShowPaymentForm(false);
      } else {
        throw new Error(data.error || 'Failed to submit payment details');
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      setVerificationStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ UPI ID copied to clipboard!");
  };

  if (entryFeeStatus === 'checking') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem'
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (entryFeeStatus === 'paid') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem'
        }}
      >
        <div className="text-center">
          <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✅</div>
          <p>Payment verified! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1050,
          userSelect: 'none',
          pointerEvents: 'all'
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      <div
        className="modal show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ 
          backgroundColor: 'transparent',
          zIndex: 1055,
          userSelect: 'none'
        }}
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxHeight: '90vh', overflow: 'auto', maxWidth: '500px' }}>
          <div
            className="modal-content p-0"
            style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '2px solid #007bff',
              boxShadow: '0 0 30px rgba(0,123,255,0.4)',
              overflow: 'visible',
              userSelect: 'none',
              position: 'relative'
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: 'none'
              }}
            />
            
            <div
              className="modal-header text-white d-flex justify-content-between align-items-center"
              style={{
                background: 'linear-gradient(90deg, #007bff, #0056b3)',
                borderBottom: 'none'
              }}
            >
              <h5 className="modal-title mb-0">🎮 Game Entry - ₹1500</h5>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              >
                Logout
              </button>
            </div>

            <div className="modal-body text-center p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {entryFeeStatus === 'pending' ? (
                <>
                  <div className="mb-4">
                    <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="text-warning mb-3">⏳ Payment Under Verification</h4>
                    <p style={{ fontSize: '0.95rem' }} className="text-muted">
                      Your payment is currently under verification by our admin team. This process typically takes between 4 to 24 hours. Please try logging in again after some time.
                    </p>
                  </div>

                  <div
                    className="alert alert-warning my-3 text-start"
                    style={{
                      fontSize: '0.9rem',
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      borderLeft: '4px solid #ffc107'
                    }}
                  >
                    ⏳ Your payment is under verification. Please wait for admin approval.
                  </div>

                  <button
                    className="btn btn-secondary w-100 mt-3 py-2"
                    onClick={checkEntryFeeStatus}
                    style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      borderRadius: '10px'
                    }}
                  >
                    🔄 Refresh Status
                  </button>
                </>
              ) : (
                <>
                  <h4 className="text-primary mb-3">Join the Game Room</h4>
                  <p style={{ fontSize: '0.95rem' }} className="text-muted">
                    Unlock your access to play and compete.
                  </p>

                  {/* Price Breakdown */}
                  <div
                    className="alert alert-info mt-3"
                    style={{
                      fontSize: '0.9rem',
                      backgroundColor: '#e6f2ff',
                      color: '#004085',
                      border: '1px solid #b8daff'
                    }}
                  >
                    <div className="text-start">
                      <strong>💰 Entry Fee Breakdown:</strong>
                      <div className="mt-2" style={{ fontSize: '0.85rem' }}>
                        <div className="d-flex justify-content-between">
                          <span>Base Amount:</span>
                          <span>₹{BASE_AMOUNT.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Tax (28%):</span>
                          <span>₹{TAX_AMOUNT.toFixed(2)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total Amount:</span>
                          <span>₹{TOTAL_AMOUNT}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="alert alert-success mt-2"
                    style={{
                      fontSize: '0.9rem',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      border: '1px solid #c3e6cb'
                    }}
                  >
                    🎁 <strong>Bonus:</strong> Unlock 1080 tokens instantly upon completing the entry fee!
                  </div>

                  {paymentStatus && (
                    <div
                      className="alert alert-secondary my-3 text-start"
                      style={{
                        fontSize: '0.9rem',
                        backgroundColor: '#f5faff',
                        color: '#003366',
                        borderLeft: '4px solid #007bff',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ℹ️ {paymentStatus}
                    </div>
                  )}

                  {!showPaymentForm ? (
                    <button
                      className="btn btn-primary w-100 mt-3 py-2"
                      onClick={handlePayNow}
                      disabled={loading}
                      style={{
                        fontWeight: '600',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                      }}
                    >
                      💳 Pay ₹1500 Now
                    </button>
                  ) : (
                    <div className="mt-4">
                      {/* QR Code Section */}
                      <div ref={qrCodeRef} className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <h6 className="mb-3" style={{ fontWeight: '600' }}>Scan QR Code to Pay</h6>
                        <img 
                          src={upiQrCode} 
                          alt="UPI QR Code" 
                          style={{ 
                            maxWidth: '250px', 
                            width: '100%', 
                            border: '3px solid #007bff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                          }}
                        />
                        
                        <div className="mt-3 p-2" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                          <small className="text-muted d-block mb-1">Or use UPI ID:</small>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <strong style={{ fontSize: '1rem', color: '#007bff' }}>{UPI_ID}</strong>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => copyToClipboard(UPI_ID)}
                              style={{ padding: '2px 10px', fontSize: '0.75rem' }}
                            >
                              📋 Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className="alert alert-warning text-start"
                        style={{
                          fontSize: '0.85rem',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          border: '1px solid #ffc107'
                        }}
                      >
                        <strong>⚠️ Important:</strong> After completing payment, upload the screenshot below and optionally provide transaction ID.
                      </div>

                      {/* Transaction ID - Optional */}
                      <div className="mb-3 text-start">
                        <label htmlFor="transactionIdInput" className="form-label" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          Transaction ID <span className="text-muted">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="transactionIdInput"
                          className="form-control"
                          placeholder="e.g., TXN123456789"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          disabled={isVerifying}
                          style={{
                            fontSize: '0.95rem',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '2px solid #ced4da'
                          }}
                        />
                      </div>

                      {/* Payment Screenshot - Required */}
                      <div className="mb-3 text-start">
                        <label htmlFor="screenshotInput" className="form-label" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          Payment Screenshot <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          id="screenshotInput"
                          className="form-control"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          disabled={isVerifying}
                          style={{
                            fontSize: '0.95rem',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '2px solid #007bff'
                          }}
                        />
                        <small className="text-muted">Max size: 5MB | Formats: JPG, PNG, JPEG</small>
                      </div>

                      {/* Screenshot Preview */}
                      {screenshotPreview && (
                        <div className="mb-3 text-center">
                          <img 
                            src={screenshotPreview} 
                            alt="Payment Screenshot Preview" 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '200px',
                              border: '2px solid #28a745',
                              borderRadius: '8px',
                              objectFit: 'contain'
                            }}
                          />
                          <p className="text-success mt-2 mb-0" style={{ fontSize: '0.85rem' }}>✅ Screenshot uploaded</p>
                        </div>
                      )}

                      {verificationStatus && (
                        <div
                          className={`alert ${verificationStatus.includes('✅') ? 'alert-success' : 'alert-danger'} my-3 text-start`}
                          style={{
                            fontSize: '0.9rem'
                          }}
                        >
                          {verificationStatus}
                        </div>
                      )}

                      <button
                        className="btn btn-success w-100 py-2"
                        onClick={handleSubmitPayment}
                        disabled={isVerifying || !paymentScreenshot}
                        style={{
                          fontWeight: '600',
                          fontSize: '1rem',
                          borderRadius: '10px',
                          boxShadow: '0 4px 12px rgba(40,167,69,0.3)'
                        }}
                      >
                        {isVerifying ? 'Submitting...' : '✅ Submit Payment Details'}
                      </button>

                      <button
                        className="btn btn-link text-primary mt-2"
                        onClick={() => {
                          clearPaymentForm();
                        }}
                        style={{ fontSize: '0.85rem' }}
                      >
                        ← Back to Payment
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className="modal-footer justify-content-center"
              style={{
                backgroundColor: '#f1f9ff',
                fontSize: '0.85rem',
                color: '#007bff',
                borderTop: '1px solid #dee2e6'
              }}
            >
              🔐 Secure UPI Payment
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1060
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div
              className="modal-content"
              style={{
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: 'none'
              }}
            >
              <div
                className="modal-header text-center"
                style={{
                  background: 'linear-gradient(90deg, #dc3545, #c82333)',
                  color: 'white',
                  borderBottom: 'none',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <h6 className="modal-title w-100 mb-0">🚪 Logout Confirmation</h6>
              </div>

              <div className="modal-body text-center p-4">
                <p className="mb-3" style={{ fontSize: '0.95rem', color: '#495057' }}>
                  Are you sure you want to logout?
                </p>
                <small className="text-muted d-block mb-3">
                  You'll need to login again to access the game.
                </small>
              </div>

              <div className="modal-footer justify-content-center border-0 pb-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm me-2"
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    fontSize: '0.85rem',
                    padding: '6px 16px',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleLogout}
                  style={{
                    fontSize: '0.85rem',
                    padding: '6px 16px',
                    borderRadius: '8px'
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntryFees;