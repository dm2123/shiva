import DemoVideoPlayer from '@/components/common/DemoVideoPlayer';
import { BRAND } from '@/lib/brand';
import ShivaIcon from './ShivaIcon';

export default function MarketingDemoSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#050508]">
      <div className="absolute inset-0 bg-violet-900/5" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <span className="shiva-capsule shiva-capsule-gold inline-flex items-center gap-2">
              <ShivaIcon size={16} animated={false} variant="gold" />
              Demo Class
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Experience THE SHIVA <br/>
              <span className="text-shiva-gold">Teaching</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              Watch a real classroom session with our founder, Shivajay Sir. Experience the quality of teaching before enrolling in our premium courses.
            </p>
            <div className="pt-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium text-sm">Class 9 & 10 Special Batch • Maths & Science</span>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-violet-900/20">
              <DemoVideoPlayer 
                src={BRAND.demoVideoUrl} 
                poster="/assets/demo-poster.jpg"
                title="Teaching Demo - Shivajay Sir"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
