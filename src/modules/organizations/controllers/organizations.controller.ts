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
import { AddMemberDto } from '../dto/add-member.dto';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationsService } from '../services/organizations.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an organization' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations for the current user' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.listForUser(user.id);
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Get organization by id' })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.organizationsService.getById(user.id, organizationId);
  }

  @Patch(':organizationId')
  @ApiOperation({ summary: 'Update an organization' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(user.id, organizationId, dto);
  }

  @Post(':organizationId/members')
  @ApiOperation({ summary: 'Add a member to an organization' })
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizationsService.addMember(user.id, organizationId, dto);
  }

  @Delete(':organizationId/members/:memberUserId')
  @ApiOperation({ summary: 'Remove a member from an organization' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return this.organizationsService.removeMember(
      user.id,
      organizationId,
      memberUserId,
    );
  }
}
