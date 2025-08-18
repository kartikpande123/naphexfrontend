import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const RulesAndRegulations = () => {
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

  const claimBoxStyle = {
    background: 'linear-gradient(135deg, #d1e7dd 0%, #a3d9a4 100%)',
    borderLeft: '4px solid #198754',
    borderRadius: '10px'
  };

  const freeplayBoxStyle = {
    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    borderLeft: '4px solid #8b5cf6',
    borderRadius: '10px'
  };

  const subSectionStyle = {
    background: '#f8f9fa',
    borderLeft: '4px solid #6c757d',
    borderRadius: '8px'
  };

  return (
    <div style={gradientBackgroundStyle} className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0" style={cardStyle}>
              {/* Enhanced Header */}
              <div className="card-header text-white text-center py-5" style={gradientHeaderStyle}>
                <h1 className="display-4 fw-bold mb-2">Naphex</h1>
                <p className="lead mb-0" style={{color: '#e3f2fd'}}>Rules and Regulations</p>
              </div>

              {/* Content */}
              <div className="card-body p-5">
                <Section 
                  title="Exchange Rules & Regulations at Naphex" 
                  sectionBarStyle={sectionBarStyle}
                >
                  All terms and conditions are stated in English and take precedence over any translated versions. Ensure you understand and accept these before using the platform.
                </Section>

                <Section 
                  title="Naphex Bonus Guidelines" 
                  sectionBarStyle={sectionBarStyle}
                >
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Naphex provides several attractive bonus programs determined solely by the platform.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Bonus amounts, terms, and conditions are non-negotiable and subject to change without prior notice.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Refer to the notification section regularly for current bonus events.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      No disputes regarding bonus offers will be entertained; Naphex's decisions are final.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Each bonus has specific terms like wagering requirements, expiry dates, and withdrawal caps. Always check bonus banners or your user account for details.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      If there is a conflict between promotional material and Naphex's terms, Naphex's terms will apply.
                    </li>
                  </ul>
                </Section>

                <Section 
                  title="Bonus Usage" 
                  sectionBarStyle={sectionBarStyle}
                >
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Bonuses have requirements (often multiple times the bonus amount) and a fixed time to complete them.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      If requirements are met, the bonus converts to real money that can be withdrawn.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      Real money is used first before bonus money in games.
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      All played games during the bonus period (real or bonus) contribute to the wagering goal.
                    </li>
                  </ul>
                </Section>

                <Section 
                  title="How to Get Your Welcome Bonus" 
                  sectionBarStyle={sectionBarStyle}
                >
                  <SubSection 
                    subtitle="Eligibility" 
                    subSectionStyle={subSectionStyle}
                  >
                    Only first-time registered users are eligible, and the welcome bonus can only be claimed with the first deposit.
                  </SubSection>
                  <SubSection 
                    subtitle="Bonus Restrictions" 
                    subSectionStyle={subSectionStyle}
                  >
                    The welcome bonus cannot be combined with any other offer or promotion.
                  </SubSection>
                  <SubSection 
                    subtitle="Technical Issues" 
                    subSectionStyle={subSectionStyle}
                  >
                    Missed bonuses due to technical errors are not automatically added. Please contact support to resolve such cases.
                  </SubSection>
                  <SubSection 
                    subtitle="Bonus Abuse" 
                    subSectionStyle={subSectionStyle}
                  >
                    Any misuse or fraudulent activity may lead to cancellation of the bonus and permanent account closure.
                  </SubSection>
                </Section>

                <Section 
                  title="How to Claim Your Naphex Bonus" 
                  sectionBarStyle={sectionBarStyle}
                >
                  <div className="p-4" style={claimBoxStyle}>
                    <ol className="list-unstyled mb-0">
                      <li className="d-flex mb-4">
                        <span style={stepNumberStyle}>1</span>
                        <div>
                          <strong className="text-dark">Register & Login:</strong>
                          <span className="text-muted ms-2">Create an account and log in.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-4">
                        <span style={stepNumberStyle}>2</span>
                        <div>
                          <strong className="text-dark">Deposit:</strong>
                          <span className="text-muted ms-2">Add funds through the "Account" section.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-4">
                        <span style={stepNumberStyle}>3</span>
                        <div>
                          <strong className="text-dark">Claim:</strong>
                          <span className="text-muted ms-2">Automatically bonus will sent to your account according to binary Performance.</span>
                        </div>
                      </li>
                      <li className="d-flex mb-0">
                        <span style={stepNumberStyle}>4</span>
                        <div>
                          <strong className="text-dark">Enjoy:</strong>
                          <span className="text-muted ms-2">Bonus everyday according to your Performance of binary.</span>
                        </div>
                      </li>
                    </ol>
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
  <div className="ms-4 mb-4 p-3" style={subSectionStyle}>
    <h6 className="fw-semibold text-dark mb-2">{subtitle}</h6>
    <div className="text-muted lh-lg">{children}</div>
  </div>
);

export default RulesAndRegulations;