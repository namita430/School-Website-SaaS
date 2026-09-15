import type { PageContent } from '../../types/content';
import { COMPONENT_REGISTRY } from './registry';

export default function PageRenderer({ content }: { content: PageContent }) {
  return (
    <>
      {content.sections.map((section) => {
        const Block = COMPONENT_REGISTRY[section.type];
        if (!Block) {
          // Unknown component type (e.g. added to the registry after this
          // frontend was built) - fail visibly rather than silently
          // dropping the section, since this is the public site.
          return (
            <div key={section.id} className="max-w-3xl mx-auto px-4 py-4 text-sm text-red-500">
              Unknown component "{section.type}"
            </div>
          );
        }
        return <Block key={section.id} props={section.props} />;
      })}
    </>
  );
}
