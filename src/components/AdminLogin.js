import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';
import API_BASE_URL from './ApiConfig';

const AdminLogin = () => {
    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = [
        { phone: '7022852377', password: 'naphex123#' },
        { phone: '9148180021', password: 'admin2024!' },
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
            // Proceed to OTP generation
            setIsLoading(true);
            try {
                const response = await axios.post(`${API_BASE_URL}/send-otp`, { phoneNo: phone });
                
                if (response.data.success) {
                    toast.success('OTP sent successfully!');
                    setStage('otp');
                    // Store the OTP for local verification
                    setGeneratedOtp(response.data.debug?.otp || '');
                    // Optional: Store debug OTP for testing
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
            // Local OTP verification
            if (otp === generatedOtp) {
                toast.success('Login Successful!');
                // Navigate to admin dashboard
                navigate('/admindashboard');
                return;
            }

            // Backend OTP verification (fallback)
            const response = await axios.post(`${API_BASE_URL}/verify-otp`, { 
                phoneNo: phone, 
                otp 
            });
            
            if (response.data.success) {
                toast.success('Login Successful!');
                // Navigate to admin dashboard
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

    // Render different stages of login
    const renderLoginForm = () => {
        switch (stage) {
            case 'credentials':
                return (
                    <form onSubmit={handleCredentialsSubmit} className="admin-login-form">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter admin phone number"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                );
            
            case 'otp':
                return (
                    <form onSubmit={handleOtpVerification} className="admin-login-form">
                        <div className="form-group">
                            <label htmlFor="otp">OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-success"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-wrapper">
                <h1>Admin Login</h1>
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
                />
            </div>
        </div>
    );
};

export default AdminLogin;
