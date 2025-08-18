import React from 'react';

const WelcomePopup = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  // CSS styles as JavaScript objects
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.6s ease-out'
    },
    container: {
      position: 'relative',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: 0,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: 'slideUp 0.6s ease-out'
    },
    closeButton: {
      position: 'sticky',
      top: '15px',
      right: '15px',
      marginLeft: 'auto',
      marginBottom: '-50px',
      width: '35px',
      height: '35px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      color: 'white',
      fontSize: '1.2rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      flexShrink: 0
    },
    bgAnimation: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 1
    },
    sparkle: {
      position: 'absolute',
      width: '4px',
      height: '4px',
      background: '#ffd700',
      borderRadius: '50%',
      animation: 'sparkle 3s linear infinite'
    },
    diamond: {
      position: 'absolute',
      width: '12px',
      height: '12px',
      background: 'linear-gradient(45deg, #ff6b6b, #ffd700)',
      transform: 'rotate(45deg)',
      animation: 'rotate 4s linear infinite'
    },
    triangle: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: '14px solid rgba(255, 255, 255, 0.3)',
      animation: 'zigzag 5s ease-in-out infinite'
    },
    hexagon: {
      position: 'absolute',
      width: '16px',
      height: '16px',
      background: 'rgba(102, 126, 234, 0.6)',
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      animation: 'drift 6s ease-in-out infinite'
    },
    content: {
      position: 'relative',
      zIndex: 2,
      padding: window.innerWidth <= 480 ? '50px 15px 20px' : window.innerWidth <= 768 ? '55px 20px 25px' : '60px 30px 30px',
      textAlign: 'center',
      color: 'white',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    mainContent: {
      flex: 1
    },
    header: {
      marginBottom: '25px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '10px'
    },
    logoIcon: {
      fontSize: window.innerWidth <= 480 ? '1.8rem' : window.innerWidth <= 768 ? '2rem' : '2.5rem',
      color: '#ffd700',
      animation: 'pulse 2s infinite'
    },
    brand: {
      fontSize: window.innerWidth <= 480 ? '1.3rem' : window.innerWidth <= 768 ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #ffd700, #ff6b6b)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    tagline: {
      fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontStyle: 'italic',
      marginTop: '5px'
    },
    description: {
      marginBottom: '20px',
      textAlign: 'left'
    },
    intro: {
      fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
      lineHeight: '1.6',
      marginBottom: '20px',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.95)'
    },
    features: {
      margin: '20px 0'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
      padding: '8px 0',
      fontSize: window.innerWidth <= 480 ? '0.8rem' : window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
      lineHeight: '1.4'
    },
    featureIcon: {
      fontSize: '1.2rem',
      color: '#ffd700',
      minWidth: '20px'
    },
    conclusion: {
      fontSize: window.innerWidth <= 768 ? '0.9rem' : '0.95rem',
      lineHeight: '1.6',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.95)'
    },
    highlight: {
      color: '#ffd700',
      fontWeight: '600'
    },
    bottomSection: {
      marginTop: 'auto',
      paddingTop: '20px'
    },
    continueBtn: {
      position: 'relative',
      background: 'linear-gradient(45deg, #ff6b6b, #ffd700)',
      border: 'none',
      color: 'white',
      padding: window.innerWidth <= 480 ? '12px 24px' : window.innerWidth <= 768 ? '14px 28px' : '16px 32px',
      borderRadius: '50px',
      fontSize: window.innerWidth <= 480 ? '0.95rem' : window.innerWidth <= 768 ? '1rem' : '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 25px rgba(255, 107, 107, 0.3)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '0 auto 20px auto',
      width: 'fit-content'
    },
    decorations: {
      display: 'flex',
      justifyContent: 'center',
      gap: window.innerWidth <= 768 ? '10px' : '15px'
    },
    decoCard: {
      width: window.innerWidth <= 768 ? '35px' : '40px',
      height: window.innerWidth <= 768 ? '35px' : '40px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
      animation: 'bounce 2s infinite'
    }
  };

  // Inline keyframes styles
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes sparkle {
      0% { 
        transform: translateY(100vh) scale(0); 
        opacity: 0; 
      }
      10% { 
        opacity: 1; 
      }
      90% { 
        opacity: 1; 
      }
      100% { 
        transform: translateY(-100px) scale(1); 
        opacity: 0; 
      }
    }
    
    @keyframes rotate {
      0% { 
        transform: rotate(45deg) translateY(100vh); 
        opacity: 0; 
      }
      10% { 
        opacity: 0.8; 
      }
      90% { 
        opacity: 0.8; 
      }
      100% { 
        transform: rotate(405deg) translateY(-100px); 
        opacity: 0; 
      }
    }
    
    @keyframes zigzag {
      0% { 
        transform: translateX(0) translateY(100vh); 
        opacity: 0; 
      }
      10% { 
        opacity: 0.7; 
      }
      25% { 
        transform: translateX(30px) translateY(75vh); 
      }
      50% { 
        transform: translateX(-20px) translateY(50vh); 
      }
      75% { 
        transform: translateX(40px) translateY(25vh); 
      }
      90% { 
        opacity: 0.7; 
      }
      100% { 
        transform: translateX(0) translateY(-100px); 
        opacity: 0; 
      }
    }
    
    @keyframes drift {
      0% { 
        transform: translateX(0) translateY(100vh) rotate(0deg); 
        opacity: 0; 
      }
      10% { 
        opacity: 0.6; 
      }
      50% { 
        transform: translateX(-50px) translateY(50vh) rotate(180deg); 
      }
      90% { 
        opacity: 0.6; 
      }
      100% { 
        transform: translateX(20px) translateY(-100px) rotate(360deg); 
        opacity: 0; 
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
  `;

  const handleCloseHover = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
    e.target.style.transform = 'scale(1.1)';
  };

  const handleCloseLeave = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
    e.target.style.transform = 'scale(1)';
  };

  const handleButtonHover = (e) => {
    e.target.style.transform = 'translateY(-3px)';
    e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.4)';
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.3)';
  };

  // Generate animated elements
  const generateAnimatedElements = () => {
    const elements = [];
    
    // Generate sparkles
    for (let i = 0; i < 20; i++) {
      elements.push(
        <div
          key={`sparkle-${i}`}
          style={{
            ...styles.sparkle,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    // Generate rotating diamonds
    for (let i = 0; i < 8; i++) {
      elements.push(
        <div
          key={`diamond-${i}`}
          style={{
            ...styles.diamond,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    // Generate zigzag triangles
    for (let i = 0; i < 6; i++) {
      elements.push(
        <div
          key={`triangle-${i}`}
          style={{
            ...styles.triangle,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    // Generate drifting hexagons
    for (let i = 0; i < 5; i++) {
      elements.push(
        <div
          key={`hexagon-${i}`}
          style={{
            ...styles.hexagon,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    return elements;
  };

  const handleButtonActive = (e) => {
    e.target.style.transform = 'translateY(-1px)';
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.container}>
          {/* Close Button */}
          <div style={{padding: '15px 15px 0px 15px'}}>
            <button 
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={handleCloseHover}
              onMouseLeave={handleCloseLeave}
              aria-label="Close popup"
            >
              ×
            </button>
          </div>

          {/* Animated Background Elements */}
          <div style={styles.bgAnimation}>
            {generateAnimatedElements()}
          </div>

          {/* Main Content */}
          <div style={styles.content}>
            <div style={styles.mainContent}>
              {/* Header with Logo */}
              <div style={styles.header}>
                <div style={styles.logo}>
                  🎮
                  <span style={styles.brand}>NAPHEX</span>
                </div>
                <div style={styles.tagline}>Your Gateway to Ultimate Gaming Fun</div>
              </div>

              {/* Main Description */}
              <div style={styles.description}>
                <p style={styles.intro}>
                  <strong>naphex.com</strong> is your ultimate destination for gaming and sports betting enthusiasts.
                </p>
                
                <div style={styles.features}>
                  <div style={styles.featureItem}>
                    🎲
                    <span>Thrilling casino games like <strong>Fruits Game</strong></span>
                  </div>
                  
                  <div style={styles.featureItem}>
                    🏆
                    <span>Sports betting and game exchange</span>
                  </div>
                  
                  <div style={styles.featureItem}>
                    💰
                    <span>Real cash games and <strong>Crazy Time</strong> casino betting</span>
                  </div>
                  
                  <div style={styles.featureItem}>
                    👥
                    <span>Play matches with friends on a secure platform</span>
                  </div>
                </div>

                <p style={styles.conclusion}>
                  Whether you're a <span style={styles.highlight}>beginner</span> or a <span style={styles.highlight}>pro</span>, 
                  <strong> naphex.com</strong> promises unforgettable gaming experiences tailored to your interests.
                </p>
              </div>
            </div>

            {/* Bottom Section with Button and Decorations */}
            <div style={styles.bottomSection}>
              {/* Call to Action */}
              <button 
                style={styles.continueBtn}
                onClick={onClose}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                onMouseDown={handleButtonActive}
              >
                ▶️
                Continue to Dashboard
              </button>

              {/* Decorative Elements */}
              <div style={styles.decorations}>
                <div style={{...styles.decoCard, animationDelay: '0s'}}>🎮</div>
                <div style={{...styles.decoCard, animationDelay: '0.5s'}}>🎲</div>
                <div style={{...styles.decoCard, animationDelay: '1s'}}>🏆</div>
                <div style={{...styles.decoCard, animationDelay: '1.5s'}}>💎</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePopup;