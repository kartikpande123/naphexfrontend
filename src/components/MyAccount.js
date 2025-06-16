import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Spinner, Alert, Card, Badge, ListGroup, Table, Toast, ToastContainer } from 'react-bootstrap';
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
        setError('Failed to connect to server');
        setLoading(false);
        eventSource.close();
      };
      
      // Clean up the event source on component unmount
      return () => {
        eventSource.close();
      };
    } catch (err) {
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
                  <h4 className="mt-3">{userData.name}</h4>
                  <p className="text-muted">{userData.phoneNo}</p>
                </Col>
                <Col md={8}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Location:</strong> {userData.city}, {userData.state}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Account Created:</strong> {formatDate(userData.createdAt)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Available Tokens:</strong> <Badge bg="success" pill>{userData.tokens.toLocaleString()}</Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
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
                        {userData.userids?.myrefrelid || "REF9G4V1K"}
                      </div>
                      <button 
                        className="btn btn-outline-primary mt-3"
                        onClick={() => copyToClipboard(userData.userids?.myrefrelid || "REF9G4V1K", "Referral ID")}
                      >
                        <i className="bi bi-clipboard me-2"></i>Copy
                      </button>
                    </Card.Body>
                  </Card>
                  
                  <Card style={styles.referralCard}>
                    <Card.Body className="text-center">
                      <h5>Your User ID</h5>
                      <div style={styles.referralCode}>
                        {userData.userids?.myuserid || "USERATGVCKEGI"}
                      </div>
                      <button 
                        className="btn btn-outline-primary mt-3"
                        onClick={() => copyToClipboard(userData.userids?.myuserid || "USERATGVCKEGI", "User ID")}
                      >
                        <i className="bi bi-clipboard me-2"></i>Copy
                      </button>
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
                          <strong>Name:</strong> {userData.name}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Phone:</strong> {userData.phoneNo}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Location:</strong> {userData.city}, {userData.state}
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
                        <h2 className="mb-0">{userData.tokens.toLocaleString()}</h2>
                        <small className="text-muted">Available Tokens</small>
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-primary">Add Tokens</button>
                        <button className="btn btn-outline-primary">Withdraw Tokens</button>
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
          <Card>
            <Card.Header style={styles.cardHeaderGradient}>
              <h4>Other Details</h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <i className="bi bi-info-circle" style={{ fontSize: '48px', color: '#6c757d', opacity: '0.5' }}></i>
                <h5 className="mt-3 text-muted">No information available</h5>
              </div>
            </Card.Body>
          </Card>
        );
      
      case 'support':
        return (
          <Card>
            <Card.Header style={styles.cardHeaderGradient}>
              <h4>Help & Support</h4>
            </Card.Header>
            <Card.Body>
              <Row className="justify-content-center">
                <Col md={8}>
                  <div>
                    <Card style={styles.supportCard} 
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="text-center p-4">
                        <i className="bi bi-headset" style={styles.supportIcon}></i>
                        <h5>Customer Support</h5>
                        <p>Our customer support team is available 24/7 to assist you.</p>
                        <button className="btn btn-primary" onClick={handleContactSupport}>Contact Support</button>
                      </Card.Body>
                    </Card>
                    
                    <Card style={styles.supportCard}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="text-center p-4">
                        <i className="bi bi-question-circle" style={styles.supportIcon}></i>
                        <h5>FAQs</h5>
                        <p>Find answers to commonly asked questions about our platform.</p>
                        <button className="btn btn-outline-primary" onClick={()=>navigate("/FAQs")}>View FAQs</button>
                      </Card.Body>
                    </Card>
                    
                    <Card style={styles.supportCard}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Card.Body className="text-center p-4">
                        <i className="bi bi-book" style={styles.supportIcon}></i>
                        <h5>Game Rules</h5>
                        <p>Learn about the rules and how to play our games.</p>
                        <button className="btn btn-outline-primary" onClick={()=>navigate("/rules")}>Read Game Rules</button>
                      </Card.Body>
                    </Card>
                  </div>
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
              <Card.Header className="bg-dark text-white">
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
                        <h5 className="mb-0">{userData.name}</h5>
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