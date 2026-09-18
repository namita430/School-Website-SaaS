import type { ComponentDefinition } from '../../types/builder';
import { useBuilderStore } from '../../store/builderStore';

/**
 * Renders each section as a generic card (type + a one-line prop preview),
 * not a live visual preview of the actual component - that requires a real
 * per-type React renderer shared with the public site, which is Phase 6
 * work. This is enough to add/reorder/edit sections and see the page's
 * structure at a glance.
 */
export default function Canvas({ components }: { components: ComponentDefinition[] }) {
  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const moveSection = useBuilderStore((s) => s.moveSection);

  const nameFor = (typeKey: string) => components.find((c) => c.typeKey === typeKey)?.name ?? typeKey;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {sections.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-sm text-gray-400">
          No sections yet — add one from the Components panel.
        </div>
      )}

      <div className="space-y-3 max-w-2xl mx-auto">
        {sections.map((section, index) => {
          const isSelected = section.id === selectedSectionId;
          return (
            <div
              key={section.id}
              onClick={() => selectSection(section.id)}
              className={`rounded-lg border bg-white p-4 cursor-pointer transition-colors ${
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {nameFor(section.type)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">
                    {Object.keys(section.props).length > 0
                      ? Object.entries(section.props)
                          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                          .join(' · ')
                      : 'No props set'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Move up"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-secondary disabled:opacity-30 text-xs px-1"
                  >
                    ↑
                  </button>
                  <button
                    title="Move down"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    className="text-gray-400 hover:text-secondary disabled:opacity-30 text-xs px-1"
                  >
                    ↓
                  </button>
                  <button
                    title="Duplicate"
                    onClick={() => duplicateSection(section.id)}
                    className="text-gray-400 hover:text-secondary text-xs px-1"
                  >
                    ⧉
                  </button>
                  <button
                    title="Remove"
                    onClick={() => removeSection(section.id)}
                    className="text-gray-400 hover:text-red-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
