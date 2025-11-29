import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, 
  Button, Form, Spinner, Alert, Modal,
  InputGroup, Pagination
} from 'react-bootstrap';
import API_BASE_URL from './ApiConfig';

const AdminIngameTransaction = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventSource, setEventSource] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTokenType, setFilterTokenType] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const eventSourceRef = useRef(null);

  // Internal CSS styles
  const styles = {
    mainContainer: {
      background: '#ffffff',
      minHeight: '100vh',
      padding: '0'
    },
    headerCard: {
      background: 'rgb(13, 110, 253)',
      border: 'none',
      borderRadius: '0',
      boxShadow: 'none',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(1px)'
    },
    headerContent: {
      position: 'relative',
      zIndex: 1
    },
    headerTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em'
    },
    headerSubtitle: {
      fontSize: '0.95rem',
      opacity: '0.9',
      marginBottom: '0'
    },
    liveBadge: {
      fontSize: '0.75rem',
      padding: '0.35rem 0.75rem',
      borderRadius: '20px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statsCard: {
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem',
      overflow: 'hidden'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '0'
    },
    statsItem: {
      padding: '1.5rem',
      textAlign: 'center',
      borderRight: '1px solid #e9ecef',
      transition: 'all 0.3s ease'
    },
    statsItemLast: {
      borderRight: 'none'
    },
    statsLabel: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#6c757d',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '0.5rem'
    },
    statsValue: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: '0'
    },
    filterCard: {
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem'
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#4a5568',
      marginBottom: '0.5rem'
    },
    formControl: {
      borderRadius: '6px',
      border: '1px solid #dee2e6',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem'
    },
    tableCard: {
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    },
    tableHeader: {
      background: '#f8f9fa',
      fontWeight: '600',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#4a5568',
      borderBottom: '2px solid #dee2e6'
    },
    badge: {
      padding: '0.4rem 0.8rem',
      fontWeight: '600',
      fontSize: '0.75rem',
      borderRadius: '6px'
    },
    userInfoBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    userName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.25rem'
    },
    userDetail: {
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    volumeBox: {
      textAlign: 'center'
    },
    volumeAmount: {
      fontSize: '0.85rem',
      color: '#6c757d',
      marginTop: '0.25rem'
    },
    totalVolume: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#0d6efd'
    },
    emptyState: {
      padding: '3rem 2rem',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '3.5rem',
      opacity: '0.2',
      marginBottom: '1rem'
    },
    modalHeader: {
      background: 'rgb(13, 110, 253)',
      color: 'white',
      borderBottom: 'none'
    },
    modalSummaryCard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '12px',
      border: '1px solid #dee2e6',
      padding: '1.5rem'
    },
    summaryItem: {
      textAlign: 'center'
    },
    summaryLabel: {
      fontSize: '0.8rem',
      color: '#6c757d',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: '0.5rem'
    },
    summaryValue: {
      fontSize: '1.5rem',
      fontWeight: '700'
    }
  };

  useEffect(() => {
    setupSSEConnection();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const setupSSEConnection = () => {
    setLoading(true);
    
    try {
      const es = new EventSource(`${API_BASE_URL}/api/users`);
      eventSourceRef.current = es;

      es.onopen = () => {
        console.log('SSE Connection opened');
        setLoading(false);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.success && data.data) {
            const usersWithTransactions = processUsersData(data.data);
            setAllUsers(usersWithTransactions);
            setFilteredUsers(usersWithTransactions);
          } else {
            setError(data.message || 'Failed to fetch users data');
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
          setError('Error processing data stream');
        }
      };

      es.onerror = (error) => {
        console.error('SSE Error:', error);
        setError('Real-time connection failed. Please refresh the page.');
        setLoading(false);
      };

      setEventSource(es);
    } catch (sseError) {
      console.error('SSE Setup Error:', sseError);
      setError('Failed to establish real-time connection');
      setLoading(false);
    }
  };

  const processUsersData = (users) => {
    return users.map(user => {
      const binaryTransactions = user.binarytokensingame ? 
        Object.values(user.binarytokensingame) : [];
      
      const wonTransactions = user.wontokensingame ? 
        Object.values(user.wontokensingame) : [];

      const allTransactions = [...binaryTransactions, ...wonTransactions]
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const totalBinaryTransactions = binaryTransactions.length;
      const totalWonTransactions = wonTransactions.length;
      const totalTransactions = allTransactions.length;

      const totalBinaryVolume = binaryTransactions.reduce((sum, tx) => 
        sum + (tx.requestedAmount || 0), 0);
      
      const totalWonVolume = wonTransactions.reduce((sum, tx) => 
        sum + (tx.requestedAmount || 0), 0);
      
      const totalVolume = totalBinaryVolume + totalWonVolume;

      const lastTransaction = allTransactions[0];

      return {
        ...user,
        phoneNo: user.phoneNo || 'N/A',
        name: user.name || 'Unknown User',
        binaryTransactions,
        wonTransactions,
        allTransactions,
        stats: {
          totalBinaryTransactions,
          totalWonTransactions,
          totalTransactions,
          totalBinaryVolume,
          totalWonVolume,
          totalVolume,
          lastActivity: lastTransaction ? new Date(lastTransaction.timestamp || lastTransaction.date) : null
        }
      };
    });
  };

  useEffect(() => {
    let filtered = allUsers;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.phoneNo?.includes(searchTerm) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId?.includes(searchTerm)
      );
    }

    if (filterTokenType !== 'all') {
      filtered = filtered.filter(user => {
        if (filterTokenType === 'binary') {
          return user.stats.totalBinaryTransactions > 0;
        } else if (filterTokenType === 'won') {
          return user.stats.totalWonTransactions > 0;
        }
        return true;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterTokenType, allUsers]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Calculate global statistics
  const globalStats = {
    totalUsers: allUsers.length,
    totalTransactions: allUsers.reduce((sum, user) => sum + user.stats.totalTransactions, 0),
    totalVolume: allUsers.reduce((sum, user) => sum + user.stats.totalVolume, 0),
    totalBinaryVolume: allUsers.reduce((sum, user) => sum + user.stats.totalBinaryVolume, 0),
    totalWonVolume: allUsers.reduce((sum, user) => sum + user.stats.totalWonVolume, 0)
  };

  const UserDetailsModal = () => (
    <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="xl" centered>
      <Modal.Header closeButton style={styles.modalHeader}>
        <Modal.Title>
          📊 Transaction Details - {selectedUser?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem' }}>
        {selectedUser && (
          <>
            <div style={styles.modalSummaryCard} className="mb-4">
              <Row>
                <Col md={3} style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>📱 Phone</div>
                  <div style={{ ...styles.summaryValue, fontSize: '1rem', color: '#2d3748' }}>
                    {selectedUser.phoneNo}
                  </div>
                </Col>
                <Col md={3} style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Total Transactions</div>
                  <div style={{ ...styles.summaryValue, color: '#0d6efd' }}>
                    {selectedUser.stats.totalTransactions}
                  </div>
                </Col>
                <Col md={3} style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>⚡ Binary Volume</div>
                  <div style={{ ...styles.summaryValue, color: '#6f42c1', fontSize: '1.2rem' }}>
                    {formatCurrency(selectedUser.stats.totalBinaryVolume)}
                  </div>
                </Col>
                <Col md={3} style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>🏆 Won Volume</div>
                  <div style={{ ...styles.summaryValue, color: '#198754', fontSize: '1.2rem' }}>
                    {formatCurrency(selectedUser.stats.totalWonVolume)}
                  </div>
                </Col>
              </Row>
            </div>

            <h5 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
              Recent Transactions
            </h5>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e9ecef' }}>
              <Table hover className="mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>Date</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>Token Type</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>Amount</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>Tax</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.allTransactions.slice(0, 10).map((tx, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {formatDate(tx.timestamp || tx.date)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <Badge bg={tx.newBinaryTokens ? 'primary' : 'success'} style={styles.badge}>
                          {tx.newBinaryTokens ? '⚡ Binary' : '🏆 Won'}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem' }}>
                        {formatCurrency(tx.requestedAmount)}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#dc3545', fontSize: '0.875rem' }}>
                        {formatCurrency(tx.taxDeducted)} ({tx.taxPercentage}%)
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <Badge bg={getStatusVariant(tx.status)} style={styles.badge}>
                          {tx.status || 'completed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <div style={styles.headerOverlay}></div>
        <Card.Body className="text-white py-4" style={styles.headerContent}>
          <Container fluid>
            <Row className="align-items-center">
              <Col>
                <h1 style={styles.headerTitle}>User In-Game Token Transfers</h1>
                <p style={styles.headerSubtitle}>
                  Real-time monitoring of all user in-game token transfers
                  {eventSource?.readyState === 1 && (
                    <span style={{ ...styles.liveBadge, background: 'rgba(255, 255, 255, 0.2)', marginLeft: '1rem' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        background: '#10b981', 
                        borderRadius: '50%',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}></span>
                      Live
                    </span>
                  )}
                </p>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>

      <Container fluid className="px-4 pb-4">
        {/* Global Statistics */}
        <Row className="mb-4">
          <Col>
            <Card style={styles.statsCard}>
              <Card.Body className="p-0">
                <div style={styles.statsGrid}>
                  <div style={styles.statsItem}>
                    <div style={styles.statsLabel}>👥 Total Users</div>
                    <h3 style={{ ...styles.statsValue, color: '#2d3748' }}>
                      {globalStats.totalUsers}
                    </h3>
                  </div>
                  <div style={styles.statsItem}>
                    <div style={styles.statsLabel}>📊 Total Transactions</div>
                    <h3 style={{ ...styles.statsValue, color: '#0d6efd' }}>
                      {globalStats.totalTransactions}
                    </h3>
                  </div>
                  <div style={styles.statsItem}>
                    <div style={styles.statsLabel}>💰 Total Volume</div>
                    <h3 style={{ ...styles.statsValue, color: '#198754' }}>
                      {formatCurrency(globalStats.totalVolume)}
                    </h3>
                  </div>
                  <div style={{ ...styles.statsItem, ...styles.statsItemLast }}>
                    <div style={styles.statsLabel}>🔍 Filtered Results</div>
                    <h3 style={{ ...styles.statsValue, color: '#6c757d' }}>
                      {filteredUsers.length}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" style={{ borderRadius: '12px' }}>
                <div className="d-flex align-items-start">
                  <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>⚠️</div>
                  <div className="flex-grow-1">
                    <Alert.Heading style={{ fontSize: '1.1rem' }}>Connection Error</Alert.Heading>
                    <p className="mb-2">{error}</p>
                    <Button variant="outline-danger" size="sm" onClick={setupSSEConnection}>
                      🔄 Reconnect
                    </Button>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card style={styles.filterCard}>
              <Card.Body className="p-4">
                <h5 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', color: '#2d3748' }}>
                  🔍 Search & Filter
                </h5>
                <Row className="g-3">
                  <Col md={5}>
                    <Form.Label style={styles.formLabel}>Search Users</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ borderRadius: '6px 0 0 6px' }}>🔍</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by phone, name, or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...styles.formControl, borderRadius: '0 6px 6px 0' }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Label style={styles.formLabel}>Filter by Token Type</Form.Label>
                    <Form.Select
                      value={filterTokenType}
                      onChange={(e) => setFilterTokenType(e.target.value)}
                      style={styles.formControl}
                    >
                      <option value="all">All Token Types</option>
                      <option value="binary">Binary Tokens Only</option>
                      <option value="won">Won Tokens Only</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label style={styles.formLabel}>&nbsp;</Form.Label>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterTokenType('all');
                      }}
                      className="w-100"
                      style={{ borderRadius: '6px', padding: '0.5rem' }}
                    >
                      🗑️ Clear Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col>
            <Card style={styles.tableCard}>
              <Card.Body className="p-0">
                {loading ? (
                  <div style={styles.emptyState}>
                    <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <p className="mt-3" style={{ color: '#6c757d', fontSize: '1rem' }}>
                      Connecting to real-time data stream...
                    </p>
                  </div>
                ) : currentUsers.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th className="ps-4 py-3">User Info</th>
                            <th className="py-3 text-center">Binary Transactions</th>
                            <th className="py-3 text-center">Won Transactions</th>
                            <th className="py-3 text-center">Total Volume</th>
                            <th className="py-3">Last Activity</th>
                            <th className="pe-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((user, index) => (
                            <tr 
                              key={user.userId}
                              style={{ borderBottom: '1px solid #f1f3f5', transition: 'background 0.2s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <td className="ps-4 py-3">
                                <div style={styles.userInfoBox}>
                                  <div style={styles.userName}>{user.name}</div>
                                  <div style={styles.userDetail}>📱 {user.phoneNo}</div>
                                  <div style={styles.userDetail}>ID: {user.userId}</div>
                                </div>
                              </td>
                              <td className="py-3">
                                <div style={styles.volumeBox}>
                                  <Badge bg="primary" style={{ ...styles.badge, fontSize: '0.85rem' }}>
                                    {user.stats.totalBinaryTransactions}
                                  </Badge>
                                  <div style={styles.volumeAmount}>
                                    {formatCurrency(user.stats.totalBinaryVolume)}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <div style={styles.volumeBox}>
                                  <Badge bg="success" style={{ ...styles.badge, fontSize: '0.85rem' }}>
                                    {user.stats.totalWonTransactions}
                                  </Badge>
                                  <div style={styles.volumeAmount}>
                                    {formatCurrency(user.stats.totalWonVolume)}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <div style={styles.totalVolume}>
                                  {formatCurrency(user.stats.totalVolume)}
                                </div>
                              </td>
                              <td className="py-3">
                                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                                  {formatDate(user.stats.lastActivity)}
                                </small>
                              </td>
                              <td className="pe-4 py-3 text-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleUserClick(user)}
                                  style={{ borderRadius: '6px', fontWeight: '600' }}
                                >
                                  📊 View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center p-4">
                        <Pagination>
                          <Pagination.Prev 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          />
                          {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                              key={index + 1}
                              active={index + 1 === currentPage}
                              onClick={() => setCurrentPage(index + 1)}
                            >
                              {index + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>👥</div>
                    <h5 style={{ color: '#4a5568', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                      No users found
                    </h5>
                    <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                      {allUsers.length === 0 
                        ? "No users data available yet." 
                        : "No users match your search criteria."
                      }
                    </p>
                    {filteredUsers.length === 0 && allUsers.length > 0 && (
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          setSearchTerm('');
                          setFilterTokenType('all');
                        }}
                        style={{ borderRadius: '6px' }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* User Details Modal */}
      <UserDetailsModal />

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminIngameTransaction;