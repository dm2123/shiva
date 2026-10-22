'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CertificateCard from '@/components/certificates/CertificateCard';
import { IconAward, IconCheckCircle, IconBook, IconChevronRight } from '@/components/student/StudentIcons';

const EARN_STEPS = [
  { icon: <IconBook size={18} />, title: 'Enroll in a course', desc: 'Join any batch or course on THE SHIVA' },
  { icon: <IconCheckCircle size={18} />, title: 'Complete all lectures', desc: 'Finish every chapter in the syllabus' },
  { icon: <IconAward size={18} />, title: 'Get certified', desc: 'Your certificate appears here automatically' },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch('/api/student/certificates');
        const data = await res.json();
        if (data.success) setCertificates(data.data.certificates || []);
      } catch (err) {
        console.error('Fetch certificates error:', err);
      }
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">Certificates you earn by completing courses on THE SHIVA.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="space-y-5">
          {/* How to earn */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <h2 className="text-[16px] font-bold text-gray-900 mb-4">How to earn a certificate</h2>
            <div className="space-y-4">
              {EARN_STEPS.map((s, i) => (
                <div key={s.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      <span className="text-indigo-600 mr-1.5">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty state */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border border-indigo-100 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <IconAward size={30} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No certificates yet</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              Complete a course to earn your first certificate. Start with the free Aptitude Foundation course.
            </p>
            <Link
              href="/app/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
            >
              Explore Courses
              <IconChevronRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
