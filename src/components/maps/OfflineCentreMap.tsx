'use client';

const centres = [
  { id: 1, city: 'Delhi', address: '123 Learning Hub, Sector 14, Dwarka, New Delhi - 110075', phone: '+91 11 2345 6789' },
  { id: 2, city: 'Mumbai', address: '456 Knowledge Park, Andheri West, Mumbai - 400058', phone: '+91 22 2345 6789' },
  { id: 3, city: 'Jaipur', address: '789 Shiva Academy, Malviya Nagar, Jaipur - 302017', phone: '+91 141 234 5678' },
  { id: 4, city: 'Lucknow', address: '321 Study Centre, Gomti Nagar, Lucknow - 226010', phone: '+91 522 234 5678' },
  { id: 5, city: 'Patna', address: '654 Education Hub, Boring Road, Patna - 800001', phone: '+91 612 234 5678' },
];

export default function OfflineCentreMap() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">THE SHIVA Offline Centres</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">5 centres across India</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {centres.map((centre) => (
          <div
            key={centre.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{centre.city}</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{centre.address}</p>
                <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">{centre.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
