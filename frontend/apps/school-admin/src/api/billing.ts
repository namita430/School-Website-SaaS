import { apiFetch } from './client';

export interface Plan {
  id: number;
  code: string;
  name: string;
  priceCents: number;
  billingInterval: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
}

export interface SubscriptionInfo {
  planCode: string;
  planName: string;
  priceCents: number;
  billingInterval: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd: string | null;
}

export interface PaymentRecord {
  id: number;
  amountCents: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  createdAt: string;
}

export function getPlans() {
  return apiFetch<Plan[]>('/api/v1/billing/plans');
}

/** null when the school has no subscription yet - a valid state, not an error. */
export function getSubscription() {
  return apiFetch<SubscriptionInfo | null>('/api/v1/billing/subscription');
}

export function getPayments() {
  return apiFetch<PaymentRecord[]>('/api/v1/billing/payments');
}

export function subscribeToPlan(planId: number) {
  return apiFetch<SubscriptionInfo>('/api/v1/billing/subscribe', { method: 'POST', body: { planId } });
}

export function cancelSubscription() {
  return apiFetch<SubscriptionInfo>('/api/v1/billing/cancel', { method: 'POST' });
}
