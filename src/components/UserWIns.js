import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

export default function UserWins() {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get phone number from memory (simulating localStorage)
      const userDataRaw = localStorage.getItem("userData");
      const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      const phoneNo = userData?.phoneNo;
      
      // In production, replace with your actual API endpoint
      const response = await fetch(`${API_BASE_URL}/user-profile/json/${phoneNo}`);
      const data = await response.json();
      
      if (data.success && data.userData) {
        setUserName(data.userData.name || data.userData.phoneNo);
        
        if (data.userData.game1 && data.userData.game1.wins) {
          const winsObj = data.userData.game1.wins;
          const winsArray = Object.entries(winsObj).map(([id, win]) => ({
            id,
            ...win
          }));
          
          winsArray.sort((a, b) => b.timestamp - a.timestamp);
          setWins(winsArray);
        }
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>My Wins</h2>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading wins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>My Wins</h2>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.headerTitle}>🏆 My Wins</h2>
        </div>
      </div>
      
      <div style={styles.content}>
        {wins.length === 0 ? (
          <div style={styles.noWins}>
            <div style={styles.noWinsIcon}>📭</div>
            <p style={styles.noWinsText}>No wins yet. Keep playing!</p>
            <p style={styles.noWinsSubtext}>Your winning history will appear here</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Session</th>
                    <th style={styles.th}>Bet Amount</th>
                    <th style={styles.th}>Selected</th>
                    <th style={styles.th}>Win Type</th>
                    <th style={styles.th}>Amount Won</th>
                  </tr>
                </thead>
                <tbody>
                  {wins.map((win, index) => (
                    <tr key={win.id} style={styles.tableRow} className="table-row">
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <div style={styles.dateMain}>{formatDate(win.date)}</div>
                          <div style={styles.dateTime}>{formatTime(win.timestamp)}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.sessionBadge}>
                          {win.session?.replace('session', 'S')}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.betAmount}>₹{win.betAmount}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.selectedNumber}>{win.selectedNumbers}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.winType}>{win.winType}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.amountWon}>₹{win.amountWon}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .table-row:hover {
          background-color: #f0f7ff !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
        }
        
        @media (max-width: 968px) {
          table {
            font-size: 13px;
          }
        }
        
        @media (max-width: 768px) {
          table {
            display: table;
            width: 100%;
          }
          
          thead {
            display: table-header-group;
            position: sticky;
            top: 0;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            z-index: 10;
          }
          
          th, td {
            padding: 12px 10px !important;
            font-size: 12px !important;
            min-width: 100px;
          }
          
          th:first-child, td:first-child {
            min-width: 120px;
            position: sticky;
            left: 0;
            background: inherit;
            z-index: 5;
          }
          
          thead th:first-child {
            z-index: 15;
          }
          
          tbody td:first-child {
            background: #ffffff;
          }
          
          .table-row:hover td:first-child {
            background-color: #f0f7ff !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    padding: '40px 20px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  userName: {
    margin: '12px 0 0 0',
    fontSize: '18px',
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '500',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  tableContainer: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
  },
  th: {
    padding: '18px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  },
  tableRow: {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    verticalAlign: 'middle',
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateMain: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '14px',
  },
  dateTime: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  sessionBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    color: '#1e40af',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #93c5fd',
  },
  betAmount: {
    color: '#374151',
    fontWeight: '600',
    fontSize: '15px',
  },
  selectedNumber: {
    display: 'inline-block',
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#92400e',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    border: '1px solid #fcd34d',
  },
  winType: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  amountWon: {
    color: '#059669',
    fontWeight: '800',
    fontSize: '16px',
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#d1fae5',
    borderRadius: '6px',
    border: '1px solid #6ee7b7',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 20px',
  },
  spinner: {
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '24px',
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
  },
  errorContainer: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    padding: '16px 24px',
    borderRadius: '12px',
    display: 'inline-block',
    border: '1px solid #fca5a5',
  },
  noWins: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  noWinsIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  noWinsText: {
    fontSize: '20px',
    color: '#374151',
    fontWeight: '600',
    marginBottom: '8px',
  },
  noWinsSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500',
  },
};