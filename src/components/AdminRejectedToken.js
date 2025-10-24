import React, { useEffect, useState } from "react";
import { Table, Container, Row, Col, Form, Spinner, Alert, Image, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from "./ApiConfig";

const RejectedTokenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  // Fetch all requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-add-token-requests`);
        const data = await response.json();

        if (data.success) {
          // Filter only rejected requests
          const rejected = data.requests.filter((req) => req.status === "rejected");
          setRequests(rejected);
          setFilteredRequests(rejected);
        } else {
          setError("No rejected requests found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch rejected requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter by date
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    if (!date) {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter((req) => {
      const reqDate = new Date(req.rejectedDate).toISOString().split("T")[0];
      return reqDate === date;
    });

    setFilteredRequests(filtered);
  };

  return (
    <div style={styles.page}>
      <Container className="py-4">
        {/* Header Section */}
        <Card className="border-0 shadow-lg mb-4" style={styles.headerCard}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col>
                <h1 style={styles.headerTitle}>Rejected Token Requests</h1>
                <p style={styles.headerSubtitle}>
                  Manage and review all rejected token requests in one place
                </p>
              </Col>
              <Col xs="auto">
                <div style={styles.iconWrapper}>
                  <i className="bi bi-x-circle-fill" style={styles.headerIcon}></i>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Content Section */}
        <Card className="border-0 shadow-sm" style={styles.contentCard}>
          <Card.Body className="p-4">
            {/* Filter Section */}
            <Row className="mb-4 align-items-end">
              <Col xs={12} md={6} lg={4}>
                <Form.Group>
                  <Form.Label style={styles.filterLabel}>
                    <i className="bi bi-calendar3 me-2"></i>
                    Filter by Date
                  </Form.Label>
                  <Form.Control 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange}
                    style={styles.dateInput}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={8} className="text-md-end mt-2 mt-md-0">
                <div style={styles.statsBadge}>
                  <span style={styles.statsText}>
                    Total Rejected: <strong>{filteredRequests.length}</strong>
                  </span>
                </div>
              </Col>
            </Row>

            {/* Loading State */}
            {loading && (
              <div className="text-center p-5">
                <Spinner animation="border" style={styles.spinner} />
                <p className="mt-3" style={styles.loadingText}>
                  Loading rejected requests...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert variant="danger" className="mt-3 text-center" style={styles.alert}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            {/* No Data State */}
            {!loading && !error && filteredRequests.length === 0 && (
              <Alert variant="warning" className="mt-3 text-center" style={styles.alert}>
                <i className="bi bi-inbox me-2"></i>
                No rejected requests found {selectedDate && "for this date"}.
              </Alert>
            )}

            {/* Data Table */}
            {!loading && !error && filteredRequests.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover responsive className="mt-3" style={styles.table}>
                  <thead style={styles.tableHead}>
                    <tr>
                      <th style={styles.tableHeader}>User Name</th>
                      <th style={styles.tableHeader}>Phone Number</th>
                      <th style={styles.tableHeader}>Amount Paid</th>
                      <th style={styles.tableHeader}>Net Tokens</th>
                      <th style={styles.tableHeader}>Rejection Reason</th>
                      <th style={styles.tableHeader}>Screenshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req, index) => (
                      <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.tableCell}>
                          <div style={styles.userInfo}>
                            <i className="bi bi-person-circle me-2" style={styles.userIcon}></i>
                            {req.userName || "N/A"}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.phoneInfo}>
                            <i className="bi bi-telephone-fill me-2" style={styles.phoneIcon}></i>
                            {req.phoneNo || "N/A"}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.amountText}>
                            ₹{req.amountPaid || req.requestedTokens || 0}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.tokenBadge}>
                            {req.netTokens || 0}
                          </span>
                        </td>
                        <td style={styles.rejectionCell}>
                          <div style={styles.rejectionReason}>
                            <i className="bi bi-x-octagon-fill me-2"></i>
                            {req.rejectionReason || "No reason provided"}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          {req.screenshotUrl ? (
                            <a 
                              href={req.screenshotUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={styles.screenshotLink}
                            >
                              <Image
                                src={req.screenshotUrl}
                                alt="Screenshot"
                                thumbnail
                                style={styles.screenshotImage}
                              />
                              <div style={styles.viewText}>View</div>
                            </a>
                          ) : (
                            <span style={styles.naText}>N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

// 🎨 Enhanced Styling
const styles = {
  page: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    paddingTop: "20px",
    paddingBottom: "40px",
  },
  headerCard: {
    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
    borderRadius: "12px",
    color: "white",
  },
  headerTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  headerSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    marginBottom: 0,
  },
  iconWrapper: {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  headerIcon: {
    fontSize: "2.5rem",
    color: "white",
  },
  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
  },
  filterLabel: {
    fontWeight: "600",
    color: "#495057",
    fontSize: "1rem",
    marginBottom: "8px",
  },
  dateInput: {
    borderRadius: "8px",
    border: "2px solid #e9ecef",
    padding: "10px",
    fontSize: "1rem",
  },
  statsBadge: {
    background: "#f8f9fa",
    padding: "10px 20px",
    borderRadius: "25px",
    border: "2px solid #e9ecef",
  },
  statsText: {
    color: "#6c757d",
    fontSize: "1rem",
    fontWeight: "500",
  },
  spinner: {
    color: "#007bff",
    width: "3rem",
    height: "3rem",
  },
  loadingText: {
    color: "#6c757d",
    fontSize: "1.1rem",
    fontWeight: "500",
  },
  alert: {
    borderRadius: "10px",
    fontSize: "1rem",
    padding: "15px 20px",
    border: "none",
  },
  table: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tableHead: {
    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
  },
  tableHeader: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "1rem",
    padding: "15px 12px",
    border: "none",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  tableCell: {
    padding: "15px 12px",
    verticalAlign: "middle",
    textAlign: "center",
    borderColor: "#dee2e6",
    fontSize: "0.95rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
  },
  userIcon: {
    color: "#007bff",
    fontSize: "1.2rem",
  },
  phoneInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneIcon: {
    color: "#28a745",
    fontSize: "0.9rem",
  },
  amountText: {
    fontWeight: "600",
    color: "#28a745",
    fontSize: "1rem",
  },
  tokenBadge: {
    background: "#17a2b8",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  rejectionCell: {
    padding: "15px 12px",
    verticalAlign: "middle",
    textAlign: "center",
    borderColor: "#dee2e6",
    maxWidth: "250px",
  },
  rejectionReason: {
    color: "#dc3545",
    fontWeight: "500",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  screenshotLink: {
    display: "inline-block",
    textDecoration: "none",
    position: "relative",
    transition: "transform 0.2s ease",
  },
  screenshotImage: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #dee2e6",
    transition: "all 0.3s ease",
  },
  viewText: {
    fontSize: "0.8rem",
    color: "#007bff",
    marginTop: "4px",
    fontWeight: "500",
  },
  naText: {
    color: "#6c757d",
    fontStyle: "italic",
  },
};

export default RejectedTokenRequests;