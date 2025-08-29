import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

const TransactionHistory = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'deposit', 'withdrawal'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const TRANSACTIONS_PER_PAGE = 20;

  // Get phone number from localStorage
  const getUserPhoneNo = () => {
    try {
      // This will work in your actual environment
      const userDataRaw = localStorage.getItem("userData");
      const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      return userData?.phoneNo || "";
    } catch (err) {
      // Fallback for demo (since localStorage isn't available in Claude artifacts)
      console.log("localStorage not available, using demo phone number");
      return "7022852377";
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
      // Make actual API call
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
      
      // Demo data for testing pagination
      const demoUserData = {
        name: 'Demo User',
        tokens: 1500,
        orders: generateDemoOrders(50),
        withdrawals: generateDemoWithdrawals(25)
      };
      setUserData(demoUserData);
      processTransactions(demoUserData);
    } finally {
      setLoading(false);
    }
  };

  // Generate demo data for testing
  const generateDemoOrders = (count) => {
    const orders = {};
    for (let i = 1; i <= count; i++) {
      orders[`order_${i}`] = {
        type: i % 5 === 0 ? 'entry_fee' : 'deposit',
        amountPaid: Math.floor(Math.random() * 1000) + 100,
        creditedTokens: Math.floor(Math.random() * 500) + 50,
        processedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['paid', 'pending'][Math.floor(Math.random() * 2)],
        taxAmount: Math.floor(Math.random() * 50),
        taxRate: '18%'
      };
    }
    return orders;
  };

  const generateDemoWithdrawals = (count) => {
    const withdrawals = {};
    for (let i = 1; i <= count; i++) {
      withdrawals[`withdrawal_${i}`] = {
        requestedTokens: Math.floor(Math.random() * 500) + 100,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
        tax: Math.floor(Math.random() * 30),
        method: {
          bankAccountNo: `****${Math.floor(Math.random() * 9999)}`
        }
      };
    }
    return withdrawals;
  };

  const processTransactions = (userData) => {
    const allTransactions = [];
    let runningBalance = 0;

    // Process deposits (orders) - these add to balance
    if (userData.orders) {
      Object.entries(userData.orders).forEach(([orderId, order]) => {
        // Check if this is an entry fee order
        const isEntryFee = order.type === 'entry_fee' || 
                          (order.paymentDetails?.order_meta?.order_note === 'Entry Fee') ||
                          (order.order_note === 'Entry Fee');
        
        // For entry fees, credit 200 tokens regardless of amount paid
        const creditedAmount = isEntryFee ? 200 : (order.creditedTokens || 0);
        runningBalance += creditedAmount;
        
        const transaction = {
          id: orderId,
          type: 'deposit',
          date: new Date(order.processedAt || Date.now()),
          amountRequested: order.amountPaid || 0,
          amountCredited: creditedAmount,
          balanceAfter: runningBalance,
          tax: order.taxAmount || 0,
          taxRate: order.taxRate || '0%',
          status: order.status || 'pending',
          method: isEntryFee ? 'Entry Fee Payment' : 'Online Payment'
        };
        allTransactions.push(transaction);
      });
    }

    // Process withdrawals - these subtract from balance
    if (userData.withdrawals) {
      Object.entries(userData.withdrawals).forEach(([withdrawalId, withdrawal]) => {
        const balanceBefore = runningBalance;
        let balanceAfter = balanceBefore;
        
        // Only subtract from balance if withdrawal is approved/completed
        if (withdrawal.status === 'approved' || withdrawal.status === 'completed') {
          runningBalance -= (withdrawal.requestedTokens || 0);
          balanceAfter = runningBalance;
        }
        
        const transaction = {
          id: withdrawalId,
          type: 'withdrawal',
          date: new Date(withdrawal.createdAt || Date.now()),
          amountRequested: withdrawal.requestedTokens || 0,
          amountCredited: -(withdrawal.requestedTokens || 0),
          balanceAfter: withdrawal.status === 'pending' ? null : balanceAfter, // Don't show balance for pending withdrawals
          tax: withdrawal.tax || 0,
          taxRate: withdrawal.tax ? `${((withdrawal.tax / withdrawal.requestedTokens) * 100).toFixed(0)}%` : '0%',
          status: withdrawal.status || 'pending',
          method: withdrawal.method ? `Bank: ${withdrawal.method.bankAccountNo}` : 'Bank Transfer'
        };
        allTransactions.push(transaction);
      });
    }

    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(allTransactions);
    
    // Apply filters
    applyFilters(allTransactions);
  };

  const applyFilters = (transactionList = transactions) => {
    let filtered = [...transactionList];

    // Filter by transaction type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by date range
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
    
    // Reset pagination
    setCurrentPage(1);
    setDisplayedTransactions(filtered.slice(0, TRANSACTIONS_PER_PAGE));
  };

  const clearFilters = () => {
    setFilterType('all');
    setDateFrom('');
    setDateTo('');
    setFilteredTransactions(transactions);
    setCurrentPage(1);
    setDisplayedTransactions(transactions.slice(0, TRANSACTIONS_PER_PAGE));
  };

  const loadMoreTransactions = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * TRANSACTIONS_PER_PAGE;
    
    setDisplayedTransactions(filteredTransactions.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const hasMoreTransactions = currentPage * TRANSACTIONS_PER_PAGE < filteredTransactions.length;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'completed':
        return '#10b981'; // Emerald green
      case 'rejected':
      case 'failed':
        return '#ef4444'; // Red
      case 'pending':
      default:
        return '#f59e0b'; // Amber
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'completed':
        return 'Success';
      case 'rejected':
      case 'failed':
        return 'Failed';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateTo(formatDateForInput(today));
    setDateFrom(formatDateForInput(thirtyDaysAgo));
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilters();
    }
  }, [filterType, dateFrom, dateTo]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '1200px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb'
    },
    header: {
      background: 'rgb(13, 110, 253)',
      color: 'white',
      padding: '32px 24px',
      textAlign: 'center',
      position: 'relative'
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
      margin: '0 0 16px 0',
      fontSize: '28px',
      fontWeight: '700',
      letterSpacing: '-0.025em'
    },
    legend: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginTop: '16px',
      fontSize: '14px',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)'
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    },
    content: {
      padding: '32px 24px'
    },
    filtersSection: {
      background: '#f8fafc',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    },
    filtersTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      alignItems: 'end'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563'
    },
    filterInput: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'border-color 0.2s ease',
      minWidth: '160px'
    },
    filterButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      flexWrap: 'wrap'
    },
    clearBtn: {
      background: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    searchSection: {
      marginBottom: '24px',
      textAlign: 'center'
    },
    refreshBtn: {
      background: 'rgb(13, 110, 253)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    loadMoreBtn: {
      background: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '12px 32px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginTop: '24px'
    },
    balanceInfo: {
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      textAlign: 'center',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151'
    },
    transactionCount: {
      textAlign: 'center',
      marginBottom: '16px',
      color: '#6b7280',
      fontSize: '14px'
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff'
    },
    table: {
      width: '100%',
      minWidth: '800px',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: 'white'
    },
    th: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      padding: '16px 12px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #e5e7eb',
      borderRight: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    thLast: {
      borderRight: 'none'
    },
    td: {
      padding: '16px 12px',
      fontSize: '14px',
      color: '#374151',
      borderBottom: '1px solid #f3f4f6',
      borderRight: '1px solid #f3f4f6',
      verticalAlign: 'middle'
    },
    tdLast: {
      borderRight: 'none'
    },
    evenRow: {
      backgroundColor: '#fafafa'
    },
    hoverRow: {
      transition: 'background-color 0.2s ease'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textAlign: 'center',
      minWidth: '80px',
      display: 'inline-block',
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    },
    typeCell: {
      fontWeight: '600'
    },
    depositType: {
      color: '#10b981',
      backgroundColor: '#d1fae5',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    withdrawalType: {
      color: '#ef4444',
      backgroundColor: '#fee2e2',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    amountPositive: {
      color: '#10b981',
      fontWeight: '600'
    },
    amountNegative: {
      color: '#ef4444',
      fontWeight: '600'
    },
    loading: {
      textAlign: 'center',
      padding: '60px 20px',
      fontSize: '16px',
      color: '#6b7280'
    },
    error: {
      textAlign: 'center',
      padding: '20px',
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      margin: '20px 0'
    },
    noData: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280',
      fontSize: '16px'
    },
    loadMoreContainer: {
      textAlign: 'center',
      marginTop: '24px'
    },
    // Mobile responsive styles
    '@media (max-width: 768px)': {
      container: {
        margin: '10px',
        borderRadius: '12px'
      },
      header: {
        padding: '24px 16px'
      },
      content: {
        padding: '20px 16px'
      },
      legend: {
        gap: '12px'
      },
      headerTitle: {
        fontSize: '24px'
      },
      filtersGrid: {
        gridTemplateColumns: '1fr'
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerOverlay}></div>
          <div style={styles.headerContent}>
            <h2 style={styles.headerTitle}>Transaction History</h2>
          </div>
        </div>
        <div style={styles.loading}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading transaction history...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .refresh-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
          }
          .load-more-btn:hover {
            background-color: #4b5563;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
          }
          .clear-btn:hover {
            background-color: #4b5563;
          }
          .table-row:hover {
            background-color: #f8fafc !important;
          }
          .filter-input:focus {
            outline: none;
            border-color: rgb(13, 110, 253);
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }
        `}
      </style>
      
      <div style={styles.header}>
        <div style={styles.headerOverlay}></div>
        <div style={styles.headerContent}>
          <h2 style={styles.headerTitle}>Transaction History</h2>
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#10b981'}}></div>
              <span>Success</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#f59e0b'}}></div>
              <span>Pending</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#ef4444'}}></div>
              <span>Failed</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div style={styles.filtersSection}>
          <h3 style={styles.filtersTitle}>🔍 Filter Transactions</h3>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Transaction Type</label>
              <select
                className="filter-input"
                style={styles.filterInput}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits Only</option>
                <option value="withdrawal">Withdrawals Only</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>From Date</label>
              <input
                type="date"
                className="filter-input"
                style={styles.filterInput}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>To Date</label>
              <input
                type="date"
                className="filter-input"
                style={styles.filterInput}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.filterButtons}>
            <button 
              className="clear-btn"
              style={styles.clearBtn} 
              onClick={clearFilters}
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        <div style={styles.searchSection}>
          <button 
            className="refresh-btn"
            style={styles.refreshBtn} 
            onClick={fetchUserData}
          >
            🔄 Refresh Transactions
          </button>
        </div>

        {userData && (
          <div style={styles.balanceInfo}>
            <strong>Current Balance: {userData.tokens || 0} Tokens</strong>
            {userData.name && <span> | User: {userData.name}</span>}
          </div>
        )}

        {filteredTransactions.length > 0 && (
          <div style={styles.transactionCount}>
            Showing {displayedTransactions.length} of {filteredTransactions.length} transactions
            {filteredTransactions.length !== transactions.length && 
              ` (filtered from ${transactions.length} total)`
            }
          </div>
        )}

        {displayedTransactions.length > 0 ? (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={{...styles.th}}>Type</th>
                    <th style={{...styles.th}}>Amount Requested</th>
                    <th style={{...styles.th}}>Amount Credited</th>
                    <th style={{...styles.th}}>Balance After</th>
                    <th style={{...styles.th}}>Tax Details</th>
                    <th style={{...styles.th}}>Method</th>
                    <th style={{...styles.th, ...styles.thLast}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTransactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id}
                      className="table-row"
                      style={index % 2 === 1 ? styles.evenRow : {}}
                    >
                      <td style={styles.td}>
                        {formatDate(transaction.date)}
                      </td>
                      <td style={styles.td}>
                        <span style={transaction.type === 'deposit' ? styles.depositType : styles.withdrawalType}>
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </td>
                      <td style={{...styles.td, fontWeight: '600'}}>
                        ₹{transaction.amountRequested}
                      </td>
                      <td style={{
                        ...styles.td,
                        ...(transaction.amountCredited > 0 ? styles.amountPositive : styles.amountNegative)
                      }}>
                        {transaction.type === 'deposit' ? '+' : ''}{transaction.amountCredited} Tokens
                      </td>
                      <td style={{...styles.td, fontWeight: '600'}}>
                        {transaction.balanceAfter !== null ? `${transaction.balanceAfter} Tokens` : '-'}
                      </td>
                      <td style={styles.td}>
                        ₹{transaction.tax} ({transaction.taxRate})
                      </td>
                      <td style={{...styles.td, fontSize: '13px'}}>
                        {transaction.method}
                      </td>
                      <td style={{...styles.td, ...styles.tdLast}}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(transaction.status)
                          }}
                        >
                          {getStatusText(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {hasMoreTransactions && (
              <div style={styles.loadMoreContainer}>
                <button 
                  className="load-more-btn"
                  style={styles.loadMoreBtn}
                  onClick={loadMoreTransactions}
                >
                  Load More ({filteredTransactions.length - displayedTransactions.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : transactions.length > 0 ? (
          <div style={styles.noData}>
            🔍 No transactions found matching your filters
            <br />
            <button 
              className="clear-btn"
              style={{...styles.clearBtn, marginTop: '16px'}} 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.noData}>
            📊 No transactions found
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;