import { IntegrationProvider, IntegrationStatus } from '@prisma/client';

export const INTEGRATION_PROVIDER_TOKEN = 'INTEGRATION_PROVIDER';

export interface IntegrationConnectInput {
  organizationId: string;
  websiteId?: string;
  displayName: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  externalId?: string;
}

export interface IntegrationProviderAdapter {
  readonly provider: IntegrationProvider;

  /**
   * Validates provider-specific credentials / OAuth payload.
   * Provider implementations will be added later (GA, Slack, etc.).
   */
  validateCredentials(
    credentials?: Record<string, unknown>,
  ): Promise<boolean> | boolean;

  /**
   * Optional hook executed after a connection record is persisted.
   */
  onConnected?(integrationId: string): Promise<void> | void;

  /**
   * Optional health check / sync probe for the provider.
   */
  healthCheck?(
    integrationId: string,
  ): Promise<{ ok: boolean; detail?: string }> | { ok: boolean; detail?: string };
}

export interface IntegrationPublicView {
  id: string;
  organizationId: string;
  websiteId: string | null;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  displayName: string;
  externalId: string | null;
  metadata: unknown;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
