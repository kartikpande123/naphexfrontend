import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Modal, 
  Button,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import API_BASE_URL from './ApiConfig';

const AdminConcerns = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  const fetchHelpRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/help-requests`);
      if (response.data.success) {
        // Sort requests with pending status first
        const sortedRequests = response.data.data.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });
        setHelpRequests(sortedRequests);
      }
    } catch (error) {
      handleError('Error fetching help requests', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/help-requests/${id}`, {
        status: status
      });

      if (response.data.success) {
        // Optimistically update the UI
        const updatedRequests = helpRequests.map(request => 
          request.id === id 
            ? { ...request, status: status } 
            : request
        );

        // Sort requests again to move resolved/rejected to bottom
        const sortedRequests = updatedRequests.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return 0;
        });

        setHelpRequests(sortedRequests);

        // Show success toast
        setToastMessage(`Request ${status} successfully`);
        setToastVariant('success');
        setShowToast(true);
      }
    } catch (error) {
      handleError(`Error ${status}ing request`, error);
    }
  };

  const handleError = (message, error) => {
    console.error(message, error);
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  const openImageModal = (request) => {
    setSelectedRequest(request);
    setShowImageModal(true);
  };

  const renderStatusBadge = (status) => {
    const badgeColors = {
      'pending': 'warning',
      'resolved': 'success',
      'rejected': 'danger'
    };
    return (
      <Badge 
        bg={badgeColors[status] || 'secondary'} 
        className="text-uppercase"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Styled Header Section */}
      <div 
        className="d-flex justify-content-center mb-4"
        style={{
          perspective: '1000px'
        }}
      >
        <div 
          className="text-center p-3 rounded-3 shadow-lg"
          style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #007bff',
            maxWidth: '600px',
            width: '100%',
            transform: 'rotateX(2deg)',
            borderLeft: '5px solid #007bff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotateX(0deg) scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateX(2deg) scale(1)';
          }}
        >
          <h2 
            className="text-primary mb-0"
            style={{
              fontWeight: 600,
              letterSpacing: '1px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Help Request Management
          </h2>
        </div>
      </div>
      
      {helpRequests.length === 0 ? (
        <div className="text-center text-muted mt-5">
          No help requests found
        </div>
      ) : (
        helpRequests.map((request) => (
          <Card 
            key={request.id} 
            className={`mb-4 shadow-sm ${
              request.status === 'pending' 
                ? 'border-warning' 
                : request.status === 'resolved' 
                ? 'border-success' 
                : 'border-danger'
            }`}
          >
            <Card.Body>
              <Row>
                {/* Image Column */}
                <Col md={3} className="mb-3 mb-md-0">
                  {request.photo ? (
                    <div 
                      onClick={() => openImageModal(request)}
                      style={{ 
                        cursor: 'pointer',
                        height: '250px',
                        backgroundImage: `url(data:image/jpeg;base64,${request.photo})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '8px'
                      }}
                      className="w-100 hover-zoom"
                    />
                  ) : (
                    <div 
                      className="bg-light d-flex align-items-center justify-content-center h-100 rounded"
                    >
                      <p className="text-muted">No Image</p>
                    </div>
                  )}
                </Col>
                
                {/* Details Column */}
                <Col md={9}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="mb-1">{request.name}</h4>
                      <p className="text-muted mb-2">
                        <strong>Contact:</strong> {request.number}
                      </p>
                    </div>
                    
                    {renderStatusBadge(request.status)}
                  </div>
                  
                  {/* Description with dynamic height */}
                  <Card 
                    body 
                    className="bg-light mb-3"
                    style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto' 
                    }}
                  >
                    <p className="text-dark">{request.description}</p>
                  </Card>
                  
                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="outline-success" 
                      onClick={() => handleStatusChange(request.id, 'resolved')}
                      disabled={request.status !== 'pending'}
                      className="px-4"
                    >
                      Resolve
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      onClick={() => handleStatusChange(request.id, 'rejected')}
                      disabled={request.status !== 'pending'}
                      className="px-4"
                    >
                      Reject
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}
      
      {/* Fullscreen Image Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        fullscreen 
        className="custom-fullscreen-modal"
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            Request Evidence: {selectedRequest?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body 
          className="p-0 d-flex justify-content-center align-items-center" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.9)',
            height: '100%',
            width: '100%'
          }}
        >
          {selectedRequest && selectedRequest.photo && (
            <img 
              src={`data:image/jpeg;base64,${selectedRequest.photo}`} 
              alt="Request Evidence" 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default AdminConcerns;