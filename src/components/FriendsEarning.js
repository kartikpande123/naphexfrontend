import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './ApiConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, useNavigate } from 'react-router-dom';

const FriendsEarnings = () => {
    const [earningsData, setEarningsData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [bonusHistory, setBonusHistory] = useState([]);
    const [filteredBonusHistory, setFilteredBonusHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullUI, setShowFullUI] = useState(false);
    const [totalPlayedAmount, setTotalPlayedAmount] = useState(0);
    const [dateSearch, setDateSearch] = useState('');

    const navigate = useNavigate()
    
    // New states for add tokens functionality
    const [showAddTokensModal, setShowAddTokensModal] = useState(false);
    const [requestedAmount, setRequestedAmount] = useState('');
    const [addingTokens, setAddingTokens] = useState(false);
    const [addTokensMessage, setAddTokensMessage] = useState('');
    const [showBonusStepsModal, setShowBonusStepsModal] = useState(false);

    // BONUS STEPS
    const BONUS_STEPS = [
        1000, 2500, 5000, 10000, 25000,
        50000, 100000, 250000, 500000,
        1000000, 2500000, 5000000, 10000000
    ];

    // Enhanced Color Scheme
    const colors = {
        primary: "#2563eb",
        secondary: "#7c3aed",
        accent: "#06b6d4",
        success: "#10b981",
        warning: "#f59e0b",
        lightBg: "#f8fafc",
        cardBg: "#ffffff",
        text: "#1e293b",
        textLight: "#64748b",
        border: "#e2e8f0",
        gradient: {
            primary: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            secondary: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
            success: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            accent: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)"
        }
    };

    // Function to sort bonus history by date (newest first)
    const sortBonusHistoryByDate = (history) => {
        return history.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            
            const parseDate = (dateStr) => {
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                } else if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                        if (parts[0].length === 4) {
                            return new Date(parts[0], parts[1] - 1, parts[2]);
                        } else {
                            return new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                    }
                }
                return new Date(dateStr);
            };

            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            
            return dateB - dateA;
        });
    };

    // Function to filter bonus history based on date search
    const filterBonusHistoryByDate = (history, searchTerm) => {
        if (!searchTerm.trim()) {
            return history.slice(0, 10);
        }

        let formattedSearch = searchTerm.replace(/[^\d]/g, '');
        
        if (formattedSearch.length >= 2) {
            formattedSearch = formattedSearch.substring(0, 2) + '/' + formattedSearch.substring(2);
        }
        if (formattedSearch.length >= 5) {
            formattedSearch = formattedSearch.substring(0, 5) + '/' + formattedSearch.substring(5, 9);
        }

        return history.filter(item => {
            if (!item.date) return false;
            
            let itemDateFormatted = item.date;
            
            if (item.date.includes('-')) {
                const parts = item.date.split('-');
                if (parts.length === 3) {
                    if (parts[0].length === 4) {
                        itemDateFormatted = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
                    } else {
                        itemDateFormatted = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                    }
                }
            }
            
            return itemDateFormatted.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
                   itemDateFormatted.replace(/\//g, '').startsWith(searchTerm.replace(/\//g, ''));
        });
    };

    // Handle date search input change
    const handleDateSearchChange = (e) => {
        let value = e.target.value;
        
        value = value.replace(/[^\d\/]/g, '');
        
        if (value.length === 2 && !value.includes('/')) {
            value = value + '/';
        } else if (value.length === 5 && value.split('/').length === 2) {
            value = value + '/';
        }
        
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        setDateSearch(value);
        
        const filtered = filterBonusHistoryByDate(bonusHistory, value);
        setFilteredBonusHistory(filtered);
    };

    // Clear date search
    const clearDateSearch = () => {
        setDateSearch('');
        setFilteredBonusHistory(bonusHistory.slice(0, 10));
    };

    // Validate amount format (allows 1 decimal place)
    const validateAmountFormat = (amount) => {
        const regex = /^\d+(\.\d)?$/;
        return regex.test(amount);
    };

    // Format number to 1 decimal place
    const formatToOneDecimal = (num) => {
        return parseFloat(num).toFixed(1);
    };

    // Transfer Binary Tokens to Game Tokens Function
    const handleTransferBinaryTokens = async () => {
        if (!requestedAmount || requestedAmount <= 0) {
            setAddTokensMessage('Please enter a valid amount');
            return;
        }

        if (!validateAmountFormat(requestedAmount)) {
            setAddTokensMessage('Only 1 decimal place allowed (e.g., 10.5)');
            return;
        }

        const amount = parseFloat(requestedAmount);
        const currentBinaryTokens = parseFloat(userData?.binaryTokens || 0);

        if (amount > currentBinaryTokens) {
            setAddTokensMessage('Insufficient binary tokens');
            return;
        }

        setAddingTokens(true);
        setAddTokensMessage('');

        try {
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            if (!storedUserData || !storedUserData.phoneNo) {
                throw new Error('User data not found in localStorage');
            }

            const response = await axios.post(`${API_BASE_URL}/add-binary-tokens`, {
                phoneNo: storedUserData.phoneNo,
                requestedAmount: amount
            });

            if (response.data.success) {
                setAddTokensMessage(`Success! ${response.data.data.tokensAdded} tokens added to game after 28% tax deduction`);
                
                const updatedUserData = { 
                    ...userData,
                    binaryTokens: response.data.data.newBinaryTokens,
                    tokens: response.data.data.newTokens
                };
                setUserData(updatedUserData);
                
                const storedData = JSON.parse(localStorage.getItem('userData'));
                if (storedData) {
                    storedData.binaryTokens = response.data.data.newBinaryTokens;
                    storedData.tokens = response.data.data.newTokens;
                    localStorage.setItem('userData', JSON.stringify(storedData));
                }
                
                setRequestedAmount('');
                setTimeout(() => {
                    setShowAddTokensModal(false);
                    setAddTokensMessage('');
                }, 2000);
            }
        } catch (error) {
            console.error('Error transferring binary tokens:', error);
            setAddTokensMessage(error.response?.data?.error || 'Failed to transfer tokens');
        } finally {
            setAddingTokens(false);
        }
    };

    // Handle amount input change with decimal validation
    const handleAmountChange = (e) => {
        let value = e.target.value;
        
        value = value.replace(/[^\d.]/g, '');
        
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.substring(0, value.lastIndexOf('.'));
        }
        
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1].length > 1) {
                value = parts[0] + '.' + parts[1].substring(0, 1);
            }
        }
        
        setRequestedAmount(value);
    };

    // Open Transfer Tokens Modal
    const handleAddIntoGame = () => {
        setShowAddTokensModal(true);
        setRequestedAmount('');
        setAddTokensMessage('');
    };

    // Close Modal
    const handleCloseModal = () => {
        setShowAddTokensModal(false);
        setRequestedAmount('');
        setAddTokensMessage('');
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
                    
                    const totalPlayed = profileData.userData?.game1?.['total-bet-amount']?.totalAmount || 0;
                    setTotalPlayedAmount(totalPlayed);
                }

                const userId = storedUserData?.userids?.myuserid;
                if (!userId) {
                    throw new Error('User ID not found');
                }

                const earningsResponse = await axios.get(`${API_BASE_URL}/latest`, {
                    params: { userId }
                });

                if (earningsResponse.data.success) {
                    setEarningsData(earningsResponse.data.data);
                    setShowFullUI(true);
                } else {
                    throw new Error(earningsResponse.data.message || 'Failed to fetch earnings data');
                }

                const historyResponse = await axios.get(`${API_BASE_URL}/userDailyEarnings`, {
                    params: { userId }
                });

                if (historyResponse.data.success) {
                    const sortedHistory = sortBonusHistoryByDate(historyResponse.data.data);
                    setBonusHistory(sortedHistory);
                    setFilteredBonusHistory(sortedHistory.slice(0, 10));
                } else {
                    console.warn('No bonus history found or error fetching history');
                    setBonusHistory([]);
                    setFilteredBonusHistory([]);
                }
            } catch (err) {
                console.log('Error occurred:', err.message);
                if (err.response?.status === 404 || err.message.includes('404') || err.message.includes('Failed to fetch')) {
                    setShowFullUI(true);
                    setEarningsData(null);
                    setBonusHistory([]);
                    setFilteredBonusHistory([]);
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const navigateToBinaryTree = () => {
        window.location.href = '/userbinary';
    };

    const handleWithdrawTokens = () => {
        navigate("/withdraw")
    };

    const getNameInitial = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border" role="status" style={{ color: colors.primary, width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    
    if (error && !showFullUI) return (
        <div className="alert text-center p-4 m-4 shadow-sm" style={{ 
            backgroundColor: colors.lightBg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px'
        }}>
            <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: colors.warning }}></i>Error: {error}
        </div>
    );

    if (showFullUI || earningsData) {
        const totalBonus = earningsData?.totalBonusReceivedTillDate || 0;
        const halfBonus = totalBonus / 2;
        
        const leftBusiness = earningsData ? halfBonus : 'N/A';
        const rightBusiness = earningsData ? halfBonus : 'N/A';
        
        const userInitial = getNameInitial(userData?.name);

        const calculateTransferPreview = () => {
            if (!requestedAmount || isNaN(parseFloat(requestedAmount))) {
                return null;
            }
            
            const amount = parseFloat(requestedAmount);
            const tax = parseFloat((amount * 0.28).toFixed(1));
            const tokensAfterTax = parseFloat((amount - tax).toFixed(1));
            
            return {
                amount,
                tax,
                tokensAfterTax
            };
        };

        const transferPreview = calculateTransferPreview();

        return (
            <div className="container my-4" style={{ maxWidth: '1200px' }}>
                {/* Bonus Steps Modal */}
                {showBonusStepsModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg" style={{ 
                                borderRadius: '16px',
                                border: 'none',
                                overflow: 'hidden'
                            }}>
                                <div className="modal-header border-0 text-white py-4" style={{ 
                                    background: colors.gradient.primary 
                                }}>
                                    <h5 className="modal-title fw-bold fs-5">
                                        <i className="bi bi-ladder me-2"></i>
                                        Bonus Steps
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowBonusStepsModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert border-0 mb-4" style={{ 
                                        backgroundColor: colors.lightBg,
                                        borderRadius: '12px',
                                        borderLeft: `4px solid ${colors.accent}`
                                    }}>
                                        <i className="bi bi-info-circle-fill me-2" style={{ color: colors.accent }}></i>
                                        <strong>Note:</strong> Reach these steps to get bonus from binary friends
                                    </div>
                                    
                                    <div className="row g-3">
                                        {BONUS_STEPS.map((step, index) => (
                                            <div key={index} className="col-6 col-md-4">
                                                <div className="p-3 text-center shadow-sm" style={{
                                                    backgroundColor: colors.lightBg,
                                                    borderRadius: '12px',
                                                    border: `2px solid ${colors.border}`,
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = colors.primary;
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = colors.border;
                                                }}>
                                                    <div className="badge mb-2" style={{
                                                        backgroundColor: colors.primary,
                                                        color: 'white',
                                                        fontSize: '10px'
                                                    }}>
                                                        Step {index + 1}
                                                    </div>
                                                    <div className="fw-bold fs-5" style={{ color: colors.text }}>
                                                        ₹{step.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-lg px-4 py-2 fw-semibold text-white border-0" 
                                        onClick={() => setShowBonusStepsModal(false)}
                                        style={{
                                            borderRadius: '12px',
                                            background: colors.gradient.primary
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transfer Tokens Modal */}
                {showAddTokensModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg" style={{ 
                                borderRadius: '16px',
                                border: 'none',
                                overflow: 'hidden'
                            }}>
                                <div className="modal-header border-0 text-white py-4" style={{ 
                                    background: colors.gradient.primary 
                                }}>
                                    <h5 className="modal-title fw-bold fs-5">
                                        <i className="bi bi-arrow-left-right me-2"></i>
                                        Transfer to Game Tokens
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold mb-3" style={{ color: colors.text }}>
                                            Enter Amount to Transfer
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg border-2 py-3"
                                            placeholder="0.0"
                                            value={requestedAmount}
                                            onChange={handleAmountChange}
                                            disabled={addingTokens}
                                            style={{
                                                borderRadius: '12px',
                                                borderColor: colors.border,
                                                fontSize: '18px',
                                                fontWeight: '500'
                                            }}
                                        />
                                        <div className="form-text mt-2 fw-medium" style={{ color: colors.textLight }}>
                                            Available Binary Tokens: <strong style={{ color: colors.primary }}>₹{formatToOneDecimal(userData?.binaryTokens || 0)}</strong>
                                        </div>
                                        <div className="form-text fw-medium" style={{ color: colors.warning }}>
                                            <i className="bi bi-info-circle me-1"></i>
                                            Note: 28% tax will be deducted. Only 1 decimal place allowed (e.g., 10.5)
                                        </div>
                                    </div>
                                    
                                    {transferPreview && (
                                        <div className="alert border-0 mb-4" style={{ 
                                            backgroundColor: colors.lightBg,
                                            borderRadius: '12px',
                                            borderLeft: `4px solid ${colors.accent}`
                                        }}>
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <small className="fw-semibold" style={{ color: colors.textLight }}>Transfer From</small>
                                                    <div className="fw-bold fs-5 mt-1" style={{ color: colors.primary }}>₹{formatToOneDecimal(transferPreview.amount)}</div>
                                                    <small style={{ color: colors.textLight }}>Binary Tokens</small>
                                                </div>
                                                <div className="col-4">
                                                    <small className="fw-semibold" style={{ color: colors.textLight }}>Tax (28%)</small>
                                                    <div className="fw-bold fs-5 mt-1" style={{ color: colors.warning }}>-₹{formatToOneDecimal(transferPreview.tax)}</div>
                                                </div>
                                                <div className="col-4">
                                                    <small className="fw-semibold" style={{ color: colors.textLight }}>Add To Game</small>
                                                    <div className="fw-bold fs-5 mt-1" style={{ color: colors.success }}>₹{formatToOneDecimal(transferPreview.tokensAfterTax)}</div>
                                                    <small style={{ color: colors.textLight }}>Tokens</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {addTokensMessage && (
                                        <div className={`alert border-0 ${addTokensMessage.includes('Success') ? 'alert-success' : 'alert-danger'}`} style={{ borderRadius: '12px' }}>
                                            <i className={`bi ${addTokensMessage.includes('Success') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                                            {addTokensMessage}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-lg px-4 py-2 border-0 fw-semibold" 
                                        onClick={handleCloseModal}
                                        disabled={addingTokens}
                                        style={{
                                            borderRadius: '12px',
                                            backgroundColor: colors.lightBg,
                                            color: colors.text
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-lg px-4 py-2 fw-semibold text-white border-0" 
                                        onClick={handleTransferBinaryTokens}
                                        disabled={addingTokens || !requestedAmount || !validateAmountFormat(requestedAmount) || parseFloat(requestedAmount) > (userData?.binaryTokens || 0)}
                                        style={{
                                            borderRadius: '12px',
                                            background: colors.gradient.primary,
                                            opacity: (addingTokens || !requestedAmount || !validateAmountFormat(requestedAmount) || parseFloat(requestedAmount) > (userData?.binaryTokens || 0)) ? 0.6 : 1
                                        }}
                                    >
                                        {addingTokens ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Transferring...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-arrow-left-right me-2"></i>
                                                Transfer Tokens
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header with Bonus Steps Button */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="text-center position-relative">
                            <div className="position-relative py-4 px-5 d-inline-block" style={{
                                background: colors.gradient.primary,
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)',
                            }}>
                                <h2 className="m-0 text-white fw-bold fs-3">
                                    <i className="bi bi-graph-up-arrow me-3"></i>
                                    FRIENDS EARNINGS
                                </h2>
                                <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ borderRadius: '20px', zIndex: -1 }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-50%',
                                        left: '-50%',
                                        width: '200%',
                                        height: '200%',
                                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px',
                                        animation: 'float 3s ease-in-out infinite'
                                    }}></div>
                                </div>
                            </div>
                            
                            {/* Bonus Steps Button */}
                            <div className="mt-3">
                                <button 
                                    onClick={() => setShowBonusStepsModal(true)} 
                                    className="btn d-flex align-items-center justify-content-center px-4 py-3 border-0 shadow-sm mx-auto" 
                                    style={{
                                        background: colors.gradient.accent,
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        transition: 'all 0.3s ease',
                                        minWidth: '180px'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    <i className="bi bi-ladder me-2 fs-5"></i>
                                    Bonus Steps
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note about showing only yesterday's data */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert border-0 d-flex align-items-center py-3 px-4" style={{
                            background: `linear-gradient(135deg, ${colors.lightBg} 0%, #f1f5f9 100%)`,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <i className="bi bi-info-circle-fill me-3 flex-shrink-0" style={{ color: colors.accent, fontSize: '24px' }}></i>
                            <span className="fw-semibold" style={{ color: colors.text, lineHeight: '1.5' }}>
                                Note: The earnings data displayed reflects only the most recent day's earnings and gets refreshed every day.
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Info Bar with Binary Tree Button and Tokens Display */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4 p-4" style={{
                            backgroundColor: colors.cardBg,
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: `1px solid ${colors.border}`
                        }}>
                            {/* Binary Tree Button */}
                            <button 
                                onClick={navigateToBinaryTree} 
                                className="btn d-flex align-items-center justify-content-center px-4 py-3 border-0 shadow-sm" 
                                style={{
                                    background: colors.gradient.secondary,
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease',
                                    minWidth: '180px'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                <i className="bi bi-diagram-3 me-2 fs-5"></i>
                                See Binary Tree
                            </button>
                            
                            {/* User Info and Tokens */}
                            <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                                <div className="px-4 py-3 d-flex flex-column flex-md-row align-items-center gap-3 shadow-sm" style={{
                                    backgroundColor: colors.lightBg,
                                    color: colors.text,
                                    borderRadius: '12px',
                                    border: `1px solid ${colors.border}`
                                }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                                            width: '40px',
                                            height: '40px',
                                            background: colors.gradient.primary,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '18px'
                                        }}>
                                            {userInitial}
                                        </div>
                                        <span className="fw-bold fs-6">{userData?.name || 'User'}</span>
                                    </div>
                                    
                                    <div className="d-flex flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-wallet2" style={{ color: colors.secondary }}></i>
                                            <span className="fw-semibold">Binary:</span>
                                            <span className="badge px-3 py-2 fw-bold" style={{ 
                                                backgroundColor: colors.secondary,
                                                color: 'white',
                                                borderRadius: '8px'
                                            }}>
                                                ₹{formatToOneDecimal(userData?.binaryTokens || 0)}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-currency-rupee" style={{ color: colors.success }}></i>
                                            <span className="fw-semibold">Game:</span>
                                            <span className="badge px-3 py-2 fw-bold" style={{ 
                                                backgroundColor: colors.success,
                                                color: 'white',
                                                borderRadius: '8px'
                                            }}>
                                                ₹{formatToOneDecimal(userData?.tokens || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <button 
                                        onClick={handleAddIntoGame} 
                                        className="btn d-flex align-items-center px-4 py-3 border-0 shadow-sm" 
                                        style={{
                                            backgroundColor: colors.success,
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            minWidth: '160px'
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                    >
                                        <i className="bi bi-arrow-left-right me-2"></i>
                                        Transfer to Game
                                    </button>
                                    <button 
                                        onClick={handleWithdrawTokens} 
                                        className="btn d-flex align-items-center px-4 py-3 border-0 shadow-sm" 
                                        style={{
                                            backgroundColor: colors.accent,
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            minWidth: '140px'
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bonus Tree Structure */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-lg" style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: colors.cardBg
                        }}>
                            <div className="card-header text-center py-4 border-0" style={{
                                background: colors.gradient.primary,
                            }}>
                                <h5 className="mb-0 fw-bold text-white fs-5">
                                    <i className="bi bi-tree-fill me-2"></i>
                                    Bonus Structure
                                </h5>
                            </div>
                            <div className="card-body p-4 p-md-5">
                                <div className="py-4">
                                    <div className="position-relative">
                                        <div className="d-flex justify-content-center mb-4">
                                            <div className="text-center">
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto shadow-lg position-relative" style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    background: colors.gradient.primary,
                                                    color: 'white',
                                                    fontSize: '42px',
                                                    fontWeight: 'bold',
                                                    border: '4px solid white',
                                                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
                                                }}>
                                                    {userInitial}
                                                    <div className="position-absolute top-0 start-100 translate-middle badge rounded-pill px-3 py-2" style={{
                                                        backgroundColor: colors.accent,
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        YOU
                                                    </div>
                                                </div>
                                                <div className="mt-3 fw-bold fs-6" style={{ color: colors.text }}>
                                                    {userData?.name || 'User'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="position-relative" style={{ height: '80px' }}>
                                            <div className="position-absolute" style={{
                                                left: '50%',
                                                top: '0',
                                                width: '3px',
                                                height: '40px',
                                                background: colors.gradient.primary,
                                                transform: 'translateX(-50%)'
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '25%',
                                                top: '40px',
                                                width: '50%',
                                                height: '3px',
                                                background: colors.gradient.primary
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '25%',
                                                top: '40px',
                                                width: '3px',
                                                height: '40px',
                                                background: colors.gradient.primary
                                            }}></div>
                                            <div className="position-absolute" style={{
                                                left: '75%',
                                                top: '40px',
                                                width: '3px',
                                                height: '40px',
                                                background: colors.gradient.primary
                                            }}></div>
                                        </div>
                                        
                                        <div className="d-flex justify-content-around flex-wrap gap-4">
                                            <div className="text-center flex-fill" style={{ minWidth: '250px' }}>
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mb-3 mx-auto shadow position-relative" style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    background: colors.gradient.secondary,
                                                    color: 'white',
                                                    fontSize: leftBusiness === 'N/A' ? '20px' : '26px',
                                                    fontWeight: 'bold',
                                                    border: '4px solid white',
                                                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                                                    {leftBusiness === 'N/A' ? 'N/A' : `₹${formatToOneDecimal(leftBusiness)}`}
                                                </div>
                                                <p className="fw-bold mb-2 fs-6 text-uppercase" style={{ 
                                                    color: colors.text,
                                                    letterSpacing: '1px'
                                                }}>Total Left Business</p>
                                                <div className="badge px-3 py-2" style={{
                                                    backgroundColor: colors.lightBg,
                                                    color: colors.secondary,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}>
                                                    <i className="bi bi-people-fill me-1"></i>
                                                    Left Network
                                                </div>
                                            </div>
                                            
                                            <div className="text-center flex-fill" style={{ minWidth: '250px' }}>
                                                <div className="rounded-circle d-flex justify-content-center align-items-center mb-3 mx-auto shadow position-relative" style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    background: colors.gradient.accent,
                                                    color: 'white',
                                                    fontSize: rightBusiness === 'N/A' ? '20px' : '26px',
                                                    fontWeight: 'bold',
                                                    border: '4px solid white',
                                                    boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)',
                                                    transition: 'transform 0.3s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                                                    {rightBusiness === 'N/A' ? 'N/A' : `₹${formatToOneDecimal(rightBusiness)}`}
                                                </div>
                                                <p className="fw-bold mb-2 fs-6 text-uppercase" style={{ 
                                                    color: colors.text,
                                                    letterSpacing: '1px'
                                                }}>Total Right Business</p>
                                                <div className="badge px-3 py-2" style={{
                                                    backgroundColor: colors.lightBg,
                                                    color: colors.accent,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}>
                                                    <i className="bi bi-people-fill me-1"></i>
                                                    Right Network
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row mt-5 pt-4 border-top" style={{ borderColor: colors.border }}>
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-md-start gap-3 p-3" style={{
                                            backgroundColor: colors.lightBg,
                                            borderRadius: '12px',
                                            border: `1px solid ${colors.border}`
                                        }}>
                                            <span className="fw-semibold text-nowrap" style={{ color: colors.text }}>Total played amount:</span>
                                            <span className="badge px-4 py-3 fw-bold shadow-sm" style={{ 
                                                fontSize: '16px',
                                                borderRadius: '10px',
                                                background: colors.gradient.secondary,
                                                color: 'white'
                                            }}>
                                                ₹{formatToOneDecimal(totalPlayedAmount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-md-start gap-3 p-3" style={{
                                            backgroundColor: colors.lightBg,
                                            borderRadius: '12px',
                                            border: `1px solid ${colors.border}`
                                        }}>
                                            <span className="fw-semibold text-nowrap" style={{ color: colors.text }}>Total Bonus Received:</span>
                                            <span className="badge px-4 py-3 fw-bold shadow-sm" style={{ 
                                                fontSize: '16px',
                                                borderRadius: '10px',
                                                background: colors.gradient.accent,
                                                color: 'white'
                                            }}>
                                                {earningsData ? `₹${formatToOneDecimal(earningsData.totalBonusReceivedTillDate || 0)}` : 'N/A'}
                                            </span>
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
                        <div className="card border-0 shadow-lg" style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: colors.cardBg
                        }}>
                            <div className="card-header py-4 border-0" style={{
                                background: colors.gradient.primary,
                            }}>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                    <h5 className="mb-0 fw-bold text-white fs-5">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Bonus History
                                    </h5>
                                    <div className="d-flex align-items-center">
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control border-0 shadow-sm"
                                                placeholder="Search by date (DD/MM/YYYY)"
                                                value={dateSearch}
                                                onChange={handleDateSearchChange}
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                                    borderRadius: '12px',
                                                    paddingLeft: '45px',
                                                    paddingRight: dateSearch ? '45px' : '20px',
                                                    width: '280px',
                                                    fontSize: '14px',
                                                    height: '45px',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            />
                                            <i className="bi bi-calendar3 position-absolute" style={{
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: colors.primary
                                            }}></i>
                                            {dateSearch && (
                                                <button
                                                    type="button"
                                                    className="btn-close position-absolute bg-light rounded-circle p-1"
                                                    onClick={clearDateSearch}
                                                    style={{
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        fontSize: '10px',
                                                        opacity: 0.7
                                                    }}
                                                ></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                                    padding: '18px 24px',
                                                    borderBottom: `2px solid ${colors.primary}`,
                                                    color: colors.text,
                                                    fontWeight: '600',
                                                    fontSize: '15px'
                                                }}>
                                                    <i className="bi bi-calendar3 me-2"></i>
                                                    Date
                                                </th>
                                                <th style={{ 
                                                    padding: '18px 24px',
                                                    borderBottom: `2px solid ${colors.primary}`,
                                                    color: colors.text,
                                                    fontWeight: '600',
                                                    fontSize: '15px'
                                                }}>
                                                    <i className="bi bi-cash-coin me-2"></i>
                                                    Bonus Received
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBonusHistory && filteredBonusHistory.length > 0 ? (
                                                filteredBonusHistory.map((item, index) => (
                                                    <tr key={index} style={{
                                                        backgroundColor: colors.cardBg,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '12px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                                    }}>
                                                        <td style={{ 
                                                            padding: '16px 24px',
                                                            color: colors.text,
                                                            fontWeight: '500',
                                                            borderTopLeftRadius: '12px',
                                                            borderBottomLeftRadius: '12px'
                                                        }}>
                                                            <i className="bi bi-calendar-check me-2" style={{ color: colors.primary }}></i>
                                                            {item.date || 'N/A'}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '16px 24px',
                                                            borderTopRightRadius: '12px',
                                                            borderBottomRightRadius: '12px'
                                                        }}>
                                                            <span className="rounded-pill px-4 py-2 d-inline-block shadow-sm" style={{
                                                                backgroundColor: colors.success + '15',
                                                                color: colors.success,
                                                                fontSize: '15px',
                                                                fontWeight: 'bold',
                                                                border: `1px solid ${colors.success}30`
                                                            }}>
                                                                <i className="bi bi-currency-rupee me-1"></i>
                                                                {item.bonusReceived ? `${formatToOneDecimal(item.bonusReceived)}` : 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center py-5" style={{ color: colors.textLight }}>
                                                        <div className="py-4">
                                                            <i className="bi bi-inbox display-4 d-block mb-3" style={{ color: colors.border }}></i>
                                                            {dateSearch ? 
                                                                `No bonus history found for "${dateSearch}"` : 
                                                                'No bonus history available'
                                                            }
                                                        </div>
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

                <div className="mt-5"></div>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-5px); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

export default FriendsEarnings;