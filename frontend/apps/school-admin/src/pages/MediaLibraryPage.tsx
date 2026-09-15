import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMedia, listMedia, uploadMedia } from '../api/media';
import { ApiError } from '../api/client';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const mediaQuery = useQuery({ queryKey: ['media'], queryFn: listMedia });

  const uploadMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (err) => setUploadError(err instanceof ApiError ? err.message : 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  const copyUrl = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      // Clipboard access can be denied (permissions, insecure context) - not
      // worth failing the page over; the user can still select the URL manually.
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-secondary">Media Library</h1>
          <p className="text-sm text-gray-500">Images and documents for use across your website.</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      </div>

      {uploadError && <p className="text-sm text-red-600 mb-4">{uploadError}</p>}

      {mediaQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mediaQuery.data?.map((asset) => (
          <div key={asset.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              {asset.contentType.startsWith('image/') ? (
                <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">{asset.contentType}</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-secondary truncate" title={asset.fileName}>
                {asset.fileName}
              </p>
              <p className="text-xs text-gray-400">{formatSize(asset.sizeBytes)}</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => copyUrl(asset.id, asset.url)} className="text-xs text-primary font-medium">
                  {copiedId === asset.id ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(asset.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mediaQuery.data?.length === 0 && (
        <p className="text-sm text-gray-400">No files uploaded yet.</p>
      )}
    </div>
  );
}
