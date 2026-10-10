'use client';

import CollegePredictor from '@/components/college/CollegePredictor';
import RankPredictor from '@/components/college/RankPredictor';

export default function CollegePredictorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">College & Rank Predictor</h1>
        <p className="text-gray-500 mb-8">Find colleges that match your score and predict your rank.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CollegePredictor />
          <RankPredictor />
        </div>
      </div>
    </div>
  );
}
