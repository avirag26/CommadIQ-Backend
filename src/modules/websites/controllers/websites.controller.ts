import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { CreateWebsiteDto } from '../dto/create-website.dto';
import { UpdateWebsiteDto } from '../dto/update-website.dto';
import { WebsitesService } from '../services/websites.service';

@ApiTags('Websites')
@ApiBearerAuth()
@Controller('organizations/:organizationId/websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a website for an organization' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreateWebsiteDto,
  ) {
    return this.websitesService.create(user.id, organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List websites for an organization' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.websitesService.list(user.id, organizationId);
  }

  @Get(':websiteId')
  @ApiOperation({ summary: 'Get a website by id' })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('websiteId', ParseUUIDPipe) websiteId: string,
  ) {
    return this.websitesService.getById(user.id, organizationId, websiteId);
  }

  @Patch(':websiteId')
  @ApiOperation({ summary: 'Update a website' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('websiteId', ParseUUIDPipe) websiteId: string,
    @Body() dto: UpdateWebsiteDto,
  ) {
    return this.websitesService.update(
      user.id,
      organizationId,
      websiteId,
      dto,
    );
  }

  @Delete(':websiteId')
  @ApiOperation({ summary: 'Delete a website' })
  delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('websiteId', ParseUUIDPipe) websiteId: string,
  ) {
    return this.websitesService.delete(user.id, organizationId, websiteId);
  }
}
