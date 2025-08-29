import React, { useEffect, useState } from "react";
import API_BASE_URL from "./ApiConfig";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import payBgImage from '../images/pay-bg.png';

const TokenWithdrawal = () => {
  const [userData, setUserData] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [netAmount, setNetAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      fetchUserProfile(parsedData.phoneNo);
    } else {
      setError("No user data found. Please login again.");
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (phoneNo) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user-profile/${phoneNo}`);

      if (!response.ok) throw new Error("Failed to fetch user profile");

      const text = await response.text();
      const match = text.match(/data: (.*)/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.success) {
          setUserData(parsed.userData);
          setTokens(parsed.tokens);

          if (parsed.userData.bankingDetails) {
            const details = Object.values(parsed.userData.bankingDetails);
            const verified = details.find((d) => d.status === "verified");
            if (verified?.bankAccountNo)
              setSelectedOption("bank-" + verified.bankAccountNo);
            else if (verified?.upiId)
              setSelectedOption("upi-" + verified.upiId);
          }
        } else {
          setError(parsed.message || "User not found");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (withdrawAmount && parseInt(withdrawAmount) > 0) {
      const amt = parseInt(withdrawAmount);
      const tax = Math.floor(amt * 0.3);
      setNetAmount(amt - tax);
    } else {
      setNetAmount(0);
    }
  }, [withdrawAmount]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseInt(withdrawAmount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }
    if (parseInt(withdrawAmount) > tokens) {
      toast.error("You don't have enough tokens");
      return;
    }
    if (!selectedOption) {
      toast.warning("Please select a withdrawal method");
      return;
    }

    const allDetails = userData?.bankingDetails
      ? Object.values(userData.bankingDetails)
      : [];

    const selectedDetail = allDetails.find((d) =>
      selectedOption.includes(d.bankAccountNo || d.upiId)
    );

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/request-withdrawal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          tokens: parseInt(withdrawAmount),
          method: selectedDetail?.bankAccountNo
            ? `Bank - ${selectedDetail.bankAccountNo}`
            : `UPI - ${selectedDetail?.upiId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Withdrawal failed");
      } else {
        toast.success(
          `Withdrawal successful! Requested: ${withdrawAmount}, After Tax (30%): ${netAmount}`
        );
        setTokens((prev) => prev - parseInt(withdrawAmount));
        setWithdrawAmount("");
        setNetAmount(0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your withdrawal details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
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
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
            }}
          >
            <p className="text-danger">{error}</p>
            <button 
              className="btn btn-primary mt-3" 
              onClick={() => window.location.href = '/home'}
            >
              Go to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const bankingDetails = userData?.bankingDetails
    ? Object.values(userData.bankingDetails)
    : [];

  const hasVerified = bankingDetails.some((d) => d.status === "verified");

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
          if (e.target === e.currentTarget && !submitting) {
            navigate('/home');
          }
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
              onClick={() => navigate('/home')}
              disabled={submitting}
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
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: submitting ? 0.5 : 1,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              <span>Back</span>
            </button>

            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>💸</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Token Withdrawal
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
            {/* Token Balance Card */}
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
                Available Balance
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b'
                }}
              >
                {tokens.toLocaleString()} tokens
              </div>
            </div>

            {bankingDetails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div 
                  style={{ 
                    fontSize: '3rem', 
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}
                >
                  ⚠️
                </div>
                <h5 style={{ marginBottom: '1rem', color: '#374151' }}>Banking Details Required</h5>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Please add and verify your banking details to proceed with withdrawal
                </p>
                <button
                  className="btn btn-warning fw-bold"
                  style={{ borderRadius: '8px', padding: '0.75rem 1.5rem' }}
                  onClick={() => navigate("/bankdetails")}
                >
                  Add Bank Details
                </button>
              </div>
            ) : (
              <>
                {/* Enhanced Payment Methods */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h6 style={{ 
                    fontWeight: '600', 
                    marginBottom: '0.75rem', 
                    color: '#374151',
                    fontSize: '0.95rem' 
                  }}>
                    Select Withdrawal Method
                  </h6>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bankingDetails.map((detail, index) => {
                      const isBank = !!detail.bankAccountNo;
                      const isVerified = detail.status === "verified";
                      const value = isBank
                        ? "bank-" + detail.bankAccountNo
                        : "upi-" + detail.upiId;

                      return (
                        <div 
                          key={index}
                          style={{
                            border: `2px solid ${
                              selectedOption === value 
                                ? '#2563eb' 
                                : isVerified 
                                  ? '#e5e7eb' 
                                  : '#f3f4f6'
                            }`,
                            borderRadius: '12px',
                            padding: '1rem',
                            cursor: isVerified ? 'pointer' : 'not-allowed',
                            opacity: isVerified ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            background: selectedOption === value ? '#eff6ff' : '#ffffff'
                          }}
                          onClick={isVerified ? () => setSelectedOption(value) : undefined}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="radio"
                              id={value}
                              value={value}
                              checked={selectedOption === value}
                              disabled={!isVerified}
                              onChange={(e) => setSelectedOption(e.target.value)}
                              style={{ marginRight: '0.75rem', transform: 'scale(1.2)' }}
                            />
                            
                            <div style={{ 
                              marginRight: '0.75rem',
                              width: '32px', 
                              height: '32px', 
                              backgroundColor: isBank ? '#dbeafe' : '#dcfce7', 
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isBank ? (
                                <svg width="16" height="16" fill="#2563eb" viewBox="0 0 24 24">
                                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" fill="#16a34a" viewBox="0 0 24 24">
                                  <path d="M17,12C17,14.42 15.28,16.44 13,16.9V21H11V16.9C8.72,16.44 7,14.42 7,12C7,9.58 8.72,7.56 11,7.1V3H13V7.1C15.28,7.56 17,9.58 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                                </svg>
                              )}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                {isBank ? 'Bank Account' : 'UPI Payment'}
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                                {isBank 
                                  ? `${detail.bankAccountNo} • ${detail.ifsc}`
                                  : detail.upiId
                                }
                              </div>
                            </div>
                            
                            <span 
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: isVerified ? '#dcfce7' : '#f3f4f6',
                                color: isVerified ? '#166534' : '#6b7280'
                              }}
                            >
                              {isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Withdrawal Amount */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Withdrawal Amount
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="Enter tokens to withdraw"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()} // Disable scroll wheel
                      disabled={!hasVerified}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: !hasVerified ? '#f9fafb' : '#ffffff',
                        paddingRight: '4rem',
                        // Hide spinner arrows
                        MozAppearance: 'textfield', // Firefox
                        WebkitAppearance: 'none', // Chrome, Safari, Edge
                        appearance: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      fontSize: '0.95rem'
                    }}>
                      tokens
                    </div>
                  </div>
                </div>

                {/* Tax Calculation */}
                {withdrawAmount && netAmount > 0 && (
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#065f46', fontSize: '0.8rem' }}>Requested</div>
                        <div style={{ fontWeight: '700', color: '#065f46' }}>
                          {parseInt(withdrawAmount).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>Tax (30%)</div>
                        <div style={{ fontWeight: '700', color: '#dc2626' }}>
                          -{(parseInt(withdrawAmount) - netAmount).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#065f46', fontSize: '0.8rem' }}>You Receive</div>
                        <div style={{ fontWeight: '700', color: '#065f46', fontSize: '1.1rem' }}>
                          {netAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!hasVerified || submitting || !withdrawAmount}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: 'none',
                    background: (!hasVerified || submitting || !withdrawAmount) 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    cursor: (!hasVerified || submitting || !withdrawAmount) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: (!hasVerified || submitting || !withdrawAmount) ? 'none' : '0 4px 20px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {submitting ? (
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
                      Processing Withdrawal...
                    </span>
                  ) : (
                    "Withdraw Tokens"
                  )}
                </button>
              </>
            )}

            {/* Info Section */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '1.5rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '0.75rem' 
              }}>
                <div style={{ 
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  marginTop: '0.1rem'
                }}>
                  ℹ️
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#92400e', 
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem' 
                  }}>
                    Important Information
                  </div>
                  <div style={{ 
                    color: '#92400e', 
                    fontSize: '0.85rem', 
                    lineHeight: '1.4' 
                  }}>
                    30% tax is automatically deducted from all withdrawals. Only verified payment methods can be used for withdrawals.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Global Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Hide number input spinners in all browsers */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
};

export default TokenWithdrawal;