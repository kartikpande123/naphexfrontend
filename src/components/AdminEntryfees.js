import React, { useEffect, useState } from 'react';
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
  Calendar,
  Image,
  ExternalLink
} from 'lucide-react';
import API_BASE_URL from './ApiConfig';

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
              user => user.entryFee === 'pending'
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

  const handleOpenImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const handleVerifyPayment = async () => {
    if (!selectedUser) return;

    const orderId = selectedUser.entryFeeOrderId;
    
    if (!orderId) {
      alert('Invalid request: Missing order ID in user data');
      console.error('User data missing entryFeeOrderId:', selectedUser);
      return;
    }

    setProcessing(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-entry-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userKey: selectedUser.userId || selectedUser.id,
          phoneNo: selectedUser.phoneNo,
          approved: action === 'approve',
          adminNote: adminNote || (action === 'approve'
            ? 'Payment verified and approved'
            : 'Payment verification failed')
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`${data.message}`);
        setUsers(prev => prev.filter(u => u.entryFeeOrderId !== orderId));
        handleCloseModal();
      } else {
        alert(`Error: ${data.error || 'Unexpected server response'}`);
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Network or server error while verifying payment.');
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

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const phoneMatch = user.phoneNo?.toLowerCase().includes(query);
    const transactionIdMatch = user.entryFeeTransactionId?.toLowerCase().includes(query);
    const orderIdMatch = user.entryFeeOrderId?.toLowerCase().includes(query);
    
    return nameMatch || phoneMatch || transactionIdMatch || orderIdMatch;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader style={{ color: '#0d6efd', marginBottom: '1rem' }} size={48} />
          <p style={{ fontSize: '1.25rem', color: '#6c757d' }}>Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: '#2563eb', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <CreditCard size={32} style={{ color: '#0d6efd' }} />
                </div>
                <div>
                  <h2 style={{ color: 'white', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '1.75rem' }}>Registration Fee Verification</h2>
                  <p style={{ color: 'white', marginBottom: 0, opacity: 0.9 }}>Manage and verify pending payment requests</p>
                </div>
              </div>
              <div style={{ background: 'white', color: '#2563eb', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '2rem' }}>{users.length}</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#6c757d' }} 
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, phone, transaction ID, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb',
                  fontSize: '1.1rem',
                  outline: 'none'
                }}
              />
            </div>
            {searchQuery && (
              <div style={{ marginTop: '1rem' }}>
                <small style={{ color: '#6c757d' }}>
                  Found {filteredUsers.length} requests
                  {filteredUsers.length !== users.length && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer', padding: '0 0 0 0.5rem', textDecoration: 'underline' }}
                    >
                      Clear search
                    </button>
                  )}
                </small>
              </div>
            )}
          </div>
        </div>

        {users.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '4rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <CheckCircle style={{ color: '#198754', marginBottom: '1.5rem' }} size={64} />
            <h4 style={{ color: '#212529', marginBottom: '0.5rem' }}>All Clear!</h4>
            <p style={{ color: '#6c757d', marginBottom: 0 }}>No pending entry fee requests at the moment.</p>
          </div>
        ) : (
          <div>
            {filteredUsers.map((user) => {
              const orderId = user.entryFeeOrderId;
              return (
                <div key={orderId || user.userId} style={{ marginBottom: '2rem' }}>
                  <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {/* Card Header */}
                    <div style={{ background: '#2563eb', padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ background: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User style={{ color: '#0d6efd' }} size={24} />
                          </div>
                          <div>
                            <h5 style={{ color: 'white', marginBottom: 0, fontWeight: 'bold' }}>{user.name || 'N/A'}</h5>
                            <small style={{ color: 'white', opacity: 0.9 }}>{user.phoneNo || 'N/A'}</small>
                          </div>
                        </div>
                        <span style={{ background: '#ffc107', color: '#212529', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                          <Clock size={16} />
                          Pending
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '2rem' }}>
                      {/* User Info Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Mail size={16} style={{ color: '#6c757d' }} />
                            <small style={{ color: '#6c757d' }}>Email</small>
                          </div>
                          <strong style={{ color: '#212529' }}>{user.email || 'N/A'}</strong>
                        </div>
                        <div style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <MapPin size={16} style={{ color: '#6c757d' }} />
                            <small style={{ color: '#6c757d' }}>City</small>
                          </div>
                          <strong style={{ color: '#212529' }}>{user.city || 'N/A'}</strong>
                        </div>
                        <div style={{ padding: '1rem', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle size={16} style={{ color: '#6c757d' }} />
                            <small style={{ color: '#6c757d' }}>KYC Status</small>
                          </div>
                          <span style={{ background: '#198754', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-block' }}>
                            {user.kyc?.kycStatus || user.kycStatus || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #dee2e6', borderRadius: '8px', background: '#f8f9fa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <DollarSign size={20} style={{ color: '#0d6efd' }} />
                          <h6 style={{ color: '#212529', fontWeight: 'bold', margin: 0 }}>Payment Details</h6>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <FileText size={16} style={{ color: '#6c757d' }} />
                              <small style={{ color: '#6c757d' }}>Order ID</small>
                            </div>
                            <code style={{ background: 'white', padding: '0.5rem 1rem', border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '0.85rem', display: 'inline-block' }}>
                              {user.entryFeeOrderId || 'N/A'}
                            </code>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <FileText size={16} style={{ color: '#6c757d' }} />
                              <small style={{ color: '#6c757d' }}>Transaction ID</small>
                            </div>
                            <code style={{ background: 'white', padding: '0.5rem 1rem', border: '1px solid #dee2e6', borderRadius: '6px', fontSize: '0.85rem', display: 'inline-block' }}>
                              {user.entryFeeTransactionId || 'N/A'}
                            </code>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <DollarSign size={16} style={{ color: '#6c757d' }} />
                              <small style={{ color: '#6c757d' }}>Amount</small>
                            </div>
                            <strong style={{ color: '#212529', fontSize: '1.5rem' }}>₹{user.entryFeeAmount || 500}</strong>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Calendar size={16} style={{ color: '#6c757d' }} />
                              <small style={{ color: '#6c757d' }}>Submitted</small>
                            </div>
                            <small style={{ color: '#212529', fontWeight: '600' }}>{formatTimestamp(user.entryFeeSubmittedAt)}</small>
                          </div>
                        </div>
                      </div>

                      {/* Payment Screenshot */}
                      {user.entryFeeScreenshotUrl && (
                        <div style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #bee5eb', borderRadius: '8px', background: '#d1ecf1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Image size={20} style={{ color: '#0c5460' }} />
                            <h6 style={{ color: '#0c5460', fontWeight: 'bold', margin: 0 }}>Payment Screenshot</h6>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <img 
                              src={user.entryFeeScreenshotUrl} 
                              alt="Payment Screenshot" 
                              style={{ 
                                maxHeight: '300px', 
                                maxWidth: '100%',
                                cursor: 'pointer',
                                objectFit: 'contain',
                                border: '1px solid #bee5eb',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                              onClick={() => handleOpenImageInNewTab(user.entryFeeScreenshotUrl)}
                            />
                            <div>
                              <button 
                                onClick={() => handleOpenImageInNewTab(user.entryFeeScreenshotUrl)}
                                style={{
                                  background: 'white',
                                  border: '1px solid #0c5460',
                                  color: '#0c5460',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <ExternalLink size={16} />
                                Open in New Tab
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <button
                          onClick={() => handleOpenModal(user, 'approve')}
                          disabled={processing[orderId]}
                          style={{
                            background: processing[orderId] ? '#6c757d' : '#198754',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '8px',
                            cursor: processing[orderId] ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem'
                          }}
                        >
                          {processing[orderId] ? (
                            <>
                              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Approve Payment
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(user, 'reject')}
                          disabled={processing[orderId]}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '8px',
                            cursor: processing[orderId] ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            opacity: processing[orderId] ? 0.6 : 1
                          }}
                        >
                          <XCircle size={20} />
                          Reject Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {showModal && selectedUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, overflowY: 'auto', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', maxWidth: '700px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <div style={{ background: action === 'approve' ? '#198754' : '#dc3545', padding: '1.5rem 2rem', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {action === 'approve' ? (
                    <CheckCircle size={24} style={{ color: 'white' }} />
                  ) : (
                    <XCircle size={24} style={{ color: 'white' }} />
                  )}
                  <h5 style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                    {action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                  </h5>
                </div>
                <button
                  onClick={handleCloseModal}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid #dee2e6', borderRadius: '8px', background: '#f8f9fa' }}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.25rem' }}>User Name</small>
                      <strong style={{ color: '#212529' }}>{selectedUser.name}</strong>
                    </div>
                    <div>
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.25rem' }}>Phone Number</small>
                      <strong style={{ color: '#212529' }}>{selectedUser.phoneNo}</strong>
                    </div>
                    <div>
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.25rem' }}>Order ID</small>
                      <code style={{ background: 'white', padding: '0.25rem 0.5rem', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                        {selectedUser.entryFeeOrderId || 'N/A'}
                      </code>
                    </div>
                    <div>
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.25rem' }}>Transaction ID</small>
                      <code style={{ background: 'white', padding: '0.25rem 0.5rem', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                        {selectedUser.entryFeeTransactionId || 'N/A'}
                      </code>
                    </div>
                    <div>
                      <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.25rem' }}>Amount</small>
                      <strong style={{ color: '#212529', fontSize: '1.5rem' }}>₹{selectedUser.entryFeeAmount || 500}</strong>
                    </div>
                  </div>
                </div>

                {selectedUser.entryFeeScreenshotUrl && (
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', border: '1px solid #bee5eb', borderRadius: '8px', background: '#d1ecf1' }}>
                    <small style={{ color: '#0c5460', display: 'block', marginBottom: '0.5rem' }}>Payment Screenshot</small>
                    <img 
                      src={selectedUser.entryFeeScreenshotUrl} 
                      alt="Payment Screenshot" 
                      style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', cursor: 'pointer', border: '1px solid #bee5eb', borderRadius: '6px', marginBottom: '0.5rem' }}
                      onClick={() => handleOpenImageInNewTab(selectedUser.entryFeeScreenshotUrl)}
                    />
                    <div>
                      <button 
                        onClick={() => handleOpenImageInNewTab(selectedUser.entryFeeScreenshotUrl)}
                        style={{
                          background: 'white',
                          border: '1px solid #0c5460',
                          color: '#0c5460',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <ExternalLink size={16} />
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Admin Note (Optional)
                  </label>
                  <textarea
                    rows="4"
                    placeholder={
                      action === 'approve'
                        ? 'e.g., Payment verified successfully'
                        : 'e.g., Invalid transaction ID or payment not found'
                    }
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ padding: '1rem', borderRadius: '8px', background: action === 'approve' ? '#d4edda' : '#f8d7da', border: `1px solid ${action === 'approve' ? '#c3e6cb' : '#f5c6cb'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <AlertTriangle size={24} style={{ color: action === 'approve' ? '#155724' : '#721c24', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: action === 'approve' ? '#155724' : '#721c24' }}>Confirm Action</strong>
                      <p style={{ margin: 0, color: action === 'approve' ? '#155724' : '#721c24' }}>
                        {action === 'approve'
                          ? 'User will be marked as paid and gain access to the dashboard.'
                          : 'User request and screenshot will be permanently deleted from the system.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={processing[selectedUser.entryFeeOrderId]}
                  style={{
                    background: action === 'approve' ? '#198754' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: processing[selectedUser.entryFeeOrderId] ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: processing[selectedUser.entryFeeOrderId] ? 0.6 : 1
                  }}
                >
                  {processing[selectedUser.entryFeeOrderId] ? (
                    <>
                      <Loader size={18} />
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
        )}
      </div>
    </div>
  );
};

export default AdminEntryFeeVerification;