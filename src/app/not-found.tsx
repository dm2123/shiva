import Link from 'next/link';
import THEShivaLogo from '@/components/brand/THEShivaLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <THEShivaLogo className="w-20 h-20 opacity-50" />
        </div>
        
        <div className="mb-8">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold mb-4 tracking-tight">
            404
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-base text-slate-300 mb-8 leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-yellow-600 text-slate-900 text-sm font-bold rounded-full hover:from-yellow-500 hover:to-gold transition-all duration-300 shadow-lg hover:shadow-gold/50"
          >
            Go to Homepage
          </Link>
          
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
