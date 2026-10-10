'use client';

import { useState, useRef } from 'react';

interface VoiceDoubtRecord {
  id: number;
  subject: string;
  topic: string;
  transcript: string;
  aiResponse: string;
  createdAt: string;
}

export default function VoiceDoubt() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VoiceDoubtRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!transcript || !subject || !topic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/student/voice-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: transcript, subject, topic }),
      });
      const data = await res.json();
      if (data.doubt) {
        setAiResponse(data.doubt.aiResponse);
        setHistory((prev) => [data.doubt, ...prev]);
      }
    } catch {
      setAiResponse('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/student/voice-doubt');
      const data = await res.json();
      setHistory(data.doubts || []);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Doubt Solver</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Physics, Chemistry"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Thermodynamics, Organic Chemistry"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
            <path d="M5 8a5 5 0 0010 0H5z" />
          </svg>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || !transcript || !subject || !topic}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Getting Answer...' : 'Get Answer'}
        </button>

        <button
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          {showHistory ? 'Hide' : 'History'}
        </button>
      </div>

      {transcript && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-gray-500 mb-1">Transcript</p>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}

      {aiResponse && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-indigo-600 mb-2">AI Response</p>
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Past Doubts</h3>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500">{h.subject} &middot; {h.topic}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(h.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
