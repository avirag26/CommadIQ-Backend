import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { ConnectIntegrationDto } from '../dto/connect-integration.dto';
import { IntegrationsService } from '../services/integrations.service';

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('organizations/:organizationId/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Connect an integration provider (provider-agnostic)',
  })
  connect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: ConnectIntegrationDto,
  ) {
    return this.integrationsService.connect(user.id, organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List integrations for an organization' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.integrationsService.list(user.id, organizationId);
  }

  @Delete(':integrationId')
  @ApiOperation({ summary: 'Disconnect an integration' })
  disconnect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('integrationId', ParseUUIDPipe) integrationId: string,
  ) {
    return this.integrationsService.disconnect(
      user.id,
      organizationId,
      integrationId,
    );
  }
}
