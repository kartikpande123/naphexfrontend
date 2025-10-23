import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CancellationRefundPolicy = () => {
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

  const welcomeBoxStyle = {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    borderLeft: '4px solid #ffc107',
    borderRadius: '10px'
  };

  const warningBoxStyle = {
    background: 'linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%)',
    borderLeft: '4px solid #dc3545',
    borderRadius: '10px'
  };

  const infoBoxStyle = {
    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
    borderLeft: '4px solid #0dcaf0',
    borderRadius: '10px'
  };

  const successBoxStyle = {
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
                <h1 className="display-4 fw-bold mb-2">Cancellation & Refund Policy</h1>
                <p className="lead mb-0" style={{color: '#e3f2fd'}}>Your Rights and Our Commitments</p>
              </div>

              {/* Content */}
              <div className="card-body p-5">
                <div className="text-end mb-4">
                  <small className="text-muted fst-italic">Last updated on 23-10-2025 19:54:49</small>
                </div>

                <Section title="Our Commitment to You" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={welcomeBoxStyle}>
                    <div className="text-dark lh-lg">
                      NADAKATTI ENTERPRISES believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. We strive to ensure your satisfaction while maintaining fair practices for all parties involved.
                    </div>
                  </div>
                </Section>

                <Section title="1. Cancellation Policy" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-4">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Immediate Cancellations:</strong> Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                      </div>
                    </li>
                    <li className="d-flex mb-4">
                      <span style={customBulletStyle}></span>
                      <div>
                        <div className="p-3" style={warningBoxStyle}>
                          <strong className="text-dark">Perishable Items:</strong>
                          <div className="text-muted mt-2">
                            NADAKATTI ENTERPRISES does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="2. Damaged or Defective Items" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4 mb-3" style={infoBoxStyle}>
                    <div className="text-dark lh-lg">
                      In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end.
                    </div>
                  </div>
                  <div className="alert alert-warning border-0 mb-0">
                    <strong>⏰ Time Limit:</strong> This should be reported within <strong>same day</strong> of receipt of the products.
                  </div>
                </Section>

                <Section title="3. Product Expectations" sectionBarStyle={sectionBarStyle}>
                  <ul className="list-unstyled">
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Not as Expected:</strong> In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>same day</strong> of receiving the product.
                      </div>
                    </li>
                    <li className="d-flex mb-3">
                      <span style={customBulletStyle}></span>
                      <div>
                        <strong>Review Process:</strong> The Customer Service Team after looking into your complaint will take an appropriate decision.
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="4. Manufacturer Warranties" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={contactBoxStyle}>
                    <div className="text-dark lh-lg">
                      In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them directly. Our team can assist you with the manufacturer's contact information if needed.
                    </div>
                  </div>
                </Section>

                <Section title="5. Refund Processing" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={successBoxStyle}>
                    <div className="text-dark">
                      <strong className="d-block mb-3">Approved Refunds</strong>
                      <div className="lh-lg">
                        In case of any Refunds approved by NADAKATTI ENTERPRISES, it'll take <strong>3-5 business days</strong> for the refund to be processed to the end customer.
                      </div>
                      <div className="mt-3 p-3 bg-white rounded">
                        <small className="text-muted">
                          💳 Refunds will be credited to the original payment method used during purchase.
                        </small>
                      </div>
                    </div>
                  </div>
                </Section>

                <Section title="6. Contact Customer Service" sectionBarStyle={sectionBarStyle}>
                  <div className="p-4" style={infoBoxStyle}>
                    <div className="text-dark">
                      For any questions or concerns regarding cancellations and refunds, please reach out to our dedicated customer service team. We're here to help!
                      <div className="mt-3">
                        <strong>Response Time:</strong> We aim to respond to all queries within 24-48 hours.
                      </div>
                    </div>
                  </div>
                </Section>

                <div className="mt-5 p-4 bg-light rounded">
                  <p className="text-center text-muted mb-0 small">
                    <strong>Note:</strong> This policy is subject to change without prior notice. Please review this page periodically for updates.
                  </p>
                </div>
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

export default CancellationRefundPolicy;