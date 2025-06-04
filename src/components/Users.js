import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        setUsers(data.data);
        setLoading(false);
      } else {
        setError(data.message);
        setLoading(false);
      }
    };
    
    eventSource.onerror = (error) => {
      setError('Error connecting to real-time updates');
      setLoading(false);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.userIds?.myuserid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTokens = (tokens) => {
    return tokens ? tokens.toLocaleString() : 'N/A';
  };

  const getStatusBadge = (tokens) => {
    if (tokens > 2000) return 'bg-success';
    if (tokens > 1000) return 'bg-warning';
    return 'bg-secondary';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 text-white fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Naphex Users Dashboard
          </h1>
          <p className="lead text-white-50">Manage and monitor user activities in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)' }}>
              <div className="card-body text-white text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="rounded-circle bg-white bg-opacity-25 p-3">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold">{users.length}</h3>
                <p className="mb-0 small">Total Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(45deg, #4ecdc4, #44a08d)' }}>
              <div className="card-body text-white text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="rounded-circle bg-white bg-opacity-25 p-3">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"/>
                      <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold">{filteredUsers.length}</h3>
                <p className="mb-0 small">Active Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(45deg, #feca57, #ff9ff3)' }}>
              <div className="card-body text-white text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="rounded-circle bg-white bg-opacity-25 p-3">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z"/>
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold">{users.reduce((sum, user) => sum + (user.tokens || 0), 0).toLocaleString()}</h3>
                <p className="mb-0 small">Total Tokens</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-lg h-100" style={{ background: 'linear-gradient(45deg, #a8edea, #fed6e3)' }}>
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="rounded-circle bg-primary bg-opacity-25 p-3">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold text-primary">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : error ? 'Offline' : 'Live'}
                </h3>
                <p className="mb-0 small text-muted">Real-time Updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          {/* Card Header */}
          <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}>
            <div className="row align-items-center">
              <div className="col-md-6">
                <h3 className="text-white mb-0 fw-bold">Users Management</h3>
                <small className="text-white-50">Monitor and search through user database</small>
              </div>
              <div className="col-md-6">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search by name, user ID, or my user ID..."
                    className="form-control form-control-lg border-0 shadow-sm"
                    style={{ 
                      borderRadius: '50px', 
                      paddingLeft: '50px',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <svg width="20" height="20" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger mx-4 mt-4 border-0 shadow-sm" role="alert" style={{ borderRadius: '15px' }}>
              <div className="d-flex align-items-center">
                <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: 'linear-gradient(90deg, #f8f9fa, #e9ecef)' }}>
                  <tr>
                    {[
                      'Name', 'User ID', 'Email', 'Phone', 'My User ID', 
                      'My Referral ID', 'Location', 'Tokens', 'Joined'
                    ].map((header) => (
                      <th key={header} className="border-0 py-3 fw-bold text-muted small text-uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index} className="border-0" style={{ borderBottom: '1px solid #f1f3f4' }}>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                              <svg width="16" height="16" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="fw-semibold">{user.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-light text-dark border">{user.userId || 'N/A'}</span>
                        </td>
                        <td className="py-3 text-muted">{user.email || 'N/A'}</td>
                        <td className="py-3 text-muted">{user.phoneNo || 'N/A'}</td>
                        <td className="py-3">
                          <span className="badge bg-info bg-opacity-10 text-info border border-info">
                            {user.userIds?.myuserid || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            {user.userIds?.myrefrelid || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="small">
                            <div className="fw-semibold">{user.city || 'N/A'}</div>
                            <div className="text-muted">{user.state || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            {formatTokens(user.tokens)}
                          </span>
                        </td>
                        <td className="py-3 text-muted small">
                          {user.createdAt ? moment(user.createdAt).format('MMM DD, YYYY') : 'N/A'}
                          <div className="text-muted small">
                            {user.createdAt ? moment(user.createdAt).format('hh:mm A') : ''}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="text-muted">
                          <svg width="48" height="48" fill="currentColor" className="mb-3 opacity-50" viewBox="0 0 16 16">
                            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                          </svg>
                          <h5>No users found</h5>
                          <p className="mb-0">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer border-0 bg-light">
            <div className="d-flex justify-content-between align-items-center text-muted small">
              <div>
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success me-2" style={{ width: '8px', height: '8px' }}></div>
                Real-time updates active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;