import { apiFetch } from '../../api/client';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type SslStatus = 'NONE' | 'PROVISIONING' | 'ACTIVE';

export interface DomainRecord {
  id: number;
  domain: string;
  type: 'SUBDOMAIN' | 'CUSTOM';
  verificationStatus: VerificationStatus;
  sslStatus: SslStatus;
  isPrimary: boolean;
  txtRecordName: string;
  txtRecordValue: string;
  cnameTarget: string;
  createdAt: string;
  updatedAt: string;
}

export function listDomains() {
  return apiFetch<DomainRecord[]>('/api/v1/domains');
}

export function addDomain(domain: string) {
  return apiFetch<DomainRecord>('/api/v1/domains', { method: 'POST', body: { domain } });
}

export function verifyDomain(id: number) {
  return apiFetch<DomainRecord>(`/api/v1/domains/${id}/verify`, { method: 'POST' });
}

export function setPrimaryDomain(id: number) {
  return apiFetch<DomainRecord>(`/api/v1/domains/${id}/set-primary`, { method: 'POST' });
}

export function deleteDomain(id: number) {
  return apiFetch<void>(`/api/v1/domains/${id}`, { method: 'DELETE' });
}
