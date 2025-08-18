import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrivacyPolicy = () => {
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

  const subSectionStyle = {
    background: '#f8f9fa',
    borderLeft: '4px solid #6c757d',
    borderRadius: '8px'
  };

  const cookiesBoxStyle = {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    borderLeft: '4px solid #ffc107',
    borderRadius: '10px'
  };

  const securityBoxStyle = {
    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
    borderLeft: '4px solid #0dcaf0',
    borderRadius: '10px'
  };

  const rightsBoxStyle = {
    background: 'linear-gradient(135deg, #d1e7dd 0%, #a3d9a4 100%)',
    borderLeft: '4px solid #198754',
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
                <h1 className="display-4 fw-bold mb-2">Privacy Policy</h1>
                <p className="lead mb-0" style={{color: '#e3f2fd'}}>Your Privacy is Our Priority</p>
              </div>

              {/* Content */}
              <div className="card-body p-5">
                <div className="text-end mb-4">
                  <small className="text-muted fst-italic">Last Updated: 24.06.2025</small>
                </div>

                <Section title="1. Introduction" sectionBarStyle={sectionBarStyle}>
                  At Naphex, your privacy is our highest priority. This policy explains how we collect, use, store, and disclose your personal information. By using Naphex, you agree to the practices outlined here.
                </Section>

                <Section title="2. Information We Collect" sectionBarStyle={sectionBarStyle}>
                  <div className="mb-3">
                    We collect information you provide directly, data from your activity on the platform, and information from third parties.
                  </div>
                  <SubSection subtitle="2.1 Personal Information You Provide" subSectionStyle={subSectionStyle}>
                    Name, email address, contact number, date of birth, and payment details.
                  </SubSection>
                  <SubSection subtitle="2.2 Automatically Collected Data" subSectionStyle={subSectionStyle}>
                    IP address, session data, and pages visited.
                  </SubSection>
                  <SubSection subtitle="2.3 Additional Verification Data" subSectionStyle={subSectionStyle}>
                    For high-value accounts or recovery: ID, proof of address, etc.
                  </SubSection>
                </Section>

                <Section title="3. How We Use Your Information" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Account Management:</strong> To maintain your account and enable transactions.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Personalization:</strong> To tailor the platform to your preferences.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Legal Compliance:</strong> For AML and regulatory checks.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Communication:</strong> To send updates, responses, and promotions.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="4. Sharing Your Information" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Service Providers:</strong> For payments, fraud checks, support, and analytics.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Legal Authorities:</strong> When required by law or legal processes.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Business Transfers:</strong> If Naphex merges or is acquired, we'll notify you.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="5. Cookies and Tracking Technologies" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={cookiesBoxStyle}>
                    <SubSection subtitle="5.1 Types of Cookies Used" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      <ul className="list-unstyled">
                        <li className="d-flex mb-2">
                          <span style={customBulletStyle}></span>
                          Essential Cookies
                        </li>
                        <li className="d-flex mb-2">
                          <span style={customBulletStyle}></span>
                          Performance Cookies
                        </li>
                      </ul>
                    </SubSection>
                    <SubSection subtitle="5.2 Managing Cookies" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      You can disable cookies through your browser settings, but it may impact functionality.
                    </SubSection>
                  </div>
                </Section>

                <Section title="6. Protecting Your Information" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={securityBoxStyle}>
                    <SubSection subtitle="6.1 Security Measures" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      Encryption, secure storage, audits, and access control protect your data.
                    </SubSection>
                    <SubSection subtitle="6.2 User Responsibility" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      Use strong passwords, don't share them, and report any suspicious activity.
                    </SubSection>
                  </div>
                </Section>

                <Section title="7. Your Rights" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={rightsBoxStyle}>
                    <ul className="list-unstyled mb-0">
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Access and Correction:</strong>
                          <span className="text-muted ms-2">Request or update your data.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Restriction:</strong>
                          <span className="text-muted ms-2">Request restrict processing.</span>
                        </div>
                      </li>
                      
                      <li className="d-flex mb-0">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Withdraw Consent:</strong>
                          <span className="text-muted ms-2">You may request revoke consent at any time.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Section>

                <Section title="8. Third-Party Links" sectionBarStyle={sectionBarStyle}>
                  Naphex may link to external websites. We're not responsible for their privacy practices.
                </Section>

                <Section title="9. Children's Privacy" sectionBarStyle={sectionBarStyle}>
                  Naphex is for users 18+. If a child accesses our service, please report it.
                </Section>

                <Section title="10. Data Retention" sectionBarStyle={sectionBarStyle}>
                  We store your data only as long as necessary. You may request deletion after verifying your identity.
                </Section>

                <Section title="11. International Data Transfers" sectionBarStyle={sectionBarStyle}>
                  Your data may be stored abroad. We ensure compliance with relevant data protection laws.
                </Section>

                <Section title="12. Updates to This Privacy Policy" sectionBarStyle={sectionBarStyle}>
                  We update this policy periodically. Changes will be posted on our platform.
                </Section>

                <Section title="13. Contact Us" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={contactBoxStyle}>
                    <div className="text-dark">
                      <strong>Email:</strong> naphex.com@gmail.com<br />
                      <strong>Phone:</strong> +91-7892739656
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

const SubSection = ({ subtitle, children, subSectionStyle }) => (
  <div className="mb-4 p-3" style={subSectionStyle}>
    <h6 className="fw-semibold text-dark mb-2">{subtitle}</h6>
    <div className="text-muted lh-lg">{children}</div>
  </div>
);

export default PrivacyPolicy;