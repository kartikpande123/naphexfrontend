import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function UserWins() {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [wonTokens, setWonTokens] = useState(0);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  // Validate amount format (allows 1 decimal place)
  const validateAmountFormat = (amount) => {
    const regex = /^\d+(\.\d)?$/;
    return regex.test(amount);
  };

  // Format number to 1 decimal place
  const formatToOneDecimal = (num) => {
    return parseFloat(num).toFixed(1);
  };

  // Handle amount input change with decimal validation
  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Allow only numbers and one decimal point
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      value = value.substring(0, value.lastIndexOf('.'));
    }
    
    // Limit to 1 decimal place
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > 1) {
        value = parts[0] + '.' + parts[1].substring(0, 1);
      }
    }
    
    setTransferAmount(value);
  };

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
        setWonTokens(data.userData.wontokens || 0);
        
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

  const handleTransferToGame = () => {
    setShowTransferModal(true);
    setTransferAmount('');
    setTransferMessage('');
  };

  const handleCloseModal = () => {
    setShowTransferModal(false);
    setTransferAmount('');
    setTransferMessage('');
  };

  const handleTransferWonTokens = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setTransferMessage('Please enter a valid amount');
      return;
    }

    // Validate amount format (allows 1 decimal place)
    if (!validateAmountFormat(transferAmount)) {
      setTransferMessage('Only 1 decimal place allowed (e.g., 10.5)');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount > wonTokens) {
      setTransferMessage('Insufficient won tokens');
      return;
    }

    setTransferring(true);
    setTransferMessage('');

    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (!storedUserData || !storedUserData.phoneNo) {
        throw new Error('User data not found in localStorage');
      }

      const response = await fetch(`${API_BASE_URL}/add-won-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNo: storedUserData.phoneNo,
          requestedAmount: amount
        })
      });

      const data = await response.json();

      if (data.success) {
        setTransferMessage(`Success! ${data.data.tokensAdded} tokens added to game after 28% tax deduction`);
        
        // Update local state
        setWonTokens(data.data.newWonTokens);
        
        // Update localStorage
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData) {
          storedData.wontokens = data.data.newWonTokens;
          storedData.tokens = data.data.newTokens;
          localStorage.setItem('userData', JSON.stringify(storedData));
        }
        
        setTransferAmount('');
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferMessage('');
          // Refresh user data to get updated tokens
          fetchUserData();
        }, 2000);
      } else {
        setTransferMessage(data.error || 'Failed to transfer tokens');
      }
    } catch (error) {
      console.error('Error transferring won tokens:', error);
      setTransferMessage('Error transferring tokens');
    } finally {
      setTransferring(false);
    }
  };

  const handleWithdraw = () => {
    // Implement withdraw logic
    console.log('Withdraw clicked');
    navigate("/withdraw")
  };

  // Calculate tax and tokens for preview
  const calculateTransferPreview = () => {
    if (!transferAmount || isNaN(parseFloat(transferAmount))) {
      return null;
    }
    
    const amount = parseFloat(transferAmount);
    const tax = parseFloat((amount * 0.28).toFixed(1));
    const tokensAfterTax = parseFloat((amount - tax).toFixed(1));
    
    return {
      amount,
      tax,
      tokensAfterTax
    };
  };

  const transferPreview = calculateTransferPreview();

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
      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={styles.modalIcon}>🔄</span>
                Transfer Won Tokens to Game
              </h3>
              <button 
                style={styles.modalCloseButton}
                onClick={handleCloseModal}
                disabled={transferring}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Enter Amount to Transfer</label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={handleAmountChange}
                  disabled={transferring}
                  style={styles.amountInput}
                />
                <div style={styles.inputHelp}>
                  Available Won Tokens: <strong>₹{formatToOneDecimal(wonTokens)}</strong>
                </div>
              </div>
              
              {transferPreview && (
                <div style={styles.previewCard}>
                  <div style={styles.previewRow}>
                    <div style={styles.previewColumn}>
                      <div style={styles.previewLabel}>Transfer From</div>
                      <div style={styles.previewAmount}>₹{formatToOneDecimal(transferPreview.amount)}</div>
                      <div style={styles.previewSubtext}>Won Tokens</div>
                    </div>
                    <div style={styles.previewColumn}>
                      <div style={styles.previewLabel}>Tax (28%)</div>
                      <div style={styles.previewTax}>-₹{formatToOneDecimal(transferPreview.tax)}</div>
                    </div>
                    <div style={styles.previewColumn}>
                      <div style={styles.previewLabel}>Add To Game</div>
                      <div style={styles.previewFinal}>₹{formatToOneDecimal(transferPreview.tokensAfterTax)}</div>
                      <div style={styles.previewSubtext}>Tokens</div>
                    </div>
                  </div>
                </div>
              )}

              {transferMessage && (
                <div style={{
                  ...styles.message,
                  ...(transferMessage.includes('Success') ? styles.successMessage : styles.errorMessage)
                }}>
                  {transferMessage}
                </div>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={transferring}
              >
                Cancel
              </button>
              <button 
                style={{
                  ...styles.transferModalButton,
                  ...(transferring || !transferAmount || !validateAmountFormat(transferAmount) || parseFloat(transferAmount) > wonTokens ? styles.disabledButton : {})
                }}
                onClick={handleTransferWonTokens}
                disabled={transferring || !transferAmount || !validateAmountFormat(transferAmount) || parseFloat(transferAmount) > wonTokens}
              >
                {transferring ? (
                  <>
                    <div style={styles.transferSpinner}></div>
                    Transferring...
                  </>
                ) : (
                  'Transfer Tokens'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.headerTitle}>🏆 My Wins</h2>
          {userName && <p style={styles.userName}>Welcome, {userName}</p>}
        </div>
        
        {/* Won Tokens Section */}
        <div style={styles.wonTokensSection}>
          <div style={styles.wonTokensCard}>
            <div style={styles.wonTokensHeader}>
              <span style={styles.wonTokensLabel}>Won Tokens</span>
              <div style={styles.wonTokensAmount}>₹{formatToOneDecimal(wonTokens)}</div>
            </div>
            
            <div style={styles.buttonsContainer}>
              <button 
                style={styles.transferButton}
                onClick={handleTransferToGame}
              >
                <span style={styles.buttonIcon}>🔄</span>
                <span style={styles.buttonText}>Transfer to Game</span>
              </button>
              
              <button 
                style={styles.withdrawButton}
                onClick={handleWithdraw}
              >
                <span style={styles.buttonIcon}>💸</span>
                <span style={styles.buttonText}>Withdraw</span>
              </button>
            </div>
          </div>
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
                        <span style={styles.betAmount}>₹{formatToOneDecimal(win.betAmount)}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.selectedNumber}>{win.selectedNumbers}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.winType}>{win.winType}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.amountWon}>₹{formatToOneDecimal(win.amountWon)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      
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
    padding: '30px 20px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto 20px auto',
    textAlign: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  userName: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    opacity: 0.95,
    fontWeight: '500',
  },
  wonTokensSection: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  wonTokensCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
  wonTokensHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  wonTokensLabel: {
    fontSize: '18px',
    fontWeight: '600',
    opacity: 0.9,
  },
  wonTokensAmount: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff, #e0f2fe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  transferButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2563eb',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    flex: 1,
    minWidth: '160px',
    justifyContent: 'center',
  },
  withdrawButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    flex: 1,
    minWidth: '160px',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  buttonText: {
    fontSize: '14px',
    fontWeight: '600',
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
    maxHeight: 'calc(100vh - 300px)',
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
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '500px',
    overflow: 'hidden',
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalIcon: {
    fontSize: '20px',
  },
  modalCloseButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
  },
  amountInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '8px',
  },
  inputHelp: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  previewCard: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  previewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  previewColumn: {
    flex: 1,
  },
  previewLabel: {
    fontSize: '12px',
    color: '#065f46',
    marginBottom: '4px',
  },
  previewAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#065f46',
  },
  previewTax: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#dc2626',
  },
  previewFinal: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#065f46',
  },
  previewSubtext: {
    fontSize: '10px',
    color: '#065f46',
    marginTop: '2px',
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #10b981',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
  },
  modalFooter: {
    padding: '20px',
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#374151',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  transferModalButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  transferSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
    marginRight: '8px',
  },
};

// Add hover effects for buttons
Object.assign(styles.transferButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
    backgroundColor: '#ffffff',
  }
});

Object.assign(styles.withdrawButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
    backgroundColor: '#22c55e',
  }
});