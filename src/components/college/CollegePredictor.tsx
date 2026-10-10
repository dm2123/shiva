'use client';

import { useState } from 'react';

const EXAMS = [
  { value: 'JEE Main', label: 'JEE Main' },
  { value: 'JEE Advanced', label: 'JEE Advanced' },
  { value: 'NEET', label: 'NEET' },
  { value: 'BITSAT', label: 'BITSAT' },
];

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
];

interface College {
  id: number;
  name: string;
  city: string;
  type: string;
  ranking: number;
  fees: number;
  cutoffData: Record<string, Record<string, number>>;
}

export default function CollegePredictor() {
  const [exam, setExam] = useState('JEE Main');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('General');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handlePredict = async () => {
    if (!rank) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/student/college-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, rank: parseInt(rank), category }),
      });
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch {
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">College Predictor</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="Enter your rank"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !rank}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Predicting...' : 'Predict Colleges'}
      </button>

      {searched && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {colleges.length > 0 ? `Found ${colleges.length} matching colleges` : 'No matching colleges found'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colleges.map((college) => (
              <div
                key={college.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-indigo-700">{college.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{college.city} &middot; {college.type}</p>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-gray-500">Rank: #{college.ranking}</span>
                  <span className="text-green-600 font-semibold">
                    {college.fees ? `₹${college.fees.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
