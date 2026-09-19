import { useQuery } from '@tanstack/react-query';
import { getContentList, type Teacher } from '../../api/content';

export default function TeachersBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Our Teachers';
  const limit = typeof props.limit === 'number' ? props.limit : 12;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'teachers', limit],
    queryFn: () => getContentList<Teacher>('/api/v1/public/teachers', limit),
  });

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {data?.map((teacher) => (
          <div key={teacher.id} className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 overflow-hidden">
              {teacher.photoUrl && (
                <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" />
              )}
            </div>
            <p className="text-sm font-medium text-secondary mt-2">{teacher.name}</p>
            {teacher.designation && <p className="text-xs text-gray-500">{teacher.designation}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
