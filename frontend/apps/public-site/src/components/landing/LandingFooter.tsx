import { Mail, MapPin, Phone, Share2 } from 'lucide-react';
import type { SchoolLandingData } from './types';

/**
 * lucide-react doesn't ship brand icons (Facebook/Twitter/etc are
 * intentionally excluded upstream), so social links use a generic icon +
 * their label as the accessible name - swap for real brand icons/SVGs
 * later if desired.
 */

export default function LandingFooter({
  schoolName,
  logoUrl,
  footer,
}: {
  schoolName: string;
  logoUrl?: string | null;
  footer: SchoolLandingData['footer'];
}) {
  return (
    <footer id="contact" className="bg-secondary text-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            {logoUrl ? (
              <img src={logoUrl} alt={schoolName} className="h-8 w-8 rounded-theme object-cover" />
            ) : (
              <span className="h-8 w-8 rounded-theme bg-primary text-white flex items-center justify-center font-heading font-bold text-sm">
                {schoolName.charAt(0)}
              </span>
            )}
            <span className="font-heading font-semibold text-white">{schoolName}</span>
          </div>
          <p className="text-sm leading-relaxed">{footer.description}</p>
        </div>

        <div>
          <p className="text-white font-medium text-sm mb-3">Quick Links</p>
          <ul className="space-y-2 text-sm">
            {footer.quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-white font-medium text-sm mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            {footer.contact.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{footer.contact.address}</span>
              </li>
            )}
            {footer.contact.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{footer.contact.phone}</span>
              </li>
            )}
            {footer.contact.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{footer.contact.email}</span>
              </li>
            )}
          </ul>

          {footer.social.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              {footer.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {schoolName}. All rights reserved.
      </div>
    </footer>
  );
}
