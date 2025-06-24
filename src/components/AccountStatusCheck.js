import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
import { useNavigate } from 'react-router-dom';

const AccountStatusChecker = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);

  const navigate = useNavigate()

  // Fetch rejected users data
  const fetchRejectedUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rejected-requests`);
      if (response.ok) {
        const data = await response.json();
        setRejectedUsers(data);
      }
    } catch (error) {
      console.error('Error fetching rejected users:', error);
    }
  };

  // Set up SSE connection for real-time user data
  useEffect(() => {
    fetchRejectedUsers();
    
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);
    
    eventSource.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.success && response.data) {
          setAllUsers(response.data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const checkAccountStatus = () => {
    if (!userId.trim()) {
      setStatusResult({
        type: 'error',
        message: 'Please enter a valid User ID'
      });
      return;
    }

    setLoading(true);
    
    console.log('Searching for userId:', userId.trim());
    console.log('All users data:', allUsers);
    
    // Check in main users collection - look for userId in userIds subcollection
    const user = allUsers.find(u => {
      console.log('Checking user:', u);
      console.log('User userIds:', u.userIds);
      console.log('User myuserid:', u.userIds?.myuserid);
      return u.userIds && u.userIds.myuserid && u.userIds.myuserid === userId.trim();
    });
    
    console.log('Found user:', user);
    
    if (user) {
      console.log('User found - checking KYC status:', user);
      console.log('User KYC Status:', user.kycStatus);
      
      // Check if user has KYC status (direct property)
      if (user.kycStatus) {
        // User has KYC data - check status
        if (user.kycStatus === 'accepted') {
          setStatusResult({
            type: 'success',
            title: '✅ KYC Verification Completed Successfully',
            message: 'Your KYC verification is completed successfully. You can now login and pay registration fees to activate your account.',
            user: user
          });
        } else if (user.kycStatus === 'submitted') {
          setStatusResult({
            type: 'pending',
            title: '⏳ KYC Verification Pending',
            message: 'Your KYC verification is pending. Please wait for 24 hours or contact admin for more information.',
            user: user
          });
        } else if (user.kycStatus === 'rejected') {
          setStatusResult({
            type: 'rejected',
            title: '❌ KYC Verification Rejected',
            message: 'Your KYC verification has been rejected. Please contact admin for more information or resubmit your documents.',
            user: user
          });
        } else {
          // Unknown KYC status
          setStatusResult({
            type: 'warning',
            title: '📋 KYC Status Unknown',
            message: `Your KYC status is unclear (Status: ${user.kycStatus}). Please contact admin for assistance.`,
            user: user
          });
        }
      } else {
        // User exists but no KYC data submitted yet
        setStatusResult({
          type: 'warning',
          title: '📋 No KYC Submitted',
          message: 'Your account exists but no KYC verification has been submitted yet. Please submit your KYC documents to proceed.',
          user: user
        });
      }
    } else {
      // User not found in main collection, check rejected users collection
      const rejectedUser = rejectedUsers.find(u => u.userId === userId.trim());
      
      if (rejectedUser) {
        setStatusResult({
          type: 'rejected',
          title: '❌ Account Rejected',
          message: 'Your account/KYC verification has been rejected by admin.',
          rejectionReason: rejectedUser.rejectionReason,
          rejectedAt: rejectedUser.rejectedAt,
          rejectedBy: rejectedUser.rejectedBy,
          user: rejectedUser
        });
      } else {
        // User not found anywhere
        setStatusResult({
          type: 'not-found',
          title: '🔍 User Not Found',
          message: `No account found with User ID: ${userId.trim()}. Please check your User ID and try again, or contact admin if you believe this is an error.`
        });
      }
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (type) => {
    switch (type) {
      case 'success': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'rejected': return 'badge bg-danger';
      case 'warning': return 'badge bg-info';
      case 'not-found': return 'badge bg-secondary';
      case 'error': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getCardClass = (type) => {
    switch (type) {
      case 'success': return 'border-success';
      case 'pending': return 'border-warning';
      case 'rejected': return 'border-danger';
      case 'warning': return 'border-info';
      case 'not-found': return 'border-secondary';
      case 'error': return 'border-danger';
      default: return 'border-secondary';
    }
  };

  return (
    <div className="container-fluid py-4" style={{ 
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          {/* Header */}
          <div className="text-center mb-4 p-4 shadow-lg" style={{
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            borderRadius: '20px',
            border: '3px solid #0d47a1'
          }}>
            <h1 className="display-4 text-white fw-bold mb-3">
              Account Status Checker
            </h1>
            <p className="lead text-white" style={{ opacity: 0.9 }}>
              Check your KYC verification and account approval status
            </p>
          </div>

          {/* Search Card */}
          <div className="card shadow-lg border-0 mb-4" style={{
            borderRadius: '20px',
            background: '#ffffff',
            border: '2px solid #e3f2fd'
          }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <label htmlFor="userIdInput" className="form-label fw-semibold text-dark mb-2">
                    Enter Your User ID
                  </label>
                  <input
                    type="text"
                    id="userIdInput"
                    className="form-control form-control-lg"
                    placeholder="e.g., USERQMZY7NECD"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAccountStatus()}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e9ecef',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div className="col-md-4 mt-3 mt-md-0">
                  <button
                    className="btn btn-lg w-100"
                    onClick={checkAccountStatus}
                    disabled={loading}
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      padding: '12px 24px',
                      marginTop: '32px'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Check Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          {statusResult && (
            <div className={`card shadow-lg border-3 ${getCardClass(statusResult.type)}`} style={{
              borderRadius: '20px',
              background: '#ffffff',
              border: '2px solid #e3f2fd'
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <h3 className="card-title mb-0 me-3">{statusResult.title}</h3>
                  <span className={getStatusBadgeClass(statusResult.type)}>
                    {statusResult.type.toUpperCase().replace('-', ' ')}
                  </span>
                </div>
                
                <p className="card-text fs-5 mb-4">{statusResult.message}</p>

                {/* Rejection Details */}
                {statusResult.type === 'rejected' && statusResult.rejectionReason && (
                  <div className="alert alert-danger" style={{ borderRadius: '12px' }}>
                    <h6 className="alert-heading fw-bold">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Rejection Details
                    </h6>
                    <p className="mb-2"><strong>Reason:</strong> {statusResult.rejectionReason}</p>
                    <p className="mb-2"><strong>Rejected By:</strong> {statusResult.rejectedBy}</p>
                    <p className="mb-0"><strong>Rejected At:</strong> {formatDate(statusResult.rejectedAt)}</p>
                  </div>
                )}

                {/* User Details */}
                {statusResult.user && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Account Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">User Name</small>
                          <span className="fw-semibold">{statusResult.user.name || statusResult.user.userName || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">Phone Number</small>
                          <span className="fw-semibold">{statusResult.user.phoneNo || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">City</small>
                          <span className="fw-semibold">{statusResult.user.city || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">State</small>
                          <span className="fw-semibold">{statusResult.user.state || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">Referral ID</small>
                          <span className="fw-semibold">{statusResult.user.referralId || statusResult.user.userIds?.myrefrelid || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <small className="text-muted d-block">KYC Submitted At</small>
                          <span className="fw-semibold">
                            {formatDate(statusResult.user.kycSubmittedAt || statusResult.user.createdAt)}
                          </span>
                        </div>
                      </div>
                      {statusResult.user.kycAcceptedAt && (
                        <div className="col-md-6">
                          <div className="bg-success bg-opacity-10 p-3 rounded-3 mb-3 border border-success">
                            <small className="text-success d-block">KYC Accepted At</small>
                            <span className="fw-semibold text-success">{formatDate(statusResult.user.kycAcceptedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-4 flex-wrap">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setStatusResult(null);
                      setUserId('');
                    }}
                    style={{ borderRadius: '10px' }}
                  >
                    Check Another Account
                  </button>
                  {(statusResult.type === 'rejected' || statusResult.type === 'pending' || statusResult.type === 'warning') && (
                    <button 
                      className="btn btn-info"
                      style={{ borderRadius: '10px' }}
                      onClick={() => navigate("/help")}
                    >
                      Contact Admin
                    </button>
                  )}
                  {statusResult.type === 'success' && (
                    <button 
                      className="btn btn-success"
                      style={{ borderRadius: '10px' }}
                      onClick={() => navigate("/login")}
                    >
                      Login & Pay Registration
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .form-control:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
        }
        
        .btn:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default AccountStatusChecker;