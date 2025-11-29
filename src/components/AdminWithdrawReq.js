import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "./ApiConfig";

export default function AdminWithdrawReq() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success && Array.isArray(data.data)) {
          const users = data.data;

          let allWithdrawals = [];
          users.forEach((user) => {
            // Process binary token withdrawals
            if (user.withdrawals) {
              Object.entries(user.withdrawals).forEach(([wid, wd]) => {
                if (wd.status === "pending") {
                  allWithdrawals.push({
                    userId: user.userId,
                    name: user.name,
                    phoneNo: user.phoneNo,
                    ...wd,
                    withdrawalId: wid,
                    withdrawalType: "binary", // Mark as binary withdrawal
                  });
                }
              });
            }

            // Process won token withdrawals
            if (user.wonWithdrawals) {
              Object.entries(user.wonWithdrawals).forEach(([wid, wd]) => {
                if (wd.status === "pending") {
                  allWithdrawals.push({
                    userId: user.userId,
                    name: user.name,
                    phoneNo: user.phoneNo,
                    ...wd,
                    withdrawalId: wid,
                    withdrawalType: "won", // Mark as won withdrawal
                  });
                }
              });
            }
          });

          allWithdrawals.sort((a, b) => a.createdAt - b.createdAt);
          setWithdrawals(allWithdrawals);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
        setLoading(false);
        toast.error("Failed to parse withdrawal data");
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setLoading(false);
      toast.error("Lost connection to withdrawal updates");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleCopy = (text, type = "text") => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} copied to clipboard!`);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const handleAction = (userId, withdrawalId, action, userName, withdrawalType) => {
    // Determine the correct API endpoint based on withdrawal type
    const endpoint = withdrawalType === "won" 
      ? `${API_BASE_URL}/won-withdrawals/${userId}/${withdrawalId}`
      : `${API_BASE_URL}/withdrawals/${userId}/${withdrawalId}`;

    fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(`${userName}'s withdrawal ${action} successfully!`);
        } else {
          toast.error(`Failed to ${action} withdrawal for ${userName}`);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Error ${action}ing withdrawal for ${userName}`);
      });
  };

  const getTokenTypeBadge = (withdrawal) => {
    if (withdrawal.withdrawalType === "won") {
      return (
        <div className="token-type-badge won-token">
          🏆 Won Tokens
        </div>
      );
    } else {
      return (
        <div className="token-type-badge binary-token">
          ⚡ Binary Tokens
        </div>
      );
    }
  };

  return (
    <>
      <style>{`
        .withdrawal-container {
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .withdrawal-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 2rem 0;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
          text-align: center;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .header-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: white;
        }
        
        .header-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          font-weight: 400;
          color: white;
        }
        
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.08);
          min-height: 400px;
        }
        
        .withdrawal-card {
          background: white;
          border: 4px solid #e5e7eb;
          border-radius: 16px;
          margin-bottom: 2.5rem;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 6px 30px rgba(0,0,0,0.1);
        }
        
        .withdrawal-card:hover {
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          transform: translateY(-3px);
          border-color: #2563eb;
        }
        
        .card-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid #e5e7eb;
          padding: 1.5rem;
        }
        
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .user-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .user-phone {
          color: #6b7280;
          font-weight: 500;
        }
        
        .timestamp {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .amount-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .amount-item {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .amount-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .amount-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .token-type-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          display: inline-block;
          margin-top: 0.5rem;
          color: white;
        }
        
        .token-type-badge.binary-token {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }
        
        .token-type-badge.won-token {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .final-amount {
          color: #059669;
        }
        
        .payment-details {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.5rem;
          margin: 1rem 1.5rem;
        }
        
        .payment-header {
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .payment-row:last-child {
          border-bottom: none;
        }
        
        .payment-label {
          font-weight: 500;
          color: #374151;
        }
        
        .payment-value {
          color: #6b7280;
          font-family: monospace;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
        }
        
        .copy-btn {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        
        .action-buttons {
          padding: 1.5rem;
          background: #fafbfc;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .approve-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .approve-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        .reject-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .reject-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }
        
        .no-withdrawals {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }
        
        .no-withdrawals-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .no-withdrawals-text {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .no-withdrawals-subtext {
          font-size: 1rem;
          opacity: 0.8;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .stats-badge {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          margin-left: 1rem;
          display: inline-block;
        }
      `}</style>

      <div className="withdrawal-container">
        <div className="withdrawal-header">
          <div className="header-content">
            <h1 className="header-title">Withdrawal Management</h1>
            <p className="header-subtitle">
              Manage pending withdrawal requests
              {withdrawals.length > 0 && (
                <span className="stats-badge">
                  {withdrawals.length} Pending
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="content-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="no-withdrawals">
              <div className="no-withdrawals-icon">💳</div>
              <h3 className="no-withdrawals-text">No Pending Withdrawals</h3>
              <p className="no-withdrawals-subtext">
                All withdrawal requests have been processed
              </p>
            </div>
          ) : (
            <div style={{ padding: '2rem' }}>
              {withdrawals.map((wd) => (
                <div key={`${wd.withdrawalType}-${wd.withdrawalId}`} className="withdrawal-card">
                  <div className="card-header">
                    <div className="user-info">
                      <div>
                        <h3 className="user-name">{wd.name}</h3>
                        <p className="user-phone">📞 {wd.phoneNo}</p>
                      </div>
                      <div className="timestamp">
                        {new Date(wd.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="amount-info">
                      <div className="amount-item">
                        <div className="amount-label">Requested Amount</div>
                        <div className="amount-value">{wd.requestedTokens} tokens</div>
                        {getTokenTypeBadge(wd)}
                      </div>
                      <div className="amount-item">
                        <div className="amount-label">Tax Deduction</div>
                        <div className="amount-value">{wd.tax}</div>
                      </div>
                      <div className="amount-item">
                        <div className="amount-label">Final Payout</div>
                        <div className="amount-value final-amount">{wd.finalTokens}</div>
                      </div>
                    </div>
                  </div>

                  {wd.method?.bankAccountNo && (
                    <div className="payment-details">
                      <div className="payment-header">
                        🏦 Bank Transfer Details
                      </div>
                      <div className="payment-row">
                        <span className="payment-label">Account Number:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className="payment-value">{wd.method.bankAccountNo}</span>
                          <button
                            className="copy-btn"
                            onClick={() => handleCopy(wd.method.bankAccountNo, "Account number")}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="payment-row">
                        <span className="payment-label">IFSC Code:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className="payment-value">{wd.method.ifsc}</span>
                          <button
                            className="copy-btn"
                            onClick={() => handleCopy(wd.method.ifsc, "IFSC code")}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {wd.method?.upiId && (
                    <div className="payment-details">
                      <div className="payment-header">
                        📱 UPI Payment Details
                      </div>
                      <div className="payment-row">
                        <span className="payment-label">UPI ID:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className="payment-value">{wd.method.upiId}</span>
                          <button
                            className="copy-btn"
                            onClick={() => handleCopy(wd.method.upiId, "UPI ID")}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={() => handleAction(wd.userId, wd.withdrawalId, "approved", wd.name, wd.withdrawalType)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleAction(wd.userId, wd.withdrawalId, "rejected", wd.name, wd.withdrawalType)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}