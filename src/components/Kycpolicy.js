import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const KycPolicy = () => {
  const gradientHeaderStyle = {
    background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
    borderBottom: '4px solid #0a58ca'
  };

  const gradientBackgroundStyle = {
    background: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
    minHeight: '100vh'
  };

  const cardStyle = {
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  };

  const sectionBarStyle = {
    width: '4px',
    height: '30px',
    background: 'linear-gradient(180deg, #0d6efd 0%, #6610f2 100%)',
    borderRadius: '10px'
  };

  const customBulletStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: '#0d6efd',
    borderRadius: '50%',
    marginTop: '8px',
    marginRight: '12px',
    flexShrink: 0
  };

  const stepNumberStyle = {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '15px',
    marginTop: '2px',
    flexShrink: 0
  };

  const verificationBoxStyle = {
    background: 'linear-gradient(135deg, #d1e7dd 0%, #a3d9a4 100%)',
    borderLeft: '4px solid #198754',
    borderRadius: '10px'
  };

  const riskFrameworkBoxStyle = {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    borderLeft: '4px solid #ffc107',
    borderRadius: '10px'
  };

  const contactBoxStyle = {
    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    borderLeft: '4px solid #8b5cf6',
    borderRadius: '10px'
  };

  return (
    <div style={gradientBackgroundStyle} className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0" style={cardStyle}>
              {/* Enhanced Header */}
              <div className="card-header text-white text-center py-5" style={gradientHeaderStyle}>
                <h1 className="display-4 fw-bold mb-2">KYC Policy</h1>
                <p className="lead mb-0" style={{color: '#e3f2fd'}}>at Naphex</p>
              </div>

              {/* Content */}
              <div className="card-body p-5">
                <div className="text-end mb-4">
                  <small className="text-muted fst-italic">Last Updated: 24.06.2025</small>
                </div>

                <Section title="Objective" sectionBarStyle={sectionBarStyle}>
                  At Naphex, we care about the security of our users' data, user information, and transactions.
                  Our KYC policy helps verify users' identities to prevent fraud, identity theft, and financial crimes.
                  It supports compliance with national and international anti-money laundering (AML) and terrorism financing (TF) regulations.
                </Section>

                <Section title="Compliance with Regulatory Framework" sectionBarStyle={sectionBarStyle}>
                  We follow EU directives and national laws to ensure that Naphex remains a secure, legal, and trusted platform for all users.
                </Section>

                <Section title="Key Regulations" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>EU Directive 2015/849:</strong> Prevents money laundering and terrorist financing.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>EU Regulation 2015/847:</strong> Ensures safe transfer of funds by requiring detailed information exchange.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Belgian Legislation (18 Sept 2017):</strong> Restricts cash usage to combat money laundering.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="Money Laundering (ML) Definition" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Transferring or acquiring criminal property
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Concealing or misrepresenting the source or ownership
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Using criminally derived funds
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Assisting or facilitating money laundering
                    </li>
                  </ul>
                </Section>

                <Section title="AML Organization and Responsibilities" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Senior Management:</strong> Oversees effective AML enforcement
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>AML Compliance Officer (AMLCO):</strong> Implements policies and conducts audits
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="Verification Process" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={verificationBoxStyle}>
                    <ol className="list-unstyled mb-0">
                      <li className="d-flex mb-4">
                        <span style={stepNumberStyle}>1</span>
                        <div>
                          <strong className="text-dark">Step 1 – Initial Assessment:</strong>
                          <span className="text-muted ms-2">Full name, DOB, gender, country, full address</span>
                        </div>
                      </li>
                      <li className="d-flex mb-4">
                        <span style={stepNumberStyle}>2</span>
                        <div>
                          <strong className="text-dark">Step 2 – Detailed Analysis:</strong>
                          <span className="text-muted ms-2">ID proof, selfie with ID, 6-digit code</span>
                        </div>
                      </li>
                      <li className="d-flex mb-0">
                        <span style={stepNumberStyle}>3</span>
                        <div>
                          <strong className="text-dark">Step 3 – Source of Wealth:</strong>
                          <span className="text-muted ms-2">Required if transactions exceed INR 5,000 or transfers exceed INR 3,000</span>
                        </div>
                      </li>
                    </ol>
                  </div>
                </Section>

                <Section title="Customer Verification Process" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Submit valid ID (passport, driver's license, etc.)
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Selfie with ID
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Handwritten note with 6-digit code provided by Naphex
                    </li>
                  </ul>
                </Section>

                <Section title="Address Verification" sectionBarStyle={sectionBarStyle}>
                  <div className="mb-3">
                    If automated address verification fails, you must upload:
                  </div>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Utility bill (electricity/gas/water)
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Bank statement or government letter
                    </li>
                  </ul>
                </Section>

                <Section title="Source of Wealth (SOW) Verification" sectionBarStyle={sectionBarStyle}>
                  <div className="mb-3">
                    Required for deposits over $5,000:
                  </div>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Proof of business ownership or employment
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Inheritance or investment-related documentation
                    </li>
                  </ul>
                </Section>

                <Section title="Risk Management Framework" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={riskFrameworkBoxStyle}>
                    <div className="mb-3">We categorize countries by risk level:</div>
                    <ul className="list-unstyled mb-0">
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Low-Risk:</strong>
                          <span className="text-muted ms-2">Standard KYC</span>
                        </div>
                      </li>
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Medium-Risk:</strong>
                          <span className="text-muted ms-2">Stricter limits & controls</span>
                        </div>
                      </li>
                      <li className="d-flex mb-0">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">High-Risk:</strong>
                          <span className="text-muted ms-2">Access to platform denied</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Section>

                <Section title="Ongoing Monitoring & Compliance" sectionBarStyle={sectionBarStyle}>
                  User activities are continuously monitored, and suspicious behavior is reported to the proper authorities.
                </Section>

                <Section title="Record Keeping and Data Security" sectionBarStyle={sectionBarStyle}>
                  All data is stored securely and encrypted for a minimum of 10 years in accordance with data protection laws.
                </Section>

                <Section title="Staff Training & Internal Audits" sectionBarStyle={sectionBarStyle}>
                  Our staff regularly undergo AML training and participate in internal policy audits.
                </Section>

                <Section title="Reporting Suspicious Activities" sectionBarStyle={sectionBarStyle}>
                  All employees are trained to report unusual activity. Verified cases are forwarded to law enforcement when needed.
                </Section>

                <Section title="Contact Us" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={contactBoxStyle}>
                    <div className="text-dark">
                      For any queries related to this policy:<br />
                      <div className="mt-3">
                        <strong>Email:</strong> naphex.com@gmail.com<br />
                        <strong>Phone:</strong> +91-7892739656
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children, sectionBarStyle }) => (
  <div className="mb-5">
    <div className="d-flex align-items-center mb-4">
      <div style={sectionBarStyle} className="me-3"></div>
      <h4 className="h3 fw-bold text-dark mb-0">{title}</h4>
    </div>
    <div className="text-muted lh-lg ps-4">{children}</div>
  </div>
);

export default KycPolicy;