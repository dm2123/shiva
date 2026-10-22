'use client';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  type?: 'certificate' | 'score' | 'achievement';
}

export default function ShareButton({ title, text, url, type = 'score' }: ShareButtonProps) {
  const shareUrl = url || window.location.href;

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n\n${text}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareOnTwitter = () => {
    const message = encodeURIComponent(`${title} ${text}`);
    window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${title}\n${text}\n${shareUrl}`);
    alert('Copied to clipboard!');
  };

  const icon = {
    certificate: '🏆',
    score: '📊',
    achievement: '⭐',
  }[type];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">{icon} Share:</span>
      <button
        onClick={shareOnWhatsApp}
        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
        title="WhatsApp"
      >
        💬
      </button>
      <button
        onClick={shareOnTwitter}
        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        title="Twitter"
      >
        🐦
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
        title="LinkedIn"
      >
        💼
      </button>
      <button
        onClick={copyToClipboard}
        className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        title="Copy Link"
      >
        📋
      </button>
    </div>
  );
}
