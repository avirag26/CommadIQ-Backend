import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';
import { slugify } from '../../../common/utils/crypto.util';
import { successResponse } from '../../../common/utils/response.util';
import { ORGANIZATION_MESSAGES } from '../constants/organizations.constants';
import { AddMemberDto } from '../dto/add-member.dto';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const baseSlug = dto.slug?.trim() || slugify(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const organization = await this.organizationRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      ownerId: userId,
    });

    return successResponse(
      organization,
      ORGANIZATION_MESSAGES.CREATED,
    );
  }

  async listForUser(userId: string) {
    const organizations =
      await this.organizationRepository.findByUserId(userId);
    return successResponse(
      organizations,
      ORGANIZATION_MESSAGES.LISTED,
    );
  }

  async getById(userId: string, organizationId: string) {
    await this.assertMembership(userId, organizationId);
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundException(ORGANIZATION_MESSAGES.NOT_FOUND);
    }

    return successResponse(
      organization,
      ORGANIZATION_MESSAGES.FETCHED,
    );
  }

  async update(
    userId: string,
    organizationId: string,
    dto: UpdateOrganizationDto,
  ) {
    await this.assertRole(userId, organizationId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    const organization = await this.organizationRepository.update(
      organizationId,
      dto,
    );

    return successResponse(
      organization,
      ORGANIZATION_MESSAGES.UPDATED,
    );
  }

  async addMember(
    actorUserId: string,
    organizationId: string,
    dto: AddMemberDto,
  ) {
    await this.assertRole(actorUserId, organizationId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    const member = await this.organizationRepository.addMember({
      organizationId,
      userId: dto.userId,
      role: dto.role ?? OrganizationRole.MEMBER,
    });

    return successResponse(member, ORGANIZATION_MESSAGES.MEMBER_ADDED);
  }

  async removeMember(
    actorUserId: string,
    organizationId: string,
    memberUserId: string,
  ) {
    await this.assertRole(actorUserId, organizationId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    const target = await this.organizationRepository.findMembership(
      memberUserId,
      organizationId,
    );

    if (!target) {
      throw new NotFoundException(ORGANIZATION_MESSAGES.MEMBER_NOT_FOUND);
    }

    if (target.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(ORGANIZATION_MESSAGES.CANNOT_REMOVE_OWNER);
    }

    await this.organizationRepository.removeMember(memberUserId, organizationId);
    return successResponse(null, ORGANIZATION_MESSAGES.MEMBER_REMOVED);
  }

  async assertMembership(userId: string, organizationId: string) {
    const membership = await this.organizationRepository.findMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new ForbiddenException(ORGANIZATION_MESSAGES.ACCESS_DENIED);
    }

    return membership;
  }

  async assertRole(
    userId: string,
    organizationId: string,
    allowedRoles: OrganizationRole[],
  ) {
    const membership = await this.assertMembership(userId, organizationId);

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(ORGANIZATION_MESSAGES.ACCESS_DENIED);
    }

    return membership;
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug || 'organization';
    let suffix = 1;

    while (await this.organizationRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}
