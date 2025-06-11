import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './ApiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

const FriendsEarnings = () => {
    const [earningsData, setEarningsData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [bonusHistory, setBonusHistory] = useState([]);
    const [filteredBonusHistory, setFilteredBonusHistory] = useState([]); // New state for filtered history
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullUI, setShowFullUI] = useState(false);
    const [totalPlayedAmount, setTotalPlayedAmount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(''); // New state for selected date
    const [showDatePicker, setShowDatePicker] = useState(false); // New state to toggle date picker

    // Color scheme
    const colors = {
        primary: '#1e88e5',   // Primary blue
        secondary: '#5e35b1', // Secondary purple
        accent: '#00acc1',    // Accent teal
        lightBg: '#e3f2fd',   // Light background
        text: '#263238',      // Dark text
        white: '#ffffff',     // White
        note: '#f9a825'       // Warning/note color
    };

    // Function to sort bonus history by date (newest first)
    const sortBonusHistoryByDate = (history) => {
        return history.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            
            // Parse dates - assuming format could be DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD
            const parseDate = (dateStr) => {
                // Handle different date formats
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    // Assume DD/MM/YYYY format
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                } else if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                        // Check if it's YYYY-MM-DD or DD-MM-YYYY
                        if (parts[0].length === 4) {
                            return new Date(parts[0], parts[1] - 1, parts[2]);
                        } else {
                            return new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                    }
                }
                // Fallback to standard Date parsing
                return new Date(dateStr);
            };

            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            
            // Sort in descending order (newest first)
            return dateB - dateA;
        });
    };

    // Function to filter bonus history by selected date
    const filterBonusHistoryByDate = (history, targetDate) => {
        if (!targetDate) return history;
        
        return history.filter(item => {
            if (!item.date) return false;
            
            // Parse the item date
            const parseDate = (dateStr) => {
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        // DD/MM/YYYY format
                        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                } else if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                        if (parts[0].length === 4) {
                            // YYYY-MM-DD format
                            return dateStr;
                        } else {
                            // DD-MM-YYYY format
                            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    }
                }
                return dateStr;
            };
            
            const itemDateFormatted = parseDate(item.date);
            return itemDateFormatted === targetDate;
        });
    };

    // Handle date selection
    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        setSelectedDate(selectedDate);
        
        if (selectedDate) {
            const filtered = filterBonusHistoryByDate(bonusHistory, selectedDate);
            setFilteredBonusHistory(filtered);
        } else {
            setFilteredBonusHistory(bonusHistory);
        }
    };

    // Clear date filter
    const clearDateFilter = () => {
        setSelectedDate('');
        setFilteredBonusHistory(bonusHistory);
        setShowDatePicker(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserData = JSON.parse(localStorage.getItem('userData'));
                if (!storedUserData || !storedUserData.phoneNo) {
                    throw new Error('User data not found in localStorage');
                }

                setUserData(storedUserData);

                const profileResponse = await axios.get(`${API_BASE_URL}/user-profile/${storedUserData.phoneNo}`);
                const profileData = JSON.parse(profileResponse.data.replace('data: ', ''));

                if (profileData.success) {
                    setUserData(profileData.userData);
                    
                    // Extract total played amount from the profile data
                    const totalPlayed = profileData.userData?.game1?.['total-bet-amount']?.totalAmount || 0;
                    setTotalPlayedAmount(totalPlayed);
                }

                const userId = storedUserData?.userids?.myuserid;
                if (!userId) {
                    throw new Error('User ID not found');
                }

                // Fetch latest earnings data
                const earningsResponse = await axios.get(`${API_BASE_URL}/latest`, {
                    params: { userId }
                });

                if (earningsResponse.data.success) {
                    setEarningsData(earningsResponse.data.data);
                    setShowFullUI(true); // Show full UI with data
                } else {
                    throw new Error(earningsResponse.data.message || 'Failed to fetch earnings data');
                }

                // Fetch bonus history data
                const historyResponse = await axios.get(`${API_BASE_URL}/userDailyEarnings`, {
                    params: { userId }
                });

                if (historyResponse.data.success) {
                    // Sort the bonus history by date (newest first)
                    const sortedHistory = sortBonusHistoryByDate(historyResponse.data.data);
                    setBonusHistory(sortedHistory);
                    setFilteredBonusHistory(sortedHistory); // Initialize filtered history
                } else {
                    console.warn('No bonus history found or error fetching history');
                    setBonusHistory([]);
                    setFilteredBonusHistory([]);
                }
            } catch (err) {
                console.log('Error occurred:', err.message);
                // Check if it's a 404 error or any other API error
                if (err.response?.status === 404 || err.message.includes('404') || err.message.includes('Failed to fetch')) {
                    setShowFullUI(true); // Show full UI with N/A values
                    setEarningsData(null); // Keep earnings data as null to show N/A
                    setBonusHistory([]); // Empty history
                    setFilteredBonusHistory([]); // Empty filtered history
                } else {
                    setError(err.message); // Show error for other types of errors
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const navigateToBinaryTree = () => {
        // Navigate to binary tree page
        window.location.href = '/userbinary';
    };

    // Get capital first letter from name
    const getNameInitial = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border" role="status" style={{ color: colors.primary }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    
    // Only show error if it's not a 404 and we shouldn't show full UI
    if (error && !showFullUI) return (
        <div className="alert text-center p-4 m-4 shadow-sm" style={{ 
            backgroundColor: colors.lightBg,
            color: colors.text,
            border: `1px solid ${colors.primary}`
        }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Error: {error}
        </div>
    );

    // Show full UI either with data or with N/A values
    if (showFullUI || earningsData) {
        // Split totalBonusReceivedTillDate in half for left and right business
        const totalBonus = earningsData?.totalBonusReceivedTillDate || 0;
        const halfBonus = totalBonus / 2;
        
        // Use the half value for both left and right business, or N/A if no data
        const leftBusiness = earningsData ? halfBonus : 'N/A';
        const rightBusiness = earningsData ? halfBonus : 'N/A';
        
        // Get user's initial for root node
        const userInitial = getNameInitial(userData?.name);

        return (
            <div className="container my-4">
                {/* Simplified Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="text-center">
                            <h2 className="position-relative m-0 py-3 px-4 d-inline-block" style={{
                                fontWeight: '700',
                                color: colors.white,
                                backgroundColor: colors.primary,
                                borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            }}>
                                <i className="bi bi-graph-up-arrow me-2"></i>
                                FRIENDS EARNINGS
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Note about showing only yesterday's data */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert d-flex align-items-center py-3" style={{
                            backgroundColor: colors.lightBg,
                            border: `1px solid ${colors.note}`,
                            borderRadius: '8px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            <i className="bi bi-info-circle-fill me-2" style={{ color: colors.note, fontSize: '20px' }}></i>
                            <span style={{ fontWeight: '500', color: colors.text }}>
                            Note: The earnings data displayed reflects only the most recent day's earnings and gets refreshed every day.
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Info Bar with Binary Tree Button and Tokens Display - SWAPPED COLORS */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            {/* Binary Tree Button - Now using token colors (purple gradient) */}
                            <div>
                                <button 
                                    onClick={navigateToBinaryTree} 
                                    className="btn d-flex align-items-center justify-content-center" 
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                                        color: colors.white,
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '15px 16px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <i className="bi bi-diagram-3 me-1"></i>
                                    See Binary Tree
                                </button>
                            </div>
                            
                            {/* User Info and Tokens - Now using teal accent color */}
                            <div className="px-4 py-3 rounded-pill shadow-sm d-flex align-items-center" style={{
                                backgroundColor: colors.accent,
                                color: colors.white
                            }}>
                                <i className="bi bi-person-circle me-2"></i>
                                <span className="fw-bold">{userData?.name || 'User'}</span>
                                <span className="mx-2">|</span>
                                <i className="bi bi-currency-rupee me-1"></i>
                                <span>Tokens: {userData?.tokens || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bonus Tree Structure */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow" style={{
                            borderRadius: '15px',
                            border: 'none',
                            overflow: 'hidden'
                        }}>
                            <div className="card-header text-center py-3" style={{
                                background: colors.primary,
                                color: colors.white,
                                borderBottom: `1px solid ${colors.secondary}`
                            }}>
                                <h5 className="mb-0 fw-bold">
                                    Bonus Structure
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                {/* Tree Structure */}
                                <div className="py-5 px-3">
                                    <div className="position-relative">
                                        {/* Root Node - Modified to show capital letter */}
                                        <div className="d-flex justify-content-center mb-3">
                                            <div className="text-center">
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto" style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                                    color: colors.white,
                                                    fontSize: '36px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {userInitial}
                                                </div>
                                                <div className="mt-2 fw-bold" style={{ color: colors.text, fontSize:"20px" }}>
                                                    {userData?.name || 'User'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Connecting Lines */}
                                        <div className="position-relative" style={{ height: '60px' }}>
                                            <div className="position-absolute" style={{
                                                left: '50%',
                                                top: '0',
                                                width: '2px',
                                                height: '30px',
                                                backgroundColor: colors.primary
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '25%',
                                                top: '30px',
                                                width: '50%',
                                                height: '2px',
                                                backgroundColor: colors.primary
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '25%',
                                                top: '30px',
                                                width: '2px',
                                                height: '30px',
                                                backgroundColor: colors.primary
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '75%',
                                                top: '30px',
                                                width: '2px',
                                                height: '30px',
                                                backgroundColor: colors.primary
                                            }}></div>
                                        </div>
                                        
                                        {/* Child Nodes */}
                                        <div className="d-flex justify-content-around">
                                            {/* Left Business */}
                                            <div className="text-center">
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mb-2 mx-auto" style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                                    color: colors.white,
                                                    fontSize: leftBusiness === 'N/A' ? '18px' : '24px',
                                                    fontWeight: 'bold',
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer',
                                                }}>
                                                    {leftBusiness === 'N/A' ? 'N/A' : `₹${leftBusiness}`}
                                                </div>
                                                <p className="fw-bold mb-0" style={{ 
                                                    color: colors.text,
                                                    fontSize: '16px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>Total Left Business</p>
                                            </div>
                                            
                                            {/* Right Business */}
                                            <div className="text-center">
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mb-2 mx-auto" style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                                    color: colors.white,
                                                    fontSize: rightBusiness === 'N/A' ? '18px' : '24px',
                                                    fontWeight: 'bold',
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer',
                                                }}>
                                                    {rightBusiness === 'N/A' ? 'N/A' : `₹${rightBusiness}`}
                                                </div>
                                                <p className="fw-bold mb-0" style={{ 
                                                    color: colors.text,
                                                    fontSize: '16px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>Total Right Business</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Summary Info */}
                                <div className="p-4 border-top" style={{ backgroundColor: colors.lightBg }}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                                                <span className="fw-bold me-2" style={{ color: colors.text }}>Total played amount:</span>
                                                <span className="badge px-3 py-2" style={{ 
                                                    fontSize: '16px',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    backgroundColor: colors.secondary,
                                                    color: colors.white
                                                }}>
                                                    ₹{totalPlayedAmount}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                                                <span className="fw-bold me-2" style={{ color: colors.text }}>Total Bonus After Tax:</span>
                                                <span className="badge px-3 py-2" style={{ 
                                                    fontSize: '16px',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    backgroundColor: colors.accent,
                                                    color: colors.white
                                                }}>
                                                    {earningsData ? `₹${earningsData.totalBonusReceivedTillDate || 0}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bonus History */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card shadow" style={{
                            borderRadius: '15px',
                            border: 'none',
                            overflow: 'hidden'
                        }}>
                            <div className="card-header py-3" style={{
                                background: colors.primary,
                                color: colors.white,
                                borderBottom: `1px solid ${colors.secondary}`
                            }}>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                    <h5 className="mb-2 mb-md-0 fw-bold">
                                        Bonus History (Latest First)
                                    </h5>
                                    
                                    {/* Calendar Search Controls */}
                                    <div className="d-flex align-items-center gap-2">
                                        {/* Calendar Icon Button - Mobile Friendly */}
                                        <button 
                                            className="btn btn-sm d-flex align-items-center justify-content-center"
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            style={{
                                                backgroundColor: colors.white,
                                                color: colors.primary,
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                minWidth: '44px',
                                                height: '44px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <i className="bi bi-calendar3" style={{ fontSize: '18px' }}></i>
                                            <span className="ms-2 d-none d-sm-inline">Filter by Date</span>
                                        </button>
                                        
                                        {/* Clear Filter Button - Only show when date is selected */}
                                        {selectedDate && (
                                            <button 
                                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                                onClick={clearDateFilter}
                                                style={{
                                                    backgroundColor: colors.accent,
                                                    color: colors.white,
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    minWidth: '44px',
                                                    height: '44px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <i className="bi bi-x-circle" style={{ fontSize: '18px' }}></i>
                                                <span className="ms-2 d-none d-sm-inline">Clear</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Date Picker - Collapsible */}
                                {showDatePicker && (
                                    <div className="mt-3 pt-3 border-top border-light">
                                        <div className="row">
                                            <div className="col-12 col-md-6">
                                                <div className="d-flex align-items-center">
                                                    <label className="form-label mb-0 me-3 text-nowrap" style={{ color: colors.white, fontWeight: '500' }}>
                                                        Select Date:
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={selectedDate}
                                                        onChange={handleDateChange}
                                                        style={{
                                                            borderRadius: '8px',
                                                            border: '1px solid #ddd',
                                                            padding: '8px 12px',
                                                            fontSize: '14px',
                                                            maxWidth: '200px'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {selectedDate && (
                                                <div className="col-12 col-md-6 mt-2 mt-md-0">
                                                    <div className="d-flex align-items-center justify-content-md-end">
                                                        <small style={{ color: colors.white, opacity: 0.9 }}>
                                                            Showing {filteredBonusHistory.length} record(s) for {selectedDate}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ 
                                        borderCollapse: 'separate',
                                        borderSpacing: '0 8px'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                background: colors.lightBg
                                            }}>
                                                <th style={{ 
                                                    padding: '15px 20px',
                                                    borderBottom: `2px solid ${colors.primary}`,
                                                    color: colors.text,
                                                    fontWeight: '600'
                                                }}>Date</th>
                                                <th style={{ 
                                                    padding: '15px 20px',
                                                    borderBottom: `2px solid ${colors.primary}`,
                                                    color: colors.text,
                                                    fontWeight: '600'
                                                }}>Tax Deducted</th>
                                                <th style={{ 
                                                    padding: '15px 20px',
                                                    borderBottom: `2px solid ${colors.primary}`,
                                                    color: colors.text,
                                                    fontWeight: '600'
                                                }}>Bonus after Tax</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {filteredBonusHistory && filteredBonusHistory.length > 0 ? (
                                                filteredBonusHistory.map((item, index) => (
                                                    <tr key={index} style={{
                                                        backgroundColor: index % 2 === 0 ? colors.lightBg : colors.white,
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <td style={{ 
                                                            padding: '14px 20px',
                                                            color: colors.text 
                                                        }}>{item.date || 'N/A'}</td>
                                                        <td style={{ padding: '14px 20px' }}>
                                                            <span className="rounded-pill px-3 py-2 d-inline-block" style={{
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                backgroundColor: colors.secondary,
                                                                color: colors.white,
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {item.taxDeducted ? `₹${item.taxDeducted}` : 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 20px' }}>
                                                            <span className="rounded-pill px-3 py-2 d-inline-block" style={{
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                backgroundColor: colors.accent,
                                                                color: colors.white,
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {item.bonusAfterTax ? `₹${item.bonusAfterTax}` : 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-5" style={{ color: colors.text }}>
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        {selectedDate ? `No bonus history found for ${selectedDate}` : 'No bonus history available'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty footer space */}
                <div className="mt-5"></div>
            </div>
        );
    }

    // Fallback return (shouldn't reach here normally)
    return null;
};

export default FriendsEarnings;