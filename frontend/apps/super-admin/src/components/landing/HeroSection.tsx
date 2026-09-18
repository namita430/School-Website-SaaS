import type { SchoolLandingData } from './types';

export default function HeroSection({
  schoolName,
  hero,
}: {
  schoolName: string;
  hero: SchoolLandingData['hero'];
}) {
  return (
    <section
      id="home"
      className="relative bg-secondary text-white bg-cover bg-center"
      style={
        hero.backgroundImageUrl
          ? { backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url(${hero.backgroundImageUrl})` }
          : undefined
      }
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <p className="uppercase tracking-widest text-xs sm:text-sm text-white/60 mb-3">{schoolName}</p>
        <h1 className="font-heading font-bold text-3xl sm:text-5xl leading-tight mb-5">{hero.tagline}</h1>
        <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-9">{hero.description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={hero.primaryCta.href}
            className="w-full sm:w-auto rounded-theme bg-primary text-white text-sm font-medium px-7 py-3 hover:opacity-90 transition-opacity"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="w-full sm:w-auto rounded-theme bg-white/10 text-white text-sm font-medium px-7 py-3 border border-white/30 hover:bg-white/20 transition-colors"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
