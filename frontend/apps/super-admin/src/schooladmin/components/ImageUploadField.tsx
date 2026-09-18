import { useRef, useState } from 'react';
import { uploadMedia } from '../api/media';
import { ApiError } from '../../api/client';

/**
 * A URL text field paired with an "Upload" button - picks a file from disk,
 * uploads it to the media library, and fills the field with the resulting
 * asset's URL. Keeps the field itself as plain text so a URL can still be
 * pasted directly (e.g. an already-hosted image), but uploading is the
 * primary path so authors aren't required to have a URL in hand.
 */
export default function ImageUploadField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const asset = await uploadMedia(file);
      onChange(new URL(asset.url, window.location.origin).href);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload an image or paste a URL"
          className={className ?? 'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm'}
        />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {value && (
        <img
          src={value}
          alt=""
          className="mt-2 h-16 w-16 rounded-md border border-gray-200 object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          onLoad={(e) => (e.currentTarget.style.display = 'block')}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
