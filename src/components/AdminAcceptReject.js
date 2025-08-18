import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, EyeOff, Calendar, Phone, MapPin, CreditCard, User, Coins, X, Camera } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserManagementDashboard.css';
import API_BASE_URL from './ApiConfig';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [processingUsers, setProcessingUsers] = useState(new Set());
  const [modalImage, setModalImage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.success && response.data) {
          // Filter out root users and sort by newest first
          const filteredUsers = response.data
            .filter(user => {
              // Filter out users with userId 'RootId' or id 'RootId' (case insensitive)
              const isRootUser = 
                user.userId === 'RootId' || 
                user.id === 'RootId' ||
                (user.userId && user.userId.toLowerCase().includes('rootid')) ||
                (user.id && user.id.toLowerCase().includes('rootid'));
              
              return !isRootUser;
            })
            .map(user => ({
              ...user,
              // Extract userId from userIds subcollection if available
              userId: user.userIds?.myuserid || user.userId || user.id,
              referralId: user.userIds?.myrefrelid || user.referralId
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setUsers(filteredUsers);
          setLoading(false);
        } else {
          setError(response.message || 'Failed to load users');
          setLoading(false);
        }
      } catch (err) {
        setError('Error parsing server response');
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setError('Connection to server failed');
      setLoading(false);
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleAcceptUser = async (userId) => {
  setProcessingUsers(prev => new Set([...prev, userId]));
  
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/accept/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (result.success) {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userIds?.myuserid === userId
            ? { 
                ...user, 
                kycStatus: 'accepted',
                kycAcceptedAt: result.data.acceptedAt
              }
            : user
        )
      );
      alert('KYC accepted successfully!');
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to accept KYC. Please try again.');
  } finally {
    setProcessingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }
};

  const handleRejectUser = async () => {
  if (!rejectionReason.trim()) {
    alert('Please provide a rejection reason');
    return;
  }

  setProcessingUsers(prev => new Set([...prev, selectedUserId]));

  try {
    const response = await fetch(`${API_BASE_URL}/kyc/reject/${selectedUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason: rejectionReason.trim()
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Remove the user from the local state since the backend deleted the user
      setUsers(prevUsers =>
        prevUsers.filter(user => user.userId !== selectedUserId)
      );

      console.log(`User ${selectedUserId} rejected and deleted successfully`);

      // Close modal and reset
      setShowRejectModal(false);
      setSelectedUserId(null);
      setRejectionReason('');
    } else {
      console.error('Error rejecting user:', result.message);
      alert(result.message || 'Rejection failed.');
    }
  } catch (error) {
    console.error('Error rejecting user:', error);
    alert('An error occurred while rejecting the user.');
  } finally {
    setProcessingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedUserId);
      return newSet;
    });
  }
};


  const openRejectModal = (userId) => {
    setSelectedUserId(userId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedUserId(null);
    setRejectionReason('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'accepted': 
        return 'text-green-600 bg-green-50';
      case 'rejected': 
        return 'text-red-600 bg-red-50';
      case 'submitted': 
        return 'text-yellow-600 bg-yellow-50';
      default: 
        return 'text-gray-600 bg-gray-50';
    }
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeImageModal();
        if (showRejectModal) {
          closeRejectModal();
        }
      }
    };

    if (modalImage || showRejectModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalImage, showRejectModal]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <XCircle className="text-danger mb-3" size={48} />
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light p-4">
      <div className="container-fluid1">
        <div className="mb-4">
          <h1 className="display-5 fw-bold text-dark">User Management Dashboard</h1>
          <p className="text-muted fs-6">Total Users: {users.length}</p>
        </div>

        <div className="row g-4">
          {users.map((user) => (
            <div key={user.userId} className="col-12">
              <div className="card shadow-sm border-0 user-card">
                {/* User Header */}
                <div className="card-header1 bg-white border-bottom p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="user-avatar bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center me-3">
                        <User className="text-primary" size={24} />
                      </div>
                      <div>
                        <h5 className="mb-1 fw-semibold">{user.name}</h5>
                        <small className="text-muted">ID: {user.userId || 'N/A'}</small>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge status-badge ${getStatusColor(user.kycStatus)}`}>
                        {user.kycStatus?.toUpperCase() || 'PENDING'}
                      </span>
                      
                      <button
                        onClick={() => toggleUserExpansion(user.userId)}
                        className="btn btn-outline-secondary btn-sm"
                        title={expandedUsers.has(user.userId) ? 'Hide Details' : 'Show Details'}
                      >
                        {expandedUsers.has(user.userId) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="row mt-3 g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <Phone className="text-muted me-2" size={16} />
                        <small>{user.phoneNo}</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <MapPin className="text-muted me-2" size={16} />
                        <small>{user.city || 'N/A'}, {user.state || 'N/A'}</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <Calendar className="text-muted me-2" size={16} />
                        <small>{formatDate(user.createdAt)}</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedUsers.has(user.userId) && (
                  <div className="card-body2 p-4">
                    <div className="row g-5">
                      {/* User Details */}
                      <div className="col-lg-6">
                        <h6 className="fw-semibold mb-3">User Details</h6>
                        <div className="user-details2">
                          <div className="detail-row d-flex justify-content-between py-2">
                            <span className="text-muted">Referral ID:</span>
                            <span className="fw-medium">{user.referralId || 'N/A'}</span>
                          </div>
                          <div className="detail-row d-flex justify-content-between py-2">
                            <span className="text-muted">My Referral ID:</span>
                            <span className="fw-medium">{user.userIds?.myrefrelid || user.referralId || 'N/A'}</span>
                          </div>
                          <div className="detail-row d-flex justify-content-between py-2 align-items-center">
                            <span className="text-muted">Tokens:</span>
                            <div className="d-flex align-items-center">
                              <Coins className="text-warning me-1" size={16} />
                              <span className="fw-medium">{user.tokens || 0}</span>
                            </div>
                          </div>
                          <div className="detail-row d-flex justify-content-between py-2">
                            <span className="text-muted">KYC Submitted:</span>
                            <span className="fw-medium">{user.kycSubmittedAt ? formatDate(user.kycSubmittedAt) : 'Not submitted'}</span>
                          </div>
                        </div>
                      </div>

                      {/* KYC Documents */}
                      <div className="col-lg-6">
                        <h6 className="fw-semibold mb-3">KYC Documents</h6>
                        {user.kyc ? (
                          <div className="kyc-documents">
                            {user.kyc.aadharCardUrl && (
                              <div className="mb-3">
                                <label className="form-label small fw-medium">Aadhar Card</label>
                                <div className="kyc-image-container" onClick={() => openImageModal(user.kyc.aadharCardUrl)} style={{cursor: 'pointer'}}>
                                  <img 
                                    src={user.kyc.aadharCardUrl} 
                                    alt="Aadhar Card" 
                                    className="img-fluid kyc-image rounded"
                                    style={{maxHeight: '150px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="kyc-fallback text-center p-3 bg-light rounded" style={{display: 'none'}}>
                                    <CreditCard className="text-muted mb-2" size={24} />
                                    <p className="small text-muted mb-0">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {user.kyc.panCardUrl && (
                              <div className="mb-3">
                                <label className="form-label small fw-medium">PAN Card</label>
                                <div className="kyc-image-container" onClick={() => openImageModal(user.kyc.panCardUrl)} style={{cursor: 'pointer'}}>
                                  <img 
                                    src={user.kyc.panCardUrl} 
                                    alt="PAN Card" 
                                    className="img-fluid kyc-image rounded"
                                    style={{maxHeight: '150px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="kyc-fallback text-center p-3 bg-light rounded" style={{display: 'none'}}>
                                    <CreditCard className="text-muted mb-2" size={24} />
                                    <p className="small text-muted mb-0">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {user.kyc.bankPassbookUrl && (
                              <div className="mb-3">
                                <label className="form-label small fw-medium">Bank Passbook</label>
                                <div className="kyc-image-container" onClick={() => openImageModal(user.kyc.bankPassbookUrl)} style={{cursor: 'pointer'}}>
                                  <img 
                                    src={user.kyc.bankPassbookUrl} 
                                    alt="Bank Passbook" 
                                    className="img-fluid kyc-image rounded"
                                    style={{maxHeight: '150px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="kyc-fallback text-center p-3 bg-light rounded" style={{display: 'none'}}>
                                    <CreditCard className="text-muted mb-2" size={24} />
                                    <p className="small text-muted mb-0">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Added Selfie Section */}
                            {user.kyc.selfieUrl && (
                              <div className="mb-3">
                                <label className="form-label small fw-medium">Selfie</label>
                                <div className="kyc-image-container" onClick={() => openImageModal(user.kyc.selfieUrl)} style={{cursor: 'pointer'}}>
                                  <img 
                                    src={user.kyc.selfieUrl} 
                                    alt="User Selfie" 
                                    className="img-fluid kyc-image rounded"
                                    style={{maxHeight: '150px', objectFit: 'cover'}}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="kyc-fallback text-center p-3 bg-light rounded" style={{display: 'none'}}>
                                    <Camera className="text-muted mb-2" size={24} />
                                    <p className="small text-muted mb-0">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted">No KYC documents submitted</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user.kycStatus === 'submitted' && (
                      <div className="mt-4 pt-4 border-top">
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            onClick={() => handleAcceptUser(user.userId)}
                            disabled={processingUsers.has(user.userId)}
                            className="btn btn-success px-4"
                          >
                            <CheckCircle size={16} className="me-2" />
                            {processingUsers.has(user.userId) ? 'Processing...' : 'Accept'}
                          </button>
                          
                          <button
                            onClick={() => openRejectModal(user.userId)}
                            disabled={processingUsers.has(user.userId)}
                            className="btn btn-danger px-4"
                          >
                            <XCircle size={16} className="me-2" />
                            {processingUsers.has(user.userId) ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-5">
            <User className="text-muted mb-3" size={48} />
            <p className="text-muted">No users found</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div 
          className="modal fade show d-block" 
          style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={closeRejectModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject KYC Request</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeRejectModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="rejectionReason"
                    rows="4"
                    placeholder="Please provide a reason for rejecting this KYC request..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleRejectUser}
                  disabled={!rejectionReason.trim() || processingUsers.has(selectedUserId)}
                >
                  {processingUsers.has(selectedUserId) ? 'Processing...' : 'Reject KYC'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {modalImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1055,
            cursor: 'pointer'
          }}
          onClick={closeImageModal}
        >
          {/* Close Button */}
          <button 
            type="button" 
            className="position-absolute btn p-2"
            onClick={closeImageModal}
            style={{
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              border: 'none',
              zIndex: 1056
            }}
          >
            <X size={24} color="white" />
          </button>

          {/* Centered Image */}
          <img 
            src={modalImage} 
            alt="KYC Document" 
            className="img-fluid"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;