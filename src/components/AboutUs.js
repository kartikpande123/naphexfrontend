import React from 'react';
import { Shield, Trophy, Users, Mail, Star, Lock, CheckCircle, MapPin, Phone, Building2 } from 'lucide-react';

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
                  <Shield size={40} color="white" />
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
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <Building2 size={18} color="#22d3ee" className="me-2" />
                  <span className="text-white fw-semibold" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                    GSTN: 29AAWFN6270D1ZR
                  </span>
                </div>
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
                  and innovation. We offer live gaming options on different sports and games. 
                  At Naphex, we provide the best gaming experience to users and the chance to test their skills and win real rewards.
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
                    href="mailto:naphex24@outlook.com" 
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
                    naphex24@outlook.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="row justify-content-center mb-5">
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

        {/* Contact Us Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-12">
            <div className="p-4 p-md-5 shadow-lg" style={heroCardStyle}>
              <div className="text-center mb-4">
                <h2 className="h1 text-white fw-bold mb-2">Contact Us</h2>
                <p className="text-light fs-5">Get in touch with Nadakatti Enterprises</p>
              </div>
              
              <div className="row g-4">
                <div className="col-12 col-md-4">
                  <div className="text-center">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '56px', height: '56px', ...iconBg }}
                    >
                      <Building2 size={28} color="white" />
                    </div>
                    <h4 className="text-white mb-2 fw-semibold">Company Name</h4>
                    <p className="text-light mb-0">Nadakatti Enterprises</p>
                  </div>
                </div>
                
                <div className="col-12 col-md-4">
                  <div className="text-center">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '56px', height: '56px', ...iconBg }}
                    >
                      <MapPin size={28} color="white" />
                    </div>
                    <h4 className="text-white mb-2 fw-semibold">Address</h4>
                    <p className="text-light mb-0">
                      Narendra Cross<br />
                      Dharwad<br />
                      Karnataka 580005
                    </p>
                  </div>
                </div>
                
                <div className="col-12 col-md-4">
                  <div className="text-center">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '56px', height: '56px', ...iconBg }}
                    >
                      <Phone size={28} color="white" />
                    </div>
                    <h4 className="text-white mb-2 fw-semibold">Phone</h4>
                    <a 
                      href="tel:7892739656" 
                      className="text-light text-decoration-none"
                      style={{ fontSize: '1.1rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#f1f5f9'}
                    >
                      +91 7892739656
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderTop: '1px solid rgba(59, 130, 246, 0.3)',
        padding: '2rem 0'
      }}>
        <div className="container">
          <div className="text-center mb-3">
            <p className="text-light mb-0">
              © 2025/2026 NADAKATTI ENTERPRISES. All rights reserved.
            </p>
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            <a href="/terms&conditions" className="text-light text-decoration-none" style={{ fontSize: '0.9rem' }}>
              Terms & Conditions
            </a>
            <span className="text-light">|</span>
            <a href="/kycpolicy" className="text-light text-decoration-none" style={{ fontSize: '0.9rem' }}>
              KYC Policy
            </a>
            <span className="text-light">|</span>
            <a href="/privacypolicy" className="text-light text-decoration-none" style={{ fontSize: '0.9rem' }}>
              Privacy Policy
            </a>
            <span className="text-light">|</span>
            <a href="/rules" className="text-light text-decoration-none" style={{ fontSize: '0.9rem' }}>
              Game Rules
            </a>
            <span className="text-light">|</span>
            <a href="/FAQs" className="text-light text-decoration-none" style={{ fontSize: '0.9rem' }}>
              FAQs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;