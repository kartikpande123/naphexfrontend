import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // For making API calls
import "bootstrap-icons/font/bootstrap-icons.css";
import image from "../images/Banner-7.png";
import logo from "../images/logo-1.png";
import "./Home.css";
import API_BASE_URL from "./ApiConfig";
import WelcomePopup from "./WelcomePopup";

const Home = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [processedWinnerIds, setProcessedWinnerIds] = useState(new Set());
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); // Initialize as false

  const navigate = useNavigate();

  // Check if welcome popup should be shown on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const welcomePopupShown = localStorage.getItem('welcomePopupShown');
    
    // Show welcome popup only if user is logged in and hasn't seen it before
    if (userData && !welcomePopupShown) {
      setShowWelcomePopup(true);
    }
  }, []); // Run only once on component mount

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem('welcomePopupShown'); // Clear welcome popup flag on logout
    navigate("/login"); // Redirect to login after logout
  };

  const toggleLogoutPopup = () => {
    setShowLogoutPopup(!showLogoutPopup);
  };

  // Fetch user tokens and check for winners
  useEffect(() => {
    let pollingInterval = null;
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Function to check for winners with improved logic
    const checkForWinners = async () => {
      try {
        if (!userData || !userData.phoneNo) return;

        // Use the specific user endpoint for better performance
        const response = await axios.get(`${API_BASE_URL}/get-user-winners/${userData.phoneNo}`);
        const unshownWinners = response.data;

        if (unshownWinners.length > 0) {
          console.log(`Found ${unshownWinners.length} unshown winners`);

          // Filter out already processed winners (in case of timing issues)
          const newWinners = unshownWinners.filter(winner =>
            !processedWinnerIds.has(winner.id)
          );

          if (newWinners.length > 0) {
            // Add to processed set
            setProcessedWinnerIds(prev => {
              const newSet = new Set(prev);
              newWinners.forEach(winner => newSet.add(winner.id));
              return newSet;
            });

            // Sort winners by timestamp if available (oldest first)
            const sortedWinners = newWinners.sort((a, b) => {
              return (a.timestamp || 0) - (b.timestamp || 0);
            });

            setWinnerDetails(sortedWinners);
            setCurrentWinnerIndex(0);
            setShowWinnerPopup(true);
          }
        }
      } catch (error) {
        console.error('Error checking winners:', error);
      }
    };

    // Function to fetch user tokens (keep existing logic)
    const fetchUserTokens = async () => {
      try {
        if (!userData || !userData.phoneNo) {
          const storedUserData = JSON.parse(localStorage.getItem("userData"));
          if (storedUserData && storedUserData.tokens) {
            setTokenCount(storedUserData.tokens);
          }
          return;
        }

        console.log("Fetching tokens for:", userData.phoneNo);

        const response = await fetch(`${API_BASE_URL}/user-profile/${userData.phoneNo}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        const lines = responseText.split('\n');
        let jsonData = null;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataString = line.substring(6);
            try {
              jsonData = JSON.parse(dataString);
              break;
            } catch (parseError) {
              console.error("Error parsing JSON from SSE:", parseError);
            }
          }
        }

        if (jsonData && jsonData.success) {
          console.log("Received token update:", jsonData.tokens);
          setTokenCount(jsonData.tokens);

          const currentUserData = JSON.parse(localStorage.getItem("userData"));
          localStorage.setItem("userData", JSON.stringify({
            ...currentUserData,
            tokens: jsonData.tokens,
            ...jsonData.userData
          }));
        } else {
          console.error("Error in token fetch:", jsonData?.message || "No valid data received");
          const storedUserData = JSON.parse(localStorage.getItem("userData"));
          if (storedUserData && storedUserData.tokens) {
            setTokenCount(storedUserData.tokens);
          }
        }
      } catch (error) {
        console.error("Error fetching tokens:", error.message || error);
        const storedUserData = JSON.parse(localStorage.getItem("userData"));
        if (storedUserData && storedUserData.tokens) {
          setTokenCount(storedUserData.tokens);
        }
      }
    };

    // Initial fetch
    fetchUserTokens();
    checkForWinners();

    // Set up polling for real-time updates (every 30 seconds)
    pollingInterval = setInterval(() => {
      fetchUserTokens();
      checkForWinners();
    }, 30000);

    // Cleanup on component unmount
    return () => {
      if (pollingInterval) {
        console.log("Clearing token polling interval");
        clearInterval(pollingInterval);
      }
    };
  }, []); // Empty dependency array for initial setup only

  // Improved close winner popup function
  const closeWinnerPopup = async () => {
    try {
      // Mark current winner as claimed using the winner ID
      const currentWinner = winnerDetails[currentWinnerIndex];

      if (currentWinner && currentWinner.id) {
        console.log(`Marking winner ${currentWinner.id} as claimed`);
        await axios.post(`${API_BASE_URL}/mark-winner-claimed/${currentWinner.id}`);
      }

      // If there are more winners, show the next one
      if (currentWinnerIndex < winnerDetails.length - 1) {
        setCurrentWinnerIndex(prevIndex => prevIndex + 1);
      } else {
        // If no more winners, close the popup completely
        setShowWinnerPopup(false);
        setCurrentWinnerIndex(0);
        setWinnerDetails([]);

        // Optional: Clear processed winners set after some time to allow new checks
        setTimeout(() => {
          setProcessedWinnerIds(new Set());
        }, 60000); // Clear after 1 minute
      }
    } catch (error) {
      console.error('Error marking winner as claimed:', error);

      // Still proceed with popup navigation even if API call fails
      if (currentWinnerIndex < winnerDetails.length - 1) {
        setCurrentWinnerIndex(prevIndex => prevIndex + 1);
      } else {
        setShowWinnerPopup(false);
        setCurrentWinnerIndex(0);
        setWinnerDetails([]);
      }
    }
  };

  // Updated handler to set the flag properly
  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('welcomePopupShown', 'true');
  };

  const handleClickGame1 = () => {
    navigate("/game1");
  };

  const generateCelebrationElements = () => {
    const elements = [];

    // Generate Confetti
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${2 + Math.random() * 3}s`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      elements.push(
        <div
          key={`confetti-${i}`}
          className="confetti"
          style={style}
        />
      );
    }

    // Generate Flowers
    for (let i = 0; i < 20; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 1}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
      elements.push(
        <div
          key={`flower-${i}`}
          className="flower"
          style={style}
        />
      );
    }

    // Generate Cracker Sparks
    for (let i = 0; i < 30; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 1}s`,
      };
      elements.push(
        <div
          key={`spark-${i}`}
          className="cracker-spark"
          style={style}
        />
      );
    }

    return elements;
  };

  return (
    <div className="enhanced-layout">
      <WelcomePopup
        isVisible={showWelcomePopup}
        onClose={handleCloseWelcomePopup}
      />
      {/* Winner Popup */}
      {showWinnerPopup && winnerDetails.length > 0 && (
        <div className="winner-popup-overlay">
          <div className="confetti-container">
            {generateCelebrationElements()}
          </div>
          <div className="winner-popup">
            <div className="winner-popup-header">
              <i className="bi bi-trophy-fill winner-popup-icon"></i>
              <h4 className="winner-popup-title">Congratulations!</h4>
            </div>
            <p className="winner-popup-message">
              You won <strong>{winnerDetails[currentWinnerIndex].amountWon}</strong> tokens in
              the Open-Close game ({winnerDetails[currentWinnerIndex].winType})!
            </p>
            <div className="winner-popup-buttons">
              <button
                className="btn btn-primary winner-popup-confirm"
                onClick={closeWinnerPopup}
              >
                {currentWinnerIndex < winnerDetails.length - 1 ? 'Next Win' : 'Claim Reward'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg enhanced-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center brand-hover" to="/">
            <img src={logo} alt="GameZone" className="enhanced-logo" />
            <span className="enhanced-brand-text">
              NAPHEX <span className="text-highlight">GameZone</span>
            </span>
          </Link>
          <button
            className="navbar-toggler custom-toggler w-20"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center nav-gap">
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-token-btn"
                  to="/add-money"
                  onMouseEnter={() => setIsHovered("tokens")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <span className="token-amount">{tokenCount}</span> Tokens
                  <i className="bi bi-plus-circle-fill ms-2 token-icon"></i>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/myaccount"
                  onMouseEnter={() => setIsHovered("account")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-person-circle nav-icon"></i>
                  <span>My Account</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/earnings"
                  onMouseEnter={() => setIsHovered("earnings")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-gift nav-icon"></i>
                  <span>Friend Earnings</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/help"
                  onMouseEnter={() => setIsHovered("help")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-question-circle nav-icon"></i>
                  <span>Help</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/history"
                  onMouseEnter={() => setIsHovered("history")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-clock-history nav-icon"></i>
                  <span>History</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/about"
                  onMouseEnter={() => setIsHovered("about")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-info-circle nav-icon"></i>
                  <span>About</span>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link enhanced-nav-link btn-link"
                  onClick={toggleLogoutPopup}
                >
                  <i className="bi bi-box-arrow-right nav-icon"></i>
                  <span>Logout</span>
                </button>
              </li>
              {showLogoutPopup && (
                <div className="logout-popup-overlay">
                  <div className="logout-popup">
                    <div className="logout-popup-header">
                      <i className="bi bi-exclamation-circle-fill logout-popup-icon"></i>
                      <h4 className="logout-popup-title">Confirm Logout</h4>
                    </div>
                    <p className="logout-popup-message">
                      Are you sure you want to log out? You will need to log in again to access your account.
                    </p>
                    <div className="logout-popup-buttons">
                      <button className="btn btn-danger logout-popup-confirm" onClick={handleLogout}>
                        Yes, Logout
                      </button>
                      <button className="btn btn-outline-secondary logout-popup-cancel" onClick={toggleLogoutPopup}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="enhanced-content">
        <div className="enhanced-banner-row">
          {/* Single Game Banner - Open-Close */}
          <div
            className="enhanced-banner-container single-game"
            onMouseEnter={() => setIsHovered("banner1")}
            onMouseLeave={() => setIsHovered(null)}
          >
            <img src={image} alt="Play Now" className="enhanced-banner" />
            <div className="enhanced-overlay">
              <h2 className="banner-title">Open-Close</h2>
              <div className="banner-subtitle">Start Your Gaming Adventure</div>
              <button className="play-button" onClick={handleClickGame1}>
                <i className="bi bi-play-fill"></i> Start Game
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="enhanced-footer">
          <div className="footer-content">
            <div className="copyright-section">
              <p className="copyright-text">
                © 2025/2026 NAPHEX. All rights reserved.
              </p>
            </div>
            <div className="footer-links">
              <Link to="/terms&conditions" className="footer-link">
                Terms & Conditions
              </Link>
              <span className="footer-separator">|</span>
              <Link to="/kycpolicy" className="footer-link">
                KYC Policy
              </Link>
              <span className="footer-separator">|</span>
              <Link to="/privacypolicy" className="footer-link">
                Privacy Policy
              </Link>
              <span className="footer-separator">|</span>
              <Link to="/rules" className="footer-link">
                Game Rules
              </Link>
              <span className="footer-separator">|</span>
              <Link to="/FAQs" className="footer-link">
                FAQs
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;