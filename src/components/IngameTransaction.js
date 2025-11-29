import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from './ApiConfig';

const IngameTransaction = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [filterTokenType, setFilterTokenType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      marginBottom: '1rem',
      letterSpacing: '-0.025em'
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      opacity: '0.9',
      marginBottom: '0'
    },

    balanceCard: {
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem'
    },
    balanceItem: {
      padding: '1.25rem',
      position: 'relative'
    },
    balanceDivider: {
      position: 'absolute',
      right: '0',
      top: '20%',
      height: '60%',
      width: '1px',
      background: '#e9ecef'
    },
    balanceLabel: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#6c757d',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '0.5rem'
    },
    balanceValue: {
      fontSize: '1.75rem',
      fontWeight: '700',
      margin: '0'
    },
    filterCard: {
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem'
    },
    filterTitle: {
      fontSize: '1.15rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
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
    clearButton: {
      borderRadius: '6px',
      padding: '0.5rem 1.25rem',
      fontWeight: '500',
      border: '1px solid #dee2e6'
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
    tableRow: {
      transition: 'background 0.2s ease',
      borderBottom: '1px solid #f1f3f5'
    },
    badge: {
      padding: '0.35rem 0.75rem',
      fontWeight: '600',
      fontSize: '0.75rem',
      borderRadius: '6px'
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
    summaryCard: {
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      background: '#f8f9fa',
      marginTop: '1rem'
    },
    summaryText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568'
    },
    taxDetails: {
      fontSize: '0.85rem',
      lineHeight: '1.6'
    },
    amountText: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2d3748'
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getUserPhoneNo = () => {
    try {
      const userDataRaw = localStorage.getItem("userData");
      const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      return userData?.phoneNo || "";
    } catch (err) {
      console.log("localStorage not available");
      return "";
    }
  };

  const fetchUserData = async () => {
    const phoneNo = getUserPhoneNo();
    
    if (!phoneNo) {
      setError('Phone number not found in user data');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user-profile/json/${phoneNo}`);
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.userData);
        processTransactions(data.userData);
      } else {
        setError(data.message || 'User not found');
      }
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processTransactions = (userData) => {
    const allTransactions = [];

    if (userData.binarytokensingame) {
      Object.entries(userData.binarytokensingame).forEach(([transactionId, transaction]) => {
        const transactionData = {
          id: transactionId,
          type: 'transfer_to_tokens',
          tokenType: 'binary',
          date: new Date(transaction.timestamp || transaction.date),
          previousTokens: transaction.previousTokens || 0,
          newTokens: transaction.newTokens || 0,
          previousBinaryTokens: transaction.previousBinaryTokens || 0,
          newBinaryTokens: transaction.newBinaryTokens || 0,
          requestedAmount: transaction.requestedAmount || 0,
          tokensAdded: transaction.tokensAdded || 0,
          taxDeducted: transaction.taxDeducted || 0,
          taxPercentage: transaction.taxPercentage || 0,
          status: transaction.status || 'completed',
          transactionDate: transaction.date
        };
        allTransactions.push(transactionData);
      });
    }

    if (userData.wontokensingame) {
      Object.entries(userData.wontokensingame).forEach(([transactionId, transaction]) => {
        const transactionData = {
          id: transactionId,
          type: 'transfer_to_tokens',
          tokenType: 'won',
          date: new Date(transaction.timestamp || transaction.date),
          previousTokens: transaction.previousTokens || 0,
          newTokens: transaction.newTokens || 0,
          previousWonTokens: transaction.previousWonTokens || 0,
          newWonTokens: transaction.newWonTokens || 0,
          requestedAmount: transaction.requestedAmount || 0,
          tokensAdded: transaction.tokensAdded || 0,
          taxDeducted: transaction.taxDeducted || 0,
          taxPercentage: transaction.taxPercentage || 0,
          status: transaction.status || 'completed',
          transactionDate: transaction.date
        };
        allTransactions.push(transactionData);
      });
    }

    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(allTransactions);
    setFilteredTransactions(allTransactions);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterTokenType !== 'all') {
      filtered = filtered.filter(transaction => transaction.tokenType === filterTokenType);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(transaction => transaction.date >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(transaction => transaction.date <= toDate);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setFilterTokenType('all');
    setDateFrom('');
    setDateTo('');
    setFilteredTransactions(transactions);
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getTokenTypeVariant = (tokenType) => {
    return tokenType === 'binary' ? 'primary' : 'success';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    applyFilters();
  }, [filterTokenType, dateFrom, dateTo, transactions]);

  return (
    <div style={styles.mainContainer}>
      {/* Header Section */}
      <Card style={styles.headerCard}>
        <div style={styles.headerOverlay}></div>
        <Card.Body className="text-white text-center py-4" style={styles.headerContent}>
          <h1 style={styles.headerTitle}>In-Game Transactions</h1>
          <p style={styles.headerSubtitle}>
            Track your bonus tokens converted in Game tokens
          </p>
        </Card.Body>
      </Card>

      <Container fluid className="px-4 pb-4">
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" style={{ borderRadius: '12px', border: 'none' }}>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <Alert.Heading style={{ fontSize: '1.25rem' }}>Error</Alert.Heading>
                  <p style={{ marginBottom: '1rem' }}>{error}</p>
                  <Button 
                    variant="outline-danger" 
                    onClick={fetchUserData}
                    style={{ borderRadius: '6px' }}
                  >
                    🔄 Retry
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        )}

        {/* User Balance Summary */}
        {userData && (
          <Row className="mb-4">
            <Col>
              <Card style={styles.balanceCard}>
                <Card.Body className="p-0">
                  <Row className="g-0">
                    <Col xs={6} md={3}>
                      <div style={styles.balanceItem}>
                        <div style={styles.balanceLabel}>💰 Regular Tokens</div>
                        <h3 style={{ ...styles.balanceValue, color: '#2d3748' }}>
                          {userData.tokens || 0}
                        </h3>
                        <div style={styles.balanceDivider}></div>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div style={styles.balanceItem}>
                        <div style={styles.balanceLabel}>⚡ Binary Tokens</div>
                        <h3 style={{ ...styles.balanceValue, color: '#0d6efd' }}>
                          {userData.binaryTokens || 0}
                        </h3>
                        <div style={styles.balanceDivider}></div>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div style={styles.balanceItem}>
                        <div style={styles.balanceLabel}>🏆 Won Tokens</div>
                        <h3 style={{ ...styles.balanceValue, color: '#198754' }}>
                          {userData.wontokens || 0}
                        </h3>
                        <div style={styles.balanceDivider}></div>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div style={styles.balanceItem}>
                        <div style={styles.balanceLabel}>📊 Total Transactions</div>
                        <h3 style={{ ...styles.balanceValue, color: '#0dcaf0' }}>
                          {transactions.length}
                        </h3>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters Section */}
        <Row className="mb-4">
          <Col>
            <Card style={styles.filterCard}>
              <Card.Body className="p-4">
                <h5 style={styles.filterTitle}>
                  <span>🔍</span>
                  <span>Filter Transactions</span>
                </h5>
                <Row className="g-3">
                  <Col xs={12} sm={6} lg={4}>
                    <Form.Group>
                      <Form.Label style={styles.formLabel}>Token Type</Form.Label>
                      <Form.Select
                        value={filterTokenType}
                        onChange={(e) => setFilterTokenType(e.target.value)}
                        style={styles.formControl}
                      >
                        <option value="all">All Tokens</option>
                        <option value="binary">Binary Tokens</option>
                        <option value="won">Won Tokens</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <Form.Group>
                      <Form.Label style={styles.formLabel}>From Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={styles.formControl}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <Form.Group>
                      <Form.Label style={styles.formLabel}>To Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={styles.formControl}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    style={styles.clearButton}
                  >
                    🗑️ Clear Filters
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transactions Table */}
        <Row>
          <Col>
            <Card style={styles.tableCard}>
              <Card.Body className="p-0">
                {loading ? (
                  <div style={styles.emptyState}>
                    <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <p className="mt-3" style={{ color: '#6c757d', fontSize: '1rem' }}>Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th className="ps-4 py-3">Date & Time</th>
                          <th className="py-3">Token Type</th>
                          <th className="py-3">Requested Amount</th>
                          <th className="py-3">Tax Details</th>
                          <th className="pe-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr 
                            key={transaction.id} 
                            style={styles.tableRow}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <td className="ps-4 py-3">
                              <div style={{ fontSize: '0.875rem', color: '#2d3748' }}>
                                {formatDate(transaction.date)}
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge 
                                bg={getTokenTypeVariant(transaction.tokenType)}
                                style={styles.badge}
                              >
                                {transaction.tokenType === 'binary' ? '⚡ Binary' : '🏆 Won'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div style={styles.amountText}>₹{transaction.requestedAmount}</div>
                            </td>
                            <td className="py-3">
                              <div style={styles.taxDetails}>
                                <div style={{ color: '#2d3748', fontWeight: '600' }}>
                                  ₹{transaction.taxDeducted}
                                </div>
                                <div style={{ color: '#718096' }}>
                                  ({transaction.taxPercentage}%)
                                </div>
                              </div>
                            </td>
                            <td className="pe-4 py-3">
                              <Badge 
                                bg={getStatusVariant(transaction.status)}
                                style={styles.badge}
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <h5 style={{ color: '#4a5568', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No transactions found</h5>
                    <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                      {transactions.length === 0 
                        ? "You don't have any in-game transactions yet."
                        : "No transactions match your current filters."
                      }
                    </p>
                    {transactions.length > 0 && (
                      <Button 
                        variant="primary" 
                        onClick={clearFilters}
                        style={{ borderRadius: '6px', padding: '0.5rem 1.25rem' }}
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

        {/* Transaction Summary */}
        {filteredTransactions.length > 0 && (
          <Row>
            <Col>
              <Card style={styles.summaryCard}>
                <Card.Body className="py-2">
                  <div className="text-center">
                    <span style={styles.summaryText}>
                      Showing <strong>{filteredTransactions.length}</strong> of{' '}
                      <strong>{transactions.length}</strong> transactions
                      {filteredTransactions.length !== transactions.length && ' (filtered)'}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default IngameTransaction;