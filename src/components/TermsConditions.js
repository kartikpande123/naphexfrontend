import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TermsAndConditions = () => {
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

  const welcomeBoxStyle = {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    borderLeft: '4px solid #ffc107',
    borderRadius: '10px'
  };

  const securityBoxStyle = {
    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
    borderLeft: '4px solid #0dcaf0',
    borderRadius: '10px'
  };

  const responsibleBoxStyle = {
    background: 'linear-gradient(135deg, #d1e7dd 0%, #a3d9a4 100%)',
    borderLeft: '4px solid #198754',
    borderRadius: '10px'
  };

  const contactBoxStyle = {
    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    borderLeft: '4px solid #8b5cf6',
    borderRadius: '10px'
  };

  const prohibitedBoxStyle = {
    background: 'linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%)',
    borderLeft: '4px solid #dc3545',
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
                <h1 className="display-4 fw-bold mb-2">Terms & Conditions</h1>
                <p className="lead mb-0" style={{color: '#e3f2fd'}}>Please Read These Terms Carefully</p>
              </div>

              {/* Content */}
              <div className="card-body p-5">
                <div className="text-end mb-4">
                  <small className="text-muted fst-italic">Last Updated: 14.06.2025</small>
                </div>

                <Section title="Welcome to Naphex!" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={welcomeBoxStyle}>
                    <div className="text-dark lh-lg">
                      You agree to follow all the terms and conditions listed here if you use services or features of the website. This operating procedure and policies are designed to ensure a friendly and safe online environment for all participants, so it is important that you carefully review it before using the website. If there is something you do not agree with, please refrain from stepping on it.
                    </div>
                  </div>
                </Section>

                <Section title="1. Overview" sectionBarStyle={sectionBarStyle}>
                  <div className="mb-3">
                    Naphex is a platform meant for online gaming and sports gaming. In order to get the most of this site, you must be a registered member and adhere to these Terms of Agreement.
                  </div>
                  <SubSection subtitle="1.1 Agreement Acceptance" subSectionStyle={subSectionStyle}>
                    Your usage of Naphex affirms your acceptance of these Terms.
                  </SubSection>
                  <SubSection subtitle="1.2 Terms Updates" subSectionStyle={subSectionStyle}>
                    We can update these Terms of Service on occasion, and such modifications will be communicated through our website. However, it is advised to check this page regularly to be updated with modified terms and conditions.
                  </SubSection>
                </Section>

                <Section title="2. Account Management and Security" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={securityBoxStyle}>
                    <SubSection subtitle="2.1 Account Creation" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      To begin the use of Naphex, you need to create an account. You must offer correct and clear information at the time of registration. Please make certain that the information you provide is updated so that we can offer the best possible service.
                    </SubSection>
                    <SubSection subtitle="2.2 Security Responsibility" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      You are expected to take responsibility for maintaining the integrity of your login credentials. If you feel any unauthorized login or activities in your account, let us know via our support channels and help sections.
                    </SubSection>
                    <SubSection subtitle="2.3 Age Requirement" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      You must be at-least 18 years of age or the lawful age in your jurisdiction.
                    </SubSection>
                  </div>
                </Section>

                <Section title="3. Financial Transactions" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Deposits:</strong> After creating your profile, you are asked to deposit money to play the games.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Banking Options:</strong> Naphex offers multiple banking options for your convenience.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Withdrawals:</strong> Withdrawals may take time based on the method and requires verification, based on the payment method you adapt tax will be deducted.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Payment Details:</strong> Double-check all payment details as they cannot be reversed.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="4. Promotions and Bonuses" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Bonus Offers:</strong> Naphex offers promotions and bonuses to enhance your experience.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Specific Terms:</strong> Every promotion has specific terms, such as minimum deposits.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Bonus Forfeiture:</strong> Failure to meet these terms may void the bonus and related winnings.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="5. Responsible Gaming" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={responsibleBoxStyle}>
                    <SubSection subtitle="5.1 Gaming Tools" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      We offer tools like Account overview, request for deactivation of the account via our support channel and reminders to help you manage your gaming experience.
                    </SubSection>
                    <SubSection subtitle="5.2 Support Resources" subSectionStyle={{...subSectionStyle, background: 'rgba(255,255,255,0.7)'}}>
                      If your gaming becomes problematic, please reach out to our support team or seek professional help.
                    </SubSection>
                  </div>
                </Section>

                <Section title="6. Gaming Rules" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Game Policies:</strong> Each game comes with specific rules. Read all game policies before playing the game.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Action Finality:</strong> Game Action cannot be reversed once placed.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Event Cancellation:</strong> If an event is canceled, we may refund or adjust the tokens accordingly.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="7. Prohibited Conduct" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={prohibitedBoxStyle}>
                    <ul className="list-unstyled mb-0">
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Fraud and Cheating:</strong>
                          <span className="text-muted ms-2">Strictly prohibited and will result in account suspension.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-3">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Multiple Accounts:</strong>
                          <span className="text-muted ms-2">Using multiple accounts to exploit rewards is not allowed.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-0">
                        <span style={customBulletStyle}></span>
                        <div>
                          <strong className="text-dark">Personal Involvement:</strong>
                          <span className="text-muted ms-2">You cannot wager on events in which you are personally involved.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Section>

                <Section title="8. Account Termination and Suspension" sectionBarStyle={sectionBarStyle}>
                  <SubSection subtitle="8.1 Platform Rights" subSectionStyle={subSectionStyle}>
                    We reserve the right to suspend or terminate accounts that violate terms.
                  </SubSection>
                  <SubSection subtitle="8.2 Voluntary Closure" subSectionStyle={subSectionStyle}>
                    You may also request voluntary closure through help support.
                  </SubSection>
                  <SubSection subtitle="8.3 Refund Policy" subSectionStyle={subSectionStyle}>
                    Refunds will be subject to withdrawal conditions and verification processes.
                  </SubSection>
                </Section>

                <Section title="9. Privacy and Data Protection" sectionBarStyle={sectionBarStyle}>
                  Your data is protected and collected for service delivery. See our Privacy Policy for details. By using Naphex, you agree to these practices.
                </Section>

                <Section title="10. Liability Disclaimer" sectionBarStyle={sectionBarStyle}>
                  Naphex is not liable for technical issues, data loss, or problems from third-party providers.
                </Section>

                <Section title="11. Dispute Resolution" sectionBarStyle={sectionBarStyle}>
                  Contact support for disputes. If unresolved, legal steps may be taken under applicable jurisdiction laws.
                </Section>

                <Section title="12. Governing Law" sectionBarStyle={sectionBarStyle}>
                  These terms follow the laws of the jurisdiction where Naphex operates.
                </Section>

                <Section title="13. Modifications to These Terms" sectionBarStyle={sectionBarStyle}>
                  We may update these terms anytime. Continued use of the platform indicates acceptance of updated terms.
                </Section>

                <Section title="14. Contact Information" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={contactBoxStyle}>
                    <div className="text-dark">
                      Reach us with any questions about your account or these terms.<br /><br />
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

export default TermsAndConditions;