import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from './ApiConfig';

const ForgotPassword = () => {
  // State management
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const navigate = useNavigate();

  // OTP Timer Effect
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResendOtp(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpTimer]);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Special handling for phone and OTP - numbers only
    if (name === 'phone' || name === 'otp') {
      processedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Validate password requirements if password field changes
    if (name === 'password') {
      validatePassword(processedValue);
    }
  };

  // Password validation
  const validatePassword = (password) => {
    const newRequirements = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordRequirements(newRequirements);

    const errors = [];
    if (!newRequirements.minLength) errors.push("Password must be at least 8 characters long");
    if (!newRequirements.hasNumber) errors.push("Password must contain at least one number");
    if (!newRequirements.hasSpecialChar) errors.push("Password must contain at least one special character");

    return errors;
  };

  // API handlers
  const handleSendOtp = async () => {
    if (!canResendOtp && otpTimer > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        phoneNo: formData.phone
      });

      if (response.data.success) {
        toast.success('OTP sent successfully');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
        if (step === 1) {
          setStep(2);
        }
        // For development only - remove in production
        localStorage.setItem('debug_otp', response.data.debug.otp);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setErrors({
        phone: error.response?.data?.message || 'Failed to send OTP'
      });
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      // For development - using stored OTP
      const storedOtp = localStorage.getItem('debug_otp');
      if (formData.otp !== storedOtp) {
        throw new Error('Invalid OTP');
      }
      setStep(3);
      toast.success('OTP verified successfully');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrors({
        otp: error.message || 'Invalid OTP'
      });
      toast.error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
        const response = await axios.post(`${API_BASE_URL}/reset-password`, {
            phoneNo: formData.phone,
            newPassword: formData.password
        });

        if (response.data.success) {
            toast.success('Password reset successful');
            
            // Display additional confirmation toast (if desired)
            toast.success('Your password has been reset. Redirecting to login page...');
            
            // Navigate to login page after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    } catch (error) {
        console.error('Reset password error:', error);
        setErrors({
            api: error.response?.data?.message || 'Failed to reset password'
        });
        toast.error('Failed to reset password');
    } finally {
        setIsLoading(false);
    }
};

  // Form submission handler
  const handleNext = async () => {
    setErrors({});

    if (step === 1) {
      if (formData.phone.length !== 10) {
        setErrors({ phone: "Please enter a valid 10-digit phone number" });
        return;
      }
      await handleSendOtp();
    } else if (step === 2) {
      if (formData.otp.length !== 6) {
        setErrors({ otp: "Please enter a valid 6-digit OTP" });
        return;
      }
      await handleVerifyOtp();
    } else if (step === 3) {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        setErrors({ password: passwordErrors });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }
      await handleResetPassword();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <>
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
          padding: 20px 0;
        }

        .forgot-password-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          letter-spacing: 2px;
          background: linear-gradient(to right, #ffffff, #e0f7fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          margin-bottom: 20px;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .forgot-password-card {
          background: rgba(26, 42, 68, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-header {
          background: linear-gradient(135deg, #42a5f5 0%, #2a5298 100%);
          padding: 30px;
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
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 1;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          margin-top: 8px;
          position: relative;
          z-index: 1;
        }

        .card-body {
          padding: 40px 30px;
          background: #1a2a44;
        }

        .form-section {
          margin-bottom: 30px;
        }

        .section-title {
          color: #42a5f5;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-left: 10px;
          border-left: 3px solid #42a5f5;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
          color: #ecf0f1;
        }

        .form-label {
          color: #ecf0f1;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
          font-size: 0.9rem;
        }

        .form-control {
          width: 100%;
          padding: 14px 16px;
          background: rgba(52, 73, 94, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
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
          color: #ecf0f1;
        }

        .form-control::placeholder {
          color: #ffffff;
          opacity: 0.8;
        }

        .form-control:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          color: rgb(1, 14, 17);
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: stretch;
        }

        .input-group .form-control {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: none;
        }

        .input-group .btn {
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-left: none;
          background: rgba(248, 249, 250, 0.9);
          border-radius: 0 10px 10px 0;
          padding: 0 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-group .btn:hover {
          background: rgba(233, 236, 239, 1);
          border-color: #42a5f5;
        }

        .input-group .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.1);
        }

        .input-group .btn i {
          font-size: 1.1rem;
          color: #6c757d;
        }

        .input-group .btn:hover i {
          color: #495057;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 6px;
          padding-left: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .error-message::before {
          content: '⚠';
          font-size: 0.9rem;
        }

        .password-requirements {
          background: rgba(52, 73, 94, 0.5);
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .password-requirements-title {
          color: #ecf0f1;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .requirement-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(236, 240, 241, 0.7);
          margin-bottom: 4px;
        }

        .requirement-item.met {
          color: #2ecc71;
        }

        .requirement-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          border: 1px solid currentColor;
        }

        .requirement-icon.met {
          background: #2ecc71;
          border-color: #2ecc71;
          color: white;
        }

        .otp-section {
          background: rgba(66, 165, 245, 0.05);
          border: 1px solid rgba(66, 165, 245, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .otp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .resend-timer {
          color: #ecf0f1;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .resend-button {
          background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(66, 165, 245, 0.3);
        }

        .resend-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(66, 165, 245, 0.4);
          background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%);
        }

        .resend-button:disabled {
          background: rgba(108, 117, 125, 0.6);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-primary {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #42a5f5 0%, #2a5298 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
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

        @media (max-width: 768px) {
          .forgot-password-container {
            padding: 0 15px;
          }
          
          .card-body {
            padding: 30px 20px;
          }
          
          .card-header {
            padding: 25px 20px;
          }
          
          .header-title {
            font-size: 1.75rem;
          }
        }
      `}</style>

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="card-header">
            <h1 className="header-title">Reset Password</h1>
            <p className="header-subtitle">Recover your account access</p>
          </div>
          
          <div className="card-body">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Phone Input Section */}
              {step >= 1 && (
                <div className="form-section">
                  <h3 className="section-title">Phone Verification</h3>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your registered phone number"
                      disabled={step !== 1}
                      maxLength="10"
                    />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                </div>
              )}

              {/* OTP Input Section */}
              {step >= 2 && (
                <div className="form-section">
                  <div className="otp-section">
                    <h3 className="section-title" style={{ color: '#42a5f5', marginBottom: '15px' }}>
                      OTP Verification
                    </h3>
                    
                    <div className="form-group">
                      <div className="otp-header">
                        <label htmlFor="otp" className="form-label">Enter OTP</label>
                        {otpTimer > 0 ? (
                          <span className="resend-timer">Resend in {otpTimer}s</span>
                        ) : (
                          <button 
                            type="button" 
                            className="resend-button"
                            onClick={handleSendOtp}
                            disabled={!canResendOtp || isLoading}
                          >
                            🔄 Resend OTP
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP sent to your phone"
                        maxLength="6"
                        style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }}
                      />
                      {errors.otp && <div className="error-message">{errors.otp}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Reset Section */}
              {step >= 3 && (
                <div className="form-section">
                  <h3 className="section-title">New Password Setup</h3>
                  
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <div className="input-group">
                      <input
                        type={passwordVisibility.password ? 'text' : 'password'}
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        <i className={`bi ${passwordVisibility.password ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    
                    <div className="password-requirements">
                      <div className="password-requirements-title">Password Requirements:</div>
                      <ul className="requirements-list">
                        <li className={`requirement-item ${passwordRequirements.minLength ? 'met' : ''}`}>
                          <span className={`requirement-icon ${passwordRequirements.minLength ? 'met' : ''}`}>
                            {passwordRequirements.minLength ? '✓' : '○'}
                          </span>
                          At least 8 characters long
                        </li>
                        <li className={`requirement-item ${passwordRequirements.hasNumber ? 'met' : ''}`}>
                          <span className={`requirement-icon ${passwordRequirements.hasNumber ? 'met' : ''}`}>
                            {passwordRequirements.hasNumber ? '✓' : '○'}
                          </span>
                          At least one number
                        </li>
                        <li className={`requirement-item ${passwordRequirements.hasSpecialChar ? 'met' : ''}`}>
                          <span className={`requirement-icon ${passwordRequirements.hasSpecialChar ? 'met' : ''}`}>
                            {passwordRequirements.hasSpecialChar ? '✓' : '○'}
                          </span>
                          At least one special character
                        </li>
                      </ul>
                    </div>
                    
                    {errors.password && (
                      <div className="error-message">
                        {Array.isArray(errors.password) ? (
                          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                            {errors.password.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        ) : (
                          errors.password
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <input
                        type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Re-enter your new password"
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        <i className={`bi ${passwordVisibility.confirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: '30px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                  )}
                  {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;