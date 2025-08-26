import React from "react";
import { ExternalLink } from "lucide-react";

export default function AdminTokendetails() {
  const containerStyle = {
    backgroundColor: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    borderRadius: "16px",
    padding: "0 24px 24px 24px",
    maxWidth: "480px",
    margin: "40px auto",
    textAlign: "center",
    overflow: "hidden",
  };

  const headerStyle = {
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
    padding: "16px",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    margin: "0 -24px 20px -24px", // extend header full width inside container
  };

  const noteStyle = {
    color: "#666",
    fontSize: "15px",
    marginBottom: "24px",
    lineHeight: "1.5",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "500",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
    transition: "background 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Token Transaction Details</h2>
      <p style={noteStyle}>
        To view your token transaction details, please visit the Cashfree
        dashboard.
      </p>
      <a
        href="https://merchant.cashfree.com/auth/login"
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
      >
        Go to Cashfree
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
