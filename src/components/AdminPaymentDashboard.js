import React, { useEffect } from 'react';
import { CreditCard, Plus, History, ArrowDownCircle } from 'lucide-react';
import logo from "../images/logo-1.png";
import { useNavigate } from 'react-router-dom';
import { FaMoneyCheck, FaRegObjectGroup, FaRegObjectUngroup } from 'react-icons/fa';

function AdminPaymentDashboard() {
    const navigate = useNavigate()
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
        `;
        document.head.appendChild(styleTag);
    
        // Cleanup function
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    // Navigation functions (replace with your actual navigation logic)
    function goWithdrawals() {
        navigate("/adminwithdrawreq");
    }

    function goAddToken() {
        console.log("Navigate to: /admin/addtoken");
        navigate("/admintokendetails");
    }
    
    function goTransactionHistory() {
        navigate("/admintransactionsdashboard");
    }

    function goEntryFeesVarification(){
        navigate("/adminentryfeeverification")
    }

    function goRejectedTokens(){
        navigate("/adminrejectedrequests")
    }

    const menuItems = [
        {
            title: 'Withdrawal Requests',
            icon: ArrowDownCircle,
            onClick: goWithdrawals,
            description: 'Process and manage user withdrawal requests'
        },
        {
            title: 'Add Token Request',
            icon: Plus,
            onClick: goAddToken,
            description: 'Handle token addition requests from users'
        },
        {
            title: 'Transaction History',
            icon: History,
            onClick: goTransactionHistory,
            description: 'View complete transaction logs and history'
        },
        {
            title: 'Entry Fees Varification',
            icon: FaMoneyCheck,
            onClick: goEntryFeesVarification,
            description: 'User Entry Fees Varifications'
        },
        {
            title: 'Rejected Token Requests',
            icon: FaRegObjectUngroup,
            onClick: goRejectedTokens,
            description: 'User Entry Fees Varifications'
        }
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
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            transition: 'all 0.3s ease',
            borderRadius: '8px',
            maxHeight: '60px',
            maxWidth: '60px'
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
        rightSection: {},
        mainContent: {
            padding: '40px 32px',
            maxWidth: '1400px',
            margin: '0 auto',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
            padding: '40px 0',
            justifyItems: 'center'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '400px'
        },
        cardIcon: {
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'white',
            fontSize: '32px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
            position: 'relative'
        },
        cardTitle: {
            fontSize: '22px',
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '12px'
        },
        cardDescription: {
            fontSize: '16px',
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
        const logoContainer = e.currentTarget;
        const logoImage = logoContainer.querySelector('.logo-image');
        if (isEntering) {
            logoContainer.style.transform = 'scale(1.05)';
            if (logoImage) {
                logoImage.style.transform = 'rotate(5deg) scale(1.1)';
            }
        } else {
            logoContainer.style.transform = 'scale(1)';
            if (logoImage) {
                logoImage.style.transform = 'rotate(0deg) scale(1)';
            }
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
                            <div style={styles.logoIcon}>
                                <img 
                                    src={logo} 
                                    alt='NAPHEX Logo' 
                                    style={styles.logoImage}
                                    className='logo-image'
                                />
                            </div>
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
                            <strong>PAYMENT MANAGEMENT DASHBOARD</strong>
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
                                    <IconComponent size={36} />
                                </div>
                                <h3 style={styles.cardTitle}>{item.title}</h3>
                                <p style={styles.cardDescription}>{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default AdminPaymentDashboard;