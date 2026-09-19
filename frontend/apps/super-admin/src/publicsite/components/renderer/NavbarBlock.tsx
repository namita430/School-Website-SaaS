interface NavLink {
  label?: string;
  url?: string;
}

export default function NavbarBlock({ props }: { props: Record<string, unknown> }) {
  const logo = typeof props.logo === 'string' ? props.logo : null;
  const links = Array.isArray(props.links) ? (props.links as NavLink[]) : [];

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-secondary">{logo ?? 'Home'}</span>
        <div className="flex items-center gap-5">
          {links.map((link, i) => (
            <a key={i} href={link.url ?? '#'} className="text-sm text-gray-600 hover:text-primary">
              {link.label ?? String(link)}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
