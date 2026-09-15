export default function TextBlock({ props }: { props: Record<string, unknown> }) {
  const content = typeof props.content === 'string' ? props.content : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-3">
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
