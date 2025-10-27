import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Container, Card, Badge } from "react-bootstrap";
import API_BASE_URL from "./ApiConfig";

export default function AdminDeleteUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/users`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.success) {
          // Filter out the root user (id: "RootId")
          const filteredUsers = (data.data || []).filter(
            user => user.id !== "RootId" && user.userIds?.myuserid !== "RootId"
          );
          setUsers(filteredUsers);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch users");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
        setError("Error processing user data");
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection error. Please refresh the page.");
      setLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleDeleteUser = async (user) => {
    const userDetails = `
User ID: ${user.userIds?.myuserid || "N/A"}
Name: ${user.name || "N/A"}
Phone: ${user.phoneNo || "N/A"}
Email: ${user.email || "N/A"}
Referral ID: ${user.userIds?.myrefrelid || "N/A"}
Tokens: ${user.tokens || 0}
Entry Fee: ${user.entryFee || "N/A"}
`.trim();

    if (
      window.confirm(
        `ARE YOU SURE YOU WANT TO DELETE THIS USER?\n\n${userDetails}\n\nThis will delete:\n• User account and all data\n• KYC documents\n• Binary tree relationships\n• Game history\n• Payment records`
      )
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/delete-user/${user.userIds?.myuserid}`,
          { method: "DELETE" }
        );
        const data = await response.json();

        if (data.success) {
          alert(`✅ User ${user.name || user.userIds?.myuserid} deleted successfully.`);
          setUsers((prev) =>
            prev.filter(
              (u) => u.userIds?.myuserid !== user.userIds?.myuserid
            )
          );
        } else {
          alert(`❌ Failed to delete: ${data.message}`);
        }
      } catch (err) {
        alert("Error deleting user: " + err.message);
      }
    }
  };

  const styles = {
    headerStyle: {
      background: "linear-gradient(135deg, #0056b3 0%, #007bff 100%)",
      color: "white",
      padding: "24px 30px",
      borderRadius: "0",
      marginBottom: "0",
      boxShadow: "0 4px 6px rgba(0, 123, 255, 0.15)",
    },
    cardStyle: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "none",
      overflow: "hidden",
      marginTop: "30px",
    },
    bodyStyle: {
      backgroundColor: "white",
      padding: "30px",
    },
    tableHeaderStyle: {
      backgroundColor: "#f8f9fa",
      borderBottom: "2px solid #dee2e6",
      fontWeight: "600",
      fontSize: "14px",
      color: "#495057",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      padding: "16px 12px",
    },
    deleteButtonStyle: {
      backgroundColor: "#dc3545",
      border: "none",
      padding: "6px 16px",
      borderRadius: "6px",
      fontWeight: "500",
      fontSize: "13px",
      boxShadow: "0 2px 4px rgba(220, 53, 69, 0.2)",
      transition: "all 0.3s ease",
    },
    headerTitleContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      margin: 0,
      fontSize: "24px",
      fontWeight: "600",
    },
    totalUsersBadge: {
      backgroundColor: "white",
      color: "#007bff",
      fontSize: "14px",
      padding: "8px 16px",
      borderRadius: "20px",
      fontWeight: "600",
    },
    loadingContainer: {
      textAlign: "center",
      padding: "60px",
    },
    loadingText: {
      marginTop: "20px",
      color: "#6c757d",
      fontSize: "16px",
    },
    noUsersContainer: {
      textAlign: "center",
      color: "#6c757d",
      padding: "60px 20px",
      fontSize: "16px",
    },
    noUsersIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      opacity: "0.3",
    },
    tableRow: {
      borderBottom: "1px solid #e9ecef",
    },
    tableCell: {
      padding: "16px 12px",
      verticalAlign: "middle",
    },
    userIdCell: {
      fontWeight: "500",
      color: "#495057",
    },
    tokensCell: {
      fontWeight: "600",
      color: "#007bff",
    },
  };

  if (loading) {
    return (
      <Container fluid style={{ padding: "40px" }}>
        <Card style={styles.cardStyle}>
          <Card.Header style={styles.headerStyle}>
            <h3 style={styles.headerTitle}>Delete User</h3>
          </Card.Header>
          <Card.Body style={{ ...styles.bodyStyle, ...styles.loadingContainer }}>
            <Spinner 
              animation="border" 
              variant="primary" 
              style={{ width: "50px", height: "50px" }} 
            />
            <p style={styles.loadingText}>Loading users...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid style={{ padding: "40px" }}>
        <Card style={styles.cardStyle}>
          <Card.Header style={styles.headerStyle}>
            <h3 style={styles.headerTitle}>Delete User</h3>
          </Card.Header>
          <Card.Body style={styles.bodyStyle}>
            <Alert 
              variant="danger" 
              style={{ borderRadius: "8px", border: "1px solid #f5c2c7" }}
            >
              <strong>Error: </strong>
              {error}
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid style={{ padding: "40px" }}>
      <Card style={styles.cardStyle}>
        <Card.Header style={styles.headerStyle}>
          <div style={styles.headerTitleContainer}>
            <h3 style={styles.headerTitle}>Delete User</h3>
            <div style={styles.totalUsersBadge}>
              Total Users: {users.length}
            </div>
          </div>
        </Card.Header>
        <Card.Body style={styles.bodyStyle}>
          {users.length === 0 ? (
            <div style={styles.noUsersContainer}>
              <div style={styles.noUsersIcon}>👥</div>
              <p style={{ margin: 0 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table hover responsive style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={styles.tableHeaderStyle}>User ID</th>
                    <th style={styles.tableHeaderStyle}>Name</th>
                    <th style={styles.tableHeaderStyle}>Referral ID</th>
                    <th style={styles.tableHeaderStyle}>Phone Number</th>
                    <th style={styles.tableHeaderStyle}>Email</th>
                    <th style={styles.tableHeaderStyle}>Tokens</th>
                    <th style={styles.tableHeaderStyle}>Entry Fee</th>
                    <th style={styles.tableHeaderStyle}>Status</th>
                    <th style={styles.tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userIds?.myuserid || user.userId} style={styles.tableRow}>
                      <td style={{ ...styles.tableCell, ...styles.userIdCell }}>
                        {user.userIds?.myuserid || "N/A"}
                      </td>
                      <td style={styles.tableCell}>{user.name || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {user.userIds?.myrefrelid || user.referralId || "N/A"}
                      </td>
                      <td style={styles.tableCell}>{user.phoneNo || "N/A"}</td>
                      <td style={styles.tableCell}>{user.email || "N/A"}</td>
                      <td style={{ ...styles.tableCell, ...styles.tokensCell }}>
                        {user.tokens || 0}
                      </td>
                      <td style={styles.tableCell}>
                        <Badge
                          bg={user.entryFee === "paid" ? "success" : "warning"}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            borderRadius: "20px",
                          }}
                        >
                          {user.entryFee === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                      <td style={styles.tableCell}>
                        <Badge
                          bg={
                            user.status === "active"
                              ? "success"
                              : user.status === "blocked"
                              ? "danger"
                              : "secondary"
                          }
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            borderRadius: "20px",
                          }}
                        >
                          {user.status || "Unknown"}
                        </Badge>
                      </td>
                      <td style={styles.tableCell}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          style={styles.deleteButtonStyle}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#bb2d3b";
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(220, 53, 69, 0.3)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc3545";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(220, 53, 69, 0.2)";
                          }}
                        >
                          Delete
                        </Button>
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
  );
}