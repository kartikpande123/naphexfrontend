import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API_BASE_URL from './ApiConfig';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfitLossChart = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highestProfit, setHighestProfit] = useState(null);
  const [highestLoss, setHighestLoss] = useState(null);

  const processChartData = useCallback((gameDetails) => {
    if (!gameDetails || !gameDetails.dailyProfitLoss) return null;

    const sortedDates = Object.keys(gameDetails.dailyProfitLoss)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-31);

    const labels = sortedDates.map((date) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    });

    const values = sortedDates.map((date) => gameDetails.dailyProfitLoss[date]);

    // Find highest profit and loss
    const highestProfitValue = Math.max(...values.filter(value => value >= 0));
    const highestLossValue = Math.min(...values.filter(value => value < 0));

    // Find dates for highest profit and loss
    const highestProfitDate = sortedDates[values.indexOf(highestProfitValue)];
    const highestLossDate = sortedDates[values.indexOf(highestLossValue)];

    setHighestProfit({
      value: highestProfitValue,
      date: new Date(highestProfitDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    });

    setHighestLoss({
      value: highestLossValue,
      date: new Date(highestLossDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    });

    return {
      labels,
      datasets: [
        {
          label: 'Profit/Loss',
          data: values,
          backgroundColor: values.map((value) =>
            value >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(244, 63, 94, 0.7)'
          ),
          borderColor: values.map((value) =>
            value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(244, 63, 94)'
          ),
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 16,
          maxBarThickness: 20,
        },
      ],
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/gameDetailsStream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.success) {
          const processedChartData = processChartData(data.data);

          if (processedChartData) {
            setChartData(processedChartData);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error processing SSE data:', error);
        setIsLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [processChartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#495057',
          font: {
            weight: 'bold',
            size: 14,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#495057',
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Profit/Loss',
          color: '#495057',
          font: {
            weight: 'bold',
            size: 14,
          },
        },
        ticks: {
          callback: (value) => (value >= 0 ? `+${value}` : `${value}`),
          color: '#495057',
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.5)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#212529',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white text-center py-3">
          <h2 className="card-title m-0">
            <i className="bi bi-graph-up-arrow me-2"></i> Daily Profit/Loss
          </h2>
          <p className="card-subtitle">Real-time Performance Tracking</p>
        </div>
        <div className="card-body pb-0">
          <div className="chart-container" style={{ height: '400px' }}>
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div
                  className="spinner-border text-success"
                  role="status"
                  style={{ width: '3rem', height: '3rem' }}
                ></div>
              </div>
            ) : chartData ? (
              <Bar data={chartData} options={options} />
            ) : (
              <div className="text-center text-muted">No data available</div>
            )}
          </div>
        </div>
        {(highestProfit || highestLoss) && (
          <div className="card-footer bg-light py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-success">
                <small>
                  <i className="bi bi-arrow-up-circle me-1"></i>
                  Highest Profit: 
                  <strong className="ms-1">
                    {highestProfit ? `+${highestProfit.value.toFixed(2)} on ${highestProfit.date}` : 'N/A'}
                  </strong>
                </small>
              </div>
              <div className="text-danger">
                <small>
                  <i className="bi bi-arrow-down-circle me-1"></i>
                  Highest Loss: 
                  <strong className="ms-1">
                    {highestLoss ? `${highestLoss.value.toFixed(2)} on ${highestLoss.date}` : 'N/A'}
                  </strong>
                </small>
              </div>
            </div>
          </div>
        )}
        <div className="card-footer bg-light text-center py-3">
          <small className="text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossChart;