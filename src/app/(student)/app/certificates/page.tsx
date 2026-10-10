'use client';

import { useState, useEffect } from 'react';
import CertificateCard from '@/components/certificates/CertificateCard';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch('/api/student/certificates');
        const data = await res.json();
        if (data.success) setCertificates(data.data.certificates);
      } catch (err) {
        console.error('Fetch certificates error:', err);
      }
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading certificates...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Certificates</h1>
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No certificates yet</p>
          <p className="text-sm text-slate-400 mt-1">Complete a course to earn your certificate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map(cert => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
