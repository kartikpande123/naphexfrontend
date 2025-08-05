import React from 'react';

export default function AddTokens() {
  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '80px auto',
        padding: '30px',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <h4 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Payment Gateway Notice</h4>
      <p style={{ fontSize: '1rem', color: '#333' }}>
        Our payment gateway is currently under process and pending approval.
        The website has not been officially launched yet, so please do <strong>not make any payments</strong> at this time.
        We will notify you once everything is live and secure for transactions.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '20px' }}>
        Thank you for your patience and understanding.
      </p>
    </div>
  );
}
