import { apiFetch } from './client';

export interface Plan {
  id: number;
  code: string;
  name: string;
  priceCents: number;
  billingInterval: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
  templateIds: string[];
}

export function listPlans() {
  return apiFetch<Plan[]>('/api/v1/superadmin/plans');
}

export function createPlan(plan: { code: string; name: string; priceCents: number; billingInterval: 'MONTHLY' | 'YEARLY' }) {
  return apiFetch<Plan>('/api/v1/superadmin/plans', { method: 'POST', body: plan });
}

export function activatePlan(id: number) {
  return apiFetch<Plan>(`/api/v1/superadmin/plans/${id}/activate`, { method: 'POST' });
}

export function deactivatePlan(id: number) {
  return apiFetch<Plan>(`/api/v1/superadmin/plans/${id}/deactivate`, { method: 'POST' });
}

export function updatePlanTemplates(id: number, templateIds: string[]) {
  return apiFetch<Plan>(`/api/v1/superadmin/plans/${id}/templates`, { method: 'PUT', body: { templateIds } });
}
