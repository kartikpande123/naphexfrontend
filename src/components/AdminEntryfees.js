import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  CreditCard, 
  User, 
  Search, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Mail, 
  XCircle,
  AlertTriangle,
  Loader,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react';
import API_BASE_URL from "./ApiConfig"
const AdminEntryFeeVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [action, setAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
            const pendingUsers = response.data.filter(
              user => user.entryFee === 'pending' && user.id !== 'RootId'
            );
            setUsers(pendingUsers);
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

  const handleOpenModal = (user, actionType) => {
    setSelectedUser(user);
    setAction(actionType);
    setAdminNote('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setAdminNote('');
    setAction('');
  };

  const handleVerifyPayment = async () => {
    if (!selectedUser) return;

    const orderId = selectedUser.entryFeeOrderId;
    setProcessing(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-entry-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          approved: action === 'approve',
          adminNote: adminNote || (action === 'approve' ? 'Payment verified and approved' : 'Payment verification failed')
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.message}`);
        handleCloseModal();
        setUsers(prev => prev.filter(u => u.entryFeeOrderId !== orderId));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const phoneMatch = user.phoneNo?.toLowerCase().includes(query);
    const orderIdMatch = user.entryFeeOrderId?.toLowerCase().includes(query);
    
    return nameMatch || phoneMatch || orderIdMatch;
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="text-center">
          <Loader className="text-primary mb-3" size={48} />
          <p className="fs-5 text-muted">Loading pending requests...</p>
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
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white rounded-3 p-2 shadow-sm">
                      <CreditCard size={32} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-white mb-1 fw-bold">Entry Fee Verification</h2>
                      <p className="text-white mb-0" style={{ opacity: 0.9 }}>Manage and verify pending payment requests</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="bg-white text-primary px-4 py-3 rounded-3 shadow-sm">
                      <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{users.length}</div>
                      <div className="small text-muted">Pending</div>
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
                    placeholder="Search by name, phone number, or order ID..."
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
                      Found {filteredUsers.length} requests
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
                  <p className="text-muted mb-0">No pending entry fee requests at the moment.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredUsers.map((user) => (
              <div key={user.userId} className="col-12 mb-4">
                <div className="card border-0 shadow-sm h-100">
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
                      <span className="badge bg-warning text-dark px-3 py-2 d-flex align-items-center gap-2">
                        <Clock size={16} />
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    {/* User Info Row */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 h-100 border rounded">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Mail size={16} className="text-muted" />
                            <small className="text-muted">Email</small>
                          </div>
                          <strong className="text-dark">{user.email || 'N/A'}</strong>
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

                    {/* Payment Details Row */}
                    <div className="p-4 mb-4 border rounded" style={{ background: '#f8f9fa' }}>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <DollarSign size={20} className="text-primary" />
                        <h6 className="text-dark fw-bold mb-0">Payment Details</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <FileText size={16} className="text-muted" />
                            <small className="text-muted">Order ID</small>
                          </div>
                          <code className="bg-white px-3 py-2 d-inline-block border rounded" style={{ fontSize: '0.85rem' }}>
                            {user.entryFeeOrderId}
                          </code>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-muted" />
                            <small className="text-muted">Amount</small>
                          </div>
                          <strong className="text-dark fs-5">₹{user.entryFeeAmount || 500}</strong>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Calendar size={16} className="text-muted" />
                            <small className="text-muted">Submitted</small>
                          </div>
                          <small className="text-dark fw-semibold">{formatTimestamp(user.entryFeeSubmittedAt)}</small>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <button
                          className="btn btn-success w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleOpenModal(user, 'approve')}
                          disabled={processing[user.entryFeeOrderId]}
                        >
                          {processing[user.entryFeeOrderId] ? (
                            <>
                              <Loader className="spinner-border spinner-border-sm" size={18} />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Approve Payment
                            </>
                          )}
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          className="btn btn-danger w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleOpenModal(user, 'reject')}
                          disabled={processing[user.entryFeeOrderId]}
                        >
                          <XCircle size={20} />
                          Reject Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {showModal && selectedUser && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
              <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div 
                  className={`modal-header border-0 p-4 ${action === 'approve' ? 'bg-success' : 'bg-danger'}`}
                  style={{ flexShrink: 0 }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {action === 'approve' ? (
                      <CheckCircle size={24} className="text-white" />
                    ) : (
                      <XCircle size={24} className="text-white" />
                    )}
                    <h5 className="modal-title text-white fw-bold mb-0">
                      {action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                  />
                </div>
                <div className="modal-body p-4" style={{ overflowY: 'auto', flex: 1 }}>
                  <div className="p-3 mb-4 border rounded" style={{ background: '#f8f9fa' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">User Name</small>
                        <strong className="text-dark">{selectedUser.name}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">Phone Number</small>
                        <strong className="text-dark">{selectedUser.phoneNo}</strong>
                      </div>
                      <div className="col-md-8">
                        <small className="text-muted d-block mb-1">Order ID</small>
                        <code className="bg-white px-2 py-1 border rounded">
                          {selectedUser.entryFeeOrderId}
                        </code>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted d-block mb-1">Amount</small>
                        <strong className="text-dark fs-5">₹{selectedUser.entryFeeAmount || 500}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="adminNote" className="form-label fw-semibold">
                      Admin Note (Optional)
                    </label>
                    <textarea
                      id="adminNote"
                      className="form-control"
                      rows="4"
                      placeholder={
                        action === 'approve'
                          ? 'e.g., Payment verified successfully'
                          : 'e.g., Invalid order ID or payment not found'
                      }
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className={`alert ${action === 'approve' ? 'alert-success' : 'alert-danger'} border-0`}>
                    <div className="d-flex align-items-start gap-3">
                      <AlertTriangle size={24} className="flex-shrink-0" />
                      <div>
                        <strong className="d-block mb-2">Confirm Action</strong>
                        <p className="mb-0">
                          {action === 'approve'
                            ? 'User will receive 200 tokens and gain access to the dashboard.'
                            : 'User will be notified of rejection and can resubmit.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 bg-light" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary px-4 py-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'} px-4 py-2 d-flex align-items-center gap-2`}
                    onClick={handleVerifyPayment}
                    disabled={processing[selectedUser.entryFeeOrderId]}
                  >
                    {processing[selectedUser.entryFeeOrderId] ? (
                      <>
                        <Loader className="spinner-border spinner-border-sm" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {action === 'approve' ? (
                          <>
                            <CheckCircle size={18} />
                            Confirm Approval
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            Confirm Rejection
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEntryFeeVerification;