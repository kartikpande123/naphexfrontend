import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SignupPage.css";

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralId, setReferralId] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const INDIAN_STATES = [
    'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Punjab',
    'Rajasthan', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const navigate = useNavigate();

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('signupData'));
    if (storedData) {
      setEmail(storedData.email || '');
      setPhone(storedData.phone || '');
      setPassword(storedData.password || '');
      setConfirmPassword(storedData.confirmPassword || '');
      setDisplayName(storedData.displayName || '');
      setReferralId(storedData.referralId || '');
    }
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    const newRequirements = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(newRequirements);

    if (!newRequirements.minLength) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!newRequirements.hasNumber) {
      errors.push("Password must contain at least one number");
    }
    if (!newRequirements.hasSpecialChar) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validatePhoneNumber(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid 10-digit phone number",
      }));
      setIsLoading(false);
      return;
    }

    if (!city.trim()) {
      setErrors((prev) => ({
        ...prev,
        city: "City is required",
      }));
      setIsLoading(false);
      return;
    }

    if (!state) {
      setErrors((prev) => ({
        ...prev,
        state: "Please select a state",
      }));
      setIsLoading(false);
      return;
    }

    if (!referralId.trim()) {
      setErrors((prev) => ({
        ...prev,
        referralId: "Referral ID is required",
      }));
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);

    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      setIsLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        password: passwordErrors,
      }));
      setIsLoading(false);
      return;
    }

    try {
      const signupData = {
        name: displayName,
        phoneNo: phone,
        email,
        password,
        city,
        state,
        referralId: referralId
      };

      localStorage.setItem('signupData', JSON.stringify(signupData));

      navigate('/paymentgateway');
    } catch (error) {
      console.error("Error saving user data locally:", error);
      setErrors((prev) => ({
        ...prev,
        api: "Failed to save user data. Try again later.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#34495e',
    color: '#ecf0f1',
  };

  return (
    <div className="container mt-5">
      <style>
        {`
          body, html {
            height: 230%;
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

          .card {
            background-color: #1a2a44;
            color: #ecf0f1;
          }

          .card-header {
            background-color: #2a5298;
            color: white;
          }

          .card-footer {
            background-color: #2a5298;
            color: #bdc3c7;
          }

          .btn-primary {
            background-color: #0d6efd;
            border-color: #e74c3c;
          }

          .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #c0392b;
          }

          .text-white:hover {
            color: #add8e6 !important;
          }

          .btn-primary:disabled {
            background-color: #6c757d;
            border-color: #6c757d;
            cursor: not-allowed;
          }

          .form-label {
            color: #ffff;
          }
        `}
      </style>
      <div className="row align-items-start justify-content-center">
        <div className="col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header text-center">
              <h3>Sign Up</h3>
            </div>
            <div className="card-body">
              {errors.api && (
                <div className="alert alert-danger" role="alert">
                  {errors.api}
                </div>
              )}
              <form onSubmit={handleNext}>
                <div className="mb-3">
                  <label htmlFor="displayName" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="displayName"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter name as per Aadhaar card"
                    style={inputStyle}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email (optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    style={inputStyle}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="referralId" className="form-label">Referral ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="referralId"
                    required
                    value={referralId}
                    onChange={(e) => setReferralId(e.target.value)}
                    placeholder="Enter Referral ID"
                    style={inputStyle}
                  />
                  {errors.referralId && <div className="error-message">{errors.referralId}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                    style={inputStyle}
                  />
                  {errors.city && <div className="error-message">{errors.city}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="state" className="form-label">State</label>
                  <select
                    className="form-control"
                    id="state"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  {errors.state && <div className="error-message">{errors.state}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter phone number"
                    style={inputStyle}
                    maxLength="10"
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter password"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  <div className="password-requirements">
                    Password must contain:
                    <ul className="mb-0 ps-3">
                      <li>At least 8 characters {passwordRequirements.minLength && <span className="requirement-met">✅</span>}</li>
                      <li>At least 1 number {passwordRequirements.hasNumber && <span className="requirement-met">✅</span>}</li>
                      <li>At least 1 special character {passwordRequirements.hasSpecialChar && <span className="requirement-met">✅</span>}</li>
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
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
                {alertMessage && (
                  <div className={`alert alert-${alertType} text-center`} role="alert">
                    {alertMessage}
                  </div>
                )}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Next
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <p className="mb-0">Already have an account? <Link to="/login" className="text-white">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;