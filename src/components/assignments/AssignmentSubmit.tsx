'use client';

import { useState } from 'react';


interface Props {
  assignmentId: number;
  onSubmit: (content: string, fileUrl?: string) => Promise<void>;
  disabled?: boolean;
}

export default function AssignmentSubmit({ assignmentId, onSubmit, disabled }: Props) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !fileName) return;
    setSubmitting(true);
    try {
      await onSubmit(content, fileName || undefined);
      setContent('');
      setFileName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg">Submit Assignment</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your answer or paste a link to your work..."
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 min-h-[160px] resize-y focus:outline-none focus:border-purple-500"
        disabled={disabled || submitting}
      />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-md cursor-pointer transition text-sm">
          📎
          {fileName || 'Attach file'}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={disabled || submitting} />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || submitting || (!content.trim() && !fileName)}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition"
      >
        ➤
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}
