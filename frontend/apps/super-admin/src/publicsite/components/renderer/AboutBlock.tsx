export default function AboutBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : '';
  const body = typeof props.body === 'string' ? props.body : null;
  const image = typeof props.image === 'string' ? props.image : null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className={`grid gap-8 items-center ${image ? 'sm:grid-cols-2' : ''}`}>
        <div>
          <h2 className="text-2xl font-semibold font-heading text-secondary mb-3">{title}</h2>
          {body && <p className="text-gray-600 leading-relaxed whitespace-pre-line">{body}</p>}
        </div>
        {image && <img src={image} alt={title} className="w-full rounded-theme" />}
      </div>
    </section>
  );
}
