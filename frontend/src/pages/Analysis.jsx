import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as usersService } from '../services/modules';

function Analysis() {
  const { token } = useAuth();
  const [chartUrl, setChartUrl] = useState('');
  const mlBaseUrl = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

  useEffect(() => {
    async function fetchChart() {
      try {
        const res = await usersService.getId(token);
        const user = res.data.user_id;
        const response = await fetch(`${mlBaseUrl}/total_time_spent?user_id=${user}`);
        const blob = await response.blob();
        setChartUrl(URL.createObjectURL(blob));
      } catch (error) {
        console.error(error);
      }
    }

    fetchChart();
  }, [mlBaseUrl, token]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Time Spent and Sentiment Analysis</h1>
      {chartUrl ? (
        <img className="w-full rounded shadow" src={chartUrl} alt="Time Spent and Sentiment" />
      ) : (
        <p className="text-sm text-gray-500">Loading chart...</p>
      )}
    </div>
  );
}

export default Analysis;
