import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom"
import API_BASE_URL from './ApiConfig';

const AdminProfitLoss = () => {
    const navigate = useNavigate();

    const [gameDetails, setGameDetails] = useState({
        totalPlayerBetAmount: 0,
        totalPlayerWinAmount: 0,
        netProfitLoss: 0
    });

    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [buttonHover, setButtonHover] = useState(false);

    useEffect(() => {
        // Establish Server-Sent Events connection
        const eventSource = new EventSource(`${API_BASE_URL}/getOpenCloseProfitLoss`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.success) {
                    const totalBet = data.totalPlayerBetAmount || 0;
                    const totalWon = data.totalPlayerWinAmount || 0;
                    const netProfitLoss = totalBet - totalWon;

                    setGameDetails({
                        totalPlayerBetAmount: totalBet,
                        totalPlayerWinAmount: totalWon,
                        netProfitLoss: netProfitLoss
                    });
                    setConnectionStatus('Connected');
                } else {
                    setConnectionStatus(data.message || 'Error connecting');
                }
            } catch (error) {
                console.error('Error parsing event data:', error);
                setConnectionStatus('Error parsing data');
            }
        };

        eventSource.onerror = () => {
            setConnectionStatus('Disconnected');
            eventSource.close();
        };

        // Cleanup function
        return () => {
            eventSource.close();
        };
    }, []);

    // Memoized navigation function
    const goToChart = useCallback(() => {
        navigate("/profitlosschart");
    }, [navigate]);

    // Styles
    const styles = {
        container: {
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px',
            boxSizing: 'border-box'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '25px',
            padding: '30px',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: '700px',
            textAlign: 'center'
        },
        title: {
            fontSize: '2rem',
            marginBottom: '30px',
            color: '#2c3e50',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px'
        },
        statsContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '30px'
        },
        statBox: {
            flex: 1,
            padding: '20px',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        },
        totalBet: {
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
        },
        totalWin: {
            background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)'
        },
        netProfitLossBox: {
            padding: '25px',
            borderRadius: '15px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        },
        profit: {
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        },
        loss: {
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
        },
        connectionStatus: {
            marginTop: '15px',
            fontSize: '0.9rem',
            color: '#7f8c8d'
        },
        detailsButton: {
            marginTop: '20px',
            padding: '12px 25px',
            backgroundColor: 'transparent',
            border: '2px solid #2c3e50',
            borderRadius: '50px',
            color: '#2c3e50',
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none'
        },
        detailsButtonHover: {
            backgroundColor: '#2c3e50',
            color: 'white',
            transform: 'scale(1.05)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        }
    };

    const { totalPlayerBetAmount, totalPlayerWinAmount, netProfitLoss } = gameDetails;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Game Profit & Loss</h2>
                
                <div style={styles.statsContainer}>
                    {/* Total Amount Betted */}
                    <div style={{...styles.statBox, ...styles.totalBet}}>
                        <h5>Total Amount Betted</h5>
                        <h3>₹{totalPlayerBetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    
                    {/* Total Won Amount */}
                    <div style={{...styles.statBox, ...styles.totalWin}}>
                        <h5>Total Won Amount</h5>
                        <h3>₹{totalPlayerWinAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                {/* Net Profit/Loss */}
                <div 
                    style={{
                        ...styles.netProfitLossBox,
                        ...(netProfitLoss >= 0 ? styles.profit : styles.loss)
                    }}
                >
                    <h5>Net Profit / Loss</h5>
                    <h3>
                        {netProfitLoss >= 0
                            ? `+₹${netProfitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `-₹${Math.abs(netProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h3>
                </div>

                {/* Connection Status */}
                <div style={styles.connectionStatus}>
                    Status: {connectionStatus}
                </div>

                {/* Show Details Chart Button */}
                <button 
                    style={{
                        ...styles.detailsButton,
                        ...(buttonHover ? styles.detailsButtonHover : {})
                    }}
                    onMouseEnter={() => setButtonHover(true)}
                    onMouseLeave={() => setButtonHover(false)}
                    onClick={goToChart}
                >
                    Show Detailed Chart
                </button>
            </div>
        </div>
    );
};

export default AdminProfitLoss;