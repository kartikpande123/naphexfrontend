import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Table, Button, Modal, Badge, Card, Form, InputGroup } from 'react-bootstrap';
import "./AdminOpenCLosePlayed.css"
import API_BASE_URL from './ApiConfig';

const AdminUserAmtPlayed = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const modalRef = useRef(null);

  // Utility function to validate date format dd/mm/yyyy
  const isValidDateFormat = (dateString) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;

    const [, day, month, year] = dateString.match(regex);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === parseInt(year) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getDate() === parseInt(day);
  };

  // Utility function to convert dd/mm/yyyy to ISO date format
  const convertToISODate = (dateString) => {
    if (!isValidDateFormat(dateString)) return null;

    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/users-with-openclose`);
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users-with-openclose`);
        const data = await response.json();
  
        if (data.success) {
          const processedUsers = processUniqueUsers(data.users);
          setUsers(processedUsers);
          setLoading(false);
        } else {
          setError(data.message);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
  
    // Initial fetch
    fetchUsers();
  
    // Handle different event types from SSE
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'initial_load':
          const processedInitialUsers = processUniqueUsers(data.users);
          setUsers(processedInitialUsers);
          setLoading(false);
          break;
        
        case 'user_processed':
          setUsers(prevUsers => {
            const updatedUsers = processUniqueUsers([...prevUsers, data.user]);
            return updatedUsers;
          });
          break;
        
        case 'new_user':
          setUsers(prevUsers => {
            const updatedUsers = processUniqueUsers([...prevUsers, data.user]);
            return updatedUsers;
          });
          break;
        
        case 'error':
          setError(data.message);
          break;
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setError('Connection to server lost');
      eventSource.close();
    };
  
    // Cleanup function
    return () => {
      eventSource.close();
    };
  }, []);

  const processUniqueUsers = (usersArray) => {
    // Create a Map to store unique users, keyed by userId
    const uniqueUsersMap = new Map();

    usersArray.forEach(user => {
      const existingUser = uniqueUsersMap.get(user.userId);
      
      // If no existing user or current user has more recent game actions
      if (!existingUser || 
          getLatestTimestamp(user.mainDetails.game1?.["game-actions"] || {}) > 
          getLatestTimestamp(existingUser.mainDetails.game1?.["game-actions"] || {})) {
        uniqueUsersMap.set(user.userId, user);
      }
    });

    // Convert Map back to sorted array
    return Array.from(uniqueUsersMap.values()).sort((a, b) => {
      const aTimestamp = getLatestTimestamp(a.mainDetails.game1?.["game-actions"] || {});
      const bTimestamp = getLatestTimestamp(b.mainDetails.game1?.["game-actions"] || {});
      return new Date(bTimestamp) - new Date(aTimestamp);
    });
  };

  const getLatestTimestamp = (gameActions) => {
    return Object.values(gameActions).reduce((latest, action) => {
      const actionTime = new Date(action.timestamp).getTime();
      return actionTime > latest ? actionTime : latest;
    }, 0);
  };

  const handleViewBetDetails = (user) => {
    setSelectedUser(user);
  };

  // Filter users based on search date
  const filteredUsers = users.filter(user => {
    // If no search date, show all users
    if (!searchDate) return true;

    // Convert search date to ISO format for comparison
    const isoSearchDate = convertToISODate(searchDate);
    if (!isoSearchDate) return true;

    // Check if any game action matches the searched date
    return Object.values(user.mainDetails.game1?.["game-actions"] || {})
      .some(action => {
        const actionDate = new Date(action.timestamp).toISOString().split('T')[0];
        return actionDate === isoSearchDate;
      });
  });

  const PlayerGamesModal = ({ user, onClose }) => {
    const getPlayerGamesDetails = (games) => {
      return Object.keys(games).map((gameId, index) => {
        const game = games[gameId];

        // Determine status color
        const getStatusColor = (status) => {
          switch(status?.toLowerCase()) {
            case 'won':
              return 'text-success fw-bold';
            case 'lost':
              return 'text-danger fw-bold';
            default:
              return 'text-secondary';
          }
        };

        return (
          <tr key={index}>
            <td>{gameId}</td>
            <td>{game.betAmount || 'N/A'}</td>
            <td>{game.gameMode || 'N/A'}</td>
            <td>{game.selectedNumbers ? game.selectedNumbers.join(', ') : 'N/A'}</td>
            <td>{game.sessionNumber || 'N/A'}</td>
            <td>
              <span className={getStatusColor(game.status)}>
                {game.status || 'N/A'}
              </span>
            </td>
            <td>{game.timestamp ? new Date(game.timestamp).toLocaleString() : 'N/A'}</td>
          </tr>
        );
      });
    };

    return (
      <Modal
        show={true}
        onHide={onClose}
        size="xl"
        className="full-width-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">Player Game Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="thead-dark">
                <tr>
                  <th>Game ID</th>
                  <th>Bet Amount</th>
                  <th>Game Mode</th>
                  <th>Selected Numbers</th>
                  <th>Session Number</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>{getPlayerGamesDetails(user.mainDetails.game1["game-actions"])}</tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <Container fluid className="py-4">
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white text-center">
          <h1 className="m-0">Players Bet Details</h1>
        </Card.Header>
      </Card>

      {/* Date Search Bar */}
      <Card className="mb-3 shadow-sm" >
        <Card.Body>
          <Form>
            <Form.Group as={Row}>
              <Col sm="10">
                <InputGroup style={{border:"2px solid #136ffe"}}>
                  <Form.Control 
                    type="text" 
                    value={searchDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Auto-format date input
                      if (value.length === 2 || value.length === 5) {
                        if (value.length === 2 && !value.includes('/')) {
                          setSearchDate(`${value}/`);
                        } else if (value.length === 5 && value.split('/').length === 2) {
                          setSearchDate(`${value}/`);
                        }
                      } else {
                        setSearchDate(value);
                      }
                    }}
                    placeholder="Enter date (dd/mm/yyyy)"
                    isInvalid={searchDate && !isValidDateFormat(searchDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid date in dd/mm/yyyy format
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="thead-dark">
                  <tr>
                    <th>Serial No.</th>
                    <th>Name</th>
                    <th>My User ID</th>
                    <th>Referral ID</th>
                    <th>Phone No</th>
                    <th>Status</th>
                    <th>Total Bet Amount</th>
                    <th>Daily Bet Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    // Get today's date in the required format
                    const today = new Date().toISOString().split('T')[0];

                    // Calculate today's bet amount
                    const todayBetAmount = Object.entries(user.mainDetails.game1?.["daily-bet-amount"] || {})
                      .filter(([date]) => date === today) // Filter only today's bets
                      .reduce((sum, [, bet]) => sum + (bet.totalAmount || 0), 0);

                    return (
                      <tr key={user.userId}>
                        <td>{index + 1}</td>
                        <td>{user.mainDetails?.name || 'N/A'}</td>
                        <td>{user.mainDetails?.userIds?.myuserid || 'N/A'}</td>
                        <td>{user.mainDetails?.userIds?.myrefrelid || 'N/A'}</td>
                        <td>{user.mainDetails?.phoneNo || 'N/A'}</td>
                        <td className='fw-bold'>
                          <Badge 
                            bg={Object.keys(user.mainDetails.game1?.["game-actions"] || {}).length > 0 
                              ? 'success' 
                              : 'secondary'}
                          >
                            {Object.keys(user.mainDetails.game1?.["game-actions"] || {}).length > 0
                              ? `${Object.keys(user.mainDetails.game1["game-actions"]).length} Games`
                              : 'No Games'}
                          </Badge>
                        </td>
                        <td>{user.mainDetails.game1?.["total-bet-amount"]?.totalAmount || 'N/A'}</td>
                        <td>{todayBetAmount || 'N/A'}</td>
                        <td>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleViewBetDetails(user)}
                          >
                            View Bet Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {selectedUser && (
        <PlayerGamesModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </Container>
  );
};
export default AdminUserAmtPlayed;