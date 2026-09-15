export default function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = typeof props.src === 'string' ? props.src : null;
  const alt = typeof props.alt === 'string' ? props.alt : '';

  if (!src) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-3">
      <img src={src} alt={alt} className="w-full rounded-theme" />
    </div>
  );
}
