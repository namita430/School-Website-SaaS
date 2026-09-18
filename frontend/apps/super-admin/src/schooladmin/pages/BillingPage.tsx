import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelSubscription, getPayments, getPlans, getSubscription, subscribeToPlan } from '../api/billing';
import { ApiError } from '../../api/client';

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

export default function BillingPage() {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({ queryKey: ['billing', 'plans'], queryFn: getPlans });
  const subscriptionQuery = useQuery({ queryKey: ['billing', 'subscription'], queryFn: getSubscription });
  const paymentsQuery = useQuery({ queryKey: ['billing', 'payments'], queryFn: getPayments });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['billing'] });
  };

  const subscribeMutation = useMutation({
    mutationFn: subscribeToPlan,
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: invalidate,
  });

  const subscription = subscriptionQuery.data;
  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-semibold text-secondary mb-1">Billing</h1>
      <p className="text-sm text-gray-500 mb-6">
        Payments run against a simulated gateway in this environment — no real charge occurs. See the
        current plan and history below.
      </p>

      {subscription && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Current subscription</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-secondary">{subscription.planName}</p>
              <p className="text-sm text-gray-500">
                {formatPrice(subscription.priceCents)} / {subscription.billingInterval.toLowerCase()}
              </p>
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-gray-400 mt-1">
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full text-xs px-2 py-0.5 ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {subscription.status}
              </span>
              {isActive && (
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-sm font-medium text-gray-700 mb-3">
        {subscription ? 'Change plan' : 'Choose a plan'}
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {plansQuery.data?.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-100 rounded-lg p-4">
            <p className="text-sm font-medium text-secondary">{plan.name}</p>
            <p className="text-xl font-semibold text-secondary mt-1">{formatPrice(plan.priceCents)}</p>
            <p className="text-xs text-gray-400">per {plan.billingInterval.toLowerCase()}</p>
            <button
              onClick={() => subscribeMutation.mutate(plan.id)}
              disabled={subscribeMutation.isPending || subscription?.planCode === plan.code}
              className="mt-3 w-full rounded-md bg-primary text-white text-xs font-medium py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {subscription?.planCode === plan.code
                ? 'Current plan'
                : subscribeMutation.isPending
                  ? 'Subscribing…'
                  : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
      {subscribeMutation.isError && (
        <p className="text-sm text-red-600 mb-6">
          {subscribeMutation.error instanceof ApiError ? subscribeMutation.error.message : 'Could not subscribe'}
        </p>
      )}

      <p className="text-sm font-medium text-gray-700 mb-3">Payment history</p>
      <div className="space-y-2">
        {paymentsQuery.data?.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3"
          >
            <span className="text-sm text-secondary">{formatPrice(payment.amountCents)}</span>
            <span className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleString()}</span>
            <span
              className={`rounded-full text-xs px-2 py-0.5 ${
                payment.status === 'SUCCEEDED'
                  ? 'bg-green-100 text-green-700'
                  : payment.status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {payment.status}
            </span>
          </div>
        ))}
        {paymentsQuery.data?.length === 0 && <p className="text-sm text-gray-400">No payments yet.</p>}
      </div>
    </div>
  );
}
