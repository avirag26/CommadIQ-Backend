import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportRepository } from './repositories/report.repository';
import { ReportsService } from './services/reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
