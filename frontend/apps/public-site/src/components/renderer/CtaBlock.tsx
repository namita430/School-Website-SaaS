export default function CtaBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : '';
  const buttonLabel = typeof props.buttonLabel === 'string' ? props.buttonLabel : null;
  const buttonUrl = typeof props.buttonUrl === 'string' ? props.buttonUrl : '#';

  return (
    <section className="bg-primary/5 py-14 px-4 text-center">
      <h2 className="text-2xl font-semibold font-heading text-secondary mb-4">{title}</h2>
      {buttonLabel && (
        <a
          href={buttonUrl}
          className="inline-block rounded-theme bg-primary text-white text-sm font-medium px-6 py-2.5 hover:opacity-90"
        >
          {buttonLabel}
        </a>
      )}
    </section>
  );
}
