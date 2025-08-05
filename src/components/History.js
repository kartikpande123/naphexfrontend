import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Table, Badge, Button, Spinner, Alert, Container } from 'react-bootstrap';
import API_BASE_URL from './ApiConfig';

const UserGameHistory = () => {
  const [userData, setUserData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    phoneNo: null,
    connectionStatus: 'Not connected',
    lastEvent: null,
    lastError: null
  });
  
  useEffect(() => {
    let eventSource = null;
    
    const connectToUserProfile = () => {
      try {
        // Get phoneNo from localStorage
        const storedUserData = JSON.parse(localStorage.getItem("userData"));
        
        setDebugInfo(prev => ({
          ...prev,
          phoneNo: storedUserData?.phoneNo || 'Not found'
        }));
        
        if (!storedUserData || !storedUserData.phoneNo) {
          setError("User phone number not found in local storage");
          setLoading(false);
          return;
        }
        
        // Create EventSource connection
        eventSource = new EventSource(
          `${API_BASE_URL}/user-profile/${storedUserData.phoneNo}`
        );
        
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'Connecting'
        }));
        
        // Set up event listeners
        eventSource.onopen = () => {
          console.log("EventSource connection opened");
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'Connected'
          }));
        };
        
        eventSource.onmessage = (event) => {
          console.log("Received event:", event.data);
          setDebugInfo(prev => ({
            ...prev,
            lastEvent: event.data.substring(0, 100) + '...' // Show first 100 chars
          }));
          
          try {
            const data = JSON.parse(event.data);
            
            if (data.success) {
              setUserData(data.userData);
              processGameHistory(data.userData);
              setLoading(false);
              
              // Close connection after successful data receipt
              eventSource.close();
              setDebugInfo(prev => ({
                ...prev,
                connectionStatus: 'Closed after successful data receipt'
              }));
            } else {
              throw new Error(data.message || "Failed to fetch user data");
            }
          } catch (parseError) {
            console.error("Error parsing event data:", parseError);
            setError(`Error parsing data: ${parseError.message}`);
            setDebugInfo(prev => ({
              ...prev,
              lastError: `Parse error: ${parseError.message}`
            }));
            setLoading(false);
            eventSource.close();
          }
        };
        
        eventSource.onerror = (eventError) => {
          console.error("EventSource error:", eventError);
          setError("Error connecting to server. Please try again later.");
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'Error',
            lastError: 'EventSource connection error'
          }));
          setLoading(false);
          
          // Close the current connection
          eventSource.close();
          
          // Attempt to reconnect after 5 seconds (like in Home component)
          setTimeout(connectToUserProfile, 5000);
        };
        
      } catch (setupError) {
        console.error("Error setting up EventSource:", setupError);
        setError(`Error connecting to server: ${setupError.message}`);
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'Setup Error',
          lastError: setupError.message
        }));
        setLoading(false);
        if (eventSource) eventSource.close();
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToUserProfile, 5000);
      }
    };
    
    // Initial connection
    connectToUserProfile();
    
    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        console.log("Closing EventSource connection");
        eventSource.close();
      }
    };
  }, []);
  
  const processGameHistory = (userData) => {
    if (!userData || !userData.game1 || !userData.game1["game-actions"]) {
      console.log("No game actions found in user data");
      setGameHistory([]);
      return;
    }
    
    const history = [];
    let totalPlayedAmount = 0;
    
    // Get game actions
    const gameActions = userData.game1["game-actions"];
    
    // Process each game action
    Object.keys(gameActions).forEach(actionId => {
      const action = gameActions[actionId];
      
      // Find which date this action belongs to
      let actionDate = "Unknown";
      const dailyBetAmounts = userData.game1["daily-bet-amount"];
      
      if (dailyBetAmounts) {
        Object.keys(dailyBetAmounts).forEach(date => {
          if (dailyBetAmounts[date].betIds && dailyBetAmounts[date].betIds.includes(actionId)) {
            actionDate = date;
          }
        });
      }
      
      // Create game entry
      const gameEntry = {
        date: actionDate,
        gameMode: action.gameMode || 'N/A',
        gameType: "Game 1", // You might want to customize this
        playedNumbers: action.selectedNumbers ? action.selectedNumbers.join(', ') : 'N/A',
        session: action.sessionNumber || 'N/A',
        amount: action.betAmount || 0,
        status: action.status || 'N/A',
        timestamp: new Date(action.timestamp).toLocaleString()
      };
      
      history.push(gameEntry);
      totalPlayedAmount += Number(action.betAmount || 0);
    });
    
    // Sort by timestamp (most recent first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`Processed ${history.length} game entries with total amount: ${totalPlayedAmount}`);
    
    setGameHistory(history);
    setTotalAmount(totalPlayedAmount);
  };
  
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    
    // Use the same reconnection pattern instead of page reload
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    
    if (storedUserData && storedUserData.phoneNo) {
      const eventSource = new EventSource(
        `http://localhost:3200/user-profile/${storedUserData.phoneNo}`
      );
      
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'Reconnecting',
        phoneNo: storedUserData.phoneNo
      }));
      
      // Set up the same event handlers as in useEffect
      // (This follows the same pattern as in the Home component)
      
      eventSource.onopen = () => {
        console.log("EventSource reconnection opened");
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'Reconnected'
        }));
      };
      
      eventSource.onmessage = (event) => {
        console.log("Received event on retry:", event.data);
        setDebugInfo(prev => ({
          ...prev,
          lastEvent: event.data.substring(0, 100) + '...'
        }));
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.success) {
            setUserData(data.userData);
            processGameHistory(data.userData);
            setLoading(false);
            
            // Close connection after successful data receipt
            eventSource.close();
            setDebugInfo(prev => ({
              ...prev,
              connectionStatus: 'Closed after successful data receipt on retry'
            }));
          } else {
            throw new Error(data.message || "Failed to fetch user data on retry");
          }
        } catch (parseError) {
          console.error("Error parsing event data on retry:", parseError);
          setError(`Error parsing data: ${parseError.message}`);
          setDebugInfo(prev => ({
            ...prev,
            lastError: `Parse error on retry: ${parseError.message}`
          }));
          setLoading(false);
          eventSource.close();
        }
      };
      
      eventSource.onerror = (eventError) => {
        console.error("EventSource error on retry:", eventError);
        setError("Error reconnecting to server. Please try again later.");
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'Error on retry',
          lastError: 'EventSource connection error on retry'
        }));
        setLoading(false);
        eventSource.close();
      };
    } else {
      setError("Cannot retry: User phone number not found");
      setLoading(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="mb-3">Loading User Game History</h5>
            <div className="text-muted small">
              <p className="mb-1">Phone: {debugInfo.phoneNo}</p>
              <p className="mb-1">Status: {debugInfo.connectionStatus}</p>
              {debugInfo.lastEvent && (
                <p className="mb-1">Last Event: {debugInfo.lastEvent}</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Show error state with retry button
  if (error) {
    return (
      <Container className="py-4">
        <Card className="border-danger shadow-sm">
          <Card.Header className="bg-danger text-white">
            <h5 className="m-0">Error Loading Game History</h5>
          </Card.Header>
          <Card.Body className="text-center py-4">
            <Alert variant="danger">{error}</Alert>
            <div className="text-muted small mb-3">
              <p className="mb-1">Phone: {debugInfo.phoneNo}</p>
              <p className="mb-1">Connection Status: {debugInfo.connectionStatus}</p>
              {debugInfo.lastError && <p className="mb-1">Error: {debugInfo.lastError}</p>}
              {debugInfo.lastEvent && <p className="mb-1">Last Event: {debugInfo.lastEvent}</p>}
            </div>
            <Button variant="primary" onClick={retryFetch}>
              <i className="bi bi-arrow-clockwise me-1"></i> Retry
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Show data
  return (
    <Container className="py-4">
      <Card className="shadow border-0">
        <div className="game-history-header text-center p-4 bg-primary  text-white rounded-top">
          <h2 className="mb-0 fw-bold">
            <span className="border border-white px-4 py-2 rounded">Game History - {userData?.name || 'User'}</span>
          </h2>
        </div>
        
        <Card.Body className="p-0">
          <div className="bg-light p-3 border-bottom">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="user-info d-flex align-items-center mb-2 mb-md-0">
                <div className="user-avatar bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: '40px', height: '40px' }}>
                  <i className="bi bi-person-fill"></i>
                </div>
                <div>
                  <h6 className="mb-0">{userData?.name || 'User'}</h6>
                  <small className="text-muted">Phone: {userData?.phoneNo}</small>
                </div>
              </div>
              <div className="tokens-info border border-success rounded-pill px-3 py-2 bg-light">
                <span className="fw-bold text-success">
                  <i className="bi bi-coin me-1"></i> Available Tokens: {userData?.tokens || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Date</th>
                  <th className="border-0">Game Mode</th>
                  <th className="border-0">Played Pictures</th>
                  <th className="border-0">Session</th>
                  <th className="border-0 text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <tr key={index}>
                      <td className="border-start align-middle">{game.date}</td>
                      <td className="align-middle">
                        <span className="fw-medium">{game.gameMode}</span>
                      </td>
                      <td className="align-middle">
                        <div className="numbers-cell">
                          {game.playedNumbers.split(', ').map((num, i) => (
                            <span key={i} className="number-badge bg-light border rounded-circle d-inline-flex justify-content-center align-items-center me-1" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                              {num}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="align-middle">
                        <span className="session-badge bg-info bg-opacity-10 text-info px-2 py-1 rounded-pill">
                          {game.session}
                        </span>
                      </td>
                      <td className="text-end fw-bold border-end align-middle">
                        <span className="amount-cell bg-light px-3 py-1 rounded-pill">
                          ₹{game.amount}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="empty-state">
                        <i className="bi bi-emoji-neutral fs-2 text-muted mb-2"></i>
                        <p className="mb-0">No game history found</p>
                      </div>
                    </td>
                  </tr>
                )}
                <tr className="bg-light">
                  <td colSpan={4} className="text-end fw-bold border-start">Total Amount Played:</td>
                  <td className="text-end fw-bold text-success border-end">
                    <div className="total-amount bg-success bg-opacity-10 px-3 py-2 rounded">
                      ₹{totalAmount}
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserGameHistory;