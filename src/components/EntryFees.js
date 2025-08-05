import React, { useEffect, useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import API_BASE_URL from './ApiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

const EntryFees = ({ onContinue }) => {
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [cashfreeInstance, setCashfreeInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ✅ Use phone number from userData in localStorage
  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const phoneNo = userData?.phoneNo || "";

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfree = await load({ mode: 'sandbox' }); // change to 'production' in prod
        setCashfreeInstance(cashfree);
        setCashfreeReady(true);
      } catch (err) {
        console.error("SDK Load Error:", err);
        alert("❌ Failed to load payment SDK");
      }
    };

    initializeCashfree();

    // Prevent closing popup with Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !paymentSuccess) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent browser back button
    const handlePopState = (e) => {
      if (!paymentSuccess) {
        e.preventDefault();
        window.history.pushState(null, null, window.location.pathname);
        alert("🚫 Payment required to continue. Please complete the entry fee.");
      }
    };

    // Prevent page refresh/close
    const handleBeforeUnload = (e) => {
      if (!paymentSuccess) {
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
  }, [paymentSuccess]);

  const handleLogout = () => {
    // Clear localStorage and navigate to login page
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handlePayment = async () => {
    if (!phoneNo) {
      alert("❌ Phone number not found in localStorage");
      return;
    }

    if (!cashfreeInstance || !cashfreeReady) {
      alert("Cashfree SDK not ready");
      return;
    }

    setLoading(true);
    setPaymentStatus("Creating payment order...");

    try {
      const res = await fetch(`${API_BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo, amount: 500, orderNote: "Entry Fee" })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create order");

      const { paymentSessionId, orderId } = data;

      setPaymentStatus("Opening payment window...");

      const result = await cashfreeInstance.checkout({
        paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result.error) {
        throw new Error(`Payment failed: ${result.error.message || result.error}`);
      }

      setPaymentStatus("Verifying payment...");

      const verifyRes = await fetch(`${API_BASE_URL}/verify-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success || verifyData.status !== 'PAID') {
        throw new Error(`Payment verification failed: ${verifyData.status}`);
      }

      setPaymentStatus("Recording entry fee...");

      const entryFeeRes = await fetch(`${API_BASE_URL}/pay-entry-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo,
          orderId,
          paymentDetails: verifyData.paymentDetails
        })
      });

      const entryFeeData = await entryFeeRes.json();
      if (!entryFeeData.success) {
        throw new Error("Failed to record entry fee");
      }

      setPaymentStatus("🎉 Payment successful! You got 200 tokens. Congratulations!");

      setPaymentSuccess(true);
    } catch (err) {
      console.error("Payment Flow Error:", err);
      setPaymentStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
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
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div
            className="modal-content p-0"
            style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '2px solid #007bff',
              boxShadow: '0 0 30px rgba(0,123,255,0.4)',
              overflow: 'hidden',
              userSelect: 'none',
              position: 'relative'
            }}
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
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

            <div className="modal-body text-center p-4">
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
                  <span role="img" aria-label="status">
                    {paymentStatus.includes('✅') ? '✅' : paymentStatus.includes('❌') ? '❌' : '⏳'}
                  </span> {paymentStatus}
                </div>
              )}

              {!paymentSuccess ? (
                <button
                  className="btn btn-primary w-100 mt-3 py-2"
                  onClick={handlePayment}
                  disabled={loading || !cashfreeReady}
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                  }}
                >
                  {loading ? 'Processing Payment...' : 'Pay ₹500 Now'}
                </button>
              ) : (
                <button
                  className="btn btn-success w-100 mt-3 py-2"
                  onClick={onContinue}
                  style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(40,167,69,0.3)'
                  }}
                >
                  ✅ Continue to Dashboard
                </button>
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
              🔐 Secure Payment by <strong>Cashfree</strong>
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