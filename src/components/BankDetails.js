import React, { useState, useEffect } from 'react';
import { Edit, CreditCard, Smartphone, Shield, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from './ApiConfig';

const BankDetails = () => {
  const [userData, setUserData] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [upiDetails, setUpiDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState(false);
  const [editingUpi, setEditingUpi] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddUpi, setShowAddUpi] = useState(false);

  // Form states
  const [bankForm, setBankForm] = useState({
    bankAccountNo: '',
    ifsc: '',
    bankingId: ''
  });
  
  const [upiForm, setUpiForm] = useState({
    upiId: '',
    bankingId: ''
  });

  // Get user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData(parsedData);
      fetchUserProfile(parsedData.phoneNo);
    }
  }, []);

  // Fetch user profile with banking details
  const fetchUserProfile = async (phoneNo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-profile/${phoneNo}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.success && data.userData) {
                processUserData(data.userData);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  // Process user data to separate bank and UPI details
  const processUserData = (data) => {
    if (data.bankingDetails) {
      const bankingEntries = Object.entries(data.bankingDetails);
      
      // Separate bank details and UPI details
      const bankEntry = bankingEntries.find(([_, details]) => 
        details.bankAccountNo && details.ifsc
      );
      const upiEntry = bankingEntries.find(([_, details]) => 
        details.upiId
      );

      if (bankEntry) {
        setBankDetails({ ...bankEntry[1], bankingId: bankEntry[0] });
      }
      if (upiEntry) {
        setUpiDetails({ ...upiEntry[1], bankingId: upiEntry[0] });
      }
    }
  };

  // Add new bank details
  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!userData?.phoneNo || !bankForm.bankAccountNo || !bankForm.ifsc) {
      toast.warning('Please fill in all bank details');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/banking/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          bankAccountNo: bankForm.bankAccountNo,
          ifsc: bankForm.ifsc
        })
      });

      const result = await response.json();
      if (result.success) {
        setBankDetails({
          bankAccountNo: bankForm.bankAccountNo,
          ifsc: bankForm.ifsc,
          bankingId: result.bankingId,
          createdAt: Date.now(),
          status: 'unverified' // Set initial status as unverified
        });
        setBankForm({ bankAccountNo: '', ifsc: '', bankingId: '' });
        setShowAddBank(false);
        toast.success('Bank details added successfully!');
      } else {
        toast.error('Failed to add bank details: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding bank details:', error);
      toast.error('Failed to add bank details');
    }
  };

  // Add new UPI details
  const handleAddUpi = async (e) => {
    e.preventDefault();
    if (!userData?.phoneNo || !upiForm.upiId) {
      toast.warning('Please enter UPI ID');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/banking/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          upiId: upiForm.upiId
        })
      });

      const result = await response.json();
      if (result.success) {
        setUpiDetails({
          upiId: upiForm.upiId,
          bankingId: result.bankingId,
          createdAt: Date.now(),
          status: 'unverified' // Set initial status as unverified
        });
        setUpiForm({ upiId: '', bankingId: '' });
        setShowAddUpi(false);
        toast.success('UPI details added successfully!');
      } else {
        toast.error('Failed to add UPI details: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding UPI details:', error);
      toast.error('Failed to add UPI details');
    }
  };

  // Edit bank details
  const handleEditBank = async (e) => {
    e.preventDefault();
    if (!userData?.phoneNo || !bankForm.bankingId) {
      toast.warning('Missing required information');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/banking/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          bankingId: bankForm.bankingId,
          bankAccountNo: bankForm.bankAccountNo,
          ifsc: bankForm.ifsc,
          status: 'unverified' // Add status flag when editing
        })
      });

      const result = await response.json();
      if (result.success) {
        setBankDetails(prev => ({
          ...prev,
          bankAccountNo: bankForm.bankAccountNo,
          ifsc: bankForm.ifsc,
          status: 'unverified' // Update local state with status
        }));
        setEditingBank(false);
        toast.success('Bank details updated successfully! Status set to unverified for admin review.');
      } else {
        toast.error('Failed to update bank details: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast.error('Failed to update bank details');
    }
  };

  // Edit UPI details
  const handleEditUpi = async (e) => {
    e.preventDefault();
    if (!userData?.phoneNo || !upiForm.bankingId) {
      toast.warning('Missing required information');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/banking/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNo: userData.phoneNo,
          bankingId: upiForm.bankingId,
          upiId: upiForm.upiId,
          status: 'unverified' // Add status flag when editing
        })
      });

      const result = await response.json();
      if (result.success) {
        setUpiDetails(prev => ({
          ...prev,
          upiId: upiForm.upiId,
          status: 'unverified' // Update local state with status
        }));
        setEditingUpi(false);
        toast.success('UPI details updated successfully! Status set to unverified for admin review.');
      } else {
        toast.error('Failed to update UPI details: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating UPI details:', error);
      toast.error('Failed to update UPI details');
    }
  };

  // Start editing bank details
  const startEditingBank = () => {
    setBankForm({
      bankAccountNo: bankDetails.bankAccountNo,
      ifsc: bankDetails.ifsc,
      bankingId: bankDetails.bankingId
    });
    setEditingBank(true);
  };

  // Start editing UPI details
  const startEditingUpi = () => {
    setUpiForm({
      upiId: upiDetails.upiId,
      bankingId: upiDetails.bankingId
    });
    setEditingUpi(true);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your banking details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          
          {/* Header */}
          <div className="text-center mb-5">
            <div className="card border-0 shadow-sm">
              <div 
                className="card-header py-4" 
                style={{ backgroundColor: '#2563eb', border: 'none' }}
              >
                <h2 className="text-white mb-0 d-flex align-items-center justify-content-center">
                  <Shield className="me-3" size={28} />
                  Banking Details
                </h2>
                <p className="text-white-50 mt-2 mb-0">Manage your payment methods securely</p>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div 
              className="card-header py-3" 
              style={{ backgroundColor: '#2563eb', border: 'none' }}
            >
              <h5 className="text-white mb-0 d-flex align-items-center">
                <CreditCard className="me-3" size={20} />
                Bank Account Details
                <span 
                  className={`badge ms-3 ${
                    bankDetails 
                      ? 'bg-success' 
                      : 'bg-warning text-dark'
                  }`}
                >
                  {bankDetails ? (
                    <>
                      <CheckCircle size={14} className="me-1" />
                      Added
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="me-1" />
                      Not Added
                    </>
                  )}
                </span>
                {bankDetails && (
                  <span className="badge bg-warning text-dark ms-2">
                    {bankDetails.status === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </h5>
            </div>

            <div className="card-body p-4">
              {!bankDetails && !showAddBank ? (
                <div className="text-center py-5">
                  <CreditCard size={48} className="text-muted mb-3" />
                  <h6 className="text-muted mb-3">No bank account details added</h6>
                  <button
                    className="btn btn-primary"
                    style={{ borderRadius: '8px' }}
                    onClick={() => setShowAddBank(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add Bank Details
                  </button>
                </div>
              ) : bankDetails && !editingBank ? (
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">Account Number</label>
                        <div className="fw-bold fs-6">{bankDetails.bankAccountNo}</div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">IFSC Code</label>
                        <div className="fw-bold fs-6">{bankDetails.ifsc}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 text-end">
                    <button
                      className="btn btn-outline-primary"
                      style={{ borderRadius: '8px' }}
                      onClick={startEditingBank}
                    >
                      <Edit size={16} className="me-2" />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={bankForm.bankAccountNo}
                        onChange={(e) => setBankForm(prev => ({ ...prev, bankAccountNo: e.target.value }))}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={bankForm.ifsc}
                        onChange={(e) => setBankForm(prev => ({ ...prev, ifsc: e.target.value }))}
                        placeholder="Enter IFSC code"
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{ borderRadius: '8px' }}
                      onClick={showAddBank ? handleAddBank : handleEditBank}
                    >
                      {showAddBank ? 'Add Details' : 'Update Details'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setShowAddBank(false);
                        setEditingBank(false);
                        setBankForm({ bankAccountNo: '', ifsc: '', bankingId: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UPI Details Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div 
              className="card-header py-3" 
              style={{ backgroundColor: '#2563eb', border: 'none' }}
            >
              <h5 className="text-white mb-0 d-flex align-items-center">
                <Smartphone className="me-3" size={20} />
                UPI Details
                <span 
                  className={`badge ms-3 ${
                    upiDetails 
                      ? 'bg-success' 
                      : 'bg-warning text-dark'
                  }`}
                >
                  {upiDetails ? (
                    <>
                      <CheckCircle size={14} className="me-1" />
                      Added
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="me-1" />
                      Not Added
                    </>
                  )}
                </span>
                {upiDetails && (
                  <span className="badge bg-warning text-dark ms-2">
                    {upiDetails.status === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </h5>
            </div>

            <div className="card-body p-4">
              {!upiDetails && !showAddUpi ? (
                <div className="text-center py-5">
                  <Smartphone size={48} className="text-muted mb-3" />
                  <h6 className="text-muted mb-3">No UPI ID added</h6>
                  <button
                    className="btn btn-primary"
                    style={{ borderRadius: '8px' }}
                    onClick={() => setShowAddUpi(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add UPI ID
                  </button>
                </div>
              ) : upiDetails && !editingUpi ? (
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">UPI ID</label>
                      <div className="fw-bold fs-6">{upiDetails.upiId}</div>
                    </div>
                  </div>
                  <div className="col-lg-4 text-end">
                    <button
                      className="btn btn-outline-primary"
                      style={{ borderRadius: '8px' }}
                      onClick={startEditingUpi}
                    >
                      <Edit size={16} className="me-2" />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="form-label">UPI ID</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: '8px' }}
                      value={upiForm.upiId}
                      onChange={(e) => setUpiForm(prev => ({ ...prev, upiId: e.target.value }))}
                      placeholder="Enter UPI ID (e.g., user@upi)"
                      required
                    />
                  </div>
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{ borderRadius: '8px' }}
                      onClick={showAddUpi ? handleAddUpi : handleEditUpi}
                    >
                      {showAddUpi ? 'Add UPI ID' : 'Update UPI ID'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setShowAddUpi(false);
                        setEditingUpi(false);
                        setUpiForm({ upiId: '', bankingId: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div 
            className="card border-0" 
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <div className="card-body p-4">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <Shield size={18} className="me-2" />
                Important Information
              </h6>
              <div className="text-primary">
                <div className="d-flex mb-2">
                  <span className="me-3" style={{ color: '#2563eb' }}>•</span>
                  <span>Your banking details are securely stored and encrypted</span>
                </div>
                <div className="d-flex mb-2">
                  <span className="me-3" style={{ color: '#2563eb' }}>•</span>
                  <span>All details show as "Unverified" until manually verified by admin</span>
                </div>
                <div className="d-flex mb-2">
                  <span className="me-3" style={{ color: '#2563eb' }}>•</span>
                  <span>You can edit your details anytime, but cannot delete them once added</span>
                </div>
                <div className="d-flex">
                  <span className="me-3" style={{ color: '#2563eb' }}>•</span>
                  <span>Both bank account and UPI details are independent payment methods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default BankDetails;