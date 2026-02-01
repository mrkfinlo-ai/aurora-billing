import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:3000/billing';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // HACK: Ask user for token since we don't have a login screen yet
        const token = prompt("Please paste your JWT Token from the terminal:");
        if (!token) return;

        const response = await axios.get(`${API_URL}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAnalytics(response.data.analytics);
        setLoading(false);
      } catch (error) {
        alert('Failed to fetch data. Check console.');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{padding: 20}}>Loading Dashboard...</div>;

  const chartData = {
    labels: ['Revenue', 'Target'],
    datasets: [
      {
        label: 'USD',
        data: [analytics.totalRevenue, 1000],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Aurora Billing Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <h2 style={{ color: 'green' }}>${analytics.totalRevenue}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Total Invoices</h3>
          <h2>{analytics.totalInvoices}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Avg Deal Size</h3>
          <h2>${analytics.averageDealSize}</h2>
        </div>
      </div>

      <div style={{ width: '600px', height: '400px' }}>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
