
import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from './ApiConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef(null);

  // Enhanced inline styles
  const styles = {
    container: {
      backgroundColor: '#f1f5f9',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      borderBottom: 'none',
      boxShadow: '0 10px 40px rgba(30, 64, 175, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)'
    },
    headerContent: {
      position: 'relative',
      zIndex: 10
    },
    headerIcon: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      padding: '20px',
      borderRadius: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    },
    connectionStatus: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)'
    },
    mainContent: {
      padding: '40px 20px'
    },
    searchAndStatsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      marginBottom: '32px'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '32px'
    },
    searchRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },
    searchInputContainer: {
      position: 'relative',
      flex: '1',
      minWidth: '300px'
    },
    searchInput: {
      borderRadius: '16px',
      border: '2px solid #e2e8f0',
      padding: '16px 24px 16px 56px',
      fontSize: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f8fafc',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      width: '100%',
      fontWeight: '500'
    },
    searchInputFocus: {
      borderColor: '#4f46e5',
      backgroundColor: '#ffffff',
      boxShadow: '0 8px 25px rgba(79, 70, 229, 0.15)',
      transform: 'translateY(-2px)'
    },
    searchIcon: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6366f1',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    blockedFilterButton: {
      borderRadius: '16px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      border: '2px solid #e2e8f0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      backgroundColor: '#f8fafc',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      whiteSpace: 'nowrap'
    },
    blockedFilterButtonActive: {
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      color: '#ffffff',
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
      transform: 'translateY(-2px)'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px'
    },
    statsCard: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '28px 24px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    statsCardHover: {
      transform: 'translateY(-6px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
    },
    userCard: {
      backgroundColor: '#ffffff',
      border: 'none',
      borderRadius: '20px',
      padding: '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      marginBottom: '24px',
      border: '1px solid rgba(226, 232, 240, 0.6)'
    },
    userCardHover: {
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      transform: 'translateY(-8px)',
      borderColor: 'rgba(79, 70, 229, 0.2)'
    },
    userCardBody: {
      padding: '32px'
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: '700',
      boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
      border: '3px solid rgba(255,255,255,0.2)'
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    toggleButton: {
      borderRadius: '14px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '700',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      minWidth: '120px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
    },
    userDetail: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '14px',
      fontSize: '15px',
      color: '#64748b',
      fontWeight: '500'
    },
    userDetailIcon: {
      width: '18px',
      marginRight: '14px',
      color: '#4f46e5',
      fontWeight: 'bold'
    },
    noResults: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '80px 40px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      border: '1px solid rgba(226, 232, 240, 0.6)'
    },
    reconnectButton: {
      backgroundColor: '#4f46e5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '16px'
    }
  };

  // Setup SSE connection
  const setupSSEConnection = () => {
    try {
      setConnectionStatus('connecting');
      setError(null);

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource connection
      const eventSource = new EventSource(`${API_BASE_URL}/api/users`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnectionStatus('connected');
        setError(null);
      };

      // In your SSE onmessage handler, update this part:
      eventSource.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          if (response.success && response.data) {
            // Map the SSE data structure to match your component expectations
            const usersWithStatus = response.data.map(user => ({
              id: user.userIds?.myuserid || user.userId, // Use myuserid instead of userId
              name: user.name || 'Unknown User',
              phoneNo: user.phoneNo || user.phone || 'N/A',
              city: user.city || 'Unknown',
              state: user.state || 'Unknown',
              createdAt: user.createdAt || user.joinedAt || new Date().toISOString(),
              tokens: user.tokens || user.balance || 0,
              status: user.status || 'active' // Default to active if not specified
            }));

            setUsers(usersWithStatus);
            setLoading(false);
          } else {
            console.warn('No user data received:', response.message);
            setUsers([]);
            setLoading(false);
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
          setError('Error parsing server response');
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setConnectionStatus('disconnected');
        setError('Connection to server lost. Trying to reconnect...');

        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current?.readyState !== EventSource.OPEN) {
            setupSSEConnection();
          }
        }, 5000);
      };

    } catch (err) {
      console.error('Failed to setup SSE connection:', err);
      setError(`Failed to connect: ${err.message}`);
      setConnectionStatus('disconnected');
      setLoading(false);
    }
  };

  // Initialize SSE connection on component mount
  useEffect(() => {
    setupSSEConnection();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Filter users based on search term and blocked filter
  useEffect(() => {
    let filtered = users;

    // Apply blocked filter first
    if (showBlockedOnly) {
      filtered = filtered.filter(user => user.status === 'blocked');
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phoneNo?.includes(searchTerm))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, showBlockedOnly]);

  // Toggle user block/unblock status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';

      // Debug logging
      console.log(`🔄 Attempting to toggle user status:`, {
        userId,
        currentStatus,
        newStatus,
        apiUrl: `${API_BASE_URL}/api/users/${userId}/status`
      });

      // Call API to update user status
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error Response:`, {
          status: response.status,
          statusText: response.statusText,
          result
        });
        throw new Error(result.message || `Failed to update user status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to update user status');
      }

      // Success - log the result
      console.log(`✅ User ${userId} status updated successfully:`, result.data);
      console.log(`Status changed from ${currentStatus} to ${newStatus}`);

      // The SSE connection will automatically update the UI with new data
      // No need to manually update state as SSE will provide real-time updates

    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      setError(`Failed to update user status: ${error.message}`);

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const getStatusBadge = (status) => {
    const isBlocked = status === 'blocked';
    return (
      <span
        style={{
          ...styles.statusBadge,
          backgroundColor: isBlocked ? '#fee2e2' : '#dcfce7',
          color: isBlocked ? '#dc2626' : '#16a34a',
          border: `2px solid ${isBlocked ? '#fca5a5' : '#86efac'}`
        }}
      >
        <span style={{ fontSize: '10px' }}>●</span>
        {isBlocked ? 'Blocked' : 'Active'}
      </span>
    );
  };

  const getConnectionStatusBadge = () => {
    const statusConfig = {
      connected: { color: '#16a34a', bg: '#dcfce7', text: 'Live', icon: '🟢' },
      connecting: { color: '#f59e0b', bg: '#fef3c7', text: 'Connecting', icon: '🟡' },
      disconnected: { color: '#dc2626', bg: '#fee2e2', text: 'Offline', icon: '🔴' }
    };

    const config = statusConfig[connectionStatus];

    return (
      <div style={{
        ...styles.connectionStatus,
        backgroundColor: config.bg,
        color: config.color
      }}>
        <span>{config.icon}</span>
        {config.text}
      </div>
    );
  };

  const reconnectSSE = () => {
    setupSSEConnection();
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #1e40af',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h3 style={{ color: '#374151', fontWeight: '700', marginBottom: '8px' }}>Connecting to Live Data...</h3>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Setting up real-time connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Enhanced Header */}
      <header style={{ ...styles.header, padding: '40px 0' }}>
        <div style={styles.headerOverlay}></div>
        {getConnectionStatusBadge()}
        <div style={{ ...styles.headerContent, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.headerIcon}>
                <span style={{ fontSize: '32px' }}>👥</span>
              </div>
              <div style={{ marginLeft: '24px' }}>
                <h1 style={{
                  margin: '0 0 8px 0',
                  fontWeight: '800',
                  color: '#ffffff',
                  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  letterSpacing: '-0.02em'
                }}>
                  User Management
                </h1>
                <p style={{
                  margin: '0',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  Real-time user account management
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ ...styles.mainContent, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search and Stats Container */}
        <div style={styles.searchAndStatsContainer}>
          {/* Search Bar and Blocked Filter */}
          <div style={styles.searchContainer}>
            <div style={styles.searchRow}>
              <div style={styles.searchInputContainer}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  onFocus={(e) => {
                    Object.assign(e.target.style, styles.searchInputFocus);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.searchInput.borderColor;
                    e.target.style.backgroundColor = styles.searchInput.backgroundColor;
                    e.target.style.boxShadow = styles.searchInput.boxShadow;
                    e.target.style.transform = 'none';
                  }}
                />
              </div>
              <button
                onClick={() => setShowBlockedOnly(!showBlockedOnly)}
                style={{
                  ...styles.blockedFilterButton,
                  ...(showBlockedOnly ? styles.blockedFilterButtonActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!showBlockedOnly) {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showBlockedOnly) {
                    e.target.style.backgroundColor = styles.blockedFilterButton.backgroundColor;
                    e.target.style.borderColor = styles.blockedFilterButton.borderColor;
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>
                  {showBlockedOnly ? '🔒' : '🚫'}
                </span>
                {showBlockedOnly ? 'Show All Users' : 'Show Blocked Users'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsContainer}>
            <div
              style={styles.statsCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statsCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statsCard.boxShadow;
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
                borderRadius: '20px 20px 0 0'
              }}></div>
              <h3 style={{
                fontWeight: '800',
                marginBottom: '8px',
                color: '#1e40af',
                fontSize: '2.5rem',
                lineHeight: '1'
              }}>
                {filteredUsers.length}
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontWeight: '600', fontSize: '15px' }}>
                {showBlockedOnly ? 'Blocked Users' : 'Total Users'}
              </p>
            </div>

            <div
              style={styles.statsCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statsCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statsCard.boxShadow;
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                borderRadius: '20px 20px 0 0'
              }}></div>
              <h3 style={{
                fontWeight: '800',
                marginBottom: '8px',
                color: '#22c55e',
                fontSize: '2.5rem',
                lineHeight: '1'
              }}>
                {users.filter(user => user.status !== 'blocked').length}
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontWeight: '600', fontSize: '15px' }}>
                Active
              </p>
            </div>

            <div
              style={styles.statsCard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statsCardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statsCard.boxShadow;
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                borderRadius: '20px 20px 0 0'
              }}></div>
              <h3 style={{
                fontWeight: '800',
                marginBottom: '8px',
                color: '#ef4444',
                fontSize: '2.5rem',
                lineHeight: '1'
              }}>
                {users.filter(user => user.status === 'blocked').length}
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontWeight: '600', fontSize: '15px' }}>
                Blocked
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '2px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontWeight: '600' }}>{error}</div>
            </div>
            {connectionStatus === 'disconnected' && (
              <button
                onClick={reconnectSSE}
                style={styles.reconnectButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4338ca';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4f46e5';
                }}
              >
                Reconnect
              </button>
            )}
          </div>
        )}

        {/* Users List */}
        <div>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={styles.userCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.userCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = styles.userCard.boxShadow;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)';
              }}
            >
              <div style={styles.userCardBody}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  {/* User Avatar and Basic Info */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '300px' }}>
                    <div style={styles.avatar}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontWeight: '700',
                        color: '#1e293b',
                        fontSize: '1.25rem'
                      }}>
                        {user.name || 'Unknown User'}
                      </h4>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>

                  {/* User Details */}
                  <div style={{ flex: '2', minWidth: '300px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={styles.userDetail}>
                          <span style={styles.userDetailIcon}>📱</span>
                          <span>{user.phoneNo}</span>
                        </div>
                        <div style={styles.userDetail}>
                          <span style={styles.userDetailIcon}>📍</span>
                          <span>{user.city}, {user.state}</span>
                        </div>
                      </div>
                      <div>
                        <div style={styles.userDetail}>
                          <span style={styles.userDetailIcon}>📅</span>
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={styles.userDetail}>
                          <span style={styles.userDetailIcon}>🪙</span>
                          <span>{user.tokens?.toLocaleString()} tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      style={{
                        ...styles.toggleButton,
                        backgroundColor: user.status === 'blocked' ? '#22c55e' : '#ef4444',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'none';
                        e.target.style.boxShadow = styles.toggleButton.boxShadow;
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>
                        {user.status === 'blocked' ? '🔓' : '🔒'}
                      </span>
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && !loading && (
          <div style={styles.noResults}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>👤</div>
            <h3 style={{ color: '#64748b', fontWeight: '700', marginBottom: '12px', fontSize: '1.5rem' }}>
              No users found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: '0' }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'No users available at the moment'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;