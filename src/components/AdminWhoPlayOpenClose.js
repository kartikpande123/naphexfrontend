import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConfig';

const UsersDetailsComponent = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const detailsRef = useRef(null);

    const calculateFinancials = useMemo(() => (user) => {
        const totalBetAmount = user.mainDetails?.game1?.['daily-bet-amount']
            ? Object.values(user.mainDetails.game1['daily-bet-amount']).reduce((sum, dailyBet) =>
                sum + (parseFloat(dailyBet.totalAmount) || 0), 0)
            : 0;

        const totalWinAmount = user.mainDetails?.game1?.wins
            ? Object.values(user.mainDetails.game1.wins).reduce((sum, win) =>
                sum + (parseFloat(win.amountWon) || 0), 0)
            : 0;

        const gamesPlayed = user.mainDetails?.game1
            ? Object.keys(user.mainDetails?.game1['game-actions'] || {}).length
            : 0;

        const profit = totalWinAmount - totalBetAmount;

        return {
            gamesPlayed,
            totalBetAmount,
            winAmount: totalWinAmount,
            profit
        };
    }, []);

    const processUsers = useMemo(() => (rawUsers) => {
        return rawUsers
            .map((user) => ({
                ...user,
                ...calculateFinancials(user)
            }))
            .sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    }, [calculateFinancials]);

    const updateUsers = useMemo(() => (newUser, currentUsers) => {
        const updatedUsers = [...currentUsers];
        const existingUserIndex = updatedUsers.findIndex(u => u.userId === newUser.userId);

        const financials = calculateFinancials(newUser);

        if (existingUserIndex !== -1) {
            updatedUsers[existingUserIndex] = {
                ...newUser,
                ...financials
            };
        } else {
            updatedUsers.push({
                ...newUser,
                ...financials
            });
        }

        return processUsers(updatedUsers);
    }, [calculateFinancials, processUsers]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const eventSource = new EventSource(`${API_BASE_URL}/users-with-openclose`, { signal });

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users-with-openclose`, { signal });
                const data = await response.json();

                if (data.success) {
                    const processedUsers = processUsers(data.users);
                    setUsers(processedUsers);
                    setFilteredUsers(processedUsers);
                } else {
                    console.error(data.message);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to fetch users:', err);
                }
            }
        };

        fetchUsers();

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'initial_load':
                    const initialProcessedUsers = processUsers(data.users);
                    setUsers(initialProcessedUsers);
                    setFilteredUsers(initialProcessedUsers);
                    break;

                case 'user_processed':
                case 'new_user':
                    setUsers(prevUsers => updateUsers(data.user, prevUsers));
                    setFilteredUsers(prevFilteredUsers => updateUsers(data.user, prevFilteredUsers));
                    break;

                case 'error':
                    console.error(data.message);
                    break;
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            controller.abort();
            eventSource.close();
        };
    }, [processUsers, updateUsers]);

    const handleSearch = useMemo(() => (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = users.filter((user) =>
            user.mainDetails?.name?.toLowerCase().includes(query) ||
            user.mainDetails?.phoneNo?.toLowerCase().includes(query) ||
            user.mainDetails?.userIds?.myuserid?.toLowerCase().includes(query)
        );

        setFilteredUsers(filtered);
    }, [users]);

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setTimeout(() => {
            detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const UserDetailsModal = ({ user, onClose }) => {
        // Filter out sensitive information like passwords
        const filteredDetails = Object.fromEntries(
            Object.entries(user.mainDetails || {})
                .filter(([key]) =>
                    !key.toLowerCase().includes('password') &&
                    typeof user.mainDetails[key] !== 'object'
                )
                .map(([key, value]) => [
                    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    value
                ])
        );

        return (
            <div className="modal show d-block position-fixed" style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content shadow-lg border border-primary">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">User Details</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <tbody>
                                        {Object.entries(filteredDetails).map(([label, value], index) => (
                                            <tr key={index} className="border border-light">
                                                <th className="col-4 text-primary bg-light">{label}</th>
                                                <td>{value || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-4">
            <div className="card mb-4 shadow-sm border border-primary">
                <div className="card-header bg-primary text-white text-center">
                    <h1 className="h3 mb-0">Open-Close Players</h1>
                </div>
                <div className="card-body">
                    <div className="row justify-content-center mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="form-control form-control-lg border border-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-lg border border-primary">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered mb-0">
                            <thead className="thead-dark">
                                <tr>
                                    <th className="border">Serial No.</th>
                                    <th className="border">Name</th>
                                    <th className="border">User</th>
                                    <th className="border">Phone No</th>
                                    <th className="border">My User ID</th>
                                    <th className="border">Referral ID</th>
                                    <th className="border">Games Played</th>
                                    <th className="border">Total Bet Amount</th>
                                    <th className="border">Win Amount</th>
                                    <th className="border">Profit</th>
                                    <th className="border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => {
                                    // Calculate the profit for the admin (bet amount - win amount)
                                    const profit = user.totalBetAmount - user.winAmount;

                                    return (
                                        <tr key={user.userId} className="border">
                                            <td className="fw-bold border">{index + 1}</td>
                                            <td className="border">{user.mainDetails?.name || 'N/A'}</td>
                                            <td className="border">{user.userId}</td>
                                            <td className="border">{user.mainDetails?.phoneNo || 'N/A'}</td>
                                            <td className="border">{user.mainDetails?.userIds?.myuserid || 'N/A'}</td>
                                            <td className="border">{user.mainDetails?.userIds?.myrefrelid || 'N/A'}</td>
                                            <td className="border">{user.gamesPlayed}</td>

                                            {/* Total Bet Amount */}
                                            <td className="border">₹{user.totalBetAmount.toFixed(2)}</td>

                                            {/* Win Amount */}
                                            <td className="border">
                                                {user.winAmount ? `₹${user.winAmount.toFixed(2)}` : '₹0.00'}
                                            </td>

                                            {/* Profit for Admin */}
                                            <td
                                                className={`fw-bold border ${profit >= 0 ? 'text-success' : 'text-danger'}`}
                                            >
                                                {profit < 0 ? `₹${profit.toFixed(2)}` : `₹${profit.toFixed(2)}`}
                                            </td>

                                            <td className="border">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default UsersDetailsComponent;