import { Module, OnModuleInit } from '@nestjs/common';
import { IntegrationProvider } from '@prisma/client';
import { OrganizationsModule } from '../organizations/organizations.module';
import { IntegrationsController } from './controllers/integrations.controller';
import {
  IntegrationProviderRegistry,
  StubIntegrationProvider,
} from './providers/integration-provider.registry';
import { IntegrationRepository } from './repositories/integration.repository';
import { IntegrationsService } from './services/integrations.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    IntegrationRepository,
    IntegrationProviderRegistry,
  ],
  exports: [IntegrationsService, IntegrationProviderRegistry],
})
export class IntegrationsModule implements OnModuleInit {
  constructor(private readonly registry: IntegrationProviderRegistry) {}

  onModuleInit(): void {
    // Pre-register stub adapters so new providers can replace them later
    // without changing service or controller code.
    for (const provider of Object.values(IntegrationProvider)) {
      this.registry.register(new StubIntegrationProvider(provider));
    }
  }
}
