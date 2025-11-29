import React, { useEffect, useState } from "react";
import API_BASE_URL from "./ApiConfig";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import payBgImage from '../images/pay-bg.png';

const TokenWithdrawal = () => {
  const [userData, setUserData] = useState(null);
  const [binaryTokens, setBinaryTokens] = useState(0);
  const [wonTokens, setWonTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [netAmount, setNetAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(23);
  const [submitting, setSubmitting] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [withdrawalMessage, setWithdrawalMessage] = useState("");
  const [tokenType, setTokenType] = useState("binaryTokens"); // "binaryTokens" or "wonTokens"

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

  // Check if today is Sunday
  const isSunday = () => {
    const today = new Date();
    return today.getDay() === 0; // 0 represents Sunday
  };

  // Validate amount format (allows 1 decimal place)
  const validateAmountFormat = (amount) => {
    const regex = /^\d+(\.\d)?$/;
    return regex.test(amount);
  };

  // Format number to 1 decimal place
  const formatToOneDecimal = (num) => {
    return parseFloat(num).toFixed(1);
  };

  // Handle amount input change with decimal validation
  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Allow only numbers and one decimal point
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      value = value.substring(0, value.lastIndexOf('.'));
    }
    
    // Limit to 1 decimal place
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > 1) {
        value = parts[0] + '.' + parts[1].substring(0, 1);
      }
    }
    
    setWithdrawAmount(value);
  };

  const checkWithdrawalEligibility = (userDataObj) => {
    if (tokenType === "binaryTokens") {
      // Binary tokens can only be withdrawn on Sundays
      if (isSunday()) {
        setCanWithdraw(true);
        setWithdrawalMessage("✅ You can withdraw your binary tokens today (Sunday).");
      } else {
        setCanWithdraw(false);
        const daysUntilSunday = 7 - new Date().getDay(); // 0 for Sunday, so 7-0=7, but we want 0 days until next Sunday
        const nextSunday = new Date();
        nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
        const formattedDate = nextSunday.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        setWithdrawalMessage(`⏳ Binary tokens can only be withdrawn on Sundays. Next withdrawal: ${formattedDate}`);
      }
    } else {
      // Won tokens can be withdrawn anytime
      setCanWithdraw(true);
      setWithdrawalMessage("✅ You can withdraw your won tokens anytime.");
    }
  };

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
          setBinaryTokens(parsed.userData.binaryTokens || 0);
          // FIX: Use lowercase 'wontokens' to match database
          setWonTokens(parsed.userData.wontokens || 0);

          // Check withdrawal eligibility
          checkWithdrawalEligibility(parsed.userData);

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

  // Update tax calculation when token type or amount changes
  useEffect(() => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      const amt = parseFloat(withdrawAmount);
      // Different tax rates for different token types
      const taxRate = tokenType === "binaryTokens" ? 0.23 : 0.30;
      const tax = parseFloat((amt * taxRate).toFixed(1));
      const net = parseFloat((amt - tax).toFixed(1));
      setTaxAmount(tax);
      setNetAmount(net);
      setTaxPercentage(tokenType === "binaryTokens" ? 23 : 30);
    } else {
      setTaxAmount(0);
      setNetAmount(0);
      setTaxPercentage(tokenType === "binaryTokens" ? 23 : 30);
    }
  }, [withdrawAmount, tokenType]);

  // Update withdrawal message when token type changes
  useEffect(() => {
    if (userData) {
      checkWithdrawalEligibility(userData);
    }
  }, [tokenType]);

  const getCurrentBalance = () => {
    return tokenType === "binaryTokens" ? binaryTokens : wonTokens;
  };

  const getTokenTypeDisplayName = () => {
    return tokenType === "binaryTokens" ? "Binary Tokens" : "Won Tokens";
  };

  const getEndpointUrl = () => {
    return tokenType === "binaryTokens" 
      ? `${API_BASE_URL}/request-withdrawal`
      : `${API_BASE_URL}/request-won-withdrawal`;
  };

  const handleWithdraw = async () => {
    if (!canWithdraw) {
      toast.error("Withdrawals are not allowed at this time. Please check the withdrawal schedule.");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }

    // Validate amount format (allows 1 decimal place)
    if (!validateAmountFormat(withdrawAmount)) {
      toast.warning("Only 1 decimal place allowed (e.g., 10.5)");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const currentBalance = getCurrentBalance();
    
    if (amount > currentBalance) {
      toast.error(`You don't have enough ${getTokenTypeDisplayName().toLowerCase()}`);
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

      const response = await fetch(getEndpointUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          tokens: amount,
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
          `${getTokenTypeDisplayName()} withdrawal successful! Requested: ${formatToOneDecimal(withdrawAmount)}, After Tax (${taxPercentage}%): ${formatToOneDecimal(netAmount)}`
        );
        
        // Update respective token balance
        if (tokenType === "binaryTokens") {
          setBinaryTokens((prev) => parseFloat((prev - amount).toFixed(1)));
        } else {
          setWonTokens((prev) => parseFloat((prev - amount).toFixed(1)));
        }
        
        setWithdrawAmount("");
        setNetAmount(0);
        setTaxAmount(0);
        
        // Update localStorage
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData) {
          if (tokenType === "binaryTokens") {
            storedData.binaryTokens = parseFloat((binaryTokens - amount).toFixed(1));
          } else {
            // FIX: Use lowercase 'wontokens' to match database
            storedData.wontokens = parseFloat((wonTokens - amount).toFixed(1));
          }
          localStorage.setItem('userData', JSON.stringify(storedData));
        }
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

          <div 
            style={{ 
              padding: '1.5rem', 
              overflowY: 'auto',
              flexGrow: 1,
              minHeight: 0
            }}
          >
            {/* Token Type Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Select Token Type
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setTokenType("binaryTokens")}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `2px solid ${tokenType === "binaryTokens" ? '#2563eb' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    background: tokenType === "binaryTokens" ? '#eff6ff' : '#ffffff',
                    color: tokenType === "binaryTokens" ? '#2563eb' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  Binary Tokens
                </button>
                <button
                  type="button"
                  onClick={() => setTokenType("wonTokens")}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `2px solid ${tokenType === "wonTokens" ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    background: tokenType === "wonTokens" ? '#f0fdf4' : '#ffffff',
                    color: tokenType === "wonTokens" ? '#10b981' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  Won Tokens
                </button>
              </div>
            </div>

            {/* Token Balance Cards */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {/* Binary Tokens Balance */}
              <div
                style={{
                  flex: 1,
                  background: tokenType === "binaryTokens" 
                    ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' 
                    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  border: `2px solid ${tokenType === "binaryTokens" ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setTokenType("binaryTokens")}
              >
                <div style={{ color: tokenType === "binaryTokens" ? '#2563eb' : '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Binary Tokens
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: tokenType === "binaryTokens" ? '#1e40af' : '#1e293b'
                  }}
                >
                  {formatToOneDecimal(binaryTokens)}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  23% tax
                </div>
              </div>

              {/* Won Tokens Balance */}
              <div
                style={{
                  flex: 1,
                  background: tokenType === "wonTokens" 
                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  border: `2px solid ${tokenType === "wonTokens" ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setTokenType("wonTokens")}
              >
                <div style={{ color: tokenType === "wonTokens" ? '#10b981' : '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Won Tokens
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: tokenType === "wonTokens" ? '#047857' : '#1e293b'
                  }}
                >
                  {formatToOneDecimal(wonTokens)}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  30% tax
                </div>
              </div>
            </div>

            {/* Withdrawal Eligibility Notice */}
            <div 
              style={{
                background: canWithdraw 
                  ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                  : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: `2px solid ${canWithdraw ? '#10b981' : '#f59e0b'}`,
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '0.75rem' 
              }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  flexShrink: 0,
                  marginTop: '0.1rem'
                }}>
                  {canWithdraw ? '✅' : '⏳'}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: canWithdraw ? '#065f46' : '#92400e', 
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem' 
                  }}>
                    {canWithdraw ? 'Withdrawal Available' : 'Withdrawal Schedule'}
                  </div>
                  <div style={{ 
                    color: canWithdraw ? '#065f46' : '#92400e', 
                    fontSize: '0.85rem', 
                    lineHeight: '1.4' 
                  }}>
                    {withdrawalMessage}
                  </div>
                </div>
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
                    Withdrawal Amount ({getTokenTypeDisplayName()})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder={`Enter ${getTokenTypeDisplayName().toLowerCase()} to withdraw`}
                      value={withdrawAmount}
                      onChange={handleAmountChange}
                      onWheel={(e) => e.target.blur()}
                      disabled={!hasVerified || !canWithdraw}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        fontSize: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: (!hasVerified || !canWithdraw) ? '#f9fafb' : '#ffffff',
                        paddingRight: '4rem',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
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
                          {formatToOneDecimal(withdrawAmount)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>Tax ({taxPercentage}%)</div>
                        <div style={{ fontWeight: '700', color: '#dc2626' }}>
                          -{formatToOneDecimal(taxAmount)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#065f46', fontSize: '0.8rem' }}>You Receive</div>
                        <div style={{ fontWeight: '700', color: '#065f46', fontSize: '1.1rem' }}>
                          {formatToOneDecimal(netAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!hasVerified || submitting || !withdrawAmount || !validateAmountFormat(withdrawAmount) || !canWithdraw}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: 'none',
                    background: (!hasVerified || submitting || !withdrawAmount || !validateAmountFormat(withdrawAmount) || !canWithdraw) 
                      ? '#9ca3af' 
                      : tokenType === 'binaryTokens' 
                        ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                        : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    cursor: (!hasVerified || submitting || !withdrawAmount || !validateAmountFormat(withdrawAmount) || !canWithdraw) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: (!hasVerified || submitting || !withdrawAmount || !validateAmountFormat(withdrawAmount) || !canWithdraw) ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.3)'
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
                    `Withdraw ${getTokenTypeDisplayName()}`
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
                    • Won tokens: Can be withdrawn anytime<br/>
                    • Binary tokens: Can only be withdrawn on Sundays<br/>
                    • Binary tokens: 23% tax, Won tokens: 30% tax<br/>
                    • Only 1 decimal place allowed for amounts (e.g., 10.5)<br/>
                    • Only verified payment methods can be used<br/>
                    • Binary tokens and won tokens are withdrawn separately
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