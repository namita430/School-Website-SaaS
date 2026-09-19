export default function HeadingBlock({ props }: { props: Record<string, unknown> }) {
  const text = typeof props.text === 'string' ? props.text : '';
  const level = typeof props.level === 'number' && props.level >= 1 && props.level <= 6 ? props.level : 2;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClass = level <= 2 ? 'text-2xl' : level === 3 ? 'text-xl' : 'text-lg';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Tag className={`${sizeClass} font-semibold font-heading text-secondary`}>{text}</Tag>
    </div>
  );
}
