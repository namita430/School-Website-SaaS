import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPage, publishPage, unpublishPage, updatePageContent } from '../api/pages';
import { listComponents } from '../api/components';
import { useBuilderStore } from '../store/builderStore';
import Toolbar from '../features/builder/Toolbar';
import ComponentPanel from '../features/builder/ComponentPanel';
import Canvas from '../features/builder/Canvas';
import PropertiesPanel from '../features/builder/PropertiesPanel';
import PageSeoPanel from '../features/builder/PageSeoPanel';
import { ApiError } from '../api/client';

export default function BuilderPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const id = Number(pageId);
  const queryClient = useQueryClient();

  const pageQuery = useQuery({ queryKey: ['pages', id], queryFn: () => getPage(id), enabled: !Number.isNaN(id) });
  const componentsQuery = useQuery({ queryKey: ['components'], queryFn: listComponents });

  const sections = useBuilderStore((s) => s.sections);
  const loadPage = useBuilderStore((s) => s.loadPage);
  const markSaved = useBuilderStore((s) => s.markSaved);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    if (pageQuery.data) {
      loadPage(pageQuery.data.id, pageQuery.data.draftContentJson.sections ?? []);
    }
    // Only re-run when a different page is loaded from the server, not on
    // every local edit (loadPage would otherwise wipe in-progress changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageQuery.data?.id]);

  const saveMutation = useMutation({
    mutationFn: () => updatePageContent(id, { sections }),
    onSuccess: (updated) => {
      setSaveError(null);
      setHasSavedOnce(true);
      markSaved();
      queryClient.setQueryData(['pages', id], updated);
    },
    onError: (err) => {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save page');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishPage(id),
    onSuccess: (updated) => {
      setPublishError(null);
      queryClient.setQueryData(['pages', id], updated);
    },
    onError: (err) => setPublishError(err instanceof ApiError ? err.message : 'Could not publish page'),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishPage(id),
    onSuccess: (updated) => {
      setPublishError(null);
      queryClient.setQueryData(['pages', id], updated);
    },
    onError: (err) => setPublishError(err instanceof ApiError ? err.message : 'Could not unpublish page'),
  });

  if (Number.isNaN(id)) {
    return <div className="p-8 text-sm text-red-600">Invalid page id.</div>;
  }
  if (pageQuery.isLoading || componentsQuery.isLoading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }
  if (pageQuery.isError || !pageQuery.data) {
    return <div className="p-8 text-sm text-red-600">Could not load this page.</div>;
  }

  const components = componentsQuery.data ?? [];

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        pageTitle={pageQuery.data.title}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
        saveError={saveError}
        saved={hasSavedOnce}
        isPublished={pageQuery.data.isPublished}
        onPublish={() => publishMutation.mutate()}
        onUnpublish={() => unpublishMutation.mutate()}
        isPublishing={publishMutation.isPending || unpublishMutation.isPending}
        publishError={publishError}
        onToggleSeo={() => setShowSeo((s) => !s)}
      />
      {showSeo && <PageSeoPanel page={pageQuery.data} onClose={() => setShowSeo(false)} />}
      <div className="flex-1 flex min-h-0">
        <ComponentPanel components={components} />
        <Canvas components={components} />
        <PropertiesPanel components={components} />
      </div>
    </div>
  );
}
