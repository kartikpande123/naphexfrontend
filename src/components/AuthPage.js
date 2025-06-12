import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import image from "../images/promo1.jpg";
import image2 from "../images/img2.jpeg";
import { FaQuestionCircle } from "react-icons/fa";
import API_BASE_URL from './ApiConfig';

const AuthPage = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secretCode, setSecretCode] = useState('');

  const navigate = useNavigate();

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
      const testResponse = await fetch(`${API_BASE_URL}/test-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNo,
          password,
        }),
      });

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        if (testResponse.status === 404 || errorText.includes("User not found")) {
          throw new Error("User not found. Please check your credentials.");
        } else {
          throw new Error("An unexpected error occurred. Please try again.");
        }
      }

      const testData = await testResponse.json();
      console.log('Password test response:', testData);

      if (!testData.success || !testData.passwordMatches) {
        setFailedAttempts(failedAttempts + 1);
        setError(`Invalid phone number or password. Attempts remaining: ${10 - failedAttempts}`);
        setLoading(false);
        return;
      }

      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNo,
          password,
        }),
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login Failed: ${errorText || loginResponse.statusText}`);
      }

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

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
        setError('User not found, Please Signin and continue.');
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

  return (
    <div className="login-container">
      <style>
        {`
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
            padding: 20px 0;
          }

          .login-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
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

          .main-content {
            display: flex;
            width: 100%;
            gap: 40px;
            align-items: center;
          }

          .ad-section {
            flex: 1;
            width: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .ad-image {
            width: 100%;
            max-width: 500px;
            height: auto;
            max-height: 500px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          }

          .form-section {
            flex: 1;
            width: 50%;
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
            background: rgba(248, 249, 250, 0.9);
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

          .password-toggle:hover {
            background: rgba(233, 236, 239, 1);
          }

          .password-toggle:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.3);
          }

          .password-toggle i {
            font-size: 1.1rem;
            color: #6c757d;
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

          .bottom-image {
            display: none;
            width: 100%;
            margin-top: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          @media (max-width: 992px) {
            .main-content {
              gap: 20px;
            }
            
            .ad-section {
              width: 45%;
            }
            
            .form-section {
              width: 55%;
            }
          }

          @media (max-width: 768px) {
            .login-container {
              padding: 15px;
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
            }

            .ad-section {
              display: none;
            }

            .bottom-image {
              display: block;
            }

            .form-section {
              max-width: 100%;
              width: 100%;
            }

            .card-body {
              padding: 20px 20px;
            }

            .card-header {
              padding: 18px 20px;
            }

            .header-title {
              font-size: 1.6rem;
            }
          }

          @media (max-width: 480px) {
            .help-icon {
              padding: 10px 14px;
              font-size: 13px;
              gap: 8px;
            }

            .help-icon svg {
              font-size: 16px;
            }

            .card-body {
              padding: 18px 15px;
            }

            .form-control {
              padding: 12px 14px;
            }

            .header-title {
              font-size: 1.4rem;
            }
          }
        `}
      </style>

      {/* Help Icon - Fixed Position Bottom Right */}
      <div className="help-icon-container">
        <button
          onClick={goToHelp}
          className="help-icon"
          aria-label="Go to Help Section"
          title="Help & Support"
        >
          <FaQuestionCircle />
          <span className="help-icon-text">Help</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Advertisement Section */}
        <div className="ad-section">
          <img src={image2} alt="Promoted Ad" className="ad-image" />
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="login-card">
            <div className="card-header">
              <h1 className="header-title">Welcome Back!</h1>
              <p className="header-subtitle">Please log in to your account</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="phoneNo" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNo"
                    value={phoneNo}
                    onChange={handlePhoneNoChange}
                    required
                    placeholder="Enter your 10-digit phone number"
                    disabled={loading}
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <i className="bi-eye-slash"></i> : <i className="bi-eye"></i>}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !phoneNo || !password}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                <Link to="/forgotpassword" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </form>
            </div>

            <div className="card-footer">
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
          </div>

          {/* Bottom Image for Mobile */}
          <img src={image} alt="Bottom Promo" className="bottom-image" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;