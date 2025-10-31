import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from "react-icons/fa";
import API_BASE_URL from './ApiConfig';
import logo from "../images/logo-2.jpg"

const AuthPage = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secretCode, setSecretCode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Load Font Awesome CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);

    return () => {
      // Cleanup
      document.head.removeChild(link);
    };
  }, []);

  // Listen for keypress events to capture secret code
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();

      if (key.match(/[A-Z]/)) {
        setSecretCode(prev => {
          const newCode = prev + key;

          // Check if the secret code matches "ADMIN"
          if (newCode === 'ADMIN') {
            navigate('/adminlogin');
            return '';
          }

          // Keep only last 10 characters to prevent memory issues
          return newCode.slice(-10);
        });
      } else {
        // Reset secret code on non-letter keys
        setSecretCode('');
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [navigate]);

  const handleDownloadAPK = () => {
    const link = document.createElement('a');
    link.href = '/naphex.apk';
    link.download = 'naphex.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset secret code after 3 seconds of inactivity
  useEffect(() => {
    if (secretCode) {
      const timer = setTimeout(() => {
        setSecretCode('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [secretCode]);

  const validateInputs = () => {
    setError('');

    if (!/^\d{10}$/.test(phoneNo)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (failedAttempts >= 10) {
      setError('You have exceeded the maximum number of login attempts. Please reset your password.');
      navigate('/forgotpassword');
      return;
    }

    if (!validateInputs()) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Pre-check password
      const testResponse = await fetch(`${API_BASE_URL}/test-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo, password }),
      });

      const testData = await testResponse.json();

      if (!testResponse.ok || !testData.success || !testData.passwordMatches) {
        setFailedAttempts(prev => prev + 1);
        setError(`Invalid phone number or password. Attempts remaining: ${10 - (failedAttempts + 1)}`);
        setLoading(false);
        return;
      }

      // Step 2: Proceed to full login
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo, password }),
      });

      const loginText = await loginResponse.text(); // catch text in case error
      let loginData = {};

      try {
        loginData = JSON.parse(loginText);
      } catch {
        // ignore JSON parse errors
      }

      if (!loginResponse.ok) {
        if (loginResponse.status === 403) {
          if (loginText.toLowerCase().includes('blocked')) {
            setError('Your account is blocked. Please contact help.');
          } else {
            setError(loginText);
          }
          setLoading(false);
          return;
        }

        if (loginResponse.status === 401) {
          setError("Invalid credentials. Please check your phone number or password.");
          setLoading(false);
          return;
        }

        throw new Error(`Login Failed: ${loginText || loginResponse.statusText}`);
      }

      // Step 3: Login success
      if (loginData.success) {
        setFailedAttempts(0);
        localStorage.setItem('authToken', loginData.customToken);

        const userDataWithTimestamp = {
          ...loginData.userData,
          loginTimestamp: new Date().toISOString(),
          userids: {
            myuserid: loginData.userData.userids?.myuserid || '',
            myrefrelid: loginData.userData.userids?.myrefrelid || ''
          }
        };

        localStorage.setItem('userData', JSON.stringify(userDataWithTimestamp));
        setPhoneNo('');
        setPassword('');

        navigate("/home", {
          state: {
            welcomeMessage: `Welcome back, ${loginData.userData.name}!`
          }
        });
      } else {
        setError(loginData.message || 'Login failed. Please verify your credentials.');
      }

    } catch (error) {
      console.error('Login process error:', error);

      if (error.message.includes('Network')) {
        setError('Network error. Please check your internet connection.');
      } else if (error.message.includes('Failed')) {
        setError(error.message);
      } else {
        setError('User not found. Please sign up and try again.');
      }

    } finally {
      setLoading(false);
    }
  };




  const goToHelp = () => {
    navigate("/help");
  };

  const handlePhoneNoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNo(value);
  };

  // Quick Links Component
  const QuickLinksComponent = ({ className = "" }) => (
    <div className={`links-container ${className}`}>
      <div className="links-header">Quick Links</div>

      <div className="nav-links">
        <button onClick={handleDownloadAPK} className="nav-link download-apk-link">
          <span className="link-icon">📱</span>
          <span className="link-text">Download Android App</span>
        </button>
        <Link to="/statuscheck" className="nav-link">
          <span className="link-icon">📊</span>
          <span className="link-text">Check account status</span>
        </Link>
        <Link to="/howtoplay" className="nav-link">
          <span className="link-icon">📽️</span>
          <span className="link-text">How To Play</span>
        </Link>
        <Link to="/terms&conditions" className="nav-link">
          <span className="link-icon">📋</span>
          <span className="link-text">Terms & Conditions</span>
        </Link>
        <Link to="/kycpolicy" className="nav-link">
          <span className="link-icon">🔒</span>
          <span className="link-text">KYC Policy</span>
        </Link>
        <Link to="/privacypolicy" className="nav-link">
          <span className="link-icon">🛡️</span>
          <span className="link-text">Privacy Policy</span>
        </Link>
        <Link to="/about" className="nav-link">
          <span className="link-icon">ℹ️</span>
          <span className="link-text">About Us</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="login-container">
      <style jsx>{`
       * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
  background-attachment: fixed;
  background-repeat: no-repeat;
}

body {
  min-height: 100vh;
  padding: 10px 0;
}

.login-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 15px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Logo Section - Top Left, Smaller */
.logo-section {
  position: relative;
  top: -5px;
  z-index: 100;
  right:550px
}

.company-logo {
  width: 140px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(66, 165, 245, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.company-logo:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(66, 165, 245, 0.4);
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-text {
  color: white;
  font-size: 1rem;
  font-weight: 900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.company-header {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, #1a2a44 0%, #42a5f5 50%, #2a5298 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 5px;
  animation: fadeIn 0.8s ease-out;
  line-height: 1.2;
}

.company-brand {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #42a5f5 0%, #2a5298 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: brandGlow 2s ease-in-out infinite alternate;
  line-height: 1.1;
  margin-top: -5px;
}

@keyframes brandGlow {
  from {
    filter: drop-shadow(0 0 10px rgba(66, 165, 245, 0.3));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(66, 165, 245, 0.6));
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.help-icon-container {
  position: fixed;
  bottom: 30px;
  right: 10px;
  z-index: 1000;
}

.help-icon {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc02 100%);
  border: 3px solid #ffffff;
  border-radius: 50px;
  padding: 14px 22px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 204, 2, 0.3);
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 204, 2, 0.3);
  }
  50% {
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6), 0 0 30px rgba(255, 204, 2, 0.5);
  }
  100% {
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 204, 2, 0.3);
  }
}

.help-icon:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 12px 35px rgba(255, 107, 53, 0.5), 0 0 35px rgba(255, 204, 2, 0.4);
  background: linear-gradient(135deg, #e55a2b 0%, #e8851a 50%, #f0b90b 100%);
  animation: none;
}

.help-icon:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.3), 0 8px 25px rgba(255, 107, 53, 0.4);
}

.help-icon-text {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-icon svg {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Main Content - Flipped Layout */
.main-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 120px;
  align-items: flex-start;
}

/* Links Container - Enhanced with attractive colors */
.links-container {
  flex: 1;
  max-width: 450px;
  background: linear-gradient(145deg, rgba(26, 42, 68, 0.95) 0%, rgba(42, 82, 152, 0.9) 100%);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 
              0 0 30px rgba(66, 165, 245, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(66, 165, 245, 0.2);
  padding: 35px 30px;
  height: fit-content;
  position: relative;
  overflow: hidden;
}

.links-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    #42a5f5 0%, 
    #ff6b35 25%, 
    #ffcc02 50%, 
    #4caf50 75%, 
    #42a5f5 100%);
  border-radius: 24px 24px 0 0;
  animation: shimmerTop 3s ease-in-out infinite;
}

@keyframes shimmerTop {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.links-container.mobile-links {
  display: none;
}

.links-header {
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #ffffff 0%, #add8e6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  letter-spacing: 1px;
}

.links-header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #42a5f5, #ff6b35);
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(66, 165, 245, 0.4);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Enhanced styling for all nav links with attractive colors */
.nav-link, .check-status-link {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(145deg, 
    rgba(52, 73, 94, 0.8) 0%, 
    rgba(44, 62, 80, 0.9) 100%);
  border: 2px solid transparent;
  border-radius: 16px;
  color: #ecf0f1 !important;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  gap: 15px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  justify-content: flex-start;
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-link:visited, .check-status-link:visited,
.nav-link:visited .link-text, .check-status-link:visited .status-text {
  color: #ecf0f1 !important;
}


/* Individual color themes for each link */
.nav-link:nth-child(1) { /* Terms & Conditions */
  border-image: linear-gradient(45deg, #42a5f5, #2196f3) 1;
  border-style: solid;
}

.nav-link:nth-child(1):hover {
  background: linear-gradient(145deg, rgba(66, 165, 245, 0.15), rgba(33, 150, 243, 0.2));
  border-color: #42a5f5;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(66, 165, 245, 0.3);
}

.nav-link:nth-child(2) { /* KYC Policy */  
  border-image: linear-gradient(45deg, #4caf50, #2e7d32) 1;
  border-style: solid;
}

.nav-link:nth-child(2):hover {
  background: linear-gradient(145deg, rgba(76, 175, 80, 0.15), rgba(46, 125, 50, 0.2));
  border-color: #4caf50;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.nav-link:nth-child(3) { /* Privacy Policy */
  border-image: linear-gradient(45deg, #ff9800, #f57c00) 1;
  border-style: solid;
}

.nav-link:nth-child(3):hover {
  background: linear-gradient(145deg, rgba(255, 152, 0, 0.15), rgba(245, 124, 0, 0.2));
  border-color: #ff9800;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
}

.nav-link:nth-child(4) { /* About Us */
  border-image: linear-gradient(45deg, #e91e63, #c2185b) 1;
  border-style: solid;
}

.nav-link:nth-child(4):hover {
  background: linear-gradient(145deg, rgba(233, 30, 99, 0.15), rgba(194, 24, 91, 0.2));
  border-color: #e91e63;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
}

.nav-link:nth-child(5), .check-status-link { /* Check Status */
  border-image: linear-gradient(45deg, #9c27b0, #7b1fa2) 1;
  border-style: solid;
}

.nav-link:nth-child(5):hover, .check-status-link:hover {
  background: linear-gradient(145deg, rgba(156, 39, 176, 0.15), rgba(123, 31, 162, 0.2));
  border-color: #9c27b0;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.3);
}

/* Hover effects for all links */
.nav-link:hover, .check-status-link:hover {
  transform: translateX(8px) translateY(-2px);
  backdrop-filter: blur(15px);
}

/* Enhanced icon styling with color coordination */
.link-icon, .status-icon {
  font-size: 1.4rem;
  opacity: 0.9;
  transition: all 0.4s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-link:hover .link-icon, .check-status-link:hover .status-icon {
  opacity: 1;
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
}

/* Text styling */
.link-text, .status-text {
  flex: 1;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Glowing effect animation */
.nav-link::before, .check-status-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  transition: left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.nav-link:hover::before, .check-status-link:hover::before {
  left: 100%;
}

/* Active state for better UX */
.nav-link:active, .check-status-link:active {
  transform: translateX(6px) translateY(-1px) scale(0.98);
}

/* Focus states for accessibility */
.nav-link:focus, .check-status-link:focus {
  outline: 3px solid rgba(66, 165, 245, 0.5);
  outline-offset: 2px;
}

/* Additional visual enhancements */
.nav-link::after, .check-status-link::after {
  content: '→';
  position: absolute;
  right: 20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: inherit;
  font-weight: bold;
  font-size: 1.2rem;
}

.nav-link:hover::after, .check-status-link:hover::after {
  opacity: 0.7;
  transform: translateX(0);
}

/* Additional animations for better user experience */
@keyframes linkPulse {
  0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
  50% { box-shadow: 0 6px 20px rgba(66, 165, 245, 0.2); }
  100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
}

.nav-link, .check-status-link {
  animation: linkPulse 4s ease-in-out infinite;
  animation-delay: calc(var(--delay, 0) * 0.2s);
}

.nav-link:nth-child(1) { --delay: 1; }
.nav-link:nth-child(2) { --delay: 2; }
.nav-link:nth-child(3) { --delay: 3; }
.nav-link:nth-child(4) { --delay: 4; }
.nav-link:nth-child(5) { --delay: 5; }

/* Form Section - Now on the right */
.form-section {
  flex: 1;
  max-width: 420px;
}

.login-card {
  background: rgba(26, 42, 68, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #42a5f5 0%, #2a5298 100%);
  padding: 20px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header-title {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-top: 6px;
  position: relative;
  z-index: 1;
}

.card-body {
  padding: 25px 30px;
  background: #1a2a44;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  color: #ecf0f1;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  background: rgba(52, 73, 94, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.form-control:focus {
  outline: none;
  border-color: #42a5f5;
  box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.1);
  background: rgba(52, 73, 94, 1);
  color: #fff;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
  opacity: 1;
}

.form-control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(52, 73, 94, 0.5);
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  // background: rgba(248, 249, 250, 0.9);
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.password-toggle i {
  font-size: 1.1rem;
  color:black;
}

.alert {
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 15px;
  border: none;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-danger {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.alert-danger::before {
  content: '⚠';
  font-size: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #42a5f5 0%, #2a5298 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(66, 165, 245, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 165, 245, 0.4);
}

.btn-primary:disabled {
  background: rgba(108, 117, 125, 0.6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.forgot-password-link {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #42a5f5;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #add8e6;
  text-decoration: underline;
}

.card-footer {
  background: rgba(42, 82, 152, 0.3);
  padding: 18px 30px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-footer p {
  margin: 0;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.card-footer a {
  color: #42a5f5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.card-footer a:hover {
  color: #add8e6;
  text-decoration: underline;
}

/* Footer */
.footer {
  width: 100%;
  text-align: center;
  margin-top: 30px;
  padding: 15px;
  background: rgba(26, 42, 68, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-text {
  color: #bdc3c7;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .logo-section {
    top: -15px;
    left: 10px;
    position: absolute;
  }
  
  .company-logo {
    width: 120px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .company-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-width: 120px;
    max-height: 40px;
  }
  
  .header-section {
    margin-top: 60px;
    margin-bottom: 15px;
    padding: 10px;
  }
  
  .company-header {
    font-size: 1.8rem;
  }
  
  .company-brand {
    font-size: 2.4rem;
  }
  
  .help-icon-container {
    bottom: 20px;
    right: 20px;
  }
  
  .help-icon {
    padding: 12px 18px;
    font-size: 14px;
  }
  
  .help-icon svg {
    font-size: 18px;
  }
  
  .main-content {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  
  /* Hide desktop quick links on mobile */
  .links-container:not(.mobile-links) {
    display: none;
  }
  
  /* Show mobile quick links with enhanced styling */
  .links-container.mobile-links {
    display: block;
    margin-top: 25px;
    padding: 25px 20px;
  }
  
  .links-header {
    font-size: 1.4rem;
    margin-bottom: 25px;
  }
  
  .nav-links {
    gap: 15px;
  }
  
  .nav-link, .check-status-link {
    padding: 14px 18px;
    font-size: 0.95rem;
  }
  
  .link-icon, .status-icon {
    font-size: 1.2rem;
  }
  
  .form-section, .links-container {
    max-width: 100%;
    width: 100%;
  }
  
  .card-body, .links-container {
    padding: 20px;
  }
  
  .card-header {
    padding: 18px 20px;
  }
  
  .header-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .logo-section {
    top: 15px;
    right: 15px;
  }
  
  .company-logo {
    width: 100px;
    height: 35px;
  }
  
  .company-logo img {
    max-width: 100px;
    max-height: 35px;
  }
  
  .logo-text {
    font-size: 0.8rem;
  }
  
  .header-section {
    margin-top: 60px;
  }
  
  .company-header {
    font-size: 1.6rem;
  }
  
  .company-brand {
    font-size: 2.2rem;
  }
  
  .help-icon {
    padding: 10px 14px;
    font-size: 13px;
    gap: 8px;
  }
  
  .help-icon svg {
    font-size: 16px;
  }
  
  .links-container.mobile-links {
    padding: 20px 15px;
  }
  
  .links-header {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .nav-links {
    gap: 12px;
  }
  
  .nav-link, .check-status-link {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
  
  .link-icon, .status-icon {
    font-size: 1.1rem;
  }
  
  .nav-link:hover, .check-status-link:hover {
    transform: translateX(5px) translateY(-1px);
  }
  
  .card-body {
    padding: 18px 15px;
  }
  
  .card-header {
    padding: 15px 20px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.8rem;
  }
  
  .form-control {
    padding: 12px 14px;
    font-size: 0.95rem;
  }
  
  .btn-primary {
    padding: 12px;
    font-size: 0.95rem;
  }
  
  .form-label {
    font-size: 0.85rem;
  }
  
  .footer {
    margin-top: 20px;
    padding: 12px;
  }
  
  .footer-text {
    font-size: 0.8rem;
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(66, 165, 245, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(66, 165, 245, 0.6);
  }
}

.login-card {
  animation: float 6s ease-in-out infinite;
}

/* Enhanced focus states for better accessibility */
.form-control:focus,
.btn-primary:focus,
.nav-link:focus,
.check-status-link:focus {
  outline: 3px solid rgba(66, 165, 245, 0.5);
  outline-offset: 2px;
}

/* Loading state enhancements */
.loading .btn-primary {
  background: linear-gradient(135deg, rgba(66, 165, 245, 0.7) 0%, rgba(42, 82, 152, 0.7) 100%);
  cursor: not-allowed;
}

.loading .form-control {
  pointer-events: none;
  opacity: 0.7;
}

/* Additional visual enhancements for premium look */
.login-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(66, 165, 245, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects for better user feedback */
.nav-link:hover .link-text,
.check-status-link:hover .status-text {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

/* Additional mobile optimizations */
@media (max-width: 360px) {
  .company-header {
    font-size: 1.4rem;
  }
  
  .company-brand {
    font-size: 2rem;
  }
  
  .login-container {
    padding: 5px;
  }
  
  .links-container.mobile-links {
    padding: 15px 10px;
  }
  
  .nav-link, .check-status-link {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .card-body {
    padding: 15px 12px;
  }
  
  .form-control {
    padding: 10px 12px;
  }
  
  .btn-primary {
    padding: 10px;
  }
}

/* Print styles */
@media print {
  .help-icon-container,
  .links-container,
  .card-footer {
    display: none;
  }
  
  .login-container {
    background: white;
    color: black;
  }
  
  .login-card {
    background: white;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
      `}</style>
      {/* Logo Section */}
      <div className="logo-section">
        <div className="company-logo">
          <img src={logo} alt='logo' />
        </div>
      </div>

      {/* Help Icon */}
      <div className="help-icon-container">
        <button className="help-icon" onClick={goToHelp}>
          <FaQuestionCircle />
          <span className="help-icon-text">Help</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Quick Links Section - Left Side */}
        <QuickLinksComponent />

        {/* Form Section - Right Side */}
        <div className="form-section">
          <div className="login-card">
            <div className="card-header">
              <h3 className="header-title">Welcome Back</h3>
              <p className="header-subtitle">NADAKATTI ENTERPRISES PRESENTS NAPHEX</p>
              <p className="header-subtitle">Contact: +91 7892739656 (WhatsApp)</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="phoneNo" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNo"
                    className="form-control"
                    placeholder="Enter your 10-digit phone number"
                    value={phoneNo}
                    onChange={handlePhoneNoChange}
                    disabled={loading}
                    maxLength="10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading && <div className="spinner-border"></div>}
                  {loading ? 'Logging In...' : 'Log In'}
                </button>

                <Link to="/forgotpassword" className="forgot-password-link">
                  Forgot your password?
                </Link>
              </form>
            </div>

            <div className="card-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup">Sign up here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Links */}
      <QuickLinksComponent className="mobile-links" />

      {/* Footer */}
      <div className="footer">
        <p className="footer-text">
          © 2025/2026 NADAKATTI ENTERPRISES. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;