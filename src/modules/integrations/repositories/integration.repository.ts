import { Injectable } from '@nestjs/common';
import { IntegrationProvider, IntegrationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

export interface CreateIntegrationData {
  organizationId: string;
  websiteId?: string;
  provider: IntegrationProvider;
  displayName: string;
  externalId?: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status: IntegrationStatus;
}

@Injectable()
export class IntegrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateIntegrationData) {
    return this.prisma.integration.create({
      data: {
        organizationId: data.organizationId,
        websiteId: data.websiteId,
        provider: data.provider,
        displayName: data.displayName,
        externalId: data.externalId,
        credentials: data.credentials as Prisma.InputJsonValue | undefined,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        status: data.status,
      },
    });
  }

  findByOrganizationId(organizationId: string) {
    return this.prisma.integration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdInOrganization(id: string, organizationId: string) {
    return this.prisma.integration.findFirst({
      where: { id, organizationId },
    });
  }

  updateStatus(id: string, status: IntegrationStatus) {
    return this.prisma.integration.update({
      where: { id },
      data: { status },
    });
  }
}
