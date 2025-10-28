import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Trophy, DollarSign, TrendingUp, Settings, StopCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import logo from "../images/logo-1.png";
import { useNavigate } from 'react-router-dom';

function AdminOpenClose() {
    const [showAdminKeyPopup, setShowAdminKeyPopup] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [adminKeyError, setAdminKeyError] = useState("");
    const [pendingAction, setPendingAction] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Add styles to head
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            html, body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            #root {
                background: transparent !important;
            }
            
            /* Header animations */
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .header-animation {
                animation: slideDown 0.6s ease-out;
            }
            
            .content-animation {
                animation: fadeIn 0.8s ease-out 0.3s both;
            }
            
            /* Glassmorphism effect */
            .glass-effect {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            /* Notification badge */
            .notification-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                border: 2px solid white;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
                }
            }

            /* Admin Key Popup Styles */
            .admin-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease-out;
            }
            
            .admin-popup {
                background: white;
                border-radius: 20px;
                padding: 32px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .admin-popup-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .admin-popup-icon {
                font-size: 48px;
                color: #667eea;
                margin-bottom: 16px;
            }
            
            .admin-popup-title {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0;
            }
            
            .admin-popup-message {
                color: #6b7280;
                text-align: center;
                margin-bottom: 24px;
                line-height: 1.6;
            }
            
            .admin-popup-input {
                width: 100%;
                padding: 12px 16px;
                padding-right: 45px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 16px;
                transition: all 0.3s ease;
                margin-bottom: 8px;
            }
            
            .admin-popup-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .password-input-wrapper {
                position: relative;
                width: 100%;
            }

            .password-toggle-btn {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .password-toggle-btn:hover {
                color: #667eea;
            }
            
            .admin-popup-error {
                color: #ef4444;
                font-size: 14px;
                margin-top: 8px;
                margin-bottom: 16px;
                text-align: center;
            }
            
            .admin-popup-buttons {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            
            .admin-popup-btn {
                flex: 1;
                padding: 12px 24px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .admin-popup-confirm {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .admin-popup-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
            
            .admin-popup-cancel {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .admin-popup-cancel:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(styleTag);
    
        // Cleanup function
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    const navigate = useNavigate();

    // Navigation functions
    function goResults() {
        console.log("Navigate to: /opencloseresult");
        navigate("/opencloseresult")
    }

    function goPlayers() {
        console.log("Navigate to: /adminwhoplayopenclose");
        navigate("/adminwhoplayopenclose")
    }
    
    function goWinners() { 
        console.log("Navigate to: /adminwinners");
        navigate("/adminwinners")
    }
    
    function goAmtBet() {
        console.log("Navigate to: /adminuseramtplayed");
        navigate("/adminuseramtplayed") 
    }
    
    function goProfitLoss() {
        console.log("Navigate to: /adminprofit");
        navigate("/adminprofit") 
    }

    function AcceptReject(){
        navigate("/adminacceptreject")
    }

    function RejectedUsers(){
        navigate("/rejectedusers")
    }
    
    function BlockUnblock(){
        setPendingAction(() => () => navigate("/blockunblockusers"));
        setShowAdminKeyPopup(true);
    }
    
    function bankverification(){
        navigate("/adminbankverfication")
    }

    // function deleteUser(){
    //     setPendingAction(() => () => navigate("/admindeleteuser"));
    //     setShowAdminKeyPopup(true);
    // }

    const handleAdminKeySubmit = () => {
        if (adminKey === "admin") {
            setShowAdminKeyPopup(false);
            setAdminKey("");
            setAdminKeyError("");
            if (pendingAction) {
                pendingAction();
                setPendingAction(null);
            }
        } else {
            setAdminKeyError("Invalid Super Admin Key");
        }
    };

    const handleAdminKeyEnter = (e) => {
        if (e.key === "Enter") {
            handleAdminKeySubmit();
        }
    };

    const handleCancelAdminKey = () => {
        setShowAdminKeyPopup(false);
        setAdminKey("");
        setAdminKeyError("");
        setPendingAction(null);
        setShowPassword(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const menuItems = [
        {
            title: 'Results',
            icon: BarChart3,
            onClick: goResults,
            description: 'View game results and analytics'
        },
        {
            title: 'Players',
            icon: Users,
            onClick: goPlayers,
            description: 'Manage active players'
        },
        {
            title: 'Winners',
            icon: Trophy,
            onClick: goWinners,
            description: 'View winners and rankings'
        },
        {
            title: 'Amount Bet',
            icon: DollarSign,
            onClick: goAmtBet,
            description: 'Monitor betting amounts'
        },
        {
            title: 'Profit/Loss',
            icon: TrendingUp,
            onClick: goProfitLoss,
            description: 'Financial performance overview'
        },
        {
            title: 'KYC Check (Accept/Reject Users)',
            icon: Users,
            onClick: AcceptReject,
            description: 'Accept Or Reject new user.'
        },
        {
            title: 'Rejected Users',
            icon: StopCircle,
            onClick: RejectedUsers,
            description: 'View rejected users list.'
        },
        {
            title: 'Block/Unblock Users',
            icon: Settings,
            onClick: BlockUnblock,
            description: 'Block or unblock users (Requires Super Admin Key).'
        },
        {
            title: 'Bank Verification',
            icon: Settings,
            onClick: bankverification,
            description: 'Verify user bank details.'
        },
    ];

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'transparent'
        },
        header: {
            background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '0',
            zIndex: '1000'
        },
        navbar: {
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        logoImage: {
            height: '60px',
            width: '60px',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease'
        },
        brandContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
        },
        logoText: {
            color: 'white',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        adminText: {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            fontWeight: '500',
            marginLeft: '8px'
        },
        centerSection: {
            display: 'flex',
            alignItems: 'center'
        },
        dashboardTitle: {
            color: 'white',
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            textAlign: 'center'
        },
        mainContent: {
            padding: '40px 32px',
            maxWidth: '1400px',
            margin: '0 auto',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            padding: '20px 0'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
        },
        cardIcon: {
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '24px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '8px'
        },
        cardDescription: {
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.6'
        }
    };

    const handleCardHover = (e, isEntering) => {
        const card = e.currentTarget;
        if (isEntering) {
            card.style.transform = 'translateY(-12px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        }
    };

    const handleLogoHover = (e, isEntering) => {
        const logo = e.currentTarget;
        if (isEntering) {
            logo.style.transform = 'scale(1.05)';
            logo.querySelector('img').style.transform = 'rotate(5deg)';
        } else {
            logo.style.transform = 'scale(1)';
            logo.querySelector('img').style.transform = 'rotate(0deg)';
        }
    };

    return (
        <div style={styles.container}>
            {/* Enhanced Header with Professional Design */}
            <header style={styles.header} className="header-animation">
                <nav style={styles.navbar}>
                    {/* Left Section - Logo & Brand */}
                    <div style={styles.leftSection}>
                        <div 
                            style={styles.logo}
                            onMouseEnter={(e) => handleLogoHover(e, true)}
                            onMouseLeave={(e) => handleLogoHover(e, false)}
                        >
                            <img 
                                src={logo} 
                                alt='NAPHEX Logo' 
                                style={styles.logoImage}
                            />
                            <div style={styles.brandContainer}>
                                <span style={styles.logoText}>
                                    <strong>NAPHEX</strong>
                                    <span style={styles.adminText}>Admin</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Center Section - Dashboard Title */}
                    <div style={styles.centerSection}>
                        <h1 style={styles.dashboardTitle}>
                            <strong>OPEN-CLOSE GAME DASHBOARD</strong>
                        </h1>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main style={styles.mainContent} className="content-animation">
                <div style={styles.grid}>
                    {menuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={index}
                                style={styles.card}
                                onClick={item.onClick}
                                onMouseEnter={(e) => handleCardHover(e, true)}
                                onMouseLeave={(e) => handleCardHover(e, false)}
                            >
                                <div style={styles.cardIcon}>
                                    <IconComponent size={28} />
                                </div>
                                <h3 style={styles.cardTitle}>{item.title}</h3>
                                <p style={styles.cardDescription}>{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Admin Key Popup */}
            {showAdminKeyPopup && (
                <div className="admin-popup-overlay">
                    <div className="admin-popup">
                        <div className="admin-popup-header">
                            <div className="admin-popup-icon">🔒</div>
                            <h4 className="admin-popup-title">Super Admin Authentication</h4>
                        </div>
                        <p className="admin-popup-message">
                            This action requires Super Admin privileges. Please enter the Super Admin key to continue.
                        </p>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="admin-popup-input"
                                placeholder="Enter Super Admin Key"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                onKeyPress={handleAdminKeyEnter}
                                autoFocus
                            />
                            <button 
                                type="button"
                                className="password-toggle-btn"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {adminKeyError && <div className="admin-popup-error">{adminKeyError}</div>}
                        <div className="admin-popup-buttons">
                            <button className="admin-popup-btn admin-popup-confirm" onClick={handleAdminKeySubmit}>
                                Submit
                            </button>
                            <button className="admin-popup-btn admin-popup-cancel" onClick={handleCancelAdminKey}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOpenClose;