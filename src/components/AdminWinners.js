import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import API_BASE_URL from './ApiConfig';

const WinnersDetailsComponent = () => {
    const [winners, setWinners] = useState([]);
    const [filteredWinners, setFilteredWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState('');

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/get-winners`);
            const data = await response.json();

            if (data.success) {
                // Sort by amount won (descending) and then by date (descending)
                const sortedWinners = data.winners.sort((a, b) => {
                    const amountA = parseFloat(a.amountWon) || 0;
                    const amountB = parseFloat(b.amountWon) || 0;
                    
                    // Primary sort by amount won (highest first)
                    if (amountB !== amountA) {
                        return amountB - amountA;
                    }
                    // Secondary sort by date (most recent first) if amounts are equal
                    return moment(b.date).valueOf() - moment(a.date).valueOf();
                });

                setWinners(sortedWinners);
                setFilteredWinners(sortedWinners);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Failed to fetch winners:', err);
            setError('Failed to fetch winners. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchDate(e.target.value);
        if (e.target.value) {
            const filtered = winners.filter((winner) =>
                moment(winner.date).format('YYYY-MM-DD').includes(e.target.value)
            );
            setFilteredWinners(filtered);
        } else {
            setFilteredWinners(winners);
        }
    };

    const formatDate = (dateString) => {
        return dateString ? moment(dateString).format('YYYY-MM-DD') : 'N/A';
    };

    return (
        <div className="container my-5">
            <div className="text-center mb-4">
                <h1 className="text-primary fw-bold">🏆 Winners Board 🏆</h1>
                <p className="text-muted fst-italic">Celebrate the success of our top players!</p>
            </div>

            {error && (
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-primary">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading winners...</p>
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-between mb-3 align-items-center">
                        <input
                            type="date"
                            className="form-control form-control-lg w-50 mx-auto shadow-sm"
                            placeholder="Search by date"
                            value={searchDate}
                            onChange={handleSearch}
                            style={{ borderRadius: '30px' }}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle shadow-lg">
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th className="p-3 border">#</th>
                                    <th className="p-3 border">User ID</th>
                                    <th className="p-3 border">Phone No</th>
                                    <th className="p-3 border">Game ID</th>
                                    <th className="p-3 border">Session</th>
                                    <th className="p-3 border">Win Type</th>
                                    <th className="p-3 border">Bet Amount</th>
                                    <th className="p-3 border">Amount Won</th>
                                    <th className="p-3 border">Date</th>
                                </tr>
                            </thead>
                            <tbody className="table-light">
                                {filteredWinners.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center p-4 text-secondary">
                                            No winners found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWinners.map((winner, index) => (
                                        <tr key={index} className="border-bottom">
                                            <td className="fw-bold border p-2">{index + 1}</td>
                                            <td className="border p-2">{winner.userId || 'N/A'}</td>
                                            <td className="border p-2">{winner.phoneNo || 'N/A'}</td>
                                            <td className="border p-2">{winner.gameId || 'N/A'}</td>
                                            <td className="border p-2">{winner.session || 'N/A'}</td>
                                            <td className="text-success border p-2">{winner.winType || 'N/A'}</td>
                                            <td className="border p-2">{winner.betAmount || 'N/A'}</td>
                                            <td className="text-success border p-2">{winner.amountWon || 'N/A'}</td>
                                            <td className="text-muted border p-2">{formatDate(winner.date)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default WinnersDetailsComponent;