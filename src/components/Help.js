import React, { useState, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import API_BASE_URL from './ApiConfig';

const NaphexHelpSection = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    userId: '',
    description: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for phone number to only allow digits
    if (name === 'number') {
      // Remove any non-digit characters and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prevState => ({
        ...prevState,
        [name]: numericValue
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: files ? files[0] : value
      }));
    }
  };

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/917022852377`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check file size before submission
    if (formData.photo && formData.photo.size > 20 * 1024 * 1024) {
      alert('File is too large. Maximum file size is 20MB.');
      return;
    }
    
    try {
      // Enhanced phone number validation
      if (formData.number.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      // Basic client-side validation
      if (!formData.name || !formData.number || !formData.description) {
        alert('Please fill in all required fields (Name, Contact Number, and Description)');
        return;
      }
  
      // Create FormData for multipart/form-data upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('number', formData.number);
      formDataToSend.append('description', formData.description);
  
      // Add optional fields
      if (formData.userId) {
        formDataToSend.append('userId', formData.userId);
      }
  
      // Add photo if exists
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
  
      // Make the API call
      const response = await fetch(`${API_BASE_URL}/help-request`, {
        method: 'POST',
        body: formDataToSend
        // Note: Do NOT set Content-Type header, let browser set it for multipart/form-data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
  
      const data = await response.json();
      
      if (data.success) {
        alert('Help request submitted successfully!');
        
        // Reset form
        setFormData({
          name: '',
          number: '',
          userId: '',
          description: '',
          photo: null
        });
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div 
      className="container p-4 position-relative" 
      style={{
        background: 'linear-gradient(135deg, #e6f2ff 0%, #b3d9ff 100%)',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: 'auto',
        transition: 'transform 0.3s ease'
      }}
    >
      <div 
        className="text-center mb-4"
        style={{
          transform: 'translateY(-10px)',
          opacity: 0,
          animation: 'fadeInUp 0.6s forwards'
        }}
      >
        <h2 
          className="fw-bold text-primary"
          style={{
            color: '#0056b3',
            letterSpacing: '1px'
          }}
        >
          Help & Support
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Your Name <span className="text-danger">*</span></label>
          <input 
            type="text" 
            className="form-control" 
            name="name"
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleChange}
            style={{
              borderColor: '#6cb2eb',
              boxShadow: 'none'
            }}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contact Number <span className="text-danger">*</span></label>
          <input 
            type="tel" 
            className="form-control" 
            name="number"
            placeholder="10-digit Contact Number" 
            value={formData.number}
            onChange={handleChange}
            style={{
              borderColor: '#6cb2eb',
              boxShadow: 'none'
            }}
            maxLength="10"
            pattern="\d{10}"
            required
          />
          {formData.number.length > 0 && formData.number.length !== 10 && (
            <div className="text-danger small mt-1">
              Please enter a 10-digit phone number
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">User ID (Optional)</label>
          <input 
            type="text" 
            className="form-control" 
            name="userId"
            placeholder="User ID" 
            value={formData.userId}
            onChange={handleChange}
            style={{
              borderColor: '#6cb2eb',
              boxShadow: 'none'
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description <span className="text-danger">*</span></label>
          <textarea 
            className="form-control" 
            name="description"
            placeholder="Describe Your Concern" 
            rows="4"
            value={formData.description}
            onChange={handleChange}
            style={{
              borderColor: '#6cb2eb',
              boxShadow: 'none',
              resize: 'vertical'
            }}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Image (Optional)</label>
          <input 
            ref={fileInputRef}
            type="file" 
            className="form-control" 
            name="photo"
            accept="image/*"
            onChange={handleChange}
            style={{
              borderColor: '#6cb2eb',
              boxShadow: 'none'
            }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100 mb-3"
          style={{
            background: '#0056b3',
            border: 'none',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Submit Concern
        </button>
      </form>

      <div 
        className="position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1000 }}
      >
        <div 
          onClick={handleWhatsAppRedirect}
          className="d-flex flex-column align-items-center"
          style={{
            cursor: 'pointer'
          }}
        >
          <span 
            className="text-success fw-bold blink-text mb-2"
            style={{
              fontSize: '1rem',
              backgroundColor: 'white',
              padding: '5px 10px',
              borderRadius: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            Live Chat
          </span>
          <button 
            className="btn btn-success rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{
              width: '60px',
              height: '60px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <MessageCircle size={30} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes customBlink {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.05);
            text-shadow: 0 0 10px rgba(0, 255, 0, 1);
          }
        }

        .blink-text {
          animation: customBlink 1.2s infinite;
          color: #28a745 !important;
        }
      `}</style>
    </div>
  );
};

export default NaphexHelpSection;