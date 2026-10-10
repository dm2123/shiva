'use client';

import { useParams } from 'next/navigation';
import NCERTBrowser from '@/components/ncert/NCERTBrowser';

export default function NCERTSubjectPage() {
  const params = useParams();
  const classLevel = params.class as string;
  const subject = params.subject as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NCERTBrowser classLevel={classLevel} subject={subject} />
    </div>
  );
}
