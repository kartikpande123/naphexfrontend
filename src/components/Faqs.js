import React, { useState } from 'react';

const ResponsibleGaming = () => {
  const [activeAccordion, setActiveAccordion] = useState("0");

  const toggleAccordion = (eventKey) => {
    setActiveAccordion(activeAccordion === eventKey ? "" : eventKey);
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center',
    marginBottom: '0'
  };

  const containerStyle = {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    paddingTop: '0',
    paddingBottom: '50px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '15px',
    overflow: 'hidden'
  };

  const accordionButtonStyle = (isActive) => ({
    backgroundColor: isActive ? '#e3f2fd' : 'white',
    color: isActive ? '#1565c0' : '#333',
    border: 'none',
    borderBottom: '1px solid #e0e0e0',
    padding: '20px 25px',
    fontSize: '16px',
    fontWeight: '600',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  const accordionContentStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px 25px',
    borderBottom: '1px solid #e0e0e0',
    color: '#555',
    lineHeight: '1.6'
  };

  const sectionStyle = {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.3s ease'
  };

  const supportStyle = {
    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
    border: '1px solid #4caf50',
    borderLeft: '5px solid #4caf50',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '20px'
  };

  const conclusionStyle = {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: 'white',
    borderRadius: '10px',
    padding: '30px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div className="container-fluid p-0">
        {/* Header */}
        <div style={headerStyle}>
          <h1 className="display-4 fw-bold mb-3">Responsible Gaming</h1>
          <p className="lead mb-3">Your safety and well-being are our priority</p>
          <small style={{ opacity: 0.8 }}>Last updated: 14.06.2025</small>
        </div>

        <div className="container py-5">
          <div style={cardStyle}>
            <div className="p-4">
              {/* FAQs Section */}
              <div className="mb-5">
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#1565c0', fontSize: '2.5rem' }}>
                  Frequently Asked Questions
                </h2>
                
                <div className="accordion-custom">
                  {faqData.map((faq, index) => (
                    <div key={index} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' }}>
                      <button
                        style={accordionButtonStyle(activeAccordion === index.toString())}
                        onClick={() => toggleAccordion(index.toString())}
                        onMouseEnter={(e) => e.target.style.backgroundColor = activeAccordion === index.toString() ? '#e3f2fd' : '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = activeAccordion === index.toString() ? '#e3f2fd' : 'white'}
                      >
                        <span>{faq.question}</span>
                        <span style={{ 
                          transform: activeAccordion === index.toString() ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                          fontSize: '20px'
                        }}>
                          ▼
                        </span>
                      </button>
                      {activeAccordion === index.toString() && (
                        <div style={accordionContentStyle}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Sections */}
              <div>
                {sections.map((section, idx) => (
                  <div 
                    key={idx} 
                    style={sectionStyle}
                    onMouseEnter={(e) => e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'}
                  >
                    <h4 className="fw-semibold mb-3" style={{ color: '#1565c0', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
                      {section.title}
                    </h4>
                    <div style={{ color: '#555', lineHeight: '1.7' }}>
                      {section.content}
                    </div>
                  </div>
                ))}

                {/* Support Section */}
                <div style={supportStyle}>
                  <h4 className="fw-semibold mb-3" style={{ color: '#2e7d32' }}>
                    Support and Assistance from Naphex
                  </h4>
                  <p className="mb-3" style={{ color: '#555' }}>For help or guidance, reach out to us:</p>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="me-3 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: '#4caf50', 
                            borderRadius: '50%',
                            color: 'white'
                          }}
                        >
                          ✉
                        </div>
                        <div>
                          <strong>Email: </strong>
                          <a 
                            href="mailto:naphex.com@gmail.com" 
                            style={{ color: '#1565c0', textDecoration: 'none' }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          >
                            naphex.com@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="me-3 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: '#2196f3', 
                            borderRadius: '50%',
                            color: 'white'
                          }}
                        >
                          ☎
                        </div>
                        <div>
                          <strong>Phone: </strong>
                          <a 
                            href="tel:+917892739656" 
                            style={{ color: '#1565c0', textDecoration: 'none' }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          >
                            +91-7892739656
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conclusion */}
                <div style={conclusionStyle}>
                  <h4 className="fw-semibold mb-3">Our Commitment</h4>
                  <p className="lead mb-0">
                    Responsible gaming keeps the experience enjoyable and safe. Naphex is committed to ensuring that you play responsibly.
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

const faqData = [
  {
    question: "What is responsible gaming?",
    answer: "It's the practice of keeping gambling under control to ensure it remains fun and risk-free."
  },
  {
    question: "What tools does Naphex provide for responsible gaming?",
    answer: "Naphex offers self-assessment tools, spending trackers, limit setting, and self-exclusion options."
  },
  {
    question: "How can I self-exclude from Naphex?",
    answer: "Contact Naphex customer support or use the self-exclusion feature directly on the website."
  },
  {
    question: "How does Naphex protect minors?",
    answer: "With strict age verification and support for parental filtering software."
  },
  {
    question: "How do I reach Naphex support?",
    answer: (
      <span>
        Email us at <a 
          href="mailto:naphex.com@gmail.com" 
          style={{ color: '#1565c0', textDecoration: 'underline' }}
        >
          naphex.com@gmail.com
        </a> or call <a 
          href="tel:+917892739656" 
          style={{ color: '#1565c0', textDecoration: 'underline' }}
        >
          +91-7892739656
        </a>.
      </span>
    )
  }
];

const sections = [
  {
    title: "Responsible Gaming at Naphex",
    content: "Responsible gaming means enjoying games within healthy limits while avoiding potential risks of problem gambling. At Naphex, we prioritize user safety and integrity, creating a space where fun stays safe."
  },
  {
    title: "What is Responsible Gaming?",
    content: "It's the conscious decision to gamble for fun without letting it impact your financial, mental, or relationship security."
  },
  {
    title: "Why is Responsible Gaming Important?",
    content: "Irresponsible gaming can lead to financial stress, addiction, and personal conflict. With control, the joy of gaming can be preserved."
  },
  {
    title: "Elements of Responsible Gaming",
    content: "Setting limits, taking breaks, and using awareness tools are key components of responsible gaming behavior."
  },
  {
    title: "Naphex's Commitment to Responsible Gaming",
    content: "We offer a secure and transparent environment that supports healthy gaming practices."
  },
  {
    title: "Advanced Tools for Player Safety",
    content: "Naphex uses tech-based solutions like spending trackers and personalized reports to help players stay informed and in control."
  },
  {
    title: "Guidelines on Healthy Gaming Habits",
    content: "Clear instructions on setting session limits and taking regular breaks are provided across the platform to promote smart habits."
  },
  {
    title: "Self-Assessment for Players",
    content: (
      <span>
        Use the <a 
          href="https://www.begambleaware.org" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#1565c0', textDecoration: 'underline' }}
        >
          BeGambleAware self-test
        </a> to evaluate your gaming habits and identify early signs of concern.
      </span>
    )
  },
  {
    title: "Setting Gaming Activity Limits",
    content: "Players can set spending limits within their Naphex account and supplement with personal budgets to prevent overspending."
  },
  {
    title: "Knowing When to Take a Break",
    content: "Breaks improve clarity and reduce risk. Naphex recommends regular time-outs from gaming activities."
  },
  {
    title: "Do Not Gamble Under the Influence",
    content: "Avoid gambling under the influence of alcohol or drugs, as this impairs judgment and increases risk."
  },
  {
    title: "Protection of Minors from Gambling",
    content: "Naphex uses a strict age verification system to prevent minors from accessing gambling services."
  },
  {
    title: "Parental Controls and Monitoring",
    content: "Parents are encouraged to use tools like Net Nanny to restrict access and monitor device usage for minors."
  },
  {
    title: "Keeping Credentials Private",
    content: "Ensure that login details are confidential and secure, especially in shared or family devices."
  },
  {
    title: "Commitment to Self-Exclusion",
    content: "Users may voluntarily exclude themselves for periods (6 months to 5 years), during which account creation is disabled."
  },
  {
    title: "Self-Exclusion Support",
    content: "Naphex's support team is ready to assist in setting up or managing self-exclusion."
  }
];

export default ResponsibleGaming;