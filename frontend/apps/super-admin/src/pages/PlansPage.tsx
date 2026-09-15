import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activatePlan, createPlan, deactivatePlan, listPlans } from '../api/plans';
import { ApiError } from '../api/client';

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

export default function PlansPage() {
  const queryClient = useQueryClient();
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: listPlans });

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['plans'] });

  const createMutation = useMutation({
    mutationFn: () => createPlan({ code, name, priceCents: Number(priceCents) || 0, billingInterval }),
    onSuccess: () => {
      setCode('');
      setName('');
      setPriceCents('');
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Could not create plan'),
  });

  const activateMutation = useMutation({ mutationFn: activatePlan, onSuccess: invalidate });
  const deactivateMutation = useMutation({ mutationFn: deactivatePlan, onSuccess: invalidate });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-6">Plans</h1>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">New plan</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="pro-monthly"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-32"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pro"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-32"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Price (cents)</label>
            <input
              value={priceCents}
              onChange={(e) => setPriceCents(e.target.value)}
              placeholder="2900"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-24"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Interval</label>
            <select
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value as 'MONTHLY' | 'YEARLY')}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !code || !name}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
      </div>

      {plansQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="space-y-2">
        {plansQuery.data?.map((plan) => (
          <div
            key={plan.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-secondary">
                {plan.name} <span className="text-xs text-gray-400">({plan.code})</span>
              </p>
              <p className="text-xs text-gray-400">
                {formatPrice(plan.priceCents)} / {plan.billingInterval.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full text-xs px-2 py-0.5 ${
                  plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
              {plan.isActive ? (
                <button
                  onClick={() => deactivateMutation.mutate(plan.id)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => activateMutation.mutate(plan.id)}
                  className="text-xs text-gray-500 hover:text-green-600"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
