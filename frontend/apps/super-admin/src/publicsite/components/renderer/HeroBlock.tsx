export default function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const title = typeof props.title === 'string' ? props.title : '';
  const subtitle = typeof props.subtitle === 'string' ? props.subtitle : null;
  const image = typeof props.image === 'string' ? props.image : null;

  return (
    <section
      className="relative bg-secondary text-white py-24 px-4 text-center bg-cover bg-center"
      style={image ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${image})` } : undefined}
    >
      <h1 className="text-3xl sm:text-4xl font-bold font-heading max-w-2xl mx-auto">{title}</h1>
      {subtitle && <p className="mt-4 text-base sm:text-lg text-white/80 max-w-xl mx-auto">{subtitle}</p>}
    </section>
  );
}
