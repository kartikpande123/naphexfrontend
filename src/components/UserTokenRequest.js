import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from './ApiConfig';

export default function UserTokenRequest() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNo, setPhoneNo] = useState('');

  useEffect(() => {
    // Get phone number from session state
    const userDataRaw = sessionStorage.getItem("userData") || localStorage.getItem("userData");
    const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
    const phoneNumber = userData?.phoneNo || "";
    setPhoneNo(phoneNumber);

    if (phoneNumber) {
      fetchUserData(phoneNumber);
    } else {
      setError("No phone number found");
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (phoneNumber) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/user-profile/json/${phoneNumber}`);
      const data = await response.json();

      if (data.success) {
        setUserData(data.userData);
      } else {
        setError(data.message || 'User not found');
      }
    } catch (err) {
      setError('Error fetching user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: '' };
    const dateObj = new Date(dateString);
    const date = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return { date, time };
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getTokenRequestHistory = () => {
    if (!userData?.tokenRequestHistory) return [];
    
    return Object.entries(userData.tokenRequestHistory)
      .map(([key, value]) => ({
        id: key,
        ...value
      }))
      .sort((a, b) => new Date(b.submittedDate || b.submittedAt) - new Date(a.submittedDate || a.submittedAt));
  };

  if (loading) {
    return (
      <Container fluid className="bg-light min-vh-100 py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-3 fs-5">Loading token requests...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="bg-light min-vh-100 py-4">
        <Alert variant="danger" className="mx-auto" style={{ maxWidth: '600px' }}>
          <Alert.Heading className="h4">Error</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  const tokenRequests = getTokenRequestHistory();

  return (
    <Container fluid className="bg-light min-vh-100 py-4 px-2 px-md-4">
      <Row className="justify-content-center">
        <Col xl={10} lg={11} md={12}>
          {/* Header Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-primary text-white py-3 py-md-4">
              <Row className="align-items-center g-2">
                <Col xs={12} md={8}>
                  <h2 className="mb-1 fw-bold fs-4 fs-md-3">
                    <i className="fas fa-coins me-2"></i>
                    Token Request History
                  </h2>
                  <p className="mb-0 opacity-75 fs-6 fs-md-5 d-none d-sm-block">
                    Overview of all your token purchase requests
                  </p>
                </Col>
                <Col xs={12} md={4} className="text-md-end">
                  <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                    <i className="fas fa-phone me-2"></i>
                    {phoneNo}
                  </Badge>
                </Col>
              </Row>
            </Card.Header>
          </Card>

          {/* Summary Cards */}
          {tokenRequests.length > 0 && (
            <Row className="mb-4 g-3">
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3 py-md-4">
                    <div className="text-primary display-6 fw-bold fs-3 fs-md-4">
                      {tokenRequests.length}
                    </div>
                    <div className="text-muted fs-6 fs-md-5">Total</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3 py-md-4">
                    <div className="text-success display-6 fw-bold fs-3 fs-md-4">
                      {tokenRequests.filter(req => req.status === 'approved').length}
                    </div>
                    <div className="text-muted fs-6 fs-md-5">Approved</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3 py-md-4">
                    <div className="text-danger display-6 fw-bold fs-3 fs-md-4">
                      {tokenRequests.filter(req => req.status === 'rejected').length}
                    </div>
                    <div className="text-muted fs-6 fs-md-5">Rejected</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3 py-md-4">
                    <div className="text-warning display-6 fw-bold fs-3 fs-md-4">
                      {tokenRequests.filter(req => !['approved', 'rejected'].includes(req.status)).length}
                    </div>
                    <div className="text-muted fs-6 fs-md-5">Pending</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Token Requests Table - Mobile Optimized */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {tokenRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x fa-md-4x text-muted mb-3"></i>
                  <h4 className="text-muted fs-5 fs-md-4">No Token Requests Found</h4>
                  <p className="text-muted fs-6 fs-md-5">You haven't made any token requests yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-lg-block">
                    <Table hover className="mb-0" bordered>
                      <thead className="bg-light">
                        <tr>
                          <th className="py-3 px-4 fs-6 fw-semibold border">Date</th>
                          <th className="py-3 px-4 fs-6 fw-semibold border">Total Paid</th>
                          <th className="py-3 px-4 fs-6 fw-semibold border">Net Tokens</th>
                          <th className="py-3 px-4 fs-6 fw-semibold border">Status</th>
                          <th className="py-3 px-4 fs-6 fw-semibold border">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenRequests.map((request, index) => {
                          const dateTime = formatDate(request.submittedDate);
                          return (
                            <tr key={request.id} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
                              <td className="px-4 py-3 border">
                                <div className="fw-semibold">
                                  {dateTime.date}
                                </div>
                                {dateTime.time && (
                                  <div className="text-muted small">
                                    {dateTime.time}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 border">
                                <span className="fw-bold text-primary fs-5">
                                  {request.requestedTokens?.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 border">
                                <span className="fw-bold text-success fs-5">
                                  {request.netTokens?.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 border">
                                <Badge 
                                  bg={getStatusVariant(request.status)} 
                                  className="fs-6 px-3 py-2"
                                >
                                  <i className={
                                    request.status === 'approved' ? 'fas fa-check me-2' :
                                    request.status === 'rejected' ? 'fas fa-times me-2' :
                                    'fas fa-clock me-2'
                                  }></i>
                                  {request.status?.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 border">
                                {request.rejectionReason ? (
                                  <span className="text-danger fw-semibold">
                                    {request.rejectionReason}
                                  </span>
                                ) : (
                                  <span className="text-muted fst-italic">
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-lg-none p-3">
                    {tokenRequests.map((request, index) => {
                      const dateTime = formatDate(request.submittedDate);
                      return (
                        <Card key={request.id} className="mb-3 border shadow-sm">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                              <div>
                                <div className="text-muted small mb-1">Date</div>
                                <div className="fw-semibold">
                                  {dateTime.date}
                                </div>
                                {dateTime.time && (
                                  <div className="text-muted small">
                                    {dateTime.time}
                                  </div>
                                )}
                              </div>
                              <Badge 
                                bg={getStatusVariant(request.status)} 
                                className="px-2 py-1"
                              >
                                {request.status?.toUpperCase()}
                              </Badge>
                            </div>

                            <Row className="g-3 mb-3 pb-3 border-bottom">
                              <Col xs={6}>
                                <div className="text-muted small mb-1">Total Paid</div>
                                <div className="fw-bold text-primary fs-5">
                                  {request.requestedTokens?.toLocaleString()}
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="text-muted small mb-1">Net Tokens</div>
                                <div className="fw-bold text-success fs-5">
                                  {request.netTokens?.toLocaleString()}
                                </div>
                              </Col>
                            </Row>

                            {request.rejectionReason && (
                              <div>
                                <div className="text-muted small mb-1">Rejection Reason</div>
                                <div className="text-danger fw-semibold">
                                  {request.rejectionReason}
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}