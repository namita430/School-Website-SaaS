import type { ComponentDefinition } from '../../types/builder';
import { useBuilderStore } from '../../store/builderStore';

export default function ComponentPanel({ components }: { components: ComponentDefinition[] }) {
  const addSection = useBuilderStore((s) => s.addSection);

  return (
    <div className="w-56 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
        Components
      </p>
      <div className="p-3 space-y-1">
        {components.map((c) => (
          <button
            key={c.typeKey}
            onClick={() => addSection(c.typeKey)}
            className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            + {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
