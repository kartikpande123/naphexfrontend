import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./ApiConfig";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralId, setReferralId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // New state for OTP timer
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Refs for input fields to enable scrolling
  const displayNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const referralIdRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const otpRef = useRef(null);

  // List of all Indian states
  const INDIAN_STATES = [
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Punjab",
    "Rajasthan",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const navigate = useNavigate();

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [referralStatus, setReferralStatus] = useState({
    isValid: false,
    message: "",
    referrerName: "",
    isChecking: false,
  });

  // Function to sanitize referral ID (remove invalid characters)
  const sanitizeReferralId = (value) => {
    // Remove any characters that aren't alphanumeric
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  };

  // Function to scroll to first error field
  const scrollToFirstError = (newErrors) => {
    const errorFieldRefs = {
      displayName: displayNameRef,
      email: emailRef,
      phone: phoneRef,
      city: cityRef,
      state: stateRef,
      referralId: referralIdRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
      otp: otpRef,
    };

    // Find the first error field in the order they appear on the form
    const fieldOrder = [
      "displayName",
      "email",
      "phone",
      "city",
      "state",
      "referralId",
      "password",
      "confirmPassword",
      "otp",
    ];

    for (const field of fieldOrder) {
      if (newErrors[field] && errorFieldRefs[field]?.current) {
        errorFieldRefs[field].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Focus on the input field
        setTimeout(() => {
          errorFieldRefs[field].current.focus();
        }, 300);
        break;
      }
    }
  };

  // Load data from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("signupData"));
    if (storedData) {
      setEmail(storedData.email || "");
      setPhone(storedData.phone || "");
      setPassword(storedData.password || "");
      setConfirmPassword(storedData.confirmPassword || "");
      setDisplayName(storedData.displayName || "");
      setReferralId(storedData.referralId || "");
    }
  }, []);

  // OTP Timer Effect
  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, otpTimer]);

  // Validate password
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

  // Validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check referral ID
  const checkReferralId = async (id) => {
    // Sanitize the ID first
    const sanitizedId = sanitizeReferralId(id);

    if (!sanitizedId) {
      setReferralStatus({
        isValid: false,
        message: "Referral ID is required",
        referrerName: "",
        isChecking: false,
      });
      return;
    }

    setReferralStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      // Use sanitized ID in API call
      const response = await axios.get(
        `${API_BASE_URL}/checkReferralSlots/${sanitizedId}`
      );

      if (response.data.success) {
        if (response.data.slotsAvailable) {
          setReferralStatus({
            isValid: true,
            message: response.data.message,
            referrerName: response.data.referrerName,
            isChecking: false,
          });
        } else {
          setReferralStatus({
            isValid: false,
            message:
              "Both slots are occupied. Please use a different referral ID.",
            referrerName: "",
            isChecking: false,
          });
        }
      }
    } catch (error) {
      setReferralStatus({
        isValid: false,
        message: error.response?.data?.error || "Invalid referral ID",
        referrerName: "",
        isChecking: false,
      });
    }
  };

  // Debounced version of checkReferralId
  const debouncedCheckReferral = debounce(checkReferralId, 500);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors = {};

    // Validate display name
    if (!displayName.trim()) {
      newErrors.displayName = "Full name is required";
    }

    // Sanitize and validate referral ID
    const sanitizedReferralId = sanitizeReferralId(referralId);

    if (!sanitizedReferralId) {
      newErrors.referralId =
        "Referral ID is required and must contain only letters and numbers";
    } else if (!referralStatus.isValid) {
      newErrors.referralId =
        "Please enter a valid referral ID with available slots";
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Validate city
    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    // Validate state
    if (!state) {
      newErrors.state = "Please select a state";
    }

    const passwordErrors = validatePassword(password);

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
    }

    // If there are validation errors, scroll to the first one
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Check phone availability
      const checkPhoneResponse = await axios.post(
        `${API_BASE_URL}/check-phone`,
        {
          phoneNo: phone,
        }
      );

      if (!checkPhoneResponse.data.success) {
        const phoneError = {
          phone: "Phone number already registered. Please log in.",
        };
        setErrors(phoneError);
        scrollToFirstError(phoneError);
        setIsLoading(false);
        return;
      }

      // Send OTP
      const sendOtpResponse = await axios.post(`${API_BASE_URL}/send-otp`, {
        phoneNo: phone,
      });

      if (sendOtpResponse.data.success) {
        setOtpSent(true);
        setAlertMessage("OTP sent successfully!");
        setAlertType("success");

        // Auto-dismiss alert after 3 seconds
        setTimeout(() => {
          setAlertMessage("");
        }, 3000);

        // Store debug OTP for testing (remove this in production)
        localStorage.setItem("debug_otp", sendOtpResponse.data.debug.otp);
      } else {
        setAlertMessage("Failed to send OTP. Please try again.");
        setAlertType("error");

        setTimeout(() => {
          setAlertMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("An error occurred. Please try again.");
      setAlertType("error");

      setTimeout(() => {
        setAlertMessage("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Resend
  const handleResendOtp = async () => {
    setIsLoading(true);
    setOtpTimer(60);
    setCanResendOtp(false);

    try {
      const sendOtpResponse = await axios.post(`${API_BASE_URL}/send-otp`, {
        phoneNo: phone,
      });

      if (sendOtpResponse.data.success) {
        localStorage.setItem("debug_otp", sendOtpResponse.data.debug.otp);
        setOtpSent(true);
        setAlertMessage("OTP resent successfully!");
        setAlertType("success");

        setTimeout(() => {
          setAlertMessage("");
        }, 3000);
      } else {
        const apiError = { api: "Failed to resend OTP. Please try again." };
        setErrors(apiError);
      }
    } catch (error) {
      console.error("Error:", error);
      const apiError = {
        api:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      };
      setErrors(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Next (OTP Verification)
  const handleNext = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};

    if (otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit OTP";
    }

    // For development: verify against stored OTP
    const storedOtp = localStorage.getItem("debug_otp");
    if (otp !== storedOtp) {
      newErrors.otp = "Invalid OTP. Please try again.";
    }

    // Validate city and state
    if (!city || !state) {
      if (!city) newErrors.city = "City is required";
      if (!state) newErrors.state = "State is required";
    }

    // If there are validation errors, scroll to the first one
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Sanitize referral ID before saving
      const sanitizedReferralId = sanitizeReferralId(referralId);

      // Prepare user data for localStorage
      const signupData = {
        name: displayName,
        phoneNo: phone,
        email,
        password,
        city,
        state,
        referralId: sanitizedReferralId, // Use sanitized version
      };

      // Save data to localStorage
      localStorage.setItem("signupData", JSON.stringify(signupData));
      localStorage.removeItem("debug_otp");

      // Navigate to next step
      navigate("/userkyc");
    } catch (error) {
      console.error("Error saving user data locally:", error);
      const apiError = { api: "Failed to save user data. Try again later." };
      setErrors(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body,
        html {
          height: 100%;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(180deg, #f5f7fa 0%, #c3cfe2 100%);
          background-attachment: fixed;
          background-repeat: no-repeat;
        }

        body {
          min-height: 100vh;
          padding: 20px 0;
        }

        .signup-container {
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

        .signup-card {
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
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
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

        .form-control.error {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
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
          content: "⚠";
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

        .referral-status {
          margin-top: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .referral-status.valid {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.3);
          color: #2ecc71;
        }

        .referral-status.invalid {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          color: #e74c3c;
        }

        .referral-status.checking {
          background: rgba(52, 152, 219, 0.1);
          border: 1px solid rgba(52, 152, 219, 0.3);
          color: #3498db;
        }

        .referrer-name {
          margin-top: 4px;
          font-weight: 500;
        }

        .otp-section {
          background: rgba(66, 165, 245, 0.05);
          border: 1px solid rgba(66, 165, 245, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .otp-timer {
          text-align: center;
          margin-top: 15px;
          color: #ecf0f1;
          font-size: 0.9rem;
        }

        .resend-button {
          background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(66, 165, 245, 0.3);
        }

        .resend-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(66, 165, 245, 0.4);
          background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%);
        }

        .resend-button:disabled {
          background: rgba(108, 117, 125, 0.6);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .alert {
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          border: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-success {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.3);
          color: #2ecc71;
        }

        .alert-error {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          color: #e74c3c;
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
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
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
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .card-footer {
          background: rgba(42, 82, 152, 0.3);
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-footer p {
          margin: 0;
          color: #bdc3c7;
          font-size: 0.95rem;
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

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .signup-container {
            padding: 0 15px;
          }

          .card-body {
            padding: 30px 20px;
          }

          .card-header {
            padding: 25px 20px;
          }

          .two-column {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .header-title {
            font-size: 1.75rem;
          }
        }
      `}</style>

      <div className="signup-container">
        <div className="signup-card">
          <div className="card-header">
            <h1 className="header-title">Create Account</h1>
            <p className="header-subtitle">
              Join us and start your journey today
            </p>
            <h2 className="header">NAPHEX</h2>
          </div>

          <div className="card-body">
            {errors.api && (
              <div className="alert alert-error" role="alert">
                <span>⚠</span>
                {errors.api}
              </div>
            )}

            {alertMessage && (
              <div className={`alert alert-${alertType}`} role="alert">
                <span>{alertType === "success" ? "✓" : "⚠"}</span>
                {alertMessage}
              </div>
            )}

            <form onSubmit={otpSent ? handleNext : handleSendOtp}>
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>

                <div className="form-group">
                  <label htmlFor="displayName" className="form-label">
                    Full Name
                  </label>
                  <input
                    ref={displayNameRef}
                    type="text"
                    className={`form-control ${
                      errors.displayName ? "error" : ""
                    }`}
                    id="displayName"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter name as per Aadhaar card"
                    disabled={otpSent}
                  />
                  {errors.displayName && (
                    <div className="error-message">{errors.displayName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address (Optional)
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    className={`form-control ${errors.email ? "error" : ""}`}
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={otpSent}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    className={`form-control ${errors.phone ? "error" : ""}`}
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 10-digit phone number"
                    disabled={otpSent}
                    maxLength="10"
                  />
                  {errors.phone && (
                    <div className="error-message">{errors.phone}</div>
                  )}
                </div>
              </div>

              {/* Location Information Section */}
              <div className="form-section">
                <h3 className="section-title">Location Details</h3>

                <div className="two-column">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      ref={cityRef}
                      type="text"
                      className={`form-control ${errors.city ? "error" : ""}`}
                      id="city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter your city"
                      disabled={otpSent}
                    />
                    {errors.city && (
                      <div className="error-message">{errors.city}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <select
                      ref={stateRef}
                      className={`form-control ${errors.state ? "error" : ""}`}
                      id="state"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={otpSent}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <div className="error-message">{errors.state}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Referral Information Section */}
              <div className="form-section">
                <h3 className="section-title">Referral Information</h3>

                <div className="form-group">
                  <label htmlFor="referralId" className="form-label">
                    Referral ID
                  </label>
                  <input
                    ref={referralIdRef}
                    type="text"
                    className={`form-control ${
                      errors.referralId ? "error" : ""
                    }`}
                    id="referralId"
                    required
                    value={referralId}
                    onChange={(e) => {
                      const sanitized = sanitizeReferralId(e.target.value);
                      setReferralId(sanitized);
                      if (sanitized) {
                        debouncedCheckReferral(sanitized);
                      } else {
                        setReferralStatus({
                          isValid: false,
                          message:
                            "Referral ID must contain only letters and numbers",
                          referrerName: "",
                          isChecking: false,
                        });
                      }
                    }}
                    placeholder="Enter Referral ID (letters and numbers only)"
                    style={{
                      borderColor: referralStatus.isValid
                        ? "#2ecc71"
                        : referralStatus.message
                        ? "#e74c3c"
                        : "rgba(255, 255, 255, 0.1)",
                    }}
                    disabled={otpSent}
                  />

                  {referralStatus.isChecking && (
                    <div className="referral-status checking">
                      <span>🔍</span>
                      Checking referral ID...
                    </div>
                  )}

                  {referralStatus.message && !referralStatus.isChecking && (
                    <div
                      className={`referral-status ${
                        referralStatus.isValid ? "valid" : "invalid"
                      }`}
                    >
                      <span>{referralStatus.isValid ? "✓" : "✗"}</span>
                      <div>
                        <div>{referralStatus.message}</div>
                        {referralStatus.slotsAvailable && (
                          <div className="referrer-name">
                            {referralStatus.slotsAvailable === "both"
                              ? "Both slots are available"
                              : "Right slot is available"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.referralId && (
                    <div className="error-message">{errors.referralId}</div>
                  )}
                </div>
              </div>

              {/* Security Information Section */}
              <div className="form-section">
                <h3 className="section-title">Security Setup</h3>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.password ? "error" : ""
                      }`}
                      id="password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Create a strong password"
                      disabled={otpSent}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="password-requirements">
                    <div className="password-requirements-title">
                      Password Requirements:
                    </div>
                    <ul className="requirements-list">
                      <li
                        className={`requirement-item ${
                          passwordRequirements.minLength ? "met" : ""
                        }`}
                      >
                        <span
                          className={`requirement-icon ${
                            passwordRequirements.minLength ? "met" : ""
                          }`}
                        >
                          {passwordRequirements.minLength ? "✓" : "○"}
                        </span>
                        At least 8 characters long
                      </li>
                      <li
                        className={`requirement-item ${
                          passwordRequirements.hasNumber ? "met" : ""
                        }`}
                      >
                        <span
                          className={`requirement-icon ${
                            passwordRequirements.hasNumber ? "met" : ""
                          }`}
                        >
                          {passwordRequirements.hasNumber ? "✓" : "○"}
                        </span>
                        At least one number
                      </li>
                      <li
                        className={`requirement-item ${
                          passwordRequirements.hasSpecialChar ? "met" : ""
                        }`}
                      >
                        <span
                          className={`requirement-icon ${
                            passwordRequirements.hasSpecialChar ? "met" : ""
                          }`}
                        >
                          {passwordRequirements.hasSpecialChar ? "✓" : "○"}
                        </span>
                        At least one special character
                      </li>
                    </ul>
                  </div>

                  {errors.password && (
                    <div className="error-message">
                      {Array.isArray(errors.password) ? (
                        <ul style={{ margin: 0, paddingLeft: "1rem" }}>
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
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      id="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      disabled={otpSent}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <i
                        className={`bi ${
                          showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="error-message">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              {/* OTP Verification Section */}
              {otpSent && (
                <div className="otp-section">
                  <h3
                    className="section-title"
                    style={{ color: "#42a5f5", marginBottom: "15px" }}
                  >
                    OTP Verification
                  </h3>

                  <div className="form-group">
                    <label htmlFor="otp" className="form-label">
                      Enter OTP
                    </label>
                    <input
                      ref={otpRef}
                      type="text"
                      className={`form-control ${errors.otp ? "error" : ""}`}
                      id="otp"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 6-digit OTP sent to your phone"
                      maxLength="6"
                      style={{ textAlign: "center", fontSize: "1.2rem" }}
                    />
                    {errors.otp && (
                      <div className="error-message">{errors.otp}</div>
                    )}
                  </div>

                  <div className="otp-timer">
                    {otpTimer > 0 ? (
                      <div>
                        <span>⏱ Resend OTP in {otpTimer} seconds</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="resend-button"
                        onClick={handleResendOtp}
                        disabled={!canResendOtp || isLoading}
                      >
                        🔄 Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: "30px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span
                      className="spinner-border"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {otpSent ? "Verify & Continue" : "Send OTP"}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer">
            <p>
              Already have an account?
              <Link to="/" style={{ marginLeft: "8px" }}>
                LogIn
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
