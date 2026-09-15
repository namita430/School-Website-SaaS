import { useQuery } from '@tanstack/react-query';
import { getContentList, type GalleryItem } from '../../api/content';

export default function GalleryBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : 'Gallery';
  const limit = typeof props.limit === 'number' ? props.limit : 12;

  const { data, isLoading } = useQuery({
    queryKey: ['public-content', 'gallery', limit],
    queryFn: () => getContentList<GalleryItem>('/api/v1/public/gallery', limit),
  });

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data?.map((item) => (
          <img
            key={item.id}
            src={item.imageUrl}
            alt={item.caption ?? ''}
            className="w-full aspect-square object-cover rounded-theme"
          />
        ))}
      </div>
    </section>
  );
}
