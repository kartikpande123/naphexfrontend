import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from './ApiConfig';

const AdminLogin = () => {
    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = [
        { phone: '7022852377', password: 'naphex123#' },
        { phone: '9019842426', password: 'naphex123#' },
        { phone: '7899527911', password: 'admin2000@' }
    ];

    // Hooks
    const navigate = useNavigate();

    // State management
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [stage, setStage] = useState('credentials');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Validate admin credentials
    const validateCredentials = () => {
        return ADMIN_CREDENTIALS.some(
            admin => admin.phone === phone && admin.password === password
        );
    };

    // Handle credentials submission
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        
        if (validateCredentials()) {
            setIsLoading(true);
            try {
                const response = await axios.post(`${API_BASE_URL}/send-otp`, { phoneNo: phone });
                
                if (response.data.success) {
                    toast.success('OTP sent successfully!');
                    setStage('otp');
                    setGeneratedOtp(response.data.debug?.otp || '');
                    localStorage.setItem('debug_otp', response.data.debug?.otp || '');
                } else {
                    toast.error('Failed to send OTP');
                }
            } catch (error) {
                toast.error('Error sending OTP');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error('Invalid admin credentials');
        }
    };

    // Handle OTP verification
    const handleOtpVerification = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);
        try {
            if (otp === generatedOtp) {
                toast.success('Login Successful!');
                navigate('/admindashboard');
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/verify-otp`, { 
                phoneNo: phone, 
                otp 
            });
            
            if (response.data.success) {
                toast.success('Login Successful!');
                navigate('/admindashboard');
            } else {
                toast.error('Invalid OTP');
            }
        } catch (error) {
            toast.error('OTP Verification Failed');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Container styles
    const containerStyle = {
        minHeight: '100vh',
        background: '#f0f8ff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    };

    // Card styles
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(13, 110, 253, 0.15)',
        border: '2px solid rgba(13, 110, 253, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        overflow: 'hidden'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#0d6efd',
        fontSize: '2.2rem',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(13, 110, 253, 0.2)'
    };

    const formGroupStyle = {
        marginBottom: '25px',
        position: 'relative'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: '#0d6efd',
        fontSize: '0.95rem',
        fontWeight: '600',
        letterSpacing: '0.5px'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px 20px',
        border: '2px solid #e3f2fd',
        borderRadius: '12px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#ffffff',
        outline: 'none',
        boxSizing: 'border-box',
        color: '#212529',
        fontWeight: '500'
    };

    const inputFocusStyle = {
        ...inputStyle,
        borderColor: '#0d6efd',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 3px rgba(13, 110, 253, 0.15)',
        color: '#212529'
    };

    const passwordWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const passwordToggleStyle = {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#0d6efd',
        fontSize: '1.2rem',
        padding: '5px',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
    };

    const buttonStyle = {
        width: '100%',
        padding: '15px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #0d6efd 0%, #0056b3 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(13, 110, 253, 0.4)'
    };

    const successButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #0d6efd 0%, #084298 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(13, 110, 253, 0.4)'
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        background: '#e9ecef',
        color: '#6c757d',
        cursor: 'not-allowed',
        boxShadow: 'none'
    };

    const iconStyle = {
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '3rem',
        color: '#0d6efd'
    };

    const backButtonStyle = {
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'none',
        border: 'none',
        color: '#0d6efd',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '50%',
        transition: 'all 0.2s ease'
    };

    // Render different stages of login
    const renderLoginForm = () => {
        switch (stage) {
            case 'credentials':
                return (
                    <form onSubmit={handleCredentialsSubmit}>
                        <div style={iconStyle}>
                            <i className="bi bi-shield-lock"></i>
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="phone" style={labelStyle}>
                                <i className="bi bi-phone me-2"></i>
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                required
                                style={inputStyle}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                            />
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="password" style={labelStyle}>
                                <i className="bi bi-lock me-2"></i>
                                Password
                            </label>
                            <div style={passwordWrapperStyle}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                                />
                                <span
                                    style={passwordToggleStyle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseEnter={(e) => e.target.style.color = '#084298'}
                                    onMouseLeave={(e) => e.target.style.color = '#0d6efd'}
                                >
                                    {showPassword ? 
                                        <i className="bi bi-eye-slash"></i> : 
                                        <i className="bi bi-eye"></i>
                                    }
                                </span>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            style={isLoading ? disabledButtonStyle : primaryButtonStyle}
                            disabled={isLoading}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.4)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <i className="bi bi-arrow-clockwise me-2" style={{animation: 'spin 1s linear infinite'}}></i>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-arrow-right me-2"></i>
                                    Continue
                                </>
                            )}
                        </button>
                    </form>
                );
            
            case 'otp':
                return (
                    <form onSubmit={handleOtpVerification}>
                        <button
                            type="button"
                            style={backButtonStyle}
                            onClick={() => setStage('credentials')}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#e3f2fd';
                                e.target.style.color = '#084298';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#0d6efd';
                            }}
                        >
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div style={iconStyle}>
                            <i className="bi bi-chat-dots"></i>
                        </div>
                        <div style={{textAlign: 'center', marginBottom: '25px', color: '#6c757d'}}>
                            <p style={{margin: '0', fontSize: '0.95rem'}}>
                                We've sent a verification code to
                            </p>
                            <p style={{margin: '5px 0 0 0', fontWeight: '600', color: '#0d6efd'}}>
                                {phone}
                            </p>
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="otp" style={labelStyle}>
                                <i className="bi bi-key me-2"></i>
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                required
                                maxLength="6"
                                style={{
                                    ...inputStyle,
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontWeight: '600'
                                }}
                                onFocus={(e) => Object.assign(e.target.style, {
                                    ...inputFocusStyle,
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontWeight: '600'
                                })}
                                onBlur={(e) => Object.assign(e.target.style, {
                                    ...inputStyle,
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontWeight: '600'
                                })}
                            />
                        </div>
                        <button 
                            type="submit" 
                            style={isLoading ? disabledButtonStyle : successButtonStyle}
                            disabled={isLoading}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.4)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <i className="bi bi-arrow-clockwise me-2" style={{animation: 'spin 1s linear infinite'}}></i>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Verify & Login
                                </>
                            )}
                        </button>
                    </form>
                );
            
            default:
                return null;
        }
    };

    return (
        <>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css');
                `}
            </style>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h1 style={headerStyle}>
                        Admin Portal
                    </h1>
                    {renderLoginForm()}
                    <ToastContainer 
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                        style={{
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default AdminLogin;