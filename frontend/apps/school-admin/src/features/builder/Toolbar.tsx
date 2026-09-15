import { Link } from 'react-router-dom';
import { useBuilderStore } from '../../store/builderStore';

interface ToolbarProps {
  pageTitle: string;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
  saved: boolean;
  isPublished: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  isPublishing: boolean;
  publishError: string | null;
  onToggleSeo: () => void;
}

export default function Toolbar({
  pageTitle,
  onSave,
  isSaving,
  saveError,
  saved,
  isPublished,
  onPublish,
  onUnpublish,
  isPublishing,
  publishError,
  onToggleSeo,
}: ToolbarProps) {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.canUndo());
  const canRedo = useBuilderStore((s) => s.canRedo());
  const dirty = useBuilderStore((s) => s.isDirty());

  return (
    <div className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/website/pages" className="text-sm text-gray-400 hover:text-secondary">
          ← Pages
        </Link>
        <span className="text-gray-300">/</span>
        <p className="text-sm font-medium text-secondary truncate">{pageTitle}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isPublished ? 'Published' : 'Unpublished'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {publishError && <p className="text-xs text-red-600">{publishError}</p>}
        {saveError && <p className="text-xs text-red-600">{saveError}</p>}
        {!saveError && saved && !dirty && <p className="text-xs text-green-600">Saved</p>}
        {dirty && !saveError && <p className="text-xs text-gray-400">Unsaved changes</p>}

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className="text-sm text-gray-500 hover:text-secondary disabled:opacity-30 px-2"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className="text-sm text-gray-500 hover:text-secondary disabled:opacity-30 px-2"
        >
          ↷ Redo
        </button>
        <button
          onClick={onToggleSeo}
          className="text-sm text-gray-500 hover:text-secondary px-2"
        >
          SEO
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !dirty}
          className="rounded-md bg-secondary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save draft'}
        </button>
        {isPublished ? (
          <button
            onClick={onUnpublish}
            disabled={isPublishing}
            className="rounded-md border border-gray-300 text-gray-600 text-sm font-medium px-4 py-1.5 hover:bg-gray-50 disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={isPublishing || dirty}
            title={dirty ? 'Save your changes before publishing' : undefined}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {isPublishing ? 'Publishing…' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  );
}
