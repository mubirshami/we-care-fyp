const ML_BASE = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

const emotionDetection = async () => {
  const res = await fetch(`${ML_BASE}/emotion-detection`);
  return res.json();
};

const sentimentAnalysis = async (text) => {
  const res = await fetch(`${ML_BASE}/sentiment-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export default { emotionDetection, sentimentAnalysis };
