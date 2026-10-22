'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@/components/student/ShivaIcons';

export default function SearchBox({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/app/search${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`);
      }}
      className="relative"
    >
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <IconSearch size={20} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Courses, batches search karo..."
        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </form>
  );
}
