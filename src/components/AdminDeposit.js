import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConfig";
import { 
  DollarSign, 
  Users, 
  Eye, 
  Activity, 
  Calendar, 
  User, 
  FileText, 
  Tag, 
  CreditCard, 
  Receipt, 
  Coins,
  TrendingUp,
  Database,
  Loader
} from 'lucide-react';

export default function AdminTokenDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.success && parsedData.data) {
          let allDeposits = [];

          parsedData.data.forEach((user) => {
            if (user.orders) {
              Object.keys(user.orders).forEach((oid) => {
                const order = user.orders[oid];
                if ((order.type === "tokens" || order.type === "entry_fee") && order.status === "paid") {
                  allDeposits.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    orderId: oid,
                    createdAt: new Date(order.processedAt).toLocaleString(),
                    amountPaid: order.amountPaid,
                    tax: order.taxAmount,
                    creditedTokens: order.creditedTokens || 0,
                    type: order.type,
                  });
                }
              });
            }
          });

          // Sort latest first
          allDeposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setDeposits(allDeposits);
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
      background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
      padding: '2rem 0',
      borderBottom: '4px solid #146c43'
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
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
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
      borderBottom: '3px solid #28a745',
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
    tokenCell: {
      fontWeight: '700',
      color: '#28a745',
      fontSize: '1.1rem'
    },
    loadMoreBtn: {
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      border: 'none',
      borderRadius: '25px',
      padding: '12px 30px',
      fontWeight: '600',
      fontSize: '1rem',
      color: 'white',
      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
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
                <DollarSign size={40} className="me-3" />
                <h1 style={styles.headerTitle}>
                  Token Deposit Transactions
                </h1>
              </div>
              <p style={styles.headerSubtitle}>
                Real-time monitoring of user token purchases and deposits
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
                    <h5 className="mb-0">Total Records</h5>
                  </div>
                  <h3 className="mb-0">{deposits.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Eye size={24} className="me-2" />
                    <h5 className="mb-0">Showing</h5>
                  </div>
                  <h3 className="mb-0">{Math.min(visibleCount, deposits.length)}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Activity size={24} className="me-2" />
                    <h5 className="mb-0">Live Updates</h5>
                  </div>
                  <h3 className="mb-0">Active</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div style={styles.tableContainer}>
            {deposits.length > 0 ? (
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
                          <Tag size={16} className="me-2" />
                          Order ID
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.tableCell}>
                        <div className="d-flex align-items-center justify-content-center">
                          <CreditCard size={16} className="me-2" />
                          Amount Paid
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
                          <FileText size={16} className="me-2" />
                          Type
                        </div>
                      </th>
                      <th className="px-4 py-3" style={styles.lastColumn}>
                        <div className="d-flex align-items-center justify-content-center">
                          <Coins size={16} className="me-2" />
                          Credited Tokens
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.slice(0, visibleCount).map((d, idx) => (
                      <tr
                        key={idx}
                        style={idx % 2 === 0 ? styles.tableRow : {...styles.tableRow, ...styles.alternateRow}}
                        className="text-center"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e8f5e8';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <small className="text-muted">{d.createdAt}</small>
                        </td>
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <span className="badge bg-secondary">{d.userId}</span>
                        </td>
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <strong>{d.name}</strong>
                        </td>
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <code className="bg-light px-2 py-1 rounded">{d.orderId}</code>
                        </td>
                        <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                          ₹{d.amountPaid}
                        </td>
                        <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                          ₹{d.tax}
                        </td>
                        <td className="px-4 py-3" style={styles.tableCell}>
                          <span className={`badge ${d.type === 'entry_fee' ? 'bg-info' : 'bg-success'}`}>
                            {d.type === 'entry_fee' ? 'Entry Fee' : 'Tokens'}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{...styles.lastColumn, ...styles.tokenCell}}>
                          {d.creditedTokens || '-'}
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
                  <h4 className="text-muted mb-3">No Data Available</h4>
                  <p className="text-muted">Waiting for token deposit transactions...</p>
                  <div className="d-flex align-items-center mt-3">
                    <Loader className="spinner-border-sm me-2" />
                    <span className="text-success">Loading...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Load More Button */}
        {visibleCount < deposits.length && (
          <div className="text-center mt-4">
            <button
              style={styles.loadMoreBtn}
              onClick={loadMore}
              className="d-flex align-items-center justify-content-center"
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
              }}
            >
              <TrendingUp size={20} className="me-2" />
              Load More Records
              <span className="ms-2 badge bg-light text-success">
                +{Math.min(30, deposits.length - visibleCount)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}