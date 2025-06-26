import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, User, Phone, Clock, FileX, AlertCircle } from 'lucide-react';
import API_BASE_URL from './ApiConfig';

const RejectedUsersAdmin = () => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch rejected users from API
  useEffect(() => {
    const fetchRejectedUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/rejected-requests`);
        
        // Handle 404 as empty data instead of error
        if (response.status === 404) {
          setRejectedUsers([]);
          setError(null);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRejectedUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching rejected users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedUsers();
  }, []);

  // Filter users based on search term and date
  const filteredUsers = useMemo(() => {
    return rejectedUsers.filter(user => {
      const matchesSearch = 
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || 
        new Date(user.rejectedAt).toDateString() === new Date(dateFilter).toDateString();
      
      return matchesSearch && matchesDate;
    });
  }, [rejectedUsers, searchTerm, dateFilter]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get rejection stats for selected date
  const getDateStats = () => {
    if (!dateFilter) return null;
    
    const selectedDate = new Date(dateFilter).toDateString();
    const count = rejectedUsers.filter(user => 
      new Date(user.rejectedAt).toDateString() === selectedDate
    ).length;
    
    return count;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <div className="text-center">
          <div 
            className="spinner-border text-primary mb-3" 
            role="status"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-primary fw-medium">Loading rejected users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <div className="text-center p-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <AlertCircle size={48} className="text-danger mb-3" />
          <h2 className="text-danger fw-semibold mb-2">Error Loading Data</h2>
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bootstrap CSS CDN */}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '24px' }}>
        <div className="container-fluid">
          {/* Header */}
          <div className="mb-4">
            <h1 className="display-4 fw-bold text-primary mb-2">Rejected Users Dashboard</h1>
            <p className="text-primary">Manage and review rejected user requests</p>
          </div>

          {/* Show "No users found rejected" message when there are no rejected users at all */}
          {rejectedUsers.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5" style={{ backgroundColor: '#f9fafb' }}>
                <FileX size={64} className="text-muted mb-3" />
                <h3 className="text-dark fw-medium mb-2">No users found rejected</h3>
                <p className="text-muted">
                  There are currently no rejected user requests to display.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="card border-primary" style={{ backgroundColor: '#eff6ff' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <FileX size={32} className="text-primary me-3" />
                        <div>
                          <p className="text-primary fw-medium mb-1">Total Rejected</p>
                          <h2 className="fw-bold text-primary mb-0">{rejectedUsers.length}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="card border-info" style={{ backgroundColor: '#f0f9ff' }}>
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <Search size={32} className="text-info me-3" />
                        <div>
                          <p className="text-info fw-medium mb-1">Filtered Results</p>
                          <h2 className="fw-bold text-info mb-0">{filteredUsers.length}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {dateFilter && (
                  <div className="col-md-4 mb-3">
                    <div className="card border-success" style={{ backgroundColor: '#f0fdfa' }}>
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <Calendar size={32} className="text-success me-3" />
                          <div>
                            <p className="text-success fw-medium mb-1">Selected Date</p>
                            <h2 className="fw-bold text-success mb-0">{getDateStats()}</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search and Filter Controls */}
              <div className="card border-primary mb-4" style={{ backgroundColor: '#eff6ff' }}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#ffffff', borderColor: '#93c5fd' }}>
                          <Search size={20} className="text-primary" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name or user ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ borderColor: '#93c5fd' }}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#ffffff', borderColor: '#93c5fd' }}>
                          <Calendar size={20} className="text-primary" />
                        </span>
                        <input
                          type="date"
                          className="form-control"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          style={{ borderColor: '#93c5fd' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {(searchTerm || dateFilter) && (
                    <div className="d-flex gap-2 mt-3">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: '20px' }}
                        >
                          Clear search ×
                        </button>
                      )}
                      {dateFilter && (
                        <button
                          onClick={() => setDateFilter('')}
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: '20px' }}
                        >
                          Clear date ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Users Table */}
              {filteredUsers.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-5" style={{ backgroundColor: '#f9fafb' }}>
                    <FileX size={64} className="text-muted mb-3" />
                    <h3 className="text-dark fw-medium mb-2">No rejected users found</h3>
                    <p className="text-muted">
                      {searchTerm || dateFilter ? 'Try adjusting your search filters' : 'No rejected users to display'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card border-primary">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: '#1d4ed8' }}>
                        <tr>
                          <th className="text-white fw-medium py-3">User Info</th>
                          <th className="text-white fw-medium py-3">Contact</th>
                          <th className="text-white fw-medium py-3">Rejection Details</th>
                          <th className="text-white fw-medium py-3">Dates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            style={{ 
                              transition: 'background-color 0.2s',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#eff6ff'}
                            onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                          >
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <div 
                                  className="d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#dbeafe',
                                    borderRadius: '50%'
                                  }}
                                >
                                  <User size={20} className="text-primary" />
                                </div>
                                <div>
                                  <div className="fw-medium text-dark">{user.userName}</div>
                                  <div className="text-primary" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {user.userId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-3">
                              <div className="d-flex align-items-center mb-1">
                                <Phone size={16} className="text-primary me-2" />
                                <span className="text-dark">{user.phoneNo}</span>
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {user.email !== 'N/A' ? user.email : 'No email provided'}
                              </div>
                            </td>
                            
                            <td className="py-3">
                              <div className="text-danger fw-medium mb-2" style={{ fontSize: '0.875rem' }}>
                                Rejected by: {user.rejectedBy}
                              </div>
                              <div 
                                className="p-2"
                                style={{
                                  backgroundColor: '#fef2f2',
                                  borderLeft: '4px solid #f87171',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <strong>Reason:</strong> {user.rejectionReason}
                              </div>
                            </td>
                            
                            <td className="py-3" style={{ fontSize: '0.875rem' }}>
                              <div className="d-flex align-items-start mb-3">
                                <Clock size={16} className="text-success me-2 mt-1" />
                                <div>
                                  <div className="fw-medium text-dark">KYC Submitted:</div>
                                  <div className="text-muted">{formatDate(user.originalKycSubmittedAt)}</div>
                                </div>
                              </div>
                              <div className="d-flex align-items-start">
                                <Clock size={16} className="text-danger me-2 mt-1" />
                                <div>
                                  <div className="fw-medium text-dark">Rejected:</div>
                                  <div className="text-muted">{formatDate(user.rejectedAt)}</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RejectedUsersAdmin;