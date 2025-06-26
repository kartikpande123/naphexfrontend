import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import "./Forgetpassword.css";
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

  // Styles
  const styles = {
    input: {
      backgroundColor: '#2C3E50',
      color: '#ECF0F1',
    },
    card: {
      backgroundColor: '#1a2a44',
      color: '#ECF0F1'
    },
    cardHeader: {
      backgroundColor: '#2a5298',
      color: '#FFF'
    },
    button: {
      backgroundColor: '#0d6efd',
      border: 'none',
      color: '#fff',
      width: '100%',
      fontWeight: 'bold'
    }
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
            opacity: 1;
          }

          .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .password-requirements {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 0.25rem;
          }

          .requirement-met {
            color: #2ecc71;
            font-weight: bold;
            margin-left: 5px;
          }

          .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #c0392b;
          }

          .form-label {
            color: #fff;
          }

          .resend-timer {
            color: #fff;
            opacity: 0.8;
            font-size: 0.875rem;
          }

          .resend-button {
            color: #0d6efd;
            background: none;
            border: none;
            padding: 0;
            font-size: 0.875rem;
            cursor: pointer;
          }

          .resend-button:disabled {
            color: #6c757d;
            cursor: not-allowed;
            opacity: 0.6;
          }
        `}
      </style>

      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg" style={styles.card}>
            <div className="card-header text-center" style={styles.cardHeader}>
              <h3>Reset Password</h3>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Phone Input */}
                {step >= 1 && (
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      style={styles.input}
                      disabled={step !== 1}
                      maxLength="10"
                    />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                )}

                {/* OTP Input */}
                {step >= 2 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <label htmlFor="otp" className="form-label">OTP</label>
                      {otpTimer > 0 ? (
                        <span className="resend-timer">Resend in {otpTimer}s</span>
                      ) : (
                        <button 
                          type="button" 
                          className="resend-button"
                          onClick={handleSendOtp}
                          disabled={!canResendOtp || isLoading}
                        >
                          Resend OTP
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
                      placeholder="Enter 6-digit OTP"
                      style={styles.input}
                      maxLength="6"
                    />
                    {errors.otp && <div className="error-message">{errors.otp}</div>}
                  </div>
                )}

                {/* Password Inputs */}
                {step >= 3 && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">New Password</label>
                      <div className="input-group">
                        <input
                          type={passwordVisibility.password ? 'text' : 'password'}
                          className="form-control"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          style={styles.input}
                        />
                        <span
                          className="input-group-text"
                          onClick={() => togglePasswordVisibility('password')}
                          style={{ cursor: 'pointer' }}
                        >
                          <i className={`bi ${passwordVisibility.password ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </span>
                      </div>
                      <div className="password-requirements">
                        Password must contain:
                        <ul className="mb-0 ps-3">
                          <li>
                            At least 8 characters 
                            {passwordRequirements.minLength && <span className="requirement-met">✅</span>}
                          </li>
                          <li>
                            At least 1 number 
                            {passwordRequirements.hasNumber && <span className="requirement-met">✅</span>}
                          </li>
                          <li>
                            At least 1 special character 
                            {passwordRequirements.hasSpecialChar && <span className="requirement-met">✅</span>}
                          </li>
                        </ul>
                      </div>
                      {errors.password && (
                        <div className="error-message">
                          {Array.isArray(errors.password) ? (
                            <ul className="mb-0 ps-3">
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

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <input
                          type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          style={styles.input}
                        />
                        <span
                          className="input-group-text"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          style={{ cursor: 'pointer' }}
                        >
                          <i className={`bi ${passwordVisibility.confirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </span>
                      </div>
                      {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={isLoading}
                  style={styles.button}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;