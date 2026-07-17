import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { successResponse } from '../../../common/utils/response.util';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { WEBSITE_MESSAGES } from '../constants/websites.constants';
import { CreateWebsiteDto } from '../dto/create-website.dto';
import { UpdateWebsiteDto } from '../dto/update-website.dto';
import { WebsiteRepository } from '../repositories/website.repository';

@Injectable()
export class WebsitesService {
  constructor(
    private readonly websiteRepository: WebsiteRepository,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    dto: CreateWebsiteDto,
  ) {
    await this.organizationsService.assertMembership(userId, organizationId);

    const website = await this.websiteRepository.create({
      organizationId,
      name: dto.name,
      domain: dto.domain.toLowerCase(),
      description: dto.description,
    });

    return successResponse(website, WEBSITE_MESSAGES.CREATED);
  }

  async list(userId: string, organizationId: string) {
    await this.organizationsService.assertMembership(userId, organizationId);
    const websites =
      await this.websiteRepository.findByOrganizationId(organizationId);
    return successResponse(websites, WEBSITE_MESSAGES.LISTED);
  }

  async getById(userId: string, organizationId: string, websiteId: string) {
    await this.organizationsService.assertMembership(userId, organizationId);
    const website = await this.requireWebsite(organizationId, websiteId);
    return successResponse(website, WEBSITE_MESSAGES.FETCHED);
  }

  async update(
    userId: string,
    organizationId: string,
    websiteId: string,
    dto: UpdateWebsiteDto,
  ) {
    await this.organizationsService.assertMembership(userId, organizationId);
    await this.requireWebsite(organizationId, websiteId);

    const website = await this.websiteRepository.update(websiteId, {
      name: dto.name,
      domain: dto.domain?.toLowerCase(),
      description: dto.description,
      isActive: dto.isActive,
    });

    return successResponse(website, WEBSITE_MESSAGES.UPDATED);
  }

  async delete(userId: string, organizationId: string, websiteId: string) {
    await this.organizationsService.assertMembership(userId, organizationId);
    await this.requireWebsite(organizationId, websiteId);
    await this.websiteRepository.delete(websiteId);
    return successResponse(null, WEBSITE_MESSAGES.DELETED);
  }

  private async requireWebsite(organizationId: string, websiteId: string) {
    const website = await this.websiteRepository.findByIdInOrganization(
      websiteId,
      organizationId,
    );

    if (!website) {
      throw new NotFoundException(WEBSITE_MESSAGES.NOT_FOUND);
    }

    return website;
  }
}
