import { useEffect, useState } from 'react';
import type { ComponentDefinition } from '../../types/builder';
import { useBuilderStore } from '../../store/builderStore';
import ImageUploadField from '../../components/ImageUploadField';

/**
 * A form generated directly from the selected section's component schema -
 * no per-component-type React form was hand-written; adding a new prop to a
 * component's schema_json (a DB row, see Phase 4) is enough for it to show
 * up here automatically.
 */
export default function PropertiesPanel({ components }: { components: ComponentDefinition[] }) {
  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const updateSectionProps = useBuilderStore((s) => s.updateSectionProps);

  const section = sections.find((s) => s.id === selectedSectionId) ?? null;
  const definition = section ? components.find((c) => c.typeKey === section.type) ?? null : null;

  // Local editable copy - committed to the (undoable) store only on Apply,
  // so every keystroke doesn't become its own undo step.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!section || !definition) {
      setDraft({});
      setJsonErrors({});
      return;
    }
    const next: Record<string, string> = {};
    for (const propName of Object.keys(definition.schemaJson.properties)) {
      const value = section.props[propName];
      const propType = definition.schemaJson.properties[propName].type;
      next[propName] =
        value === undefined
          ? ''
          : propType === 'array' || propType === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value);
    }
    setDraft(next);
    setJsonErrors({});
  }, [section?.id, definition]);

  if (!section) {
    return (
      <div className="w-72 shrink-0 border-l border-gray-200 bg-white p-4 text-sm text-gray-400">
        Select a section to edit its properties.
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="w-72 shrink-0 border-l border-gray-200 bg-white p-4 text-sm text-red-600">
        Unknown component type "{section.type}".
      </div>
    );
  }

  const apply = () => {
    const props: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    for (const [propName, schema] of Object.entries(definition.schemaJson.properties)) {
      const raw = draft[propName] ?? '';
      if (raw === '') continue;

      if (schema.type === 'number') {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          errors[propName] = 'Must be a number';
        } else {
          props[propName] = num;
        }
      } else if (schema.type === 'boolean') {
        props[propName] = raw === 'true';
      } else if (schema.type === 'array' || schema.type === 'object') {
        try {
          props[propName] = JSON.parse(raw);
        } catch {
          errors[propName] = `Must be valid JSON ${schema.type === 'array' ? '(array)' : '(object)'}`;
        }
      } else {
        props[propName] = raw;
      }
    }

    setJsonErrors(errors);
    if (Object.keys(errors).length === 0) {
      updateSectionProps(section.id, props);
    }
  };

  return (
    <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
      <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
        {definition.name} properties
      </p>
      <div className="p-4 space-y-3">
        {Object.entries(definition.schemaJson.properties).map(([propName, schema]) => (
          <div key={propName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {propName}
              {schema.required && <span className="text-red-500"> *</span>}
            </label>

            {schema.type === 'boolean' ? (
              <select
                value={draft[propName] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [propName]: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">—</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : schema.type === 'array' || schema.type === 'object' ? (
              <textarea
                rows={3}
                value={draft[propName] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [propName]: e.target.value }))}
                placeholder={schema.type === 'array' ? '[]' : '{}'}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono"
              />
            ) : schema.type === 'string' && /image|photo|picture|avatar|logo|icon/i.test(propName) ? (
              <ImageUploadField
                value={draft[propName] ?? ''}
                onChange={(url) => setDraft((d) => ({ ...d, [propName]: url }))}
              />
            ) : (
              <input
                type={schema.type === 'number' ? 'number' : 'text'}
                value={draft[propName] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [propName]: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            )}

            {jsonErrors[propName] && <p className="mt-1 text-xs text-red-600">{jsonErrors[propName]}</p>}
          </div>
        ))}

        <button
          onClick={apply}
          className="w-full rounded-md bg-secondary text-white text-sm font-medium py-1.5 hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
