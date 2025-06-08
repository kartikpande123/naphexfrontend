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
                    <div className="row mobile-responsive-row">
                        {result['open-number'] && (
                            <div className="col-lg-6 col-12 mb-3">
                                <div className="bg-primary-subtle p-3 rounded">
                                    <h5 className="card-title text-primary">Open Details</h5>
                                    <div className="d-flex align-items-center justify-content-center text-primary fs-5 flex-column">
                                        <span className="mobile-label">open-number</span>
                                        {formatNumbers(result['open-number'])}
                                    </div>
                                    <div className="text-primary fs-5 mobile-pana-section">
                                        <span className="mobile-label">close-pana</span>
                                        {formatNumbers(result['open-pana'])}
                                    </div>
                                </div>
                            </div>
                        )}
                        {result['close-number'] && (
                            <div className="col-lg-6 col-12 mb-3">
                                <div className="bg-success-subtle p-3 rounded">
                                    <h5 className="card-title text-success">Close Details</h5>
                                    <div className="d-flex flex-column align-items-center justify-content-center text-primary fs-5">
                                        <span className="mobile-label">close-number</span>
                                        {formatNumbers(result['close-number'])}
                                    </div>
                                    <div className="text-success fs-5 mobile-pana-section">
                                        <span className="mobile-label">close-pana</span>
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
        <div className="container-fluid py-4 px-2">
            {/* Header - Mobile Responsive */}
            <div className="header-container">
                <h1 className="header-title">Results</h1>
            </div>

            {/* Date Search - Mobile Responsive */}
            <div className="date-search-container">
                <input
                    type="date"
                    className="form-control date-input"
                    placeholder="Search by Date"
                    value={searchDate}
                    onChange={handleDateSearch}
                />
            </div>

            {/* Today's Results */}
            <div className="mb-4">
                <h2 className="results-date-title">
                    {results.date ? `Results for ${results.date}` : 'Results'}
                </h2>
                <div className="row">
                    <div className="col-12 mb-3">
                        <h6 className="session-title">Today Session 1</h6>
                        {formatResult(results.todayResults.session1, 'Today Session 1')}
                    </div>
                    <div className="col-12 mb-3">
                        <h6 className="session-title">Today Session 2</h6>
                        {formatResult(results.todayResults.session2, 'Today Session 2')}
                    </div>
                </div>
            </div>

            {/* Previous Results */}
            <div>
                <h2 className="previous-results-title">Previous Results</h2>
                {results.previousResults.length > 0 ? (
                    <div className="accordion">
                        {results.previousResults.map((prevResult, index) => (
                            <div className="card mb-2 accordion-card" key={index}>
                                <div
                                    className="card-header accordion-header"
                                    onClick={() => toggleResultsVisibility(index)}
                                >
                                    <h5 className="mb-0 accordion-title">
                                        Results for {prevResult.date}
                                    </h5>
                                    <span className="accordion-icon">
                                        {openResultsIndex === index ? <ChevronUp /> : <ChevronDown />}
                                    </span>
                                </div>
                                {openResultsIndex === index && (
                                    <div className="card-body accordion-body">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <h6 className="session-title">Session 1</h6>
                                                {formatResult(prevResult.session1, 'Previous Session 1')}
                                            </div>
                                            <div className="col-12 mb-3">
                                                <h6 className="session-title">Session 2</h6>
                                                {formatResult(prevResult.session2, 'Previous Session 2')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info text-center no-results-alert">
                        No previous results available
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsDashboard;