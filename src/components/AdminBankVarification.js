import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Phone, CreditCard, Building, Hash, Loader, Users, X } from 'lucide-react';
import API_BASE_URL from './ApiConfig';

const BankVerificationComponent = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all users data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showVerifiedUsers, setShowVerifiedUsers] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'upi'

  // Internal CSS styles
  const styles = {
    customCard: {
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      marginBottom: '2rem'
    },
    gradientHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1.5rem'
    },
    userAvatar: {
      width: '60px',
      height: '60px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    detailCard: {
      backgroundColor: '#f8f9ff',
      border: '2px solid #e3e8ff',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.3s ease'
    },
    pendingBadge: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    verifyBtn: {
      background: 'linear-gradient(45deg, #10b981, #059669)',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1.5rem',
      color: 'white',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    iconWrapper: {
      width: '40px',
      height: '40px',
      backgroundColor: '#667eea',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem'
    },
    maskedAccount: {
      fontFamily: 'Monaco, monospace',
      fontSize: '1.1rem',
      fontWeight: '700',
      letterSpacing: '1px',
      color: '#1e40af'
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success && data.data) {
          // Store all users data
          setAllUsers(data.data);
          
          // Filter to show only unverified or no status banking details
          const filteredUsers = data.data.map(user => {
            if (user.bankingDetails) {
              const unverifiedBankingDetails = {};
              Object.entries(user.bankingDetails).forEach(([detailId, detail]) => {
                // Show only if status is unverified, undefined, null, or doesn't exist
                if (!detail.status || detail.status === 'unverified' || detail.status === 'pending') {
                  unverifiedBankingDetails[detailId] = detail;
                }
              });
              
              // Only include user if they have unverified banking details
              if (Object.keys(unverifiedBankingDetails).length > 0) {
                return {
                  ...user,
                  bankingDetails: unverifiedBankingDetails
                };
              }
            }
            return null;
          }).filter(user => user !== null);
          
          setUsers(filteredUsers);
          setLoading(false);
        } else {
          setError(data.message || 'Failed to fetch users');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
        setError('Error parsing server data');
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setError('Connection error. Please refresh the page.');
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Process verified users from all users data
  const processVerifiedUsers = (allUsersData) => {
    const bankVerified = [];
    const upiVerified = [];
    
    allUsersData.forEach(user => {
      if (user.bankingDetails) {
        Object.entries(user.bankingDetails).forEach(([detailId, detail]) => {
          if (detail.status === 'verified') {
            const baseUserData = {
              phoneNo: user.phoneNo,
              name: user.name,
              userIds: user.userIds,
              verifiedAt: detail.verifiedAt || detail.updatedAt || detail.createdAt,
              detailId: detailId
            };

            // If it has bank account details, add to bank verified
            if (detail.bankAccountNo && detail.ifsc) {
              bankVerified.push({
                ...baseUserData,
                bankAccountNo: detail.bankAccountNo,
                ifsc: detail.ifsc,
                type: 'bank'
              });
            }

            // If it has UPI details, add to UPI verified
            if (detail.upiId) {
              upiVerified.push({
                ...baseUserData,
                upiId: detail.upiId,
                type: 'upi'
              });
            }
          }
        });
      }
    });
    
    return { bankVerified, upiVerified };
  };

  // Handle show verified users
  const handleShowVerifiedUsers = () => {
    const { bankVerified, upiVerified } = processVerifiedUsers(allUsers);
    setVerifiedUsers({ bankVerified, upiVerified });
    setShowVerifiedUsers(true);
    setActiveTab('bank'); // Default to bank tab
  };

  const handleVerify = async (userId, detailId, type) => {
    setVerifyingId(`${userId}-${detailId}-${type}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-banking-detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          detailId,
          type
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove the verified user from the list since we only show unverified ones
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userId === userId) {
              const updatedBankingDetails = { ...user.bankingDetails };
              delete updatedBankingDetails[detailId]; // Remove verified detail
              
              // If no more unverified details, remove user completely
              if (Object.keys(updatedBankingDetails).length === 0) {
                return null;
              }
              
              return {
                ...user,
                bankingDetails: updatedBankingDetails
              };
            }
            return user;
          }).filter(user => user !== null)
        );
        
        // Show success message
        alert(`${type.toUpperCase()} details verified successfully!`);
      } else {
        throw new Error(result.message || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Verification failed: ${error.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const formatBankAccountNo = (accountNo) => {
    if (!accountNo) return 'N/A';
    return accountNo.toString();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .loading-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
            }
          `}
        </style>
        <div className="loading-container">
          <div className="text-center">
            <div style={styles.loadingSpinner}></div>
            <h4 className="mt-4 text-white">Loading Banking Data...</h4>
            <p className="text-white-50">Please wait while we fetch user information</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-danger-subtle d-flex align-items-center justify-content-center">
        <div className="text-center p-5">
          <XCircle size={64} className="text-danger mb-4" />
          <h3 className="text-danger mb-3">Connection Error</h3>
          <p className="text-danger">{error}</p>
          <button 
            className="btn btn-danger mt-3"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .detail-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }
          .verify-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          body {
            background-color: #f1f5f9;
          }
          .nav-tab-custom {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            margin: 0 0.5rem;
            transition: all 0.3s ease;
          }
          .nav-tab-custom.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
          }
          .nav-tab-custom:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }
          .nav-tab-custom.active:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
        `}
      </style>
      
      <div className="min-vh-100 py-5" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="container-fluid px-4">
          {/* Header Section */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="text-center position-relative">
                {/* See Verified Users Button - Top Right */}
                <div className="position-absolute" style={{ top: '0', right: '0' }}>
                  <button
                    className="btn btn-success"
                    style={{ borderRadius: '8px' }}
                    onClick={handleShowVerifiedUsers}
                  >
                    <Users size={16} className="me-2" />
                    See Verified Users
                  </button>
                </div>

                <h1 className="display-4 fw-bold text-dark mb-3">
                  Bank Verification Dashboard
                </h1>
                <p className="lead text-muted">
                  Verify pending user banking details and UPI information
                </p>
                <div className="d-flex justify-content-center mt-4">
                  <div className="badge bg-warning fs-6 me-3">
                    Pending Verifications: {users.length}
                  </div>
                  <div className="badge bg-success fs-6">
                    System Status: Online
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Users Modal */}
          {showVerifiedUsers && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                 style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
              <div className="card shadow-lg" style={{ width: '95%', maxWidth: '1200px', maxHeight: '85vh' }}>
                <div className="card-header" 
                     style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-white mb-0">
                      <Users size={20} className="me-2" />
                      Verified Users
                    </h5>
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setShowVerifiedUsers(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="d-flex justify-content-center mt-3">
                    <button
                      className={`nav-tab-custom ${activeTab === 'bank' ? 'active' : ''}`}
                      onClick={() => setActiveTab('bank')}
                    >
                      <CreditCard size={16} className="me-2" />
                      Bank Details ({verifiedUsers.bankVerified?.length || 0})
                    </button>
                    <button
                      className={`nav-tab-custom ${activeTab === 'upi' ? 'active' : ''}`}
                      onClick={() => setActiveTab('upi')}
                    >
                      <Hash size={16} className="me-2" />
                      UPI Details ({verifiedUsers.upiVerified?.length || 0})
                    </button>
                  </div>
                </div>
                
                <div className="card-body p-0" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                  {/* Bank Details Tab */}
                  {activeTab === 'bank' && (
                    <>
                      {verifiedUsers.bankVerified?.length === 0 ? (
                        <div className="text-center py-5">
                          <CreditCard size={48} className="text-muted mb-3" />
                          <h6 className="text-muted">No verified bank details found</h6>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Phone No</th>
                                <th>Name</th>
                                <th>User ID</th>
                                <th>Bank Account</th>
                                <th>IFSC Code</th>
                                <th>Status</th>
                                <th>Verified Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {verifiedUsers.bankVerified?.map((user, index) => (
                                <tr key={index}>
                                  <td className="fw-medium">{user.phoneNo || 'N/A'}</td>
                                  <td>{user.name || 'N/A'}</td>
                                  <td>{user.userIds?.myuserid || 'N/A'}</td>
                                  <td>{user.bankAccountNo || 'N/A'}</td>
                                  <td>{user.ifsc || 'N/A'}</td>
                                  <td>
                                    <span className="badge bg-success">
                                      <CheckCircle size={12} className="me-1" />
                                      Verified
                                    </span>
                                  </td>
                                  <td>{formatDate(user.verifiedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {/* UPI Details Tab */}
                  {activeTab === 'upi' && (
                    <>
                      {verifiedUsers.upiVerified?.length === 0 ? (
                        <div className="text-center py-5">
                          <Hash size={48} className="text-muted mb-3" />
                          <h6 className="text-muted">No verified UPI details found</h6>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Phone No</th>
                                <th>Name</th>
                                <th>User ID</th>
                                <th>UPI ID</th>
                                <th>Status</th>
                                <th>Verified Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {verifiedUsers.upiVerified?.map((user, index) => (
                                <tr key={index}>
                                  <td className="fw-medium">{user.phoneNo || 'N/A'}</td>
                                  <td>{user.name || 'N/A'}</td>
                                  <td>{user.userIds?.myuserid || 'N/A'}</td>
                                  <td>{user.upiId || 'N/A'}</td>
                                  <td>
                                    <span className="badge bg-success">
                                      <CheckCircle size={12} className="me-1" />
                                      Verified
                                    </span>
                                  </td>
                                  <td>{formatDate(user.verifiedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="card-footer text-center">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowVerifiedUsers(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="row">
            <div className="col-12">
              {users.length === 0 ? (
                <div className="card" style={styles.customCard}>
                  <div className="card-body text-center py-5">
                    <CheckCircle size={80} className="text-success mb-4" />
                    <h3 className="text-success">All Banking Details Verified!</h3>
                    <p className="text-muted">There are no pending banking details to verify at this time</p>
                  </div>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.userId} className="card detail-card" style={styles.customCard}>
                    {/* User Header */}
                    <div style={styles.gradientHeader}>
                      <div className="d-flex align-items-center">
                        <div style={styles.userAvatar}>
                          <User size={28} />
                        </div>
                        <div className="ms-4 flex-grow-1">
                          <h3 className="mb-2 fw-bold">
                            {user.name || 'Unknown User'}
                          </h3>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="d-flex align-items-center mb-2">
                                <Phone size={16} className="me-2" />
                                <span>{user.phoneNo || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex align-items-center">
                                <Hash size={16} className="me-2" />
                                <span>User ID: {user.userIds?.myuserid || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex align-items-center">
                                <Hash size={16} className="me-2" />
                                <span>Ref ID: {user.userIds?.myrefrelid || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Banking Details */}
                    <div className="card-body p-4">
                      <h4 className="mb-4 d-flex align-items-center">
                        <Clock className="me-2 text-warning" />
                        Pending Verification
                      </h4>
                      
                      {Object.entries(user.bankingDetails || {}).map(([detailId, detail]) => (
                        <div key={detailId} className="mb-4" style={styles.detailCard}>
                          
                          {/* Bank Account Section */}
                          {detail.bankAccountNo && (
                            <div className="mb-4">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center">
                                  <div style={styles.iconWrapper}>
                                    <CreditCard size={20} className="text-white" />
                                  </div>
                                  <h5 className="mb-0 fw-bold">Bank Account Details</h5>
                                </div>
                                <span 
                                  className="badge d-flex align-items-center"
                                  style={styles.pendingBadge}
                                >
                                  <Clock size={14} className="me-1" />
                                  Pending Verification
                                </span>
                              </div>
                              
                              <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold text-muted">Account Number</label>
                                  <p className="mb-0 fw-bold" style={styles.maskedAccount}>
                                    {formatBankAccountNo(detail.bankAccountNo)}
                                  </p>
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold text-muted">IFSC Code</label>
                                  <p className="mb-0 fw-bold text-uppercase">
                                    {detail.ifsc || 'N/A'}
                                  </p>
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label fw-semibold text-muted">Created At</label>
                                  <p className="mb-0">{formatDate(detail.createdAt)}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleVerify(user.userId, detailId, 'bank')}
                                disabled={verifyingId === `${user.userId}-${detailId}-bank`}
                                className="btn verify-btn"
                                style={styles.verifyBtn}
                              >
                                {verifyingId === `${user.userId}-${detailId}-bank` ? (
                                  <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Verifying Bank Account...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={16} className="me-2" />
                                    Verify Bank Account
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* UPI Section */}
                          {detail.upiId && (
                            <div>
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center">
                                  <div style={styles.iconWrapper}>
                                    <Hash size={20} className="text-white" />
                                  </div>
                                  <h5 className="mb-0 fw-bold">UPI Details</h5>
                                </div>
                                <span 
                                  className="badge d-flex align-items-center"
                                  style={styles.pendingBadge}
                                >
                                  <Clock size={14} className="me-1" />
                                  Pending Verification
                                </span>
                              </div>
                              
                              <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold text-muted">UPI ID</label>
                                  <p className="mb-0 fw-bold">{detail.upiId}</p>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold text-muted">Created At</label>
                                  <p className="mb-0">{formatDate(detail.createdAt)}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleVerify(user.userId, detailId, 'upi')}
                                disabled={verifyingId === `${user.userId}-${detailId}-upi`}
                                className="btn verify-btn me-2"
                                style={styles.verifyBtn}
                              >
                                {verifyingId === `${user.userId}-${detailId}-upi` ? (
                                  <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Verifying UPI...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={16} className="me-2" />
                                    Verify UPI
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Verify Both Button (if both bank and UPI exist) */}
                          {detail.bankAccountNo && detail.upiId && (
                            <button
                              onClick={() => handleVerify(user.userId, detailId, 'both')}
                              disabled={verifyingId?.startsWith(`${user.userId}-${detailId}`)}
                              className="btn verify-btn mt-2"
                              style={{ ...styles.verifyBtn, background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)' }}
                            >
                              {verifyingId?.startsWith(`${user.userId}-${detailId}`) ? (
                                <>
                                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                  Verifying All Details...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} className="me-2" />
                                  Verify All Details
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BankVerificationComponent;