import React from 'react';
import { Shield, Trophy, Users, Mail, Star, Gamepad2, Lock, CheckCircle } from 'lucide-react';
import logo from "../images/logo-1.png";
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const gradientBg = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '1.5rem',
    transition: 'all 0.3s ease-in-out'
  };

  const heroCardStyle = {
    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.5) 100%)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '2rem'
  };

  const iconBg = {
    background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
    borderRadius: '1rem'
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #2563eb, #0891b2)',
    border: 'none',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <div style={gradientBg}>
      {/* Bootstrap CSS CDN */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      {/* Hero Section */}
      <div className="position-relative overflow-hidden">
        <div 
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)'
          }}
        ></div>
        <div className="position-relative">
          <div className="container py-5">
            <div className="row justify-content-center py-5">
              <div className="col-12 text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center mb-4 shadow-lg"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
                    borderRadius: '50%'
                  }}
                >
                  <img src={logo} alt='logo' style={{height:"100px", width:"100px", borderRadius:"50%"}}/>
                </div>
                <h2 
                  className="h3 text-light mb-2"
                  style={{
                    background: 'linear-gradient(45deg, #60a5fa, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  NADAKATTI ENTERPRISES PRESENTS
                </h2>
                <h1 
                  className="display-1 fw-bold mb-4"
                  style={{
                    background: 'linear-gradient(45deg, #60a5fa, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Naphex
                </h1>
                <p className="lead text-light fs-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  A premium product of Nadakatti Enterprises - Your premier destination for world-class online gaming experiences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Welcome Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-12">
            <div className="p-4 p-md-5 shadow-lg" style={heroCardStyle}>
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ width: '48px', height: '48px', ...iconBg }}
                >
                  <Users size={24} color="white" />
                </div>
                <h1 className="h1 text-white mb-0 fw-bold">Welcome to Naphex</h1>
              </div>
              <div className="text-light fs-5 lh-lg">
                <p className="mb-4">
                  Welcome to Naphex, a premium online gaming platform brought to you by Nadakatti Enterprises. 
                  We offer a wide range of gaming options to users including, online slots, 
                  and sports gaming that you can enjoy using your device such as mobile and laptop.
                </p>
                <p className="mb-4">
                  As a sub-product of Nadakatti Enterprises, Naphex upholds the same standards of excellence 
                  and innovation. We offer live gaming options on different sports and games 
                  . At Naphex, we provide the best gaming experience 
                  to users and the chance to test their skills and win real rewards.
                </p>
                <p className="mb-0">
                  Backed by Nadakatti Enterprises reputation for quality and reliability, we ensure that all 
                  of your personal and financial data is safe and secured. We use industry-standard encryption 
                  and follow strict safety protocols so that users can experience worry-free gaming and focus 
                  more on their games.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="row g-4 mb-5">
          {/* Fairness and Security */}
          <div className="col-12 col-lg-6">
            <div 
              className="p-4 shadow-lg h-100"
              style={{
                ...cardStyle,
                background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ width: '48px', height: '48px', ...iconBg }}
                >
                  <Shield size={24} color="white" />
                </div>
                <h3 className="h2 text-white mb-0 fw-bold">Fairness & Security</h3>
              </div>
              <div className="text-light fs-6 lh-lg">
                <p className="mb-3">
                  Our platform is designed to offer a fair and transparent gaming experience to users, and for this, 
                  we incorporate an advanced fairness policy for our gaming providers.
                </p>
                <p className="mb-4">
                  This audit helps us ensure that the outcomes generated by the games on our platform will be random 
                  and unbiased. Here, we are committed to offering you a platform on which you can trust and rely for 
                  all your gaming needs without any concern.
                </p>
                <div className="d-flex align-items-center" style={{ color: '#22d3ee' }}>
                  <CheckCircle size={20} className="me-2" />
                  <span className="fw-semibold">Industry-Standard Encryption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gaming Experience */}
          <div className="col-12 col-lg-6">
            <div 
              className="p-4 shadow-lg h-100"
              style={{
                ...cardStyle,
                background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.4) 0%, rgba(30, 58, 138, 0.4) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
                    borderRadius: '1rem'
                  }}
                >
                  <Trophy size={24} color="white" />
                </div>
                <h3 className="h2 text-white mb-0 fw-bold">Your Gaming Experience</h3>
              </div>
              <div className="text-light fs-6 lh-lg">
                <p className="mb-3">
                  Here, you get the gaming environment where you can test your skills with complete safety at all times 
                  and have confidence in the integrity of all the games.
                </p>
                <p className="mb-4">
                  With a major focus on simplicity, safety, and fairness, we offer the best possible gaming experience 
                  to our players. Based on feedback and market demand, we keep updating our services to meet the 
                  expectations of our users.
                </p>
                <div className="d-flex align-items-center" style={{ color: '#60a5fa' }}>
                  <Star size={20} className="me-2" />
                  <span className="fw-semibold">Continuously Updated Services</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="row justify-content-center mb-5">
          <div className="col-12">
            <div 
              className="p-4 p-md-5 text-center shadow-lg"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.6) 0%, rgba(6, 182, 212, 0.6) 100%)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '2rem'
              }}
            >
              <h3 className="display-5 fw-bold text-white mb-4">Our Mission</h3>
              <p className="lead text-light fs-4 lh-lg" style={{ maxWidth: '900px', margin: '0 auto' }}>
                As part of Nadakatti Enterprises, our mission is to provide the most friendly and rewarding gaming platform 
                to users while ensuring the complete safety of their data and money. We strive to create an environment 
                where gaming excellence meets absolute security, upholding the values and standards of our parent company.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="row justify-content-center mb-4">
          <div className="col-12">
            <div className="p-4 shadow-lg" style={cardStyle}>
              <div className="row align-items-center">
                <div className="col-12 col-md-8">
                  <div className="d-flex align-items-center">
                    <div 
                      className="d-flex align-items-center justify-content-center me-4"
                      style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
                        borderRadius: '1.25rem'
                      }}
                    >
                      <Mail size={32} color="white" />
                    </div>
                    <div>
                      <h3 className="h2 text-white mb-2 fw-bold">Need Support?</h3>
                      <p className="text-light mb-0 fs-6">We're here to help with any questions you might have</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4 text-center text-md-end mt-3 mt-md-0">
                  <p className="text-light mb-3 fs-6">Contact our support team:</p>
                  <a 
                    href="mailto:naphex.com@gmail.com" 
                    className="btn btn-lg text-white fw-semibold px-4 py-3 d-inline-flex align-items-center shadow-lg"
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.background = 'linear-gradient(45deg, #1d4ed8, #0e7490)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'linear-gradient(45deg, #2563eb, #0891b2)';
                    }}
                  >
                    <Mail size={20} className="me-2" />
                    naphex.com@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="row justify-content-center">
          <div className="col-12">
            <div 
              className="p-4"
              style={{
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <div className="d-flex align-items-start">
                <Lock size={20} color="#60a5fa" className="me-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="h5 text-white mb-3 fw-semibold">Important Notice</h3>
                  <p className="text-white mb-0 small lh-lg">
                    The data on this page might get updated from time to time. We advise you to be vigilant and 
                    inform yourself about any changes from time to time with privacy and confidentiality policies in mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="enhanced-footer">
                <div className="footer-content">
                  <div className="copyright-section">
                    <p className="copyright-text">
                      © 2025/2026 NADAKATTI ENTERPRISES. All rights reserved.
                    </p>
                  </div>
                  <div className="footer-links">
                    <Link to="/terms&conditions" className="footer-link">
                      Terms & Conditions
                    </Link>
                    <span className="footer-separator">|</span>
                    <Link to="/kycpolicy" className="footer-link">
                      KYC Policy
                    </Link>
                    <span className="footer-separator">|</span>
                    <Link to="/privacypolicy" className="footer-link">
                      Privacy Policy
                    </Link>
                    <span className="footer-separator">|</span>
                    <Link to="/rules" className="footer-link">
                      Game Rules
                    </Link>
                    <span className="footer-separator">|</span>
                    <Link to="/FAQs" className="footer-link">
                      FAQs
                    </Link>
                  </div>
                </div>
              </footer>
    </div>
  );
};

export default AboutPage;