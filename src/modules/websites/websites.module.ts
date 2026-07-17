import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { WebsitesController } from './controllers/websites.controller';
import { WebsiteRepository } from './repositories/website.repository';
import { WebsitesService } from './services/websites.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [WebsitesController],
  providers: [WebsitesService, WebsiteRepository],
  exports: [WebsitesService],
})
export class WebsitesModule {}
