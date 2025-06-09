import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // For making API calls
import "bootstrap-icons/font/bootstrap-icons.css";
import image from "../images/promo1.jpg";
import "./Home.css";
import API_BASE_URL from "./ApiConfig";

const Home = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login"); // Redirect to login after logout
  };

  const toggleLogoutPopup = () => {
    setShowLogoutPopup(!showLogoutPopup);
  };

  // Fetch user tokens and check for winners
  useEffect(() => {
    let pollingInterval = null;
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Function to check for winners
    const checkForWinners = async () => {
      try {
        if (!userData || !userData.phoneNo) return;

        const response = await axios.get(`${API_BASE_URL}/get-winners`);
        const winners = response.data;

        // Find unshown winners for the current user
        const userWinners = winners.filter(winner =>
          winner.phoneNo === userData.phoneNo && !winner.popupShown
        );

        if (userWinners.length > 0) {
          // Show all unshown winners
          setWinnerDetails(userWinners);
          setShowWinnerPopup(true);

          // Mark all these winners as popup shown
          const markWinnerPromises = userWinners.map(winner =>
            axios.post(`${API_BASE_URL}/mark-winner-claimed/${userData.phoneNo}`)
          );
          await Promise.all(markWinnerPromises);
        }
      } catch (error) {
        console.error('Error checking winners:', error);
      }
    };

    // Function to fetch user tokens
    const fetchUserTokens = async () => {
      try {
        if (!userData || !userData.phoneNo) {
          // If no user data, try to get from localStorage
          const storedUserData = JSON.parse(localStorage.getItem("userData"));
          if (storedUserData && storedUserData.tokens) {
            setTokenCount(storedUserData.tokens);
          }
          return;
        }

        console.log("Fetching tokens for:", userData.phoneNo);

        // Use fetch instead of axios to handle SSE text response
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

        // Read the response as text since it's SSE format
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        // Parse SSE data format (data: {...})
        const lines = responseText.split('\n');
        let jsonData = null;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataString = line.substring(6); // Remove 'data: ' prefix
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

          // Update localStorage with new data
          const currentUserData = JSON.parse(localStorage.getItem("userData"));
          localStorage.setItem("userData", JSON.stringify({
            ...currentUserData,
            tokens: jsonData.tokens,
            ...jsonData.userData
          }));
        } else {
          console.error("Error in token fetch:", jsonData?.message || "No valid data received");
          // Fallback to stored tokens
          const storedUserData = JSON.parse(localStorage.getItem("userData"));
          if (storedUserData && storedUserData.tokens) {
            setTokenCount(storedUserData.tokens);
          }
        }
      } catch (error) {
        console.error("Error fetching tokens:", error.message || error);
        // Fallback to stored tokens
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
    }, 30000); // Poll every 30 seconds

    // Cleanup on component unmount
    return () => {
      if (pollingInterval) {
        console.log("Clearing token polling interval");
        clearInterval(pollingInterval);
      }
    };
  }, []); // Empty dependency array for initial setup only

  // Close winner popup
  const closeWinnerPopup = () => {
    // If there are more winners, show the next one
    if (currentWinnerIndex < winnerDetails.length - 1) {
      setCurrentWinnerIndex(prevIndex => prevIndex + 1);
    } else {
      // If no more winners, close the popup completely
      setShowWinnerPopup(false);
      setCurrentWinnerIndex(0);
      setWinnerDetails([]);
    }
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
            <img src={image} alt="GameZone" className="enhanced-logo" />
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
                  to="/about-us"
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

        <div className="enhanced-bottom-message">
          <div className="message-content">
            <i className="bi bi-controller message-icon"></i>
            <span>More Exciting Games Coming Soon!</span>
            <div className="pulse-animation"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;