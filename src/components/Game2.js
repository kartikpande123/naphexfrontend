import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';
import API_BASE_URL from './ApiConfig';

const Game2 = () => {
    const [tokenCount, setTokenCount] = useState(0);
    const [betAmount, setBetAmount] = useState('');

    useEffect(() => {
        let eventSource = null;

        const connectToTokenUpdates = () => {
            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData || !userData.phoneNo) return;

                // Create EventSource connection
                eventSource = new EventSource(
                    `${API_BASE_URL}/user-profile/${userData.phoneNo}`
                );

                // Handle incoming messages
                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.success) {
                            setTokenCount(data.tokens);

                            // Update localStorage with new data
                            const currentUserData = JSON.parse(localStorage.getItem("userData"));
                            localStorage.setItem("userData", JSON.stringify({
                                ...currentUserData,
                                tokens: data.tokens,
                            }));
                        }
                    } catch (e) {
                        // Silently handle JSON parsing errors
                    }
                };

                // Handle connection errors
                eventSource.onerror = () => {
                    eventSource.close();
                    // Attempt to reconnect after 5 seconds
                    setTimeout(connectToTokenUpdates, 5000);
                };
            } catch (error) {
                // Fallback to stored tokens
                const storedUserData = JSON.parse(localStorage.getItem("userData"));
                if (storedUserData && storedUserData.tokens) {
                    setTokenCount(storedUserData.tokens);
                }
            }
        };

        // Initial connection
        connectToTokenUpdates();

        // Cleanup on component unmount
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    const handleBet = async () => {
        try {
            const betAmountNum = Number(betAmount);

            // Basic validation
            if (!betAmount) {
                alert('Please enter a bet amount');
                return;
            }

            if (betAmountNum > tokenCount) {
                alert('Insufficient balance!!!!!!!!!');
                return;
            }

            const userData = JSON.parse(localStorage.getItem('userData'));
            const userPhoneNo = userData.phoneNo;

            // Deduct tokens
            const deductResponse = await fetch(`${API_BASE_URL}/deduct-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNo: userPhoneNo,
                    amount: betAmountNum
                })
            });

            const deductResult = await deductResponse.json();

            if (deductResult.success) {
                // Store game action after successful token deduction
                const gameActionResponse = await fetch(`${API_BASE_URL}/store-game2-action`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNo: userPhoneNo,
                        betAmount: betAmountNum
                    })
                });

                const gameActionResult = await gameActionResponse.json();

                if (gameActionResult.success) {
                    setTokenCount(deductResult.currentBalance);
                    alert(`Bet placed successfully! Bet ID: ${gameActionResult.betId}`);
                    setBetAmount('');
                } else {
                    // Optionally, refund tokens if game action storage fails
                    alert(gameActionResult.message || 'Failed to store game action');
                }
            } else {
                alert(deductResult.message || 'Failed to place bet');
            }

        } catch (error) {
            console.error('Bet placement error:', error);
            alert('An error occurred while placing the bet');
        }
    };

    return (
        <div className="game-container">
            <div className="token-display">
                <FaCoins /> 
                <span>{tokenCount.toFixed(2)} Tokens</span>
            </div>

            <div className="bet-section">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter Bet Amount"
                    value={betAmount}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setBetAmount(value);
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBet}
                >
                    Place Bet
                </motion.button>
            </div>
        </div>
    );
};

export default Game2;