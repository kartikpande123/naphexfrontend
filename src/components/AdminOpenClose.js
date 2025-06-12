import React, { useEffect } from 'react';
import { BarChart3, Users, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import img from "./../images/promo1.jpg"

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
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            #root {
                background: transparent !important;
            }
            .enhanced-navbar {
                background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%) !important;
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 15px 0;
            }
            .enhanced-logo {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 24px;
            }
            .enhanced-brand-text {
                color: white;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 1px;
                margin-left: 15px;
            }
            .text-highlight {
                color: #a0aec0;
                font-weight: 300;
                font-size: 18px;
            }
            .brand-hover {
                text-decoration: none !important;
                transition: all 0.3s ease;
            }
            .brand-hover:hover {
                transform: translateY(-2px);
            }
            .dashboard-header {
                color: white;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: 2px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(styleTag);
    
        // Cleanup function
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    const navigate = useNavigate()

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

    const menuItems = [
        {
            title: 'Results',
            icon: BarChart3,
            onClick: goResults,
            description: 'View game results'
        },
        {
            title: 'Players',
            icon: Users,
            onClick: goPlayers,
            description: 'Manage players'
        },
        {
            title: 'Winners',
            icon: Trophy,
            onClick: goWinners,
            description: 'View winners list'
        },
        {
            title: 'Amount Bet',
            icon: DollarSign,
            onClick: goAmtBet,
            description: 'Betting amounts'
        },
        {
            title: 'Profit/Loss',
            icon: TrendingUp,
            onClick: goProfitLoss,
            description: 'Financial overview'
        }
    ];

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'transparent'
        },
        header: {
            background: 'transparent',
            padding: '0'
        },
        navbar: {
            background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '15px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        logoIcon: {
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
        },
        logoText: {
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            letterSpacing: '1px'
        },
        adminText: {
            color: '#a0aec0',
            fontSize: '18px',
            fontWeight: '300',
            marginLeft: '5px'
        },
        dashboardHeader: {
            color: 'white',
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '2px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        },
        navItems: {
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
        },
        navItem: {
            color: '#cbd5e0',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        logoutBtn: {
            background: '#3182ce',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
        },
        mainContent: {
            padding: '40px 30px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        pageTitle: {
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '50px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            padding: '20px 0'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
        },
        cardIcon: {
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '24px'
        },
        cardTitle: {
            fontSize: '22px',
            fontWeight: '600',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '8px'
        },
        cardDescription: {
            fontSize: '14px',
            color: '#718096',
            textAlign: 'center',
            lineHeight: '1.5'
        },
        cardHoverEffect: {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        }
    };

    const handleCardHover = (e, isEntering) => {
        const card = e.currentTarget;
        if (isEntering) {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            card.querySelector('.hover-effect').style.opacity = '1';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            card.querySelector('.hover-effect').style.opacity = '0';
        }
    };

    const handleNavHover = (e, isEntering) => {
        if (isEntering) {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = 'white';
        } else {
            e.target.style.background = 'transparent';
            e.target.style.color = '#cbd5e0';
        }
    };

    const handleLogoutHover = (e, isEntering) => {
        if (isEntering) {
            e.target.style.background = '#2c5aa0';
            e.target.style.transform = 'translateY(-2px)';
        } else {
            e.target.style.background = '#3182ce';
            e.target.style.transform = 'translateY(0)';
        }
    };

    return (
        <div style={styles.container}>
            {/* Header with Navbar */}
            <header style={styles.header}>
                <nav style={styles.navbar}>
                    <div style={styles.logo}>
                       <img src={img} alt='logo' style={{height:"50px", width:"50px"}}/>
                        <div>
                            <span style={styles.logoText}>NAPHEX</span>
                            <span style={styles.adminText}>Admin</span>
                        </div>
                    </div>
                    <div style={styles.dashboardHeader}>
                        OPEN-CLOSE GAME DASHBOARD
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main style={styles.mainContent}>
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
                                <div className="hover-effect" style={styles.cardHoverEffect}></div>
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