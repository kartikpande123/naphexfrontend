import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import image from "../images/naphex_web_banner_final_1.png";
import logo from "../images/logo-1.png";
import "./Home.css";
import API_BASE_URL from './ApiConfig';

const Home = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showAdminKeyPopup, setShowAdminKeyPopup] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminKeyError, setAdminKeyError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [counts, setCounts] = useState({
    pendingWithdrawals: 0,
    pendingTokenRequests: 0,
    pendingEntryFees: 0,
    pendingKYC: 0,
    pendingBankDetails: 0
  });
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    navigate("/");
  };

  const toggleLogoutPopup = () => {
    setShowLogoutPopup(!showLogoutPopup);
  };

  const handleAdminKeySubmit = () => {
    if (adminKey === "admin") {
      setShowAdminKeyPopup(false);
      setAdminKey("");
      setAdminKeyError("");
      setShowPassword(false);
      navigate("/binary");
    } else {
      setAdminKeyError("Invalid Super Admin Key");
    }
  };

  const handleAdminKeyEnter = (e) => {
    if (e.key === "Enter") {
      handleAdminKeySubmit();
    }
  };

  const handleBinaryClick = () => {
    setShowAdminKeyPopup(true);
  };

  const handleCancelAdminKey = () => {
    setShowAdminKeyPopup(false);
    setAdminKey("");
    setAdminKeyError("");
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate pending counts from user data
  const calculatePendingCounts = (users) => {
    let withdrawalCount = 0;
    let tokenRequestCount = 0;
    let entryFeeCount = 0;
    let kycCount = 0;
    let bankDetailsCount = 0;

    users.forEach(user => {
      // Count pending withdrawals
      if (user.withdrawals) {
        Object.values(user.withdrawals).forEach(withdrawal => {
          if (withdrawal.status === 'pending') {
            withdrawalCount++;
          }
        });
      }

      // Count pending token requests
      if (user.tokenRequestHistory) {
        Object.values(user.tokenRequestHistory).forEach(request => {
          if (request.status === 'pending') {
            tokenRequestCount++;
          }
        });
      }

      // Count pending entry fees
      if (user.entryFeeSubmittedAt && user.entryFee !== 'paid') {
        entryFeeCount++;
      }

      // Count pending KYC
      if (user.kycSubmittedAt && user.kycStatus !== 'accepted') {
        kycCount++;
      }

      // Count unverified bank details
      // Check both possible field names: bankingDetails and bankDetails
      const bankData = user.bankingDetails || user.bankDetails;
      if (bankData) {
        Object.values(bankData).forEach(bankDetail => {
          // Count as pending if status is not "verified" or status key doesn't exist
          if (!bankDetail.status || bankDetail.status !== 'verified') {
            bankDetailsCount++;
          }
        });
      }
    });

    return {
      pendingWithdrawals: withdrawalCount,
      pendingTokenRequests: tokenRequestCount,
      pendingEntryFees: entryFeeCount,
      pendingKYC: kycCount,
      pendingBankDetails: bankDetailsCount
    };
  };

  // Setup SSE connection to fetch pending counts
  useEffect(() => {
    let eventSource = null;

    const setupSSE = () => {
      try {
        // Create SSE connection
        eventSource = new EventSource(`${API_BASE_URL}/api/users`);
        
        eventSource.onopen = () => {
          console.log('SSE Connection established');
          setSseConnected(true);
          setLoading(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.success && data.data) {
              const newCounts = calculatePendingCounts(data.data);
              setCounts(newCounts);
              setLoading(false);
            }
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          setSseConnected(false);
          setLoading(false);
          
          // Close the connection
          if (eventSource) {
            eventSource.close();
          }
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            console.log('Attempting to reconnect SSE...');
            setupSSE();
          }, 5000);
        };

      } catch (err) {
        console.error('Error setting up SSE:', err);
        setLoading(false);
      }
    };

    setupSSE();

    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  }, []);

  // Auto logout after 15 minutes of inactivity
  useEffect(() => {
    let logoutTimer;

    const startLogoutTimer = () => {
      logoutTimer = setTimeout(() => {
        handleLogout();
      }, 900000);
    };

    const resetLogoutTimer = () => {
      clearTimeout(logoutTimer);
      startLogoutTimer();
    };

    window.addEventListener("mousemove", resetLogoutTimer);
    window.addEventListener("keydown", resetLogoutTimer);
    startLogoutTimer();

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetLogoutTimer);
      window.removeEventListener("keydown", resetLogoutTimer);
    };
  }, []);

  const handleClickGame1 = () => {
    navigate("/adminopenclose");
  };

  const pendingCards = [
    {
      title: 'Pending Withdrawals',
      count: counts.pendingWithdrawals,
      icon: 'bi-cash-coin',
      bgColor: '#ff6b6b',
      textColor: '#fff'
    },
    {
      title: 'Pending Token Requests',
      count: counts.pendingTokenRequests,
      icon: 'bi-credit-card-2-front',
      bgColor: '#4ecdc4',
      textColor: '#fff'
    },
    {
      title: 'Pending Entry Fees',
      count: counts.pendingEntryFees,
      icon: 'bi-receipt',
      bgColor: '#a29bfe',
      textColor: '#fff'
    },
    {
      title: 'Pending KYC',
      count: counts.pendingKYC,
      icon: 'bi-person-check',
      bgColor: '#fd79a8',
      textColor: '#fff'
    },
    {
      title: 'Pending Bank Details',
      count: counts.pendingBankDetails,
      icon: 'bi-bank',
      bgColor: '#55efc4',
      textColor: '#fff'
    }
  ];

  return (
    <div className="enhanced-layout">
      <style>
        {`
          .password-input-wrapper {
            position: relative;
            width: 100%;
          }

          .password-toggle-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6c757d;
            font-size: 1.2rem;
            transition: color 0.3s ease;
            z-index: 10;
          }

          .password-toggle-icon:hover {
            color: #495057;
          }

          .form-control {
            padding-right: 40px;
          }
        `}
      </style>
      <nav className="navbar navbar-expand-lg enhanced-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center brand-hover" to="/">
            <img src={logo} alt="GameZone" className="enhanced-logo" />
            <span className="enhanced-brand-text">
              NAPHEX <span className="text-highlight">Admin</span>
            </span>
          </Link>

          <button
            className="navbar-toggler custom-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center nav-gap">
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/adminhelp"
                  onMouseEnter={() => setIsHovered("account")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-person-circle nav-icon"></i>
                  <span>Queries</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/users"
                  onMouseEnter={() => setIsHovered("account")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-person-circle nav-icon"></i>
                  <span>Game Users</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/adminpayment"
                  onMouseEnter={() => setIsHovered("adminpayment")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-gift nav-icon"></i>
                  <span>Overall Payments</span>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link enhanced-nav-link btn-link"
                  onClick={handleBinaryClick}
                  onMouseEnter={() => setIsHovered("earnings")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-gift nav-icon"></i>
                  <span>Binary</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link enhanced-nav-link btn-link"
                  onClick={toggleLogoutPopup}
                >
                  <i className="bi bi-box-arrow-right nav-icon"></i>
                  <span>Logout</span>
                </button>
              </li>
              {showLogoutPopup && (
                <div className="logout-popup-overlay">
                  <div className="logout-popup">
                    <div className="logout-popup-header">
                      <i className="bi bi-exclamation-circle-fill logout-popup-icon"></i>
                      <h4 className="logout-popup-title">Confirm Logout</h4>
                    </div>
                    <p className="logout-popup-message">
                      Are you sure you want to log out? You will need to log in again to access your account.
                    </p>
                    <div className="logout-popup-buttons">
                      <button className="btn btn-danger logout-popup-confirm" onClick={handleLogout}>
                        Yes, Logout
                      </button>
                      <button className="btn btn-outline-secondary logout-popup-cancel" onClick={toggleLogoutPopup}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showAdminKeyPopup && (
                <div className="logout-popup-overlay">
                  <div className="logout-popup">
                    <div className="logout-popup-header">
                      <i className="bi bi-shield-lock-fill logout-popup-icon"></i>
                      <h4 className="logout-popup-title">Super Admin Authentication</h4>
                    </div>
                    <p className="logout-popup-message">
                      Please enter the Super Admin key to access Binary section.
                    </p>
                    <div className="form-group mb-3">
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Enter Super Admin Key"
                          value={adminKey}
                          onChange={(e) => setAdminKey(e.target.value)}
                          onKeyPress={handleAdminKeyEnter}
                          autoFocus
                        />
                        <i 
                          className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} password-toggle-icon`}
                          onClick={togglePasswordVisibility}
                          title={showPassword ? "Hide password" : "Show password"}
                        ></i>
                      </div>
                      {adminKeyError && <div className="text-danger mt-2">{adminKeyError}</div>}
                    </div>
                    <div className="logout-popup-buttons">
                      <button className="btn btn-primary logout-popup-confirm" onClick={handleAdminKeySubmit}>
                        Submit
                      </button>
                      <button className="btn btn-outline-secondary logout-popup-cancel" onClick={handleCancelAdminKey}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="enhanced-content">
        <div className="container-fluid px-4 py-3">
          <div className="row g-3">
            {/* Left Side - Banner */}
            <div className="col-lg-7">
              <div
                className="enhanced-banner-container"
                onMouseEnter={() => setIsHovered("banner1")}
                onMouseLeave={() => setIsHovered(null)}
                style={{ height: '480px', borderRadius: '15px', overflow: 'hidden', position: 'relative' }}
              >
                <img src={image} alt="Play Now" className="enhanced-banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="enhanced-overlay">
                  <h2 className="banner-title">Fruits Game</h2>
                  <div className="banner-subtitle">Admin Dashboard</div>
                  <button className="play-button" onClick={handleClickGame1}>
                    <i className="bi bi-play-fill"></i> Show Details
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Pending Requests Dashboard */}
            <div className="col-lg-5">
              <div className="card shadow border-0" style={{ borderRadius: '15px', height: '480px', display: 'flex', flexDirection: 'column' }}>
                <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px 15px 0 0', padding: '12px 16px' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0" style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="bi bi-bell-fill me-2"></i>
                      Pending Requests
                    </h6>
                    <div>
                      {sseConnected ? (
                        <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i> Live
                        </span>
                      ) : (
                        <span className="badge bg-danger" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i> Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body p-2" style={{ flex: '1', overflowY: 'auto' }}>
                  {loading ? (
                    <div className="text-center d-flex flex-column justify-content-center align-items-center" style={{ height: '100%' }}>
                      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted mb-0" style={{ fontSize: '0.9rem' }}>Connecting to live updates...</p>
                    </div>
                  ) : (
                    <div className="row g-2 p-2">
                      {pendingCards.map((card, index) => (
                        <div key={index} className="col-12">
                          <div 
                            className="card border-0 shadow-sm"
                            style={{
                              background: card.bgColor,
                              borderRadius: '10px',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '';
                            }}
                          >
                            <div className="card-body p-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="flex-grow-1">
                                  <p className="mb-0" style={{ color: card.textColor, fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.2' }}>
                                    {card.title}
                                  </p>
                                  <h4 className="mb-0 mt-1" style={{ color: card.textColor, fontWeight: '700', fontSize: '1.5rem' }}>
                                    {card.count}
                                  </h4>
                                </div>
                                <div 
                                  className="d-flex align-items-center justify-content-center ms-2"
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    flexShrink: 0
                                  }}
                                >
                                  <i className={`bi ${card.icon}`} style={{ fontSize: '1.3rem', color: card.textColor }}></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer bg-light text-center py-2" style={{ borderRadius: '0 0 15px 15px' }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;