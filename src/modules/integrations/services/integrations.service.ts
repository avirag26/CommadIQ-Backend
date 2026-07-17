import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IntegrationStatus } from '@prisma/client';
import { successResponse } from '../../../common/utils/response.util';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { INTEGRATION_MESSAGES } from '../constants/integrations.constants';
import { ConnectIntegrationDto } from '../dto/connect-integration.dto';
import { IntegrationPublicView } from '../interfaces/integration-provider.interface';
import { IntegrationProviderRegistry } from '../providers/integration-provider.registry';
import { IntegrationRepository } from '../repositories/integration.repository';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly integrationRepository: IntegrationRepository,
    private readonly providerRegistry: IntegrationProviderRegistry,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async connect(
    userId: string,
    organizationId: string,
    dto: ConnectIntegrationDto,
  ) {
    await this.organizationsService.assertMembership(userId, organizationId);

    const adapter = this.providerRegistry.get(dto.provider);
    const valid = await adapter.validateCredentials(dto.credentials);
    if (!valid) {
      throw new NotFoundException(INTEGRATION_MESSAGES.INVALID_CREDENTIALS);
    }

    const integration = await this.integrationRepository.create({
      organizationId,
      websiteId: dto.websiteId,
      provider: dto.provider,
      displayName: dto.displayName,
      externalId: dto.externalId,
      credentials: dto.credentials,
      metadata: dto.metadata,
      status: IntegrationStatus.CONNECTED,
    });

    await adapter.onConnected?.(integration.id);

    return successResponse(
      this.toPublicView(integration),
      INTEGRATION_MESSAGES.CONNECTED,
    );
  }

  async list(userId: string, organizationId: string) {
    await this.organizationsService.assertMembership(userId, organizationId);
    const integrations =
      await this.integrationRepository.findByOrganizationId(organizationId);

    return successResponse(
      integrations.map((item) => this.toPublicView(item)),
      INTEGRATION_MESSAGES.LISTED,
    );
  }

  async disconnect(
    userId: string,
    organizationId: string,
    integrationId: string,
  ) {
    await this.organizationsService.assertMembership(userId, organizationId);

    const existing = await this.integrationRepository.findByIdInOrganization(
      integrationId,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException(INTEGRATION_MESSAGES.NOT_FOUND);
    }

    const updated = await this.integrationRepository.updateStatus(
      integrationId,
      IntegrationStatus.DISCONNECTED,
    );

    return successResponse(
      this.toPublicView(updated),
      INTEGRATION_MESSAGES.DISCONNECTED,
    );
  }

  private toPublicView(integration: {
    id: string;
    organizationId: string;
    websiteId: string | null;
    provider: IntegrationPublicView['provider'];
    status: IntegrationPublicView['status'];
    displayName: string;
    externalId: string | null;
    metadata: unknown;
    lastSyncedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): IntegrationPublicView {
    return {
      id: integration.id,
      organizationId: integration.organizationId,
      websiteId: integration.websiteId,
      provider: integration.provider,
      status: integration.status,
      displayName: integration.displayName,
      externalId: integration.externalId,
      metadata: integration.metadata,
      lastSyncedAt: integration.lastSyncedAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
