interface SocialLink {
  label?: string;
  url?: string;
}

export default function FooterBlock({ props }: { props: Record<string, unknown> }) {
  const text = typeof props.text === 'string' ? props.text : null;
  const socialLinks = Array.isArray(props.socialLinks) ? (props.socialLinks as SocialLink[]) : [];

  return (
    <footer className="border-t border-gray-100 bg-secondary text-white/70 py-8 px-4 text-center text-sm">
      {text && <p>{text}</p>}
      {socialLinks.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          {socialLinks.map((link, i) => (
            <a key={i} href={link.url ?? '#'} className="hover:text-white">
              {link.label ?? String(link)}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
