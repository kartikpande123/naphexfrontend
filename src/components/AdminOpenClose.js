import { Import } from 'lucide-react';
import React from 'react';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';



function AdminOpenClose() {
    useEffect(() => {
        // Add styles to head
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            html, body {
                background-color: #e6f2ff !important;
                margin: 0;
                padding: 0;
                min-height: 100vh;
            }
            #root {
                background-color: #e6f2ff !important;
            }
        `;
        document.head.appendChild(styleTag);
    
        // Cleanup function
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);
    const navigate = useNavigate();

    function goResults() {
        navigate("/opencloseresult")
    }

    function goPlayers() {navigate("/adminwhoplayopenclose")}
    function goWinners() { navigate("/adminwinners")}
    function goAmtBet() {navigate("/adminuseramtplayed") }
    function goProfitLoss() {navigate("/adminprofit") }
    const styles = {
        container: {
            textAlign: 'center',
            backgroundColor: '#f0f8ff',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            margin: 'auto',
            marginTop: '50px'
        },
        heading: {
            color: '#1a73e8',
            fontSize: '32px',
            marginBottom: '30px',
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        buttonsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '10px'
        },
        button: {
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            padding: '18px 32px',
            fontSize: '20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
        },
        buttonHover: {
            backgroundColor: '#1557b0',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
        }
    };

    const handleMouseEnter = (e) => {
        e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
        e.target.style.transform = styles.buttonHover.transform;
        e.target.style.boxShadow = styles.buttonHover.boxShadow;
    };

    const handleMouseLeave = (e) => {
        e.target.style.backgroundColor = styles.button.backgroundColor;
        e.target.style.transform = styles.button.transform;
        e.target.style.boxShadow = styles.button.boxShadow;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Open-Close Game Details</h1>
            <div style={styles.buttonsContainer}>
                <button
                    style={styles.button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={goResults}
                >
                    Results
                </button>
                <button
                    style={styles.button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={goPlayers}
                >
                    Players
                </button>
                <button
                    style={styles.button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={goWinners}
                >
                    Winners
                </button>
                <button
                    style={styles.button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={goAmtBet}
                >
                    Amount Bet
                </button>
                <button
                    style={styles.button}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={goProfitLoss}
                >
                    Profit/Loss
                </button>
            </div>
        </div>
    );
}

export default AdminOpenClose;
