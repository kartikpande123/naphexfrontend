import React, { useEffect } from 'react';
import { BarChart3, Users, Trophy, DollarSign, TrendingUp, Settings, Bell, User, Menu, Settings2, Blocks, BlocksIcon, StopCircle, DeleteIcon } from 'lucide-react';
import logo from "../images/logo-1.png";
import { useNavigate } from 'react-router-dom';

function AdminOpenClose() {
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

    const navigate = useNavigate();

    // Navigation functions (replace with your actual navigation logic)
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
        navigate("/blockunblockusers")
    }
    function bankverification(){
        navigate("/adminbankverfication")
    }

    function deleteUser(){
        navigate("/admindeleteuser")
    }

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
            description: 'Accept Or Reject new user.'
        },
        {
            title: 'Block/Unblock Users',
            icon: Settings,
            onClick: BlockUnblock,
            description: 'Accept Or Reject new user.'
        },
        {
            title: 'Bank Verification',
            icon: Settings,
            onClick: bankverification,
            description: 'Accept Or Reject new user.'
        },
        {
            title: 'Delete User',
            icon: DeleteIcon,
            onClick: deleteUser,
            description: 'Delete user permanently.'
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
        rightSection: {},
        mainContent: {
            padding: '40px 32px',
            maxWidth: '1400px',
            margin: '0 auto',

        },
        pageTitle1: {
            color: 'white',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '48px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
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

    const handleActionButtonHover = (e, isEntering) => {
        // Removed - not needed for simplified header
    };

    const handleProfileHover = (e, isEntering) => {
        // Removed - not needed for simplified header
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
        </div>
    );
}

export default AdminOpenClose;