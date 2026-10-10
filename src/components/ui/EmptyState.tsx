interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({ title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
        !
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
        >
          {actionText}
        </a>
      )}
    </div>
  );
}
