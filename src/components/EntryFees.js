import React, { useEffect, useState } from 'react';
import API_BASE_URL from './ApiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

const EntryFees = ({ onContinue }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showOrderIdInput, setShowOrderIdInput] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [entryFeeStatus, setEntryFeeStatus] = useState('checking'); // checking, unpaid, pending, paid

  // Get user data from localStorage
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const phoneNo = userData?.phoneNo || "";

  const RAZORPAY_LINK = "https://razorpay.me/@mohammedadilbetageri?amount=zgioswZa9n4qt5x9yD7i%2BQ%3D%3D";

  useEffect(() => {
    // Check entry fee status on component mount
    checkEntryFeeStatus();

    // Prevent closing popup with Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && entryFeeStatus !== 'paid') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent browser back button
    const handlePopState = (e) => {
      if (entryFeeStatus !== 'paid') {
        e.preventDefault();
        window.history.pushState(null, null, window.location.pathname);
        alert("🚫 Payment required to continue. Please complete the entry fee.");
      }
    };

    // Prevent page refresh/close
    const handleBeforeUnload = (e) => {
      if (entryFeeStatus !== 'paid') {
        e.preventDefault();
        e.returnValue = "Payment is required to continue. Are you sure you want to leave?";
        return "Payment is required to continue. Are you sure you want to leave?";
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Push initial state to prevent back navigation
    window.history.pushState(null, null, window.location.pathname);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [entryFeeStatus]);

  // Check if user has already paid entry fee
  const checkEntryFeeStatus = async () => {
    if (!phoneNo) {
      setEntryFeeStatus('unpaid');
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
        setEntryFeeStatus('paid');
        // Auto-continue to dashboard
        setTimeout(() => onContinue(), 1000);
      } else if (data.success && data.entryFee === 'pending') {
        setEntryFeeStatus('pending');
        setVerificationStatus('Your payment is under verification. Please wait for admin approval.');
      } else {
        setEntryFeeStatus('unpaid');
      }
    } catch (err) {
      console.error("Error checking entry fee status:", err);
      setEntryFeeStatus('unpaid');
    }
  };

  const handleLogout = () => {
    // Clear localStorage and navigate to login page
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handlePayNow = () => {
    // Open Razorpay payment link in new tab
    window.open(RAZORPAY_LINK, '_blank');
    
    // Show order ID input after opening payment link
    setShowOrderIdInput(true);
    setPaymentStatus('Please complete the payment and copy your Order ID from Razorpay');
  };

  const handleSubmitOrderId = async () => {
    if (!orderId.trim()) {
      alert("❌ Please enter the Order ID");
      return;
    }

    if (!phoneNo) {
      alert("❌ Phone number not found");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('Submitting order ID for verification...');

    try {
      const res = await fetch(`${API_BASE_URL}/submit-order-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phoneNo, 
          orderId: orderId.trim(),
          amount: 500
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setEntryFeeStatus('pending');
        setVerificationStatus('✅ Order ID submitted successfully! Your payment is under verification. Admin will verify your payment soon.');
        setShowOrderIdInput(false);
      } else {
        throw new Error(data.error || 'Failed to submit order ID');
      }
    } catch (err) {
      console.error("Error submitting order ID:", err);
      setVerificationStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Render different states
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
      {/* Fullscreen overlay to prevent clicking outside */}
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
        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxHeight: '90vh', overflow: 'auto' }}>
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
            {/* Invisible overlay to prevent any bypass attempts */}
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
              <h5 className="modal-title mb-0">🎮 Game Entry - ₹500</h5>
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
                // Pending Verification Status
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

                  {verificationStatus && (
                    <div
                      className="alert alert-warning my-3 text-start"
                      style={{
                        fontSize: '0.9rem',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        borderLeft: '4px solid #ffc107'
                      }}
                    >
                      {verificationStatus}
                    </div>
                  )}

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
                // Unpaid Status - Show Payment Flow
                <>
                  <h4 className="text-primary mb-3">Join the Game Room</h4>
                  <p style={{ fontSize: '0.95rem' }} className="text-muted">
                    Unlock your access to play and compete. Entry fee is ₹500.
                  </p>

                  <div
                    className="alert alert-info mt-3"
                    style={{
                      fontSize: '0.9rem',
                      backgroundColor: '#e6f2ff',
                      color: '#004085',
                      border: '1px solid #b8daff'
                    }}
                  >
                    🎁 <strong>Bonus:</strong> Unlock 200 tokens instantly upon completing the entry fee!
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

                  {!showOrderIdInput ? (
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
                      💳 Pay ₹500 Now
                    </button>
                  ) : (
                    <div className="mt-4">
                      <div
                        className="alert alert-warning text-start"
                        style={{
                          fontSize: '0.85rem',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          border: '1px solid #ffc107'
                        }}
                      >
                        <strong>⚠️ Important:</strong> After completing payment on Razorpay, copy the <strong>Order ID</strong> and paste it below.
                      </div>

                      <label htmlFor="orderIdInput" className="form-label text-start w-100 mb-2" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        Enter Order ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="orderIdInput"
                        className="form-control mb-3"
                        placeholder="e.g., order_abc123xyz"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        disabled={isVerifying}
                        style={{
                          fontSize: '0.95rem',
                          padding: '10px 15px',
                          borderRadius: '8px',
                          border: '2px solid #007bff'
                        }}
                      />

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
                        onClick={handleSubmitOrderId}
                        disabled={isVerifying || !orderId.trim()}
                        style={{
                          fontWeight: '600',
                          fontSize: '1rem',
                          borderRadius: '10px',
                          boxShadow: '0 4px 12px rgba(40,167,69,0.3)'
                        }}
                      >
                        {isVerifying ? 'Submitting...' : '✅ Submit Order ID'}
                      </button>

                      <button
                        className="btn btn-link text-primary mt-2"
                        onClick={() => {
                          setShowOrderIdInput(false);
                          setOrderId('');
                          setVerificationStatus('');
                          setPaymentStatus('');
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
              🔐 Secure Payment by <strong>Razorpay</strong>
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