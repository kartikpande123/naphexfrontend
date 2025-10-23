import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Coins, 
  User, 
  Search, 
  Clock, 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  Target, 
  Hash, 
  Calendar,
  AlertCircle,
  Loader,
  XCircle
} from 'lucide-react';
import API_BASE_URL from "./ApiConfig"

export default function AdminTokenDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [tokenUpdates, setTokenUpdates] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModal, setRejectModal] = useState({ show: false, user: null, request: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    let eventSource = null;

    const connectSSE = () => {
      eventSource = new EventSource(`${API_BASE_URL}/api/users`, {
        withCredentials: false
      });

      eventSource.onopen = () => {
        console.log('SSE Connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.success && response.data) {
            const usersWithPendingTokens = response.data
              .filter(user => user.id !== 'RootId' && user.tokenRequestHistory)
              .map(user => {
                const pendingRequests = Object.entries(user.tokenRequestHistory || {})
                  .filter(([_, request]) => request.status === 'pending')
                  .map(([key, request]) => ({ id: key, ...request }));
                
                return pendingRequests.length > 0 ? { ...user, pendingRequests } : null;
              })
              .filter(user => user !== null);

            setUsers(usersWithPendingTokens);
            setLoading(false);
          } else if (response.success === false) {
            console.log('No users found');
            setUsers([]);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Connection error:', err);
        setLoading(false);
        if (eventSource) {
          eventSource.close();
        }
        
        setTimeout(() => {
          console.log('Attempting to reconnect SSE...');
          connectSSE();
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleTokenChange = (userId, requestId, value) => {
    setTokenUpdates(prev => ({
      ...prev,
      [`${userId}-${requestId}`]: value
    }));
  };

  const handleUpdateTokens = async (user, request) => {
    const key = `${user.userId}-${request.id}`;
    const tokensToAdd = tokenUpdates[key] || request.netTokens;

    if (!tokensToAdd || tokensToAdd <= 0) {
      alert('Please enter a valid token amount');
      return;
    }

    setProcessing(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          requestId: request.id,
          tokensToAdd: parseFloat(tokensToAdd),
          paymentId: request.paymentId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Successfully added ${tokensToAdd} tokens to ${user.name}`);

        setUsers(prev =>
          prev
            .map(u => {
              if (u.userId === user.userId) {
                const updatedRequests = u.pendingRequests.filter(r => r.id !== request.id);
                return updatedRequests.length > 0 ? { ...u, pendingRequests: updatedRequests } : null;
              }
              return u;
            })
            .filter(u => u !== null)
        );

        setTokenUpdates(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      } else {
        console.error('Error response from backend:', data);
        alert(`${data.error || 'Failed to update tokens'}`);
      }
    } catch (err) {
      console.error('Token update error:', err);
      alert('Failed to update tokens. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  const openRejectModal = (user, request) => {
    setRejectModal({ show: true, user, request });
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, user: null, request: null });
    setRejectionReason('');
  };

  const handleRejectRequest = async () => {
    const { user, request } = rejectModal;
    
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const key = `${user.userId}-${request.id}`;
    setProcessing(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/reject-token-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          requestId: request.id,
          reason: rejectionReason
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Request rejected successfully`);

        setUsers(prev =>
          prev
            .map(u => {
              if (u.userId === user.userId) {
                const updatedRequests = u.pendingRequests.filter(r => r.id !== request.id);
                return updatedRequests.length > 0 ? { ...u, pendingRequests: updatedRequests } : null;
              }
              return u;
            })
            .filter(u => u !== null)
        );

        closeRejectModal();
      } else {
        console.error('Error response from backend:', data);
        alert(`${data.error || 'Failed to reject request'}`);
      }
    } catch (err) {
      console.error('Reject request error:', err);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const totalPendingRequests = users.reduce((total, user) => total + user.pendingRequests.length, 0);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const phoneMatch = user.phoneNo?.toLowerCase().includes(query);
    const paymentIdMatch = user.pendingRequests.some(req => 
      req.paymentId?.toLowerCase().includes(query)
    );
    
    return nameMatch || phoneMatch || paymentIdMatch;
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="text-center">
          <Loader className="text-primary mb-3" size={48} />
          <p className="fs-5 text-muted">Loading pending token requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-white">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4" style={{ background: '#2563eb' }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white rounded-3 p-2 shadow-sm">
                      <Coins size={32} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-white mb-1 fw-bold">Token Request Management</h2>
                      <p className="text-white mb-0" style={{ opacity: 0.9 }}>Review and approve pending token requests</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="bg-white text-primary px-4 py-3 rounded-3 shadow-sm">
                      <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{totalPendingRequests}</div>
                      <div className="small text-muted">Pending Requests</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="position-relative">
                  <Search 
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
                    size={20}
                  />
                  <input
                    type="text"
                    className="form-control form-control-lg ps-5"
                    placeholder="Search by name, phone number, or payment ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      borderRadius: '10px', 
                      border: '2px solid #e5e7eb',
                      paddingLeft: '3rem'
                    }}
                  />
                </div>
                {searchQuery && (
                  <div className="mt-3">
                    <small className="text-muted">
                      Found {filteredUsers.reduce((total, user) => total + user.pendingRequests.length, 0)} requests
                      {filteredUsers.length !== users.length && (
                        <button 
                          className="btn btn-link btn-sm p-0 ms-2"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </button>
                      )}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <CheckCircle className="text-success mb-4" size={64} />
                  <h4 className="text-dark mb-2">All Clear!</h4>
                  <p className="text-muted mb-0">No pending token requests at the moment.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredUsers.flatMap((user) => 
              user.pendingRequests.map((request) => {
                const key = `${user.userId}-${request.id}`;
                return (
                  <div key={key} className="col-12 mb-4">
                    <div className="card border-0 shadow-sm">
                      {/* Card Header */}
                      <div className="card-header border-0 p-4" style={{ background: '#2563eb' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                              <User className="text-primary" size={24} />
                            </div>
                            <div>
                              <h5 className="text-white mb-0 fw-bold">{user.name || 'N/A'}</h5>
                              <small className="text-white" style={{ opacity: 0.9 }}>{user.phoneNo || 'N/A'}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="text-end">
                              <small className="text-white d-block" style={{ opacity: 0.9 }}>Current Tokens</small>
                              <strong className="text-white fs-5">{user.tokens || 0}</strong>
                            </div>
                            <span className="badge bg-warning text-dark px-3 py-2 d-flex align-items-center gap-2">
                              <Clock size={16} />
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="card-body p-4">
                        {/* User Info */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-4">
                            <div className="p-3 h-100 border rounded">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Hash size={16} className="text-muted" />
                                <small className="text-muted">User ID</small>
                              </div>
                              <code className="text-dark">{user.userIds?.myuserid || 'N/A'}</code>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 h-100 border rounded">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <MapPin size={16} className="text-muted" />
                                <small className="text-muted">City</small>
                              </div>
                              <strong className="text-dark">{user.city || 'N/A'}</strong>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 h-100 border rounded">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <CheckCircle size={16} className="text-muted" />
                                <small className="text-muted">KYC Status</small>
                              </div>
                              <span className="badge bg-success px-3 py-2">
                                {user.kyc?.kycStatus || user.kycStatus || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Token Request Details */}
                        <div className="p-4 mb-4 border rounded" style={{ background: '#f8f9fa' }}>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <Coins size={20} className="text-primary" />
                            <h6 className="text-dark fw-bold mb-0">Token Request Details</h6>
                          </div>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <CreditCard size={16} className="text-muted" />
                                <small className="text-muted">Payment ID</small>
                              </div>
                              <code className="bg-white px-3 py-2 d-inline-block border rounded" style={{ fontSize: '0.85rem' }}>
                                {request.paymentId}
                              </code>
                            </div>
                            <div className="col-md-2">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <DollarSign size={16} className="text-muted" />
                                <small className="text-muted">Amount Paid</small>
                              </div>
                              <strong className="text-dark fs-5">₹{request.amountPaid}</strong>
                            </div>
                            <div className="col-md-2">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Target size={16} className="text-muted" />
                                <small className="text-muted">Requested</small>
                              </div>
                              <strong className="text-dark">{request.requestedTokens}</strong>
                            </div>
                            <div className="col-md-2">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Hash size={16} className="text-muted" />
                                <small className="text-muted">Net Tokens</small>
                              </div>
                              <strong className="text-success fs-5">{request.netTokens}</strong>
                            </div>
                            <div className="col-md-12">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Calendar size={16} className="text-muted" />
                                <small className="text-muted">Submitted At</small>
                              </div>
                              <small className="text-dark fw-semibold">{formatTimestamp(request.submittedAt)}</small>
                            </div>
                          </div>
                        </div>

                        {/* Action Section */}
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2">
                              <Coins size={18} />
                              Tokens to Add
                            </label>
                            <input
                              type="number"
                              className="form-control py-2"
                              placeholder="Enter tokens to add"
                              value={tokenUpdates[key] || ''}
                              onChange={(e) => handleTokenChange(user.userId, request.id, e.target.value)}
                              min="0"
                              step="0.01"
                            />
                            <small className="text-muted d-flex align-items-center gap-1 mt-1">
                              <AlertCircle size={14} />
                              Net tokens available: {request.netTokens}
                            </small>
                          </div>
                          <div className="col-md-6 d-flex align-items-end gap-2">
                            <button
                              className="btn btn-primary flex-grow-1 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleUpdateTokens(user, request)}
                              disabled={processing[key]}
                            >
                              {processing[key] ? (
                                <>
                                  <Loader className="spinner-border spinner-border-sm" size={18} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={20} />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-danger py-3 px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                              onClick={() => openRejectModal(user, request)}
                              disabled={processing[key]}
                            >
                              <XCircle size={20} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <XCircle className="text-danger" size={24} />
                  Reject Token Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeRejectModal}
                  disabled={processing[`${rejectModal.user?.userId}-${rejectModal.request?.id}`]}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted mb-1">User: <strong>{rejectModal.user?.name}</strong></p>
                  <p className="text-muted mb-3">Payment ID: <code>{rejectModal.request?.paymentId}</code></p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Reason for Rejection</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Please provide a reason for rejecting this request..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                  disabled={processing[`${rejectModal.user?.userId}-${rejectModal.request?.id}`]}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={handleRejectRequest}
                  disabled={processing[`${rejectModal.user?.userId}-${rejectModal.request?.id}`] || !rejectionReason.trim()}
                >
                  {processing[`${rejectModal.user?.userId}-${rejectModal.request?.id}`] ? (
                    <>
                      <Loader className="spinner-border spinner-border-sm" size={18} />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}