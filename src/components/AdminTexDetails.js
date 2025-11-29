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
  Tag,
  GamepadIcon
} from 'lucide-react';

export default function AdminTaxDetails() {
  const [withdrawTaxes, setWithdrawTaxes] = useState([]);
  const [depositTaxes, setDepositTaxes] = useState([]);
  const [gameTaxes, setGameTaxes] = useState([]);
  const [activeTab, setActiveTab] = useState("withdraw");

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.success && parsedData.data) {
          let allWithdraws = [];
          let allDeposits = [];
          let allGameTaxes = [];

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

            // In-game Transaction Tax - From binarytokensingame and wontokensingame
            if (user.binarytokensingame) {
              Object.keys(user.binarytokensingame).forEach((tid) => {
                const transaction = user.binarytokensingame[tid];
                if (transaction.taxDeducted && transaction.taxDeducted > 0) {
                  allGameTaxes.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    transactionId: tid,
                    createdAt: new Date(transaction.timestamp || transaction.date).toLocaleString(),
                    amount: transaction.requestedAmount,
                    tax: transaction.taxDeducted,
                    taxPercentage: transaction.taxPercentage,
                    type: 'binary_tokens',
                    status: transaction.status || 'completed'
                  });
                }
              });
            }

            if (user.wontokensingame) {
              Object.keys(user.wontokensingame).forEach((tid) => {
                const transaction = user.wontokensingame[tid];
                if (transaction.taxDeducted && transaction.taxDeducted > 0) {
                  allGameTaxes.push({
                    userId: user.userIds?.myuserid || user.userId,
                    name: user.name,
                    transactionId: tid,
                    createdAt: new Date(transaction.timestamp || transaction.date).toLocaleString(),
                    amount: transaction.requestedAmount,
                    tax: transaction.taxDeducted,
                    taxPercentage: transaction.taxPercentage,
                    type: 'won_tokens',
                    status: transaction.status || 'completed'
                  });
                }
              });
            }
          });

          // Sort latest first
          allWithdraws.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          allDeposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          allGameTaxes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setWithdrawTaxes(allWithdraws);
          setDepositTaxes(allDeposits);
          setGameTaxes(allGameTaxes);
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
    const total = list.reduce((sum, item) => sum + (item.tax || 0), 0);
    // Format to 1 decimal place
    return Math.round(total * 10) / 10;
  };

  const getTaxTypeStats = (list) => {
    const stats = {
      binary_tokens: { count: 0, total: 0 },
      won_tokens: { count: 0, total: 0 }
    };
    
    list.forEach(item => {
      if (stats[item.type]) {
        stats[item.type].count += 1;
        stats[item.type].total += item.tax || 0;
      }
    });
    
    return stats;
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
    gameTab: {
      borderColor: '#ff6b35',
      color: '#ff6b35'
    },
    gameTabActive: {
      backgroundColor: '#ff6b35',
      borderColor: '#ff6b35',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)'
    },
    summaryCard: {
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      margin: '0.5rem',
      border: '2px solid rgba(255,255,255,0.2)'
    },
    statsContainer: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '1.5rem',
      borderBottom: '1px solid #e9ecef'
    },
    statCard: {
      borderRadius: '12px',
      padding: '1.5rem',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '2px solid rgba(255,255,255,0.2)',
      height: '100%'
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
        : activeTab === 'deposit'
        ? '3px solid #28a745'
        : '3px solid #ff6b35',
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
      color: activeTab === 'withdraw' ? '#dc3545' : activeTab === 'deposit' ? '#28a745' : '#ff6b35',
      fontSize: '1.1rem'
    },
    noDataCard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '15px',
      padding: '3rem',
      textAlign: 'center',
      margin: '2rem'
    },
    typeBadge: {
      binary_tokens: {
        background: 'linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)',
        color: 'white'
      },
      won_tokens: {
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white'
      },
      entry_fee: {
        background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
        color: 'white'
      },
      tokens: {
        background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
        color: 'black'
      }
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
                {(activeTab === 'deposit' || activeTab === 'game') && (
                  <th className="px-4 py-3" style={styles.tableCell}>
                    <div className="d-flex align-items-center justify-content-center">
                      <Tag size={16} className="me-2" />
                      Type
                    </div>
                  </th>
                )}
                {activeTab === 'game' && (
                  <th className="px-4 py-3" style={styles.tableCell}>
                    <div className="d-flex align-items-center justify-content-center">
                      <Calculator size={16} className="me-2" />
                      Tax %
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
                    const hoverColor = activeTab === 'withdraw' 
                      ? '#ffeaea' 
                      : activeTab === 'deposit'
                      ? '#e8f5e8'
                      : '#fff3e8';
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
                  {(activeTab === 'deposit' || activeTab === 'game') && (
                    <td className="px-4 py-3" style={styles.tableCell}>
                      <span 
                        className="badge" 
                        style={styles.typeBadge[t.type] || { background: '#6c757d', color: 'white' }}
                      >
                        {t.type === 'entry_fee' ? 'Entry Fee' : 
                         t.type === 'tokens' ? 'Tokens' :
                         t.type === 'binary_tokens' ? 'Binary Tokens' :
                         t.type === 'won_tokens' ? 'Won Tokens' : t.type}
                      </span>
                    </td>
                  )}
                  {activeTab === 'game' && (
                    <td className="px-4 py-3" style={styles.tableCell}>
                      <span className="badge bg-info">
                        {t.taxPercentage}%
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

  const activeData = activeTab === "withdraw" 
    ? withdrawTaxes 
    : activeTab === "deposit" 
    ? depositTaxes 
    : gameTaxes;
  
  const totalTax = getTotalTax(activeData);
  const withdrawTotal = getTotalTax(withdrawTaxes);
  const depositTotal = getTotalTax(depositTaxes);
  const gameTotal = getTotalTax(gameTaxes);
  const gameStats = getTaxTypeStats(gameTaxes);

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
                Comprehensive tax tracking for deposits, withdrawals, and in-game transactions
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
              <button
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "game" ? 
                    {...styles.gameTab, ...styles.gameTabActive} : 
                    styles.gameTab)
                }}
                onClick={() => setActiveTab("game")}
                className="d-flex align-items-center"
              >
                <GamepadIcon size={20} className="me-2" />
                In-game Tax
              </button>
            </div>

            {/* Summary Cards - Horizontal Layout */}
            <div className="row g-3">
              <div className="col-md-4">
                <div style={{
                  ...styles.summaryCard,
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <TrendingDown size={24} className="me-2" />
                    <h5 className="mb-0">Total Withdrawal Tax</h5>
                  </div>
                  <h2 className="mb-0">₹{withdrawTotal}</h2>
                  <small className="opacity-75">{withdrawTaxes.length} transactions</small>
                </div>
              </div>
              <div className="col-md-4">
                <div style={{
                  ...styles.summaryCard,
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <TrendingUp size={24} className="me-2" />
                    <h5 className="mb-0">Total Deposit Tax</h5>
                  </div>
                  <h2 className="mb-0">₹{depositTotal}</h2>
                  <small className="opacity-75">{depositTaxes.length} transactions</small>
                </div>
              </div>
              <div className="col-md-4">
                <div style={{
                  ...styles.summaryCard,
                  background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <GamepadIcon size={24} className="me-2" />
                    <h5 className="mb-0">Total In-game Tax</h5>
                  </div>
                  <h2 className="mb-0">₹{gameTotal}</h2>
                  <small className="opacity-75">
                    {gameTaxes.length} transactions
                    {gameStats.binary_tokens.count > 0 && ` (${gameStats.binary_tokens.count} binary, ${gameStats.won_tokens.count} won)`}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Simplified */}
          <div style={styles.statsContainer}>
            <div className="row g-3 justify-content-center">
              <div className="col-md-4">
                <div style={{
                  ...styles.statCard,
                  background: activeTab === 'withdraw' 
                    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                    : activeTab === 'deposit'
                    ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                    : 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Database size={24} className="me-2" />
                    <h5 className="mb-0">Active Records</h5>
                  </div>
                  <h3 className="mb-0">{activeData.length}</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div style={{
                  ...styles.statCard,
                  background: activeTab === 'withdraw' 
                    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                    : activeTab === 'deposit'
                    ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                    : 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                }}>
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Calculator size={24} className="me-2" />
                    <h5 className="mb-0">Current Tax Total</h5>
                  </div>
                  <h3 className="mb-0">₹{totalTax}</h3>
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