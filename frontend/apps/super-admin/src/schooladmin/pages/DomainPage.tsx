import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDomain, deleteDomain, type DomainRecord, listDomains, setPrimaryDomain, verifyDomain } from '../api/domains';
import { ApiError } from '../../api/client';

const STATUS_STYLES: Record<DomainRecord['verificationStatus'], string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  VERIFIED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

function DomainRow({ domain }: { domain: DomainRecord }) {
  const queryClient = useQueryClient();
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['domains'] });
  const verifyMutation = useMutation({
    mutationFn: () => verifyDomain(domain.id),
    onSuccess: (updated) => {
      setVerifyError(null);
      if (updated.verificationStatus !== 'VERIFIED') {
        setVerifyError('DNS record not found yet - it can take a few minutes to propagate. Try again shortly.');
      }
      invalidate();
    },
    onError: (err) => setVerifyError(err instanceof ApiError ? err.message : 'Verification failed'),
  });
  const primaryMutation = useMutation({ mutationFn: () => setPrimaryDomain(domain.id), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: () => deleteDomain(domain.id), onSuccess: invalidate });

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary">
            {domain.domain}
            {domain.isPrimary && (
              <span className="ml-2 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">Primary</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`rounded-full text-xs px-2 py-0.5 ${STATUS_STYLES[domain.verificationStatus]}`}>
              {domain.verificationStatus}
            </span>
            <span className="text-xs text-gray-400">SSL: {domain.sslStatus}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {domain.verificationStatus !== 'VERIFIED' && (
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="text-xs text-primary font-medium disabled:opacity-50"
            >
              {verifyMutation.isPending ? 'Checking…' : 'Verify'}
            </button>
          )}
          {domain.verificationStatus === 'VERIFIED' && !domain.isPrimary && (
            <button onClick={() => primaryMutation.mutate()} className="text-xs text-gray-500 hover:text-secondary">
              Set as primary
            </button>
          )}
          <button onClick={() => deleteMutation.mutate()} className="text-xs text-gray-400 hover:text-red-600">
            Remove
          </button>
        </div>
      </div>

      {domain.verificationStatus !== 'VERIFIED' && (
        <div className="mt-3 bg-gray-50 rounded-md p-3 text-xs text-gray-600 space-y-2">
          <p className="font-medium text-gray-700">Add this DNS record to verify ownership:</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono">
            <span className="text-gray-400">Type</span>
            <span>TXT</span>
            <span className="text-gray-400">Name</span>
            <span className="break-all">{domain.txtRecordName}</span>
            <span className="text-gray-400">Value</span>
            <span className="break-all">{domain.txtRecordValue}</span>
          </div>
          <p className="font-medium text-gray-700 pt-1">Then point your domain at this platform:</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono">
            <span className="text-gray-400">Type</span>
            <span>CNAME</span>
            <span className="text-gray-400">Value</span>
            <span className="break-all">{domain.cnameTarget}</span>
          </div>
          {verifyError && <p className="text-red-600 pt-1">{verifyError}</p>}
        </div>
      )}
    </div>
  );
}

export default function DomainPage() {
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const domainsQuery = useQuery({ queryKey: ['domains'], queryFn: listDomains });

  const addMutation = useMutation({
    mutationFn: () => addDomain(newDomain.trim()),
    onSuccess: () => {
      setNewDomain('');
      setAddError(null);
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
    onError: (err) => setAddError(err instanceof ApiError ? err.message : 'Could not add domain'),
  });

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Domain</h1>
      <p className="text-sm text-gray-500 mb-6">
        Connect your own domain (e.g. abcschool.com) to this website. Your site is always reachable at
        its default subdomain too.
      </p>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Add a custom domain</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate();
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Domain</label>
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="abcschool.com"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={addMutation.isPending || !newDomain}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {addMutation.isPending ? 'Adding…' : 'Add'}
          </button>
        </form>
        {addError && <p className="mt-2 text-xs text-red-600">{addError}</p>}
      </div>

      {domainsQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-3">
        {domainsQuery.data?.map((domain) => (
          <DomainRow key={domain.id} domain={domain} />
        ))}
      </div>

      {domainsQuery.data?.length === 0 && (
        <p className="text-sm text-gray-400">No custom domains yet.</p>
      )}
    </div>
  );
}
