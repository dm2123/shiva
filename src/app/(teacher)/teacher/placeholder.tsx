import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';

export default function TeacherPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <TeacherPageHeader title={title} description={`Manage your ${title.toLowerCase()} content here.`} />
      <TeacherGlassPanel className="h-64 flex items-center justify-center text-[var(--teacher-text-muted)]">
        <p>The {title} module will be available in the next phase.</p>
      </TeacherGlassPanel>
    </div>
  );
}
