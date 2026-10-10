'use client';

import VoiceDoubt from '@/components/ai/VoiceDoubt';

export default function VoiceDoubtPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Voice Doubt Solver</h1>
        <p className="text-gray-500 mb-8">Speak your doubt and get instant AI-powered explanations.</p>

        <VoiceDoubt />
      </div>
    </div>
  );
}
