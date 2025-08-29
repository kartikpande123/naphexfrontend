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
  Loader
} from 'lucide-react';

export default function AdminWithdrawTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.success && parsedData.data) {
          let allTransactions = [];

          parsedData.data.forEach((user) => {
            if (user.withdrawals) {
              Object.keys(user.withdrawals).forEach((wid) => {
                const w = user.withdrawals[wid];
                if (w.status === "approved") {
                  allTransactions.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    createdAt: new Date(w.createdAt).toLocaleString(),
                    requestedTokens: w.requestedTokens,
                    tax: w.tax,
                    method: w.method?.bankAccountNo
                      ? `Bank: ${w.method.bankAccountNo} (${w.method.ifsc})`
                      : w.method?.upiId
                      ? `UPI: ${w.method.upiId}`
                      : "N/A",
                    finalTokens: w.finalTokens,
                  });
                }
              });
            }
          });

          // Sort latest first
          allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setTransactions(allTransactions);
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

  const loadMore = () => {
    setVisibleCount((prev) => prev + 30);
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
                Real-time monitoring of approved user withdrawal requests
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div style={styles.statsContainer}>
            <div className="row g-3">
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Database size={24} className="me-2" />
                    <h5 className="mb-0">Total Withdrawals</h5>
                  </div>
                  <h3 className="mb-0">{transactions.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Eye size={24} className="me-2" />
                    <h5 className="mb-0">Displaying</h5>
                  </div>
                  <h3 className="mb-0">{Math.min(visibleCount, transactions.length)}</h3>
                </div>
              </div>
              <div className="col-md-4">
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

          {/* Enhanced Table */}
          <div style={styles.tableContainer}>
            {transactions.length > 0 ? (
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
                    {transactions.slice(0, visibleCount).map((t, idx) => (
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
                        <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                          ₹{t.requestedTokens}
                        </td>
                        <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                          ₹{t.tax}
                        </td>
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <span style={styles.methodCell}>{t.method}</span>
                        </td>
                        <td className="px-4 py-3" style={{...styles.lastColumn, ...styles.finalAmountCell}}>
                          ₹{t.finalTokens}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.noDataCard}>
                <div className="d-flex flex-column align-items-center">
                  <Database size={48} className="text-muted mb-3" />
                  <h4 className="text-muted mb-3">No Withdrawal Data</h4>
                  <p className="text-muted">Waiting for approved withdrawal transactions...</p>
                  <div className="d-flex align-items-center mt-3">
                    <Loader className="spinner-border-sm me-2" />
                    <span className="text-primary">Loading...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Load More Button */}
        {visibleCount < transactions.length && (
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
                +{Math.min(30, transactions.length - visibleCount)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}