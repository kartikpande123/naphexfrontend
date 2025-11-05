import React, { useState, useEffect } from 'react';
import API_BASE_URL from './ApiConfig';

const HowToPlayVideo = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState('website');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tutorials`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentVideo = () => {
    return videos.find(video => 
      activeVideo === 'android' 
        ? video.name.includes('android')
        : video.name.includes('website')
    );
  };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const currentVideo = getCurrentVideo();

  return (
    <div style={styles.wrapper}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.headerTitle}>How to Use Website</h1>
          <p style={styles.headerSubtitle}>
            Watch our comprehensive tutorials to get started with NAPHEX
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={styles.spinner}>
            <div style={styles.spinnerCircle}></div>
            <p style={styles.loadingText}>Loading videos...</p>
          </div>
        ) : error ? (
          <div style={styles.alert}>
            <h3 style={styles.alertHeading}>Oops! Something went wrong</h3>
            <p style={styles.alertText}>{error}</p>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div style={styles.navTabs}>
              <button
                style={{
                  ...styles.navButton,
                  ...(activeVideo === 'website' ? styles.navButtonActive : {})
                }}
                onClick={() => setActiveVideo('website')}
              >
                Website Tutorial
              </button>
              <button
                style={{
                  ...styles.navButton,
                  ...(activeVideo === 'android' ? styles.navButtonActive : {})
                }}
                onClick={() => setActiveVideo('android')}
              >
                Android Tutorial
              </button>
            </div>

            {/* Video Player Section */}
            <div style={styles.row}>
              {currentVideo && (
                <div style={styles.videoCard}>
                  <div style={styles.cardBody}>
                    <h3 style={styles.videoTitle}>
                      {activeVideo === 'android' 
                        ? 'Android App Tutorial' 
                        : 'Website Tutorial'}
                    </h3>
                    
                    <div style={styles.videoContainer}>
                      <video
                        style={styles.video}
                        controls
                        controlsList="nodownload"
                        key={currentVideo.url}
                      >
                        <source src={currentVideo.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div style={styles.videoInfo}>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>File Size</span>
                        <span style={styles.infoValue}>
                          {formatFileSize(currentVideo.size)}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Type</span>
                        <span style={styles.infoValue}>
                          {activeVideo === 'android' ? 'Android' : 'Website'}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Format</span>
                        <span style={styles.infoValue}>MP4</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '50px 20px',
    marginBottom: '50px',
    borderRadius: '0 0 30px 30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    margin: '0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
  },
  headerSubtitle: {
    color: '#f0f0f0',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: '300'
  },
  navTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  navButton: {
    padding: '12px 30px',
    borderRadius: '25px',
    border: '2px solid #667eea',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    outline: 'none'
  },
  navButtonActive: {
    backgroundColor: '#667eea',
    color: '#ffffff',
    border: '2px solid #667eea'
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 20px'
  },
  videoCard: {
    maxWidth: '900px',
    width: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: 'none',
    marginBottom: '30px',
    backgroundColor: '#ffffff'
  },
  cardBody: {
    padding: '30px'
  },
  videoTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    marginTop: '0'
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    backgroundColor: '#000',
    borderRadius: '15px',
    overflow: 'hidden'
  },
  video: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  videoInfo: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px'
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '5px',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '1rem',
    color: '#333',
    fontWeight: '600'
  },
  spinner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  spinnerCircle: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '1.1rem'
  },
  alert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '20px 30px',
    borderRadius: '10px',
    border: '1px solid #f5c6cb',
    maxWidth: '600px',
    margin: '0 auto'
  },
  alertHeading: {
    fontSize: '1.3rem',
    marginBottom: '10px',
    marginTop: '0'
  },
  alertText: {
    fontSize: '1rem',
    marginBottom: '0'
  }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default HowToPlayVideo;