import React, { useState } from 'react';
import mlService from '../services/modules/ml';

function EmotionDetection() {
  const [emotion, setEmotion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmotionDetection = async () => {
    try {
      setLoading(true);
      const data = await mlService.emotionDetection();
      setEmotion(JSON.stringify(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={handleEmotionDetection}
        disabled={loading}
      >
        {loading ? 'Detecting...' : 'Detect Emotion'}
      </button>
      <p className="mt-2">Emotion detected: {emotion}</p>
    </div>
  );
}

export default EmotionDetection;
