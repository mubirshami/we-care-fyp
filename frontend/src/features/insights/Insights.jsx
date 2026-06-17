import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import mlService from '../../services/ml';
import emotiontimeService from '../../services/emotiontime';
import usersService from '../../services/users';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const EMOTION_MAP = {
  happy:    { emoji: '😊', label: 'Happy',    cls: 'bg-success-50 border-success-200 text-success-700' },
  sad:      { emoji: '😔', label: 'Sad',      cls: 'bg-info-50 border-info-200 text-info-700' },
  angry:    { emoji: '😠', label: 'Angry',    cls: 'bg-error-50 border-error-200 text-error-600' },
  surprised:{ emoji: '😲', label: 'Surprised',cls: 'bg-warning-50 border-warning-200 text-warning-700' },
  fearful:  { emoji: '😨', label: 'Fearful',  cls: 'bg-info-50 border-info-200 text-info-600' },
  disgusted:{ emoji: '🤢', label: 'Disgusted',cls: 'bg-neutral-100 border-neutral-200 text-neutral-600' },
  neutral:  { emoji: '😐', label: 'Neutral',  cls: 'bg-neutral-100 border-neutral-200 text-neutral-600' },
};

function getEmotionConfig(emotion) {
  const key = (emotion || '').toLowerCase();
  return EMOTION_MAP[key] || { emoji: '🤔', label: emotion || 'Unknown', cls: 'bg-neutral-100 border-neutral-200 text-neutral-600' };
}

function EmotionResult({ data }) {
  const dominant = data.dominant_emotion || data.emotion || Object.keys(data)[0];
  const confidence = data[dominant] ?? data.confidence;
  const cfg = getEmotionConfig(dominant);
  const pct = confidence != null ? Math.round(Number(confidence) * 100) : null;

  return (
    <div className={`rounded-card border p-6 ${cfg.cls}`}>
      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden="true">{cfg.emoji}</span>
        <div>
          <p className="text-xl font-display font-bold">{cfg.label}</p>
          {pct != null && <p className="mt-0.5 text-sm opacity-80">{pct}% confidence</p>}
        </div>
      </div>
      {typeof data === 'object' && Object.keys(data).length > 1 && (
        <div className="mt-5 space-y-2">
          {Object.entries(data)
            .filter(([, v]) => typeof v === 'number')
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([emotion, score]) => (
              <div key={emotion} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium capitalize opacity-80">{emotion}</span>
                <div className="flex-1 h-1.5 rounded-full bg-current/20">
                  <div className="h-full rounded-full bg-current/60 transition-all duration-500" style={{ width: `${Math.round(Number(score) * 100)}%` }} />
                </div>
                <span className="w-8 text-xs text-right opacity-70">{Math.round(Number(score) * 100)}%</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function SentimentChart({ token }) {
  const [chartUrl, setChartUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mlBase = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

  useEffect(() => {
    async function load() {
      try {
        const res = await usersService.getId(token);
        const userId = res.data.user_id;
        const imgRes = await fetch(`${mlBase}/total_time_spent?user_id=${userId}`);
        if (!imgRes.ok) throw new Error('Chart unavailable');
        const blob = await imgRes.blob();
        setChartUrl(URL.createObjectURL(blob));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { if (chartUrl) URL.revokeObjectURL(chartUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mlBase]);

  if (loading) return <LoadingSkeleton variant="card" />;

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-card border border-dashed border-neutral-200 bg-neutral-50 py-12 text-center">
        <p className="text-3xl mb-3" aria-hidden="true">📉</p>
        <p className="text-sm font-medium text-neutral-600">Chart unavailable</p>
        <p className="mt-1 text-xs text-neutral-500">Write journal entries to generate your sentiment timeline.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <p className="text-sm font-semibold text-neutral-800">Time spent &amp; sentiment over time</p>
        <p className="mt-0.5 text-xs text-neutral-500">Based on your journaling activity and session durations</p>
      </div>
      <div className="p-4">
        <img src={chartUrl} alt="Sentiment and time-spent analysis chart" className="w-full rounded-md" />
      </div>
    </div>
  );
}

export default function Insights() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [detecting, setDetecting] = useState(false);
  const [emotionData, setEmotionData] = useState(null);

  const handleDetect = useCallback(async () => {
    setDetecting(true);
    setEmotionData(null);
    try {
      const data = await mlService.emotionDetection();
      setEmotionData(data);
      if (data?.emotionTime != null) {
        await emotiontimeService.post({ emotionTime: data.emotionTime }, token).catch(() => null);
      }
    } catch {
      addToast('Emotion detection failed. Please try again.', 'error');
    } finally {
      setDetecting(false);
    }
  }, [token, addToast]);

  return (
    <div className="max-w-[820px] mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Insights</h1>
        <p className="text-sm text-neutral-500">Understand your emotional patterns through face detection and journaling data.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-neutral-800 mb-1">Emotion Detection</h2>
        <p className="text-sm text-neutral-500 mb-5">Uses your camera to detect your current emotional state using facial recognition.</p>
        <div className="rounded-card border border-neutral-200 bg-white shadow-card p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <span className="text-2xl" aria-hidden="true">📷</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">Facial emotion analysis</p>
              <p className="text-xs text-neutral-500 mt-0.5">Allow camera access when prompted. Results are analyzed in real time.</p>
            </div>
          </div>
          <Button onClick={handleDetect} loading={detecting} variant="primary" size="md">
            {detecting ? 'Analyzing…' : 'Detect my emotion'}
          </Button>
          {emotionData && <EmotionResult data={emotionData} />}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-800 mb-1">Sentiment Timeline</h2>
        <p className="text-sm text-neutral-500 mb-5">A visual summary of your mood trends based on your journal entries.</p>
        <SentimentChart token={token} />
      </section>
    </div>
  );
}
