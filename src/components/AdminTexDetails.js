import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "./ApiConfig";
import { 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  Calculator,
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  Database,
  Loader,
  PieChart,
  BarChart3,
  Tag
} from 'lucide-react';

export default function AdminTaxDetails() {
  const [withdrawTaxes, setWithdrawTaxes] = useState([]);
  const [depositTaxes, setDepositTaxes] = useState([]);
  const [activeTab, setActiveTab] = useState("withdraw");

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.success && parsedData.data) {
          let allWithdraws = [];
          let allDeposits = [];

          parsedData.data.forEach((user) => {
            // Withdraw Tax - Only include approved withdrawals (exclude rejected ones)
            if (user.withdrawals) {
              Object.keys(user.withdrawals).forEach((wid) => {
                const w = user.withdrawals[wid];
                // Only include if tax > 0 AND status is not "rejected"
                if (w.tax && w.tax > 0 && w.status !== "rejected") {
                  allWithdraws.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    createdAt: new Date(w.createdAt).toLocaleString(),
                    amount: w.requestedTokens,
                    tax: w.tax,
                    type: 'withdrawal'
                  });
                }
              });
            }

            // Deposit Tax - Include both tokens and entry_fee
            if (user.orders) {
              Object.keys(user.orders).forEach((oid) => {
                const order = user.orders[oid];
                if ((order.type === "tokens" || order.type === "entry_fee") && order.status === "paid" && order.taxAmount > 0) {
                  allDeposits.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    orderId: oid,
                    createdAt: new Date(order.processedAt).toLocaleString(),
                    amount: order.amountPaid,
                    tax: order.taxAmount,
                    type: order.type === 'entry_fee' ? 'entry_fee' : 'tokens'
                  });
                }
              });
            }
          });

          // Sort latest first
          allWithdraws.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          allDeposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setWithdrawTaxes(allWithdraws);
          setDepositTaxes(allDeposits);
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

  const getTotalTax = (list) => {
    return list.reduce((sum, item) => sum + (item.tax || 0), 0);
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
      background: 'linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)',
      padding: '2rem 0',
      borderBottom: '4px solid #4a148c'
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
    tabContainer: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '2rem',
      borderBottom: '1px solid #e9ecef'
    },
    tabButton: {
      borderRadius: '25px',
      padding: '12px 30px',
      fontWeight: '600',
      fontSize: '1rem',
      border: '2px solid',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: '0 0.5rem'
    },
    withdrawTab: {
      borderColor: '#dc3545',
      color: '#dc3545'
    },
    withdrawTabActive: {
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
    },
    depositTab: {
      borderColor: '#28a745',
      color: '#28a745'
    },
    depositTabActive: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
    },
    summaryCard: {
      background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 6px 20px rgba(23, 162, 184, 0.3)',
      margin: '1.5rem'
    },
    statsContainer: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '1.5rem',
      borderBottom: '1px solid #e9ecef'
    },
    statCard: {
      background: activeTab === 'withdraw' 
        ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
        : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: activeTab === 'withdraw'
        ? '0 4px 15px rgba(220, 53, 69, 0.3)'
        : '0 4px 15px rgba(40, 167, 69, 0.3)'
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
      borderBottom: activeTab === 'withdraw' 
        ? '3px solid #dc3545'
        : '3px solid #28a745',
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
    taxCell: {
      fontWeight: '700',
      color: '#dc3545',
      fontSize: '1.1rem'
    },
    noDataCard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '15px',
      padding: '3rem',
      textAlign: 'center',
      margin: '2rem'
    }
  };

  const renderTable = (data) => (
    <div style={styles.tableContainer}>
      {data.length > 0 ? (
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
                {activeTab === 'deposit' && (
                  <th className="px-4 py-3" style={styles.tableCell}>
                    <div className="d-flex align-items-center justify-content-center">
                      <Tag size={16} className="me-2" />
                      Type
                    </div>
                  </th>
                )}
                <th className="px-4 py-3" style={styles.tableCell}>
                  <div className="d-flex align-items-center justify-content-center">
                    <DollarSign size={16} className="me-2" />
                    Amount
                  </div>
                </th>
                <th className="px-4 py-3" style={styles.lastColumn}>
                  <div className="d-flex align-items-center justify-content-center">
                    <Receipt size={16} className="me-2" />
                    Tax
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((t, idx) => (
                <tr
                  key={idx}
                  style={idx % 2 === 0 ? styles.tableRow : {...styles.tableRow, ...styles.alternateRow}}
                  className="text-center"
                  onMouseEnter={(e) => {
                    const hoverColor = activeTab === 'withdraw' ? '#ffeaea' : '#e8f5e8';
                    e.currentTarget.style.backgroundColor = hoverColor;
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
                  {activeTab === 'deposit' && (
                    <td className="px-4 py-3" style={styles.tableCell}>
                      <span className={`badge ${t.type === 'entry_fee' ? 'bg-info' : 'bg-success'}`}>
                        {t.type === 'entry_fee' ? 'Entry Fee' : 'Tokens'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3" style={{...styles.tableCell, ...styles.amountCell}}>
                    ₹{t.amount}
                  </td>
                  <td className="px-4 py-3" style={{...styles.lastColumn, ...styles.taxCell}}>
                    ₹{t.tax}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.noDataCard}>
          <div className="d-flex flex-column align-items-center">
            <Receipt size={48} className="text-muted mb-3" />
            <h4 className="text-muted mb-3">No Tax Data</h4>
            <p className="text-muted">
              No {activeTab} tax records found at the moment...
            </p>
            <div className="d-flex align-items-center mt-3">
              <Loader className="spinner-border-sm me-2" />
              <span className="text-info">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const activeData = activeTab === "withdraw" ? withdrawTaxes : depositTaxes;
  const totalTax = getTotalTax(activeData);
  const withdrawTotal = getTotalTax(withdrawTaxes);
  const depositTotal = getTotalTax(depositTaxes);

  return (
    <div style={styles.pageContainer}>
      <div className="container">
        <div style={styles.mainCard}>
          {/* Enhanced Header */}
          <div style={styles.headerSection}>
            <div className="container text-center">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <Receipt size={40} className="me-3" />
                <h1 style={styles.headerTitle}>
                  Tax Analytics Dashboard
                </h1>
              </div>
              <p style={styles.headerSubtitle}>
                Comprehensive tax tracking for deposits and withdrawals
              </p>
            </div>
          </div>

          {/* Enhanced Tab Section */}
          <div style={styles.tabContainer}>
            <div className="d-flex justify-content-center align-items-center mb-4">
              <button
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "withdraw" ? 
                    {...styles.withdrawTab, ...styles.withdrawTabActive} : 
                    styles.withdrawTab)
                }}
                onClick={() => setActiveTab("withdraw")}
                className="d-flex align-items-center"
              >
                <TrendingDown size={20} className="me-2" />
                Withdrawal Tax
              </button>
              <button
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "deposit" ? 
                    {...styles.depositTab, ...styles.depositTabActive} : 
                    styles.depositTab)
                }}
                onClick={() => setActiveTab("deposit")}
                className="d-flex align-items-center"
              >
                <TrendingUp size={20} className="me-2" />
                Deposit Tax
              </button>
            </div>

            {/* Summary Cards */}
            <div className="row g-3">
              <div className="col-md-6">
                <div style={{
                  ...styles.summaryCard,
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  boxShadow: '0 6px 20px rgba(220, 53, 69, 0.3)'
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <TrendingDown size={24} className="me-2" />
                    <h5 className="mb-0">Total Withdrawal Tax</h5>
                  </div>
                  <h2 className="mb-0">₹{withdrawTotal}</h2>
                  <small className="opacity-75">{withdrawTaxes.length} transactions</small>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{
                  ...styles.summaryCard,
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)'
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <TrendingUp size={24} className="me-2" />
                    <h5 className="mb-0">Total Deposit Tax</h5>
                  </div>
                  <h2 className="mb-0">₹{depositTotal}</h2>
                  <small className="opacity-75">{depositTaxes.length} transactions</small>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div style={styles.statsContainer}>
            <div className="row g-3">
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Database size={24} className="me-2" />
                    <h5 className="mb-0">Active Records</h5>
                  </div>
                  <h3 className="mb-0">{activeData.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Calculator size={24} className="me-2" />
                    <h5 className="mb-0">Current Tax Total</h5>
                  </div>
                  <h3 className="mb-0">₹{totalTax}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={styles.statCard}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <BarChart3 size={24} className="me-2" />
                    <h5 className="mb-0">Category</h5>
                  </div>
                  <h3 className="mb-0 text-capitalize">{activeTab}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          {renderTable(activeData)}
        </div>
      </div>
    </div>
  );
}