import type { SchoolLandingData } from './types';

export default function AboutSection({ about }: { about: SchoolLandingData['about'] }) {
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
      <div className={about.imageUrl ? 'order-2 md:order-1' : 'order-2 md:order-1 md:col-span-2 text-center'}>
        <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">About Us</p>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-secondary mb-4">{about.heading}</h2>
        <p className="text-gray-600 leading-relaxed mb-6">{about.body}</p>
        <a
          href={about.ctaHref}
          className="inline-block rounded-theme border border-primary text-primary text-sm font-medium px-6 py-2.5 hover:bg-primary hover:text-white transition-colors"
        >
          {about.ctaLabel}
        </a>
      </div>
      {about.imageUrl && (
        <div className="order-1 md:order-2">
          <img src={about.imageUrl} alt="" className="w-full h-72 sm:h-80 object-cover rounded-theme" />
        </div>
      )}
    </section>
  );
}
