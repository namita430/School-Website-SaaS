import type { SchoolLandingData } from './types';

export default function CtaSection({ cta }: { cta: SchoolLandingData['cta'] }) {
  return (
    <section id="admissions" className="bg-secondary text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-3">{cta.heading}</h2>
        <p className="text-white/70 mb-8">{cta.body}</p>
        <a
          href={cta.buttonHref}
          className="inline-block rounded-theme bg-primary text-white text-sm font-medium px-8 py-3 hover:opacity-90 transition-opacity"
        >
          {cta.buttonLabel}
        </a>
      </div>
    </section>
  );
}
