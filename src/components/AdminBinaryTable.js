import React, { useState, useEffect } from 'react';
import { Search, Calendar, BarChart3, AlertCircle, ChevronDown } from 'lucide-react';
import API_BASE_URL from './ApiConfig';

const BinaryUsersDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin-binary-tree-by-date-range`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && Object.keys(result).length > 0) {
        setData(result);
        
        // Extract available dates from the result
        const dates = Object.keys(result).sort((a, b) => new Date(b) - new Date(a));
        setAvailableDates(dates);
        
        // Set the default selected date to the most recent one
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } else {
        throw new Error('API returned empty response');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process data to create table rows for the selected date
  const processData = () => {
    if (!data || !selectedDate || !data[selectedDate]) return [];
    
    const dateData = data[selectedDate];
    
    return Object.keys(dateData).map(userId => {
      const user = dateData[userId];
      
      return {
        name: user.name || 'Unknown',
        userId: userId,
        totalLeftBusiness: user.totalLeftBusiness || 0,
        totalRightBusiness: user.totalRightBusiness || 0,
        finalLeftBusiness: user.finalLeftBusiness || 0,
        finalRightBusiness: user.finalRightBusiness || 0,
        leftCarryForward: user.leftCarryForward || 0,
        rightCarryForward: user.rightCarryForward || 0,
        totalPlayedAmount: user.totalPlayedAmount || 0,
        bonusReceived: user.bonusReceived || 0,
        bonusStepMatched: user.bonusStepMatched || 0,
        eligibleStep: user.eligibleStep || 0,
        totalEligibleAmount: user.totalEligibleAmount || 0,
        yesterdayEligibleAmount: user.yesterdayEligibleAmount || 0,
        totalBonusReceivedTillDate: user.totalBonusReceivedTillDate || 0,
        referralId: user.referralId || 'None',
        leftChild: user.leftChild || 'None',
        rightChild: user.rightChild || 'None'
      };
    });
  };

  // Date change handler
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter data based on search term
  const filterData = (data) => {
    if (!searchTerm) return data;
    
    return data.filter(row => 
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Processed and filtered data
  const processedData = processData();
  const tableData = filterData(processedData);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center h-100 py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-3 fs-5">Loading dashboard data...</span>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger m-4 shadow-sm" role="alert">
      <AlertCircle size={24} className="me-2" />
      <strong>Error:</strong> {error}
    </div>
  );
  
  if (!data || Object.keys(data).length === 0) return (
    <div className="alert alert-info m-4 shadow-sm" role="alert">
      <AlertCircle size={24} className="me-2" />
      No data available. Please check your connection and try again.
    </div>
  );

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '100%', backgroundColor: '#f8fafd' }}>
      {/* Page Header */}
      <div className="dashboard-header py-4 px-4">
        <div className="container-fluid">
          <div className="text-center mb-4">
            <h1 className="fw-bold display-5 mb-3">
              <BarChart3 size={42} className="text-white me-3 mb-1" />
              <span className="text-white">BINARY USERS</span> <span className="text-warning">DASHBOARD</span>
            </h1>
            <p className="text-white fs-5 mb-0">Manage and monitor binary user information</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="dashboard-controls p-3 bg-white rounded-4 shadow">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="input-group date-selector shadow-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <Calendar size={22} className="text-primary" />
                      </span>
                      <select
                        id="date-select"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="form-select border-start-0 fw-medium fs-5 py-2"
                        style={{ paddingRight: "2.5rem" }}
                      >
                        {availableDates.map((date) => (
                          <option key={date} value={date}>{date}</option>
                        ))}
                      </select>
                      <div className="position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: "4" }}>
                        <ChevronDown size={18} className="text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="search-box">
                      <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                          <Search size={22} className="text-primary" />
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 fs-5 py-2" 
                          placeholder="Search user or ID..."
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="container-fluid px-4 mt-4 pb-4">
        <div className="card border-0 shadow mb-4 rounded-4 overflow-hidden">
          <div className="card-header bg-primary py-3 px-4">
            <h4 className="text-white mb-0 fw-bold">Binary Users Data</h4>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive" style={{ maxHeight: '70vh' }}>
              <table className="table table-hover custom-table mb-0" style={{ minWidth: '2200px' }}>
                <thead>
                  <tr className="table-header">
                    <th className="position-sticky bg-primary text-white" style={{ left: 0, zIndex: 2, minWidth: '160px' }}>
                      Name
                    </th>
                    <th className="position-sticky bg-primary text-white" style={{ left: '160px', zIndex: 2, minWidth: '160px' }}>
                      User ID
                    </th>
                    <th className="bg-primary text-white" style={{ minWidth: '160px' }}>Referral ID</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Total Left Business</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Total Right Business</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Final Left Business</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Final Right Business</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Left Carry Forward</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Right Carry Forward</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Total Played Amount</th>
                    <th className="bg-primary text-white" style={{ minWidth: '140px', textAlign: 'right' }}>Bonus Received</th>
                    <th className="bg-primary text-white" style={{ minWidth: '160px', textAlign: 'right' }}>Bonus Step Matched</th>
                    <th className="bg-primary text-white" style={{ minWidth: '140px', textAlign: 'right' }}>Eligible Step</th>
                    <th className="bg-primary text-white" style={{ minWidth: '180px', textAlign: 'right' }}>Total Eligible Amount</th>
                    <th className="bg-primary text-white" style={{ minWidth: '200px', textAlign: 'right' }}>Yesterday Eligible Amount</th>
                    <th className="bg-primary text-white" style={{ minWidth: '200px', textAlign: 'right' }}>Total Bonus Till Date</th>
                    <th className="bg-primary text-white" style={{ minWidth: '140px' }}>Left Child</th>
                    <th className="bg-primary text-white" style={{ minWidth: '140px' }}>Right Child</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.userId} className="position-relative">
                      <td className="position-sticky bg-white" style={{ left: 0, zIndex: 1, fontWeight: '600', fontSize: '1.05rem' }}>
                        {row.name}
                      </td>
                      <td className="position-sticky bg-white fw-semibold text-primary" style={{ left: '160px', zIndex: 1, fontSize: '1.05rem' }}>
                        {row.userId}
                      </td>
                      <td className="text-nowrap fw-medium">{row.referralId}</td>
                      <td className="text-end fw-medium">{row.totalLeftBusiness.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.totalRightBusiness.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.finalLeftBusiness.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.finalRightBusiness.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.leftCarryForward.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.rightCarryForward.toLocaleString()}</td>
                      <td className="text-end fw-semibold highlight-cell">{row.totalPlayedAmount.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.bonusReceived.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.bonusStepMatched.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.eligibleStep.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.totalEligibleAmount.toLocaleString()}</td>
                      <td className="text-end fw-medium">{row.yesterdayEligibleAmount.toLocaleString()}</td>
                      <td className="text-end fw-semibold success-cell">{row.totalBonusReceivedTillDate.toLocaleString()}</td>
                      <td className="fw-medium">{row.leftChild}</td>
                      <td className="fw-medium">{row.rightChild}</td>
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                    <tr>
                      <td colSpan="18" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <Search size={48} className="text-muted mb-3" />
                          <h4 className="mb-2">No results found</h4>
                          <p className="text-muted mb-0">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No data available for selected date'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded-4 p-3 shadow">
          <div className="text-primary fs-5 fw-medium">
            Showing <span className="text-primary fw-bold">{tableData.length}</span> users for <span className="text-primary fw-bold">{selectedDate}</span>
          </div>
          <div className="badge bg-primary px-3 py-2 rounded-pill">
            <span className="pulse-dot me-2"></span>
            Auto-refreshing data
          </div>
        </div>
      </div>
      
      {/* Bootstrap CSS and Custom Styles */}
      <style>
        {`
          @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
          
          /* Custom Styles */
          body {
            background-color: #f8fafd;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          .dashboard-header {
            background: linear-gradient(135deg, #3a57e8, #2645d5);
            color: white;
            border-bottom: 4px solid rgba(255, 200, 61, 0.8);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .dashboard-header h1 {
            letter-spacing: 0.5px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
          }
          
          .dashboard-controls {
            border-radius: 12px;
            border: 1px solid rgba(58, 87, 232, 0.1);
          }
          
          .card {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
          }
          
          .search-box .form-control,
          .date-selector .form-select {
            height: 48px;
          }
          
          .search-box .form-control {
            min-width: 280px;
          }
          
          .date-selector .form-select {
            min-width: 180px;
            appearance: none;
          }
          
          .input-group-text {
            border-color: #dee2e6;
          }
          
          .custom-table {
            font-size: 1.05rem;
          }
          
          .table-header th {
            font-weight: 600;
            font-size: 1rem;
            padding: 14px 16px;
            border: 1px solid #3a57e8;
            white-space: nowrap;
            vertical-align: middle;
          }
          
          .custom-table td {
            vertical-align: middle;
            padding: 14px 16px;
            border: 1px solid #e9ecef;
            font-size: 1.05rem;
          }
          
          .custom-table tr:hover {
            background-color: rgba(58, 87, 232, 0.05);
          }
          
          .highlight-cell {
            background-color: rgba(255, 200, 61, 0.1);
            font-weight: 600 !important;
            color: #d9870d;
          }
          
          .success-cell {
            background-color: rgba(25, 135, 84, 0.08);
            font-weight: 600 !important;
            color: #198754;
          }
          
          .text-primary {
            color: #3a57e8 !important;
          }
          
          .bg-primary {
            background-color: #3a57e8 !important;
          }
          
          .text-warning {
            color: #ffc83d !important;
          }
          
          .table-responsive::-webkit-scrollbar {
            height: 10px;
          }
          
          .table-responsive::-webkit-scrollbar-thumb {
            background-color: rgba(58, 87, 232, 0.4);
            border-radius: 5px;
          }
          
          .table-responsive::-webkit-scrollbar-track {
            background-color: rgba(0, 0, 0, 0.03);
          }
          
          .form-control:focus, 
          .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(58, 87, 232, 0.15);
            border-color: #a5b4fc;
          }
          
          .rounded-4 {
            border-radius: 0.75rem !important;
          }
          
          .card-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .pulse-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #fff;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
            }
            70% {
              box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
          
          /* Responsive adjustments */
          @media (max-width: 992px) {
            .dashboard-header h1 {
              font-size: 1.8rem;
            }
            
            .col-md-6 {
              margin-bottom: 15px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BinaryUsersDashboard;