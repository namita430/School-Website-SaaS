import { apiFetch } from './client';
import type { ComponentDefinition } from '../types/builder';

export function listComponents() {
  return apiFetch<ComponentDefinition[]>('/api/v1/components');
}
