import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateWebsiteData } from '../interfaces/create-website.interface';
import { UpdateWebsiteData } from '../interfaces/update-website.interface';

@Injectable()
export class WebsiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateWebsiteData) {
    return this.prisma.website.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        domain: data.domain,
        description: data.description,
      },
    });
  }

  findByOrganizationId(organizationId: string) {
    return this.prisma.website.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdInOrganization(websiteId: string, organizationId: string) {
    return this.prisma.website.findFirst({
      where: { id: websiteId, organizationId },
    });
  }

  update(id: string, data: UpdateWebsiteData) {
    const payload: Prisma.WebsiteUpdateInput = {};

    if (data.name !== undefined) {
      payload.name = data.name;
    }
    if (data.domain !== undefined) {
      payload.domain = data.domain;
    }
    if (data.description !== undefined) {
      payload.description = data.description;
    }
    if (data.isActive !== undefined) {
      payload.isActive = data.isActive;
    }

    return this.prisma.website.update({
      where: { id },
      data: payload,
    });
  }

  delete(id: string) {
    return this.prisma.website.delete({ where: { id } });
  }
}
