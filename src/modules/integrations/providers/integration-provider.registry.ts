import { Injectable, Logger } from '@nestjs/common';
import { IntegrationProvider } from '@prisma/client';
import {
  IntegrationConnectInput,
  IntegrationProviderAdapter,
} from '../interfaces/integration-provider.interface';

/**
 * Default no-op adapter used until concrete provider adapters are registered.
 * Keeps the integration registry open for extension without modifying callers.
 */
@Injectable()
export class StubIntegrationProvider implements IntegrationProviderAdapter {
  private readonly logger = new Logger(StubIntegrationProvider.name);

  constructor(readonly provider: IntegrationProvider) {}

  validateCredentials(_credentials?: Record<string, unknown>): boolean {
    this.logger.debug(
      `Stub validation for provider ${this.provider} — replace with real adapter`,
    );
    return true;
  }

  onConnected(integrationId: string): void {
    this.logger.debug(
      `Stub onConnected for ${this.provider} integration ${integrationId}`,
    );
  }

  healthCheck(_integrationId: string) {
    return { ok: true, detail: 'Stub provider — not connected to external API' };
  }
}

@Injectable()
export class IntegrationProviderRegistry {
  private readonly adapters = new Map<
    IntegrationProvider,
    IntegrationProviderAdapter
  >();

  register(adapter: IntegrationProviderAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: IntegrationProvider): IntegrationProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (adapter) {
      return adapter;
    }

    const stub = new StubIntegrationProvider(provider);
    this.adapters.set(provider, stub);
    return stub;
  }

  listRegistered(): IntegrationProvider[] {
    return [...this.adapters.keys()];
  }
}
