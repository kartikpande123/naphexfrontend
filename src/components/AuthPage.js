import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import image from "../images/promo1.jpg";
import { FaUserShield } from "react-icons/fa";
import API_BASE_URL from './ApiConfig';

const AuthPage = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0); // Counter for failed attempts


  const navigate = useNavigate();



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

    // Check if the user has exceeded the maximum number of failed attempts
    if (failedAttempts >= 10) {
      setError('You have exceeded the maximum number of login attempts. Please reset your password.');
      navigate('/forgotpassword');
      return;
    }

    // Input validation
    if (!validateInputs()) return;

    setLoading(true);
    setError('');

    try {
      // Password test request
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

      // Handle network or server errors during password test
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

      // Strict password validation
      if (!testData.success || !testData.passwordMatches) {
        setFailedAttempts(failedAttempts + 1);
        setError(`Invalid phone number or password. Attempts remaining: ${10 - failedAttempts}`);
        setLoading(false);
        return;
      }

      // Login request
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

      // Handle network or server errors during login
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login Failed: ${errorText || loginResponse.statusText}`);
      }

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

      // Comprehensive login success handling
      if (loginData.success) {
        // Reset failed attempts counter on successful login
        setFailedAttempts(0);

        // Secure token storage
        localStorage.setItem('authToken', loginData.customToken);

        // Enhanced user data storage with timestamp and proper userIds
        const userDataWithTimestamp = {
          ...loginData.userData,
          loginTimestamp: new Date().toISOString(),
          userids: {
            myuserid: loginData.userData.userids?.myuserid || '',
            myrefrelid: loginData.userData.userids?.myrefrelid || ''
          }
        };
        localStorage.setItem('userData', JSON.stringify(userDataWithTimestamp));

        // Form and state reset
        setPhoneNo('');
        setPassword('');

        // Navigation with optional state passing
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
  const goToAdminLogin = () => {
    navigate("/adminlogin");
  };

  const handlePhoneNoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNo(value);
  };

  const inputStyle = {
    backgroundColor: '#1a2a44',
    color: '#ecf0f1',
  };

  return (
    <div className="container mt-5">
      <style>
        {`
          body, html {
            height: 100%;
            margin: 0;
          }

          body {
            background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
          }

          .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .ad-container {
            width: 60%;
          }

          .ad-image {
            width: 90%;
            height: 50%;
            object-fit: cover;
            border-radius: 8px;
          }

          .form-container {
            flex: 1;
            max-width: 420px;
            margin: 0 auto;
          }

          .data-safety {
            background-color: rgba(26, 42, 68, 0.9);
            border-radius: 8px;
            padding: 2rem;
            height: fit-content;
          }

          .card {
            background-color: #1a2a44;
            color: #ecf0f1;
            border: 2px solid #3a506b;
          }

          .card-header, .card-footer {
            background-color: #2a5298;
            color: #fff;
          }

          .btn {
            width: 100%;
            background-color: #0d6efd;
            color: #fff;
            border: none;
            transition: background-color 0.3s ease;
          }

          .btn:hover {
            background-color: #0b5ed7;
          }

          .btn:focus {
            outline: none;
            box-shadow: 0 0 8px #3a506b;
          }

          .btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }

          .loading-spinner {
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
            animation: spin 1s linear infinite;
          }
          .form-label{
            color:#fff
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .row {
            display: flex;
            gap: 20px;
          }

          .text-white:hover {
            color: #add8e6 !important;
          }

          .bottom-image {
            display: none;
            width: 100%;
            margin-top: 20px;
            border-radius: 8px;
          }

          @media (max-width: 576px) {
            .bottom-image {
              display: block;
            }

            .ad-container {
              display: none;
            }

            .adminlogo{
              display: none;
            }

            .form-container {
              flex: 1;
              max-width: 100%;
            }

            .card {
              padding: 1rem;
            }

            .card-header h3 {
              font-size: 1.5rem;
            }

            .card-body {
              padding: 1rem;
            }

            .btn {
              font-size: 1rem;
            }
            
          }
        `}
      </style>
      <div className="row align-items-start flex align-items-center">
        <div className="col-lg-4 ad-container">
          <img src={image} alt="Promoted Ad" className="ad-image" />
        </div>
        <div className="col-lg-8 form-container">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header text-center">
              <h3>Welcome Back!</h3>
              <p className="text-white-50">Please log in to your account</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="mb-3">
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
                    style={inputStyle}
                    disabled={loading}
                    maxLength={10}
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={inputStyle}
                    disabled={loading}
                    minLength={6}
                  />
                  <span
                    className="position-absolute"
                    style={{
                      top: "72%",
                      right: "2px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "1.3rem",
                      color: "black",
                      backgroundColor: "#fff",
                      width: "40px",
                      textAlign: "center"
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <i className="bi-eye-slash"></i> : <i className="bi-eye"></i>}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={loading || !phoneNo || !password}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
                <div className="mt-3 text-center">
                  <Link to="/forgotpassword" className="text-white">Forgot Password?</Link>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <p className="mb-0">Don't have an account? <Link to="/signup" className="text-white">Sign Up</Link></p>
            </div>
          </div>
          <img src={image} alt="Bottom Promo" className="bottom-image" />
        </div>
      </div>
      <button
        onClick={goToAdminLogin}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#007bff",
          fontSize: "44px",
          display: "flex",
          justifyContent: "flex-start"
        }}
        aria-label="Go to Admin Dashboard"
        className='adminlogo'
      >
        <FaUserShield className='adminlogo' /> {/* Admin icon */}
      </button>
    </div>
  );
};

export default AuthPage;