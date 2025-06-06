import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from 'react-google-charts';

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Adjust the URL below to match your backend endpoint.
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics-data`);
        [
          ["Date", "Sessions"],
          ["2025-01-01", 150],
          ["2025-01-02", 200],
          // ...
        ]
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching Analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Chart
        chartType="LineChart"
        data={analyticsData}
        width="100%"
        height="400px"
        options={{
          title: 'Sessions Over Time',
          hAxis: { title: 'Date' },
          vAxis: { title: 'Sessions' },
          legend: { position: 'bottom' },
        }}
      />
    </div>
  );
};

export default Dashboard;
