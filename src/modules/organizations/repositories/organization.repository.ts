import { Injectable } from '@nestjs/common';
import { OrganizationRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateOrganizationData } from '../interfaces/create-organization.interface';
import { AddMemberData } from '../interfaces/add-member.interface';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOrganizationData) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        members: {
          create: {
            userId: data.ownerId,
            role: OrganizationRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: true,
        websites: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.organization.findUnique({ where: { slug } });
  }

  findByUserId(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        isActive: true,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
        },
        _count: {
          select: { websites: true, members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: UpdateOrganizationDto) {
    const payload: Prisma.OrganizationUpdateInput = {};

    if (data.name !== undefined) {
      payload.name = data.name;
    }
    if (data.description !== undefined) {
      payload.description = data.description;
    }

    return this.prisma.organization.update({
      where: { id },
      data: payload,
    });
  }

  findMembership(userId: string, organizationId: string) {
    return this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  addMember(data: AddMemberData) {
    return this.prisma.organizationMember.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
      },
    });
  }

  removeMember(userId: string, organizationId: string) {
    return this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }
}
