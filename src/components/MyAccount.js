import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Spinner, Alert, Card, Badge, ListGroup, Table, Toast, ToastContainer, Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNo, setPhoneNo] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const navigate = useNavigate();

  // Inline CSS styles
  const styles = {
    sidebarWrapper: {
      marginBottom: '20px'
    },
    sidebar: {
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: '20px'
    },
    navLink: {
      padding: '12px 20px',
      color: '#495057',
      borderLeft: '4px solid transparent',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    navLinkHover: {
      backgroundColor: '#f8f9fa',
      color: '#0d6efd'
    },
    navLinkActive: {
      backgroundColor: '#f0f7ff',
      color: '#0d6efd',
      borderLeftColor: '#0d6efd',
      fontWeight: '600'
    },
    miniAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#0d6efd',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    tokenBadge: {
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      color: '#0d6efd',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      display: 'inline-block',
      marginTop: '4px'
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '15px'
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: '#0d6efd',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '40px'
    },
    referralCard: {
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginBottom: '24px'
    },
    referralCode: {
      fontSize: '24px',
      fontWeight: 'bold',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      margin: '15px 0',
      letterSpacing: '1px',
      userSelect: 'all',
      cursor: 'text'
    },
    tokenDisplay: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    supportIcon: {
      fontSize: '48px',
      color: '#0d6efd',
      marginBottom: '15px',
      display: 'block'
    },
    supportCard: {
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      marginBottom: '20px',
      cursor: 'pointer'
    },
    supportCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
    },
    cardHeaderGradient: {
      background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
      color: 'white'
    },
    userInfo: {
      padding: '15px'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '50px'
    },
    kycImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      border: '2px solid #e9ecef'
    },
    kycImageHover: {
      transform: 'scale(1.05)'
    },
    kycCard: {
      marginBottom: '20px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 'bold'
    },
    modalImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '80vh',
      objectFit: 'contain'
    },
    forgotPasswordCard: {
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const getUserDataFromLocalStorage = () => {
      try {
        const localUserData = localStorage.getItem('userData');
        if (localUserData) {
          const parsedData = JSON.parse(localUserData);
          if (parsedData && parsedData.phoneNo) {
            setPhoneNo(parsedData.phoneNo);
            return parsedData.phoneNo;
          }
        }
        return null;
      } catch (err) {
        console.error('Error getting user data from localStorage:', err);
        return null;
      }
    };

    const userPhoneNo = getUserDataFromLocalStorage();

    if (userPhoneNo) {
      fetchUserData(userPhoneNo);
    } else {
      setError('User phone number not found. Please log in again.');
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (userPhoneNo) => {
    try {
      setLoading(true);

      // Create an EventSource connection to the server
      const eventSource = new EventSource(`${API_BASE_URL}/user-profile/${userPhoneNo}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received user data:', data); // Debug log

        if (data.success) {
          setUserData(data.userData);
          setLoading(false);
          // Close the connection after receiving data
          eventSource.close();
        } else {
          setError(data.message);
          setLoading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('Failed to connect to server');
        setLoading(false);
        eventSource.close();
      };

      // Clean up the event source on component unmount
      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching user data');
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(`${label} copied to clipboard!`);
      setShowToast(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setToastMessage(`${label} copied to clipboard!`);
        setShowToast(true);
      } catch (err) {
        setToastMessage(`Failed to copy ${label}`);
        setShowToast(true);
      }

      document.body.removeChild(textArea);
    }
  };

  // Share function for social media
  const shareId = async (id, label) => {
    const shareText = `My ${label}: ${id}`;

    if (navigator.share) {
      // Use native share API if available (mobile devices)
      try {
        await navigator.share({
          title: `My ${label}`,
          text: shareText
          // Removed URL - only sharing the ID text
        });
        setToastMessage(`${label} shared successfully!`);
        setShowToast(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          // If user cancels, don't show error
          fallbackShare(shareText, label);
        }
      }
    } else {
      // Fallback to copying share text
      fallbackShare(shareText, label);
    }
  };

  const fallbackShare = async (shareText, label) => {
    try {
      await navigator.clipboard.writeText(shareText);
      setToastMessage(`${label} share text copied to clipboard! You can now paste it on any social media platform.`);
      setShowToast(true);
    } catch (err) {
      // Final fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setToastMessage(`${label} share text copied to clipboard! You can now paste it on any social media platform.`);
        setShowToast(true);
      } catch (err) {
        setToastMessage(`Failed to prepare ${label} for sharing`);
        setShowToast(true);
      }

      document.body.removeChild(textArea);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContactSupport = () => {
    navigate('/help');
  };

  const handleImageClick = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  const handleForgotPassword = () => {
    navigate('/forgotpassword');
  };

  // Helper function to safely get user ID values
  const getUserId = () => {
    // Try different possible data structures
    if (userData?.userIds?.myuserid) {
      return userData.userIds.myuserid;
    }
    if (userData?.userids?.myuserid) {
      return userData.userids.myuserid;
    }
    if (userData?.myuserid) {
      return userData.myuserid;
    }
    return "Loading...";
  };

  const getReferralId = () => {
    // Try different possible data structures
    if (userData?.userIds?.myrefrelid) {
      return userData.userIds.myrefrelid;
    }
    if (userData?.userids?.myrefrelid) {
      return userData.userids.myrefrelid;
    }
    if (userData?.myrefrelid) {
      return userData.myrefrelid;
    }
    return "Loading...";
  };

  // Helper function to get KYC status badge
  const getKycStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return <Badge bg="success" style={styles.statusBadge}>✓ Verified</Badge>;
      case 'submitted':
        return <Badge bg="warning" style={styles.statusBadge}>⏳ Under Review</Badge>;
      case 'rejected':
        return <Badge bg="danger" style={styles.statusBadge}>✗ Rejected</Badge>;
      default:
        return <Badge bg="secondary" style={styles.statusBadge}>Not Submitted</Badge>;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading user profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          {error}
        </Alert>
      );
    }

    if (!userData) {
      return (
        <Alert variant="warning">
          No user data found.
        </Alert>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <Card>
              <Card.Header style={styles.cardHeaderGradient}>
                <h4>User Profile</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center mb-4">
                    <div style={styles.avatarContainer}>
                      <div style={styles.avatar}>
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <h4 className="mt-3">{userData.name || 'Unknown User'}</h4>
                    <p className="text-muted">{userData.phoneNo || 'No phone number'}</p>
                  </Col>
                  <Col md={8}>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Location:</strong> {userData.city || 'N/A'}, {userData.state || 'N/A'}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Account Created:</strong> {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Available Tokens:</strong> <Badge bg="success" pill>{(userData.tokens || 0).toLocaleString()}</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>User ID:</strong> {getUserId()}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Referral ID:</strong> {getReferralId()}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Forgot Password Section - Moved to Profile */}
            <Card style={styles.forgotPasswordCard} className="mt-4">
              <Card.Header style={styles.cardHeaderGradient}>
                <h4 className="mb-0">
                  <i className="bi bi-key me-2"></i>
                  Password Management
                </h4>
              </Card.Header>
              <Card.Body>
                <Row className="justify-content-center">
                  <Col md={6}>
                    <div className="text-center">
                      <i className="bi bi-shield-lock" style={{ fontSize: '48px', color: '#0d6efd', marginBottom: '20px' }}></i>
                      <h5>Reset Your Password</h5>
                      <p className="text-muted mb-4">
                        Need to change your password? Click the button below to go to the password reset page.
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleForgotPassword}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reset Password
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        );

      case 'refrelid':
        return (
          <Card>
            <Card.Header style={styles.cardHeaderGradient}>
              <h4>My Referral Details</h4>
            </Card.Header>
            <Card.Body>
              <Row className="justify-content-center">
                <Col md={8}>
                  <Card style={styles.referralCard}>
                    <Card.Body className="text-center">
                      <h5>Your Referral ID</h5>
                      <div style={styles.referralCode}>
                        {getReferralId()}
                      </div>
                      <div style={styles.buttonGroup}>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => copyToClipboard(getReferralId(), "Referral ID")}
                          disabled={getReferralId() === "Loading..."}
                        >
                          <i className="bi bi-clipboard me-2"></i>Copy
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => shareId(getReferralId(), "Referral ID")}
                          disabled={getReferralId() === "Loading..."}
                        >
                          <i className="bi bi-share me-2"></i>Share
                        </button>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card style={styles.referralCard}>
                    <Card.Body className="text-center">
                      <h5>Your User ID</h5>
                      <div style={styles.referralCode}>
                        {getUserId()}
                      </div>
                      <div style={styles.buttonGroup}>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => copyToClipboard(getUserId(), "User ID")}
                          disabled={getUserId() === "Loading..."}
                        >
                          <i className="bi bi-clipboard me-2"></i>Copy
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => shareId(getUserId(), "User ID")}
                          disabled={getUserId() === "Loading..."}
                        >
                          <i className="bi bi-share me-2"></i>Share
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 'account':
        return (
          <Card>
            <Card.Header style={styles.cardHeaderGradient}>
              <h4>Account Overview</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col lg={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Account Summary</h5>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Name:</strong> {userData.name || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Phone:</strong> {userData.phoneNo || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Location:</strong> {userData.city || 'N/A'}, {userData.state || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>User ID:</strong> {getUserId()}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Referral ID:</strong> {getReferralId()}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Token Summary</h5>
                    </Card.Header>
                    <Card.Body>
                      <div style={styles.tokenDisplay}>
                        <h2 className="mb-0">{(userData.tokens || 0).toLocaleString()}</h2>
                        <small className="text-muted">Available Tokens</small>
                      </div>
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate("/addtokens")}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Tokens
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate("/withdraw")}
                        >
                          <i className="bi bi-arrow-down-circle me-2"></i>
                          Withdraw Tokens
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => navigate("/bankdetails")}
                        >
                          <i className="bi bi-bank me-2"></i>
                          Bank Details
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => navigate("/transactions")}
                        >
                          <i className="bi bi-bank me-2"></i>
                          Transaction History
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 'details':
        return (
          <div>
            {/* KYC Details Section - Forgot Password Section Removed */}
            <Card style={styles.kycCard}>
              <Card.Header style={styles.cardHeaderGradient}>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">KYC Verification Details</h4>
                  {getKycStatusBadge(userData.kycStatus)}
                </div>
              </Card.Header>
              <Card.Body>
                {userData.kyc ? (
                  <div>
                    <Row className="mb-4">
                      <Col md={6}>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <strong>KYC Status:</strong> {getKycStatusBadge(userData.kycStatus)}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Submitted Date:</strong> {userData.kycSubmittedAt ? formatDate(userData.kycSubmittedAt) : 'N/A'}
                          </ListGroup.Item>
                          {userData.kycAcceptedAt && (
                            <ListGroup.Item>
                              <strong>Accepted Date:</strong> {formatDate(userData.kycAcceptedAt)}
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                      </Col>
                    </Row>

                    <h5 className="mb-3">KYC Documents</h5>
                    <Row>
                      {userData.kyc.aadharCardUrl && (
                        <Col md={4} className="mb-4">
                          <Card className="h-100">
                            <Card.Header className="bg-light text-center">
                              <h6 className="mb-0">
                                <i className="bi bi-card-text me-2"></i>
                                Aadhar Card
                              </h6>
                            </Card.Header>
                            <Card.Body className="text-center p-2">
                              <img
                                src={userData.kyc.aadharCardUrl}
                                alt="Aadhar Card"
                                style={styles.kycImage}
                                onClick={() => handleImageClick(userData.kyc.aadharCardUrl, 'Aadhar Card')}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              />
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleImageClick(userData.kyc.aadharCardUrl, 'Aadhar Card')}
                              >
                                <i className="bi bi-eye me-1"></i>View Full Image
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}

                      {userData.kyc.panCardUrl && (
                        <Col md={4} className="mb-4">
                          <Card className="h-100">
                            <Card.Header className="bg-light text-center">
                              <h6 className="mb-0">
                                <i className="bi bi-credit-card me-2"></i>
                                PAN Card
                              </h6>
                            </Card.Header>
                            <Card.Body className="text-center p-2">
                              <img
                                src={userData.kyc.panCardUrl}
                                alt="PAN Card"
                                style={styles.kycImage}
                                onClick={() => handleImageClick(userData.kyc.panCardUrl, 'PAN Card')}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              />
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleImageClick(userData.kyc.panCardUrl, 'PAN Card')}
                              >
                                <i className="bi bi-eye me-1"></i>View Full Image
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}

                      {userData.kyc.bankPassbookUrl && (
                        <Col md={4} className="mb-4">
                          <Card className="h-100">
                            <Card.Header className="bg-light text-center">
                              <h6 className="mb-0">
                                <i className="bi bi-bank me-2"></i>
                                Bank Passbook
                              </h6>
                            </Card.Header>
                            <Card.Body className="text-center p-2">
                              <img
                                src={userData.kyc.bankPassbookUrl}
                                alt="Bank Passbook"
                                style={styles.kycImage}
                                onClick={() => handleImageClick(userData.kyc.bankPassbookUrl, 'Bank Passbook')}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              />
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleImageClick(userData.kyc.bankPassbookUrl, 'Bank Passbook')}
                              >
                                <i className="bi bi-eye me-1"></i>View Full Image
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}
                    </Row>

                    {(!userData.kyc.aadharCardUrl && !userData.kyc.panCardUrl && !userData.kyc.bankPassbookUrl) && (
                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        No KYC documents found. Please complete your KYC verification.
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    KYC verification not completed. Please submit your documents for verification.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </div>
        );

      case 'support':
        return (
          <Card>
            <Card.Header style={styles.cardHeaderGradient}>
              <h4>Help & Support</h4>
            </Card.Header>
            <Card.Body>
              <Row className="justify-content-center">
                <Col md={10}>
                  <Row>
                    <Col lg={4} md={6} className="mb-4">
                      <Card style={styles.supportCard}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="text-center p-4">
                          <i className="bi bi-headset" style={styles.supportIcon}></i>
                          <h5>Get Support</h5>
                          <p>Need help? Contact support for assistance..</p>
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate("/help")}
                          >
                            Contact Support
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4} md={6} className="mb-4">
                      <Card style={styles.supportCard}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="text-center p-4">
                          <i className="bi bi-book" style={styles.supportIcon}></i>
                          <h5>Game Rules</h5>
                          <p>Learn about the rules and how to play our games.</p>
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => navigate("/rules")}
                          >
                            Read Game Rules
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                      <Card style={styles.supportCard}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="text-center p-4">
                          <i className="bi bi-book" style={styles.supportIcon}></i>
                          <h5>FAQ's</h5>
                          <p>Know Some Interesting facts about our game.</p>
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => navigate("/faqs")}
                          >
                            Read FAQ's
                          </button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      default:
        return (
          <Alert variant="info">
            Select a section from the sidebar to view details.
          </Alert>
        );
    }
  };

  // Add Bootstrap Icons CSS link to document
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <Container fluid className="py-4">
        <Row>
          {/* Sidebar */}
          <Col lg={3} md={4} style={styles.sidebarWrapper}>
            <Card style={styles.sidebar}>
              <Card.Header className="text-white" style={{ backgroundColor: "rgb(13, 110, 253)" }}>
                <h4 className="mb-0">My Account</h4>
              </Card.Header>
              <Card.Body className="p-0">
                {userData && (
                  <div style={styles.userInfo}>
                    <div className="d-flex align-items-center">
                      <div style={styles.miniAvatar}>
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ms-3">
                        <h5 className="mb-0">{userData.name || 'Unknown User'}</h5>
                        <div style={styles.tokenBadge}>
                          <i className="bi bi-coin me-1"></i>
                          <span>{userData.tokens ? userData.tokens.toLocaleString() : 0} Tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Nav className="flex-column">
                  <Nav.Link
                    style={{
                      ...styles.navLink,
                      ...(activeTab === 'profile' ? styles.navLinkActive : {})
                    }}
                    onClick={() => setActiveTab('profile')}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'profile') {
                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                        e.currentTarget.style.color = styles.navLinkHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'profile') {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = styles.navLink.color;
                      }
                    }}
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    Profile
                  </Nav.Link>
                  <Nav.Link
                    style={{
                      ...styles.navLink,
                      ...(activeTab === 'refrelid' ? styles.navLinkActive : {})
                    }}
                    onClick={() => setActiveTab('refrelid')}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'refrelid') {
                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                        e.currentTarget.style.color = styles.navLinkHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'refrelid') {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = styles.navLink.color;
                      }
                    }}
                  >
                    <i className="bi bi-link-45deg me-2"></i>
                    My Referral ID
                  </Nav.Link>
                  <Nav.Link
                    style={{
                      ...styles.navLink,
                      ...(activeTab === 'account' ? styles.navLinkActive : {})
                    }}
                    onClick={() => setActiveTab('account')}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'account') {
                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                        e.currentTarget.style.color = styles.navLinkHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'account') {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = styles.navLink.color;
                      }
                    }}
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Account Overview
                  </Nav.Link>
                  <Nav.Link
                    style={{
                      ...styles.navLink,
                      ...(activeTab === 'details' ? styles.navLinkActive : {})
                    }}
                    onClick={() => setActiveTab('details')}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'details') {
                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                        e.currentTarget.style.color = styles.navLinkHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'details') {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = styles.navLink.color;
                      }
                    }}
                  >
                    <i className="bi bi-info-circle me-2"></i>
                    Other Details
                  </Nav.Link>
                  <Nav.Link
                    style={{
                      ...styles.navLink,
                      ...(activeTab === 'support' ? styles.navLinkActive : {})
                    }}
                    onClick={() => setActiveTab('support')}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'support') {
                        e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor;
                        e.currentTarget.style.color = styles.navLinkHover.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'support') {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = styles.navLink.color;
                      }
                    }}
                  >
                    <i className="bi bi-headset me-2"></i>
                    Help & Support
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col lg={9} md={8}>
            {renderContent()}
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedImageTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={selectedImage}
            alt={selectedImageTitle}
            style={styles.modalImage}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => window.open(selectedImage, '_blank')}
          >
            <i className="bi bi-download me-2"></i>
            Download
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast notification for copy feedback */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default MyAccount;