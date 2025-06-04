import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import "./OpenCloseResults.css"

// Import your number image assets
import number0 from '../images/picture-0.png';
import number1 from '../images/picture-1.png';
import number2 from '../images/picture-2.png';
import number3 from '../images/picture-3.png';
import number4 from '../images/picture-4.png';
import number5 from '../images/picture-5.png';
import number6 from '../images/picture-6.png';
import number7 from '../images/picture-7.png';
import number8 from '../images/picture-8.png';
import number9 from '../images/picture-9.png';
import API_BASE_URL from './ApiConfig';

const ResultsDashboard = () => {
    const [results, setResults] = useState({
        date: null,
        todayResults: { session1: null, session2: null },
        previousResults: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState('');
    const [openResultsIndex, setOpenResultsIndex] = useState(null);

    // Fetch results
    useEffect(() => {
        const eventSource = new EventSource(
            `${API_BASE_URL}/fetch-results?date=${searchDate || ''}`
        );

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.success) {
                const { date, todayResults, previousResults } = data.results;
                setResults({
                    date,
                    todayResults: {
                        session1: todayResults.session1,
                        session2: todayResults.session2,
                    },
                    previousResults: previousResults.filter(
                        (result) => result.date !== date
                    ),
                });
                setLoading(false);
            } else {
                setError(data.message || 'Failed to fetch results');
                setLoading(false);
            }
        };

        eventSource.onerror = (err) => {
            setError('Connection lost or server error');
            setLoading(false);
            eventSource.close();
        };

        return () => {
            eventSource.close(); // Cleanup on unmount
        };
    }, [searchDate]);

    // Function to get the number image based on the digit
    const getNumberImage = (digit) => {
        switch (digit) {
            case '0':
                return number0;
            case '1':
                return number1;
            case '2':
                return number2;
            case '3':
                return number3;
            case '4':
                return number4;
            case '5':
                return number5;
            case '6':
                return number6;
            case '7':
                return number7;
            case '8':
                return number8;
            case '9':
                return number9;
            default:
                return null;
        }
    };

    // Format numbers as image components
    const formatNumbers = (numberString, isFullNumbers = false) => {
        if (!numberString) return null;

        const sanitizedString = String(numberString).replace(/[^0-9]/g, '');

        const Hyphen = () => (
            <span className="hyphen-container" style={{
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 10px'
            }}>
                <span style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1a73e8'
                }}>-</span>
            </span>
        );

        return (
            <span className="result-images" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '5px'
            }}>
                {Array.from(sanitizedString).map((digit, index) => {
                    const imageSrc = getNumberImage(digit);

                    const needsHyphen = isFullNumbers && (index === 2 || index === 4);

                    return (
                        <React.Fragment key={index}>
                            {imageSrc && (
                                <span className="image-container">
                                    <img
                                        src={imageSrc}
                                        alt={`Number ${digit}`}
                                        className="number-image"
                                    />
                                    <span className="image-label">Picture {digit}</span>
                                </span>
                            )}
                            {needsHyphen && <Hyphen />}
                        </React.Fragment>
                    );
                })}
            </span>
        );
    };




    // Format results for display
    const formatResult = (result, sessionType) => {
        if (!result) {
            return (
                <div className="alert text-center" style={{ backgroundColor: "blueviolet" }}>
                    <span className="mb-0 text-white">No Data Available</span>
                </div>
            );
        }

        return (
            <div className="card mb-3">
                <div className="card-body2">
                    <div className="row">
                        {result['open-number'] && (
                            <div className="col-6 mb-3">
                                <div className="bg-primary-subtle p-3 rounded">
                                    <h5 className="card-title text-primary">Open Details</h5>
                                    <div className="d-flex align-items-center justify-content-center text-primary fs-5 flex-column">
                                        <span>open-number</span>
                                        {formatNumbers(result['open-number'])}
                                    </div>
                                    <div className="text-primary fs-5">
                                        <span>close-pana</span>
                                        {formatNumbers(result['open-pana'])}
                                    </div>
                                </div>
                            </div>
                        )}
                        {result['close-number'] && (
                            <div className="col-6 mb-3">
                                <div className="bg-success-subtle p-3 rounded">
                                    <h5 className="card-title text-success">Close Details</h5>
                                    <div className="d-flex flex-column align-items-center justify-content-center text-primary fs-5">
                                        <span>close-number</span>
                                        {formatNumbers(result['close-number'])}
                                    </div>
                                    <div className="text-success fs-5">
                                        <span>close-pana</span>
                                        {formatNumbers(result['close-pana'])}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {result.nums && (
                        <div className="bg-info-subtle p-3 rounded mt-3">
                            <h5 className="card-title text-info">Full Pictures</h5>
                            <div className="d-flex align-items-center justify-content-center">
                                {formatNumbers(result.nums, true)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleDateSearch = (e) => {
        setSearchDate(e.target.value);
    };

    const toggleResultsVisibility = (index) => {
        setOpenResultsIndex(openResultsIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <div className="container py-4">
            <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-10" style={{
                backgroundColor: '#f0f8ff', border: "1px solid #1a73e8", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", width: "600px", margin: "auto",
                borderRadius: "8px", marginTop: "10px"
            }}>
                <h1
                    style={{
                        color: "#1a73e8",
                        textAlign: "center",
                        marginBottom: "20px"
                    }}
                >
                    Results
                </h1>
            </div>

            <div className="mb-4" style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
    <input
        type="date"
        className="form-control"
        placeholder="Search by Date (YYYY-MM-DD)"
        value={searchDate}
        onChange={handleDateSearch}
        style={{
            border: "1px solid blue",
            width: "60%",
            textAlign: "center",
        }}
    />
</div>



            <div className="mb-4">
                <h2 className="text-primary">{results.date ? `Results for ${results.date}` : 'Results'}</h2>
                <div className="row">
                    <div className="col-12 mb-3">
                        <h6 className="text-center" style={{ fontSize: "24px", fontWeight: "bold" }}>
                            Today Session 1
                        </h6>
                        {formatResult(results.todayResults.session1, 'Today Session 1')}
                    </div>
                    <div className="col-12 mb-3">
                        <h6 className="text-center" style={{ fontSize: "24px", fontWeight: "bold" }}>
                            Today Session 2
                        </h6>
                        {formatResult(results.todayResults.session2, 'Today Session 2')}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-secondary" style={{ fontSize: "28px", fontWeight: "bold" }}>Previous Results</h2>
                {results.previousResults.length > 0 ? (
                    <div className="accordion">
                        {results.previousResults.map((prevResult, index) => (
                            <div className="card mb-2" key={index}>
                                <div
                                    className="card-header d-flex justify-content-between align-items-center"
                                    onClick={() => toggleResultsVisibility(index)}
                                >
                                    <h5 className="mb-0 text-primary" style={{ fontSize: "22px" }}>
                                        Results for {prevResult.date}
                                    </h5>
                                    {openResultsIndex === index ? <ChevronUp /> : <ChevronDown />}
                                </div>
                                {openResultsIndex === index && (
                                    <div className="card-body" style={{ border: "1px solid blue" }}>
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <h6 className="text-center" style={{ fontSize: "24px", fontWeight: "bold" }}>
                                                    Session 1
                                                </h6>
                                                {formatResult(prevResult.session1, 'Previous Session 1')}
                                            </div>
                                            <div className="col-12 mb-3">
                                                <h6 className="text-center" style={{ fontSize: "24px", fontWeight: "bold" }}>
                                                    Session 2
                                                </h6>
                                                {formatResult(prevResult.session2, 'Previous Session 2')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info text-center" style={{ fontSize: "20px" }}>
                        No previous results available
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsDashboard;