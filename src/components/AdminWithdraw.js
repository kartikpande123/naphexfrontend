import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConfig";
import { 
  ArrowDownCircle, 
  Users, 
  Eye, 
  Activity, 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Banknote,
  TrendingDown,
  Database,
  Loader,
  Filter,
  X,
  Coins,
  Award
} from 'lucide-react';

export default function AdminWithdrawTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.success && parsedData.data) {
          let allTransactions = [];

          parsedData.data.forEach((user) => {
            // Process binary token withdrawals
            if (user.withdrawals) {
              Object.keys(user.withdrawals).forEach((wid) => {
                const w = user.withdrawals[wid];
                if (w.status === "approved") {
                  allTransactions.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    createdAt: new Date(w.createdAt).toLocaleString(),
                    rawDate: new Date(w.createdAt),
                    requestedTokens: w.requestedTokens,
                    tax: w.tax,
                    method: w.method?.bankAccountNo
                      ? `Bank: ${w.method.bankAccountNo} (${w.method.ifsc})`
                      : w.method?.upiId
                      ? `UPI: ${w.method.upiId}`
                      : "N/A",
                    finalTokens: w.finalTokens,
                    tokenType: "Binary Tokens",
                    taxPercentage: w.taxPercentage || 23
                  });
                }
              });
            }

            // Process won token withdrawals
            if (user.wonWithdrawals) {
              Object.keys(user.wonWithdrawals).forEach((wid) => {
                const w = user.wonWithdrawals[wid];
                if (w.status === "approved") {
                  allTransactions.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    createdAt: new Date(w.createdAt).toLocaleString(),
                    rawDate: new Date(w.createdAt),
                    requestedTokens: w.requestedTokens,
                    tax: w.tax,
                    method: w.method?.bankAccountNo
                      ? `Bank: ${w.method.bankAccountNo} (${w.method.ifsc})`
                      : w.method?.upiId
                      ? `UPI: ${w.method.upiId}`
                      : "N/A",
                    finalTokens: w.finalTokens,
                    tokenType: "Won Tokens",
                    taxPercentage: w.taxPercentage || 30
                  });
                }
              });
            }
          });

          // Sort latest first
          allTransactions.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

          setTransactions(allTransactions);
          setFilteredTransactions(allTransactions);
        }
      } catch (err) {
        console.error("Error parsing event data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Filter transactions by selected date
  useEffect(() => {
    if (selectedDate) {
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.rawDate);
        const selected = new Date(selectedDate);
        
        return transactionDate.toDateString() === selected.toDateString();
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
    setVisibleCount(30); // Reset visible count when filter changes
  }, [selectedDate, transactions]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 30);
  };

  const clearFilter = () => {
    setSelectedDate('');
  };

  const getTokenTypeBadge = (tokenType) => {
    if (tokenType === "Binary Tokens") {
      return {
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        icon: <Coins size={14} className="me-1" />
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        icon: <Award size={14} className="me-1" />
      };
    }
  };

  const styles = {
    pageContainer: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    },
    mainCard: {
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e0e6ed',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    headerSection: {
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      padding: '2rem 0',
      borderBottom: '4px solid #004085'
    },
    headerTitle: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '2.2rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      marginBottom: '0.5rem'
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: '1.1rem',
      fontWeight: '400'
    },
    filterSection: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '1.5rem',
      borderBottom: '1px solid #dee2e6'
    },
    filterCard: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '1px solid #e0e6ed'
    },
    filterButton: {
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontWeight: '600',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
      transition: 'all 0.3s ease'
    },
    clearButton: {
      background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontWeight: '600',
      color: 'white',
      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
      transition: 'all 0.3s ease'
    },
    statsContainer: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '1.5rem',
      borderBottom: '1px solid #e9ecef'
    },
    statCard: {
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
    },
    tableContainer: {
      borderRadius: '0 0 20px 20px',
      overflow: 'hidden'
    },
    tableHeader: {
      background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.95rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '3px solid #007bff',
      borderRight: '1px solid #495057'
    },
    tableRow: {
      background: '#ffffff',
      borderBottom: '2px solid #e9ecef',
      borderRight: '1px solid #e9ecef',
      transition: 'all 0.3s ease'
    },
    alternateRow: {
      background: '#f8f9fa',
      borderBottom: '2px solid #e9ecef',
      borderRight: '1px solid #e9ecef'
    },
    tableCell: {
      borderRight: '1px solid #e9ecef',
      borderBottom: '1px solid #e9ecef'
    },
    lastColumn: {
      borderRight: 'none'
    },
    amountCell: {
      fontWeight: '600',
      color: '#495057'
    },
    finalAmountCell: {
      fontWeight: '700',
      color: '#dc3545',
      fontSize: '1.1rem'
    },
    methodCell: {
      fontSize: '0.9rem',
      fontFamily: 'monospace',
      backgroundColor: '#f8f9fa',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      display: 'inline-block'
    },
    tokenTypeBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadMoreBtn: {
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      border: 'none',
      borderRadius: '25px',
      padding: '12px 30px',
      fontWeight: '600',
      fontSize: '1rem',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    noDataCard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '15px',
      padding: '3rem',
      textAlign: 'center',
      margin: '2rem 0'
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div className="container">
        <div style={styles.mainCard}>
          {/* Enhanced Header */}
          <div style={styles.headerSection}>
            <div className="container text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <ArrowDownCircle size={40} className="me-3" />
                <h1 style={styles.headerTitle}>
                  Withdrawal Transactions
                </h1>
              </div>
              <p style={styles.headerSubtitle}>
                Real-time monitoring of approved user withdrawal requests (Binary & Won Tokens)
              </p>
            </div>
          </div>

          {/* Date Filter Section */}
          <div style={styles.filterSection}>
            <div className="container">
              <div style={styles.filterCard}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <Filter size={20} className="text-primary me-2" />
                      <h5 className="mb-0 me-3">Filter by Date:</h5>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                          maxWidth: '200px',
                          border: '2px solid #007bff',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                      />
                      {selectedDate && (
                        <button
                          style={styles.clearButton}
                          onClick={clearFilter}
                          className="ms-3 d-flex align-items-center"
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                          }}
                        >
                          <X size={16} className="me-1" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <Calendar size={18} className="text-muted me-2" />
                      <span className="text-muted">
                        {selectedDate 
                          ? `Showing withdrawals for: ${new Date(selectedDate).toLocaleDateString()}`
                          : 'Showing all withdrawals'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div style={styles.statsContainer}>
            <div className="container">
              <div className="row g-3">
                <div className="col-md-3">
                  <div style={styles.statCard}>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Database size={24} className="me-2" />
                      <h5 className="mb-0">Total Withdrawals</h5>
                    </div>
                    <h3 className="mb-0">{transactions.length}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={styles.statCard}>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Coins size={24} className="me-2" />
                      <h5 className="mb-0">Binary Tokens</h5>
                    </div>
                    <h3 className="mb-0">
                      {transactions.filter(t => t.tokenType === "Binary Tokens").length}
                    </h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={styles.statCard}>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Award size={24} className="me-2" />
                      <h5 className="mb-0">Won Tokens</h5>
                    </div>
                    <h3 className="mb-0">
                      {transactions.filter(t => t.tokenType === "Won Tokens").length}
                    </h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div style={styles.statCard}>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Activity size={24} className="me-2" />
                      <h5 className="mb-0">Status</h5>
                    </div>
                    <h3 className="mb-0">Live</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div style={styles.tableContainer}>
            {filteredTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ border: '2px solid #dee2e6' }}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Calendar size={16} className="me-2" />
                          Date & Time
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <User size={16} className="me-2" />
                          User ID
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <FileText size={16} className="me-2" />
                          Name
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Coins size={16} className="me-2" />
                          Token Type
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <DollarSign size={16} className="me-2" />
                          Requested Amount
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Receipt size={16} className="me-2" />
                          Tax
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <CreditCard size={16} className="me-2" />
                          Method
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.lastColumn}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Banknote size={16} className="me-2" />
                          Final Amount
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(0, visibleCount).map((t, idx) => {
                      const tokenBadge = getTokenTypeBadge(t.tokenType);
                      return (
                        <tr
                          key={idx}
                          style={idx % 2 === 0 ? styles.tableRow : {...styles.tableRow, ...styles.alternateRow}}
                          className="text-center"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e7f3ff';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <td className="px-4 py-3" style={styles.tableCell}>
                            <small className="text-muted">{t.createdAt}</small>
                          </td>
                          <td className="px-4 py-3" style={styles.tableCell}>
                            <span className="badge bg-secondary">{t.userId}</span>
                          </td>
                          <td className="px-4 py-3" style={styles.tableCell}>
                            <strong>{t.name}</strong>
                          </td>
                          <td className="px-4 py-3" style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.tokenTypeBadge,
                                background: tokenBadge.background
                              }}
                            >
                              {tokenBadge.icon}
                              {t.tokenType}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                            ₹{t.requestedTokens}
                          </td>
                          <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                            <div>
                              ₹{t.tax}
                              <br />
                              <small className="text-muted">({t.taxPercentage}%)</small>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={styles.tableCell}>
                            <span style={styles.methodCell}>{t.method}</span>
                          </td>
                          <td className="px-4 py-3" style={{...styles.lastColumn, ...styles.finalAmountCell}}>
                            ₹{t.finalTokens}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.noDataCard}>
                <div className="d-flex flex-column align-items-center">
                  <Database size={48} className="text-muted mb-3" />
                  <h4 className="text-muted mb-3">
                    {selectedDate ? 'No Data for Selected Date' : 'No Withdrawal Data'}
                  </h4>
                  <p className="text-muted">
                    {selectedDate 
                      ? `No withdrawal transactions found for ${new Date(selectedDate).toLocaleDateString()}`
                      : 'Waiting for approved withdrawal transactions...'
                    }
                  </p>
                  {selectedDate && (
                    <button
                      style={styles.clearButton}
                      onClick={clearFilter}
                      className="mt-2 d-flex align-items-center"
                    >
                      <X size={16} className="me-1" />
                      Clear Filter
                    </button>
                  )}
                  {!selectedDate && (
                    <div className="d-flex align-items-center mt-3">
                      <Loader className="spinner-border-sm me-2" />
                      <span className="text-primary">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Load More Button */}
        {visibleCount < filteredTransactions.length && (
          <div className="text-center mt-4">
            <button
              style={styles.loadMoreBtn}
              onClick={loadMore}
              className="d-flex align-items-center justify-content-center"
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.4)';
              }}
            >
              <TrendingDown size={20} className="me-2" />
              Load More Records
              <span className="ms-2 badge bg-light text-primary">
                +{Math.min(30, filteredTransactions.length - visibleCount)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}