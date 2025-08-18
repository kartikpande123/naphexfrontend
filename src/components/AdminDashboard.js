import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import image from "../images/Banner-7.png";
import logo from "../images/logo-1.png";
import "./Home.css";

const Home = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showAdminKeyPopup, setShowAdminKeyPopup] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminKeyError, setAdminKeyError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    navigate("/"); // Redirect to login after logout
  };

  const toggleLogoutPopup = () => {
    setShowLogoutPopup(!showLogoutPopup);
  };

  const handleAdminKeySubmit = () => {
    if (adminKey === "admin") {
      setShowAdminKeyPopup(false);
      setAdminKey("");
      setAdminKeyError("");
      navigate("/binary");
    } else {
      setAdminKeyError("Invalid Super Admin Key");
    }
  };

  // Handle Enter key press for admin key submission
  const handleAdminKeyEnter = (e) => {
    if (e.key === "Enter") {
      handleAdminKeySubmit();
    }
  };

  const handleBinaryClick = () => {
    setShowAdminKeyPopup(true);
  };

  // Function to handle automatic logout after 15 minutes (900000 ms) of inactivity
  useEffect(() => {
    let logoutTimer;

    // Function to start the logout timer
    const startLogoutTimer = () => {
      logoutTimer = setTimeout(() => {
        handleLogout(); // Logout after 15 minutes
      }, 900000);
    };

    // Function to reset the logout timer
    const resetLogoutTimer = () => {
      clearTimeout(logoutTimer); // Clear the previous timer
      startLogoutTimer(); // Start a new timer
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetLogoutTimer);
    window.addEventListener("keydown", resetLogoutTimer);

    // Start the logout timer initially
    startLogoutTimer();

    // Cleanup on component unmount (remove event listeners and clear timeout)
    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetLogoutTimer);
      window.removeEventListener("keydown", resetLogoutTimer);
    };
  }, []);

  const handleClickGame1 = () => {
    navigate("/adminopenclose");
  };

  return (
    <div className="enhanced-layout">
      <nav className="navbar navbar-expand-lg enhanced-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center brand-hover" to="/">
            <img src={logo} alt="GameZone" className="enhanced-logo" />
            <span className="enhanced-brand-text">
              NAPHEX <span className="text-highlight">Admin</span>
            </span>
          </Link>

          <button
            className="navbar-toggler custom-toggler"
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
                  className="nav-link enhanced-nav-link"
                  to="/adminhelp"
                  onMouseEnter={() => setIsHovered("account")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-person-circle nav-icon"></i>
                  <span>Queries</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link enhanced-nav-link"
                  to="/users"
                  onMouseEnter={() => setIsHovered("account")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-person-circle nav-icon"></i>
                  <span>Game Users</span>
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
                  <span>Overall Payments</span>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link enhanced-nav-link btn-link"
                  onClick={handleBinaryClick}
                  onMouseEnter={() => setIsHovered("earnings")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <i className="bi bi-gift nav-icon"></i>
                  <span>Binary</span>
                </button>
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
              {showAdminKeyPopup && (
                <div className="logout-popup-overlay">
                  <div className="logout-popup">
                    <div className="logout-popup-header">
                      <i className="bi bi-shield-lock-fill logout-popup-icon"></i>
                      <h4 className="logout-popup-title">Super Admin Authentication</h4>
                    </div>
                    <p className="logout-popup-message">
                      Please enter the Super Admin key to access Binary section.
                    </p>
                    <div className="form-group mb-3">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter Super Admin Key"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        onKeyPress={handleAdminKeyEnter}
                        autoFocus
                      />
                      {adminKeyError && <div className="text-danger mt-2">{adminKeyError}</div>}
                    </div>
                    <div className="logout-popup-buttons">
                      <button className="btn btn-primary logout-popup-confirm" onClick={handleAdminKeySubmit}>
                        Submit
                      </button>
                      <button className="btn btn-outline-secondary logout-popup-cancel" onClick={() => setShowAdminKeyPopup(false)}>
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
          {/* Only Game 1 Banner (Open-Close) */}
          <div
            className="enhanced-banner-container enhanced-banner-container-single"
            onMouseEnter={() => setIsHovered("banner1")}
            onMouseLeave={() => setIsHovered(null)}
          >
            <img src={image} alt="Play Now" className="enhanced-banner" />
            <div className="enhanced-overlay">
              <h2 className="banner-title">Open-Close</h2>
              <div className="banner-subtitle">Start Your Gaming Adventure</div>
              <button className="play-button" onClick={handleClickGame1}>
                <i className="bi bi-play-fill"></i> Show Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;