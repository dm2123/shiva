'use client';

import { useState } from 'react';

const EXAMS = [
  { value: 'JEE Main', label: 'JEE Main' },
  { value: 'JEE Advanced', label: 'JEE Advanced' },
  { value: 'NEET', label: 'NEET' },
  { value: 'BITSAT', label: 'BITSAT' },
];

interface Prediction {
  predictedRankMin: number;
  predictedRankMax: number;
}

export default function RankPredictor() {
  const [exam, setExam] = useState('JEE Main');
  const [score, setScore] = useState('');
  const [percentile, setPercentile] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!score || !percentile) return;
    setLoading(true);
    try {
      const res = await fetch('/api/student/rank-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, score: parseInt(score), percentile: parseFloat(percentile) }),
      });
      const data = await res.json();
      setPrediction(data.prediction || null);
    } catch {
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const getBarWidth = () => {
    if (!prediction) return 0;
    const { predictedRankMin, predictedRankMax } = prediction;
    const avg = (predictedRankMin + predictedRankMax) / 2;
    const maxRank = 1500000;
    return Math.max(5, 100 - (avg / maxRank) * 100);
  };

  const getRankColor = () => {
    if (!prediction) return 'bg-gray-300';
    const { predictedRankMin } = prediction;
    if (predictedRankMin <= 1000) return 'bg-emerald-500';
    if (predictedRankMin <= 10000) return 'bg-green-500';
    if (predictedRankMin <= 50000) return 'bg-yellow-500';
    if (predictedRankMin <= 150000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rank Predictor</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            {EXAMS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter your score"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Percentile</label>
          <input
            type="number"
            value={percentile}
            onChange={(e) => setPercentile(e.target.value)}
            placeholder="e.g. 99.5"
            min="0"
            max="100"
            step="0.1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !score || !percentile}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Predicting...' : 'Predict Rank'}
      </button>

      {prediction && (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Your predicted rank range:</p>
            <p className="text-3xl font-extrabold text-gray-900">
              #{prediction.predictedRankMin.toLocaleString()} &ndash; #{prediction.predictedRankMax.toLocaleString()}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Top (1)</span>
              <span>Bottom (15,00,000)</span>
            </div>
            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getRankColor()} transition-all duration-700 ease-out`}
                style={{ width: `${getBarWidth()}%` }}
              />
            </div>
            <div
              className="relative mt-1"
              style={{ left: `${getBarWidth()}%`, transform: 'translateX(-50%)' }}
            >
              <div className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                You
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
