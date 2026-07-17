import { Injectable } from '@nestjs/common';
import { successResponse } from '../../../common/utils/response.util';
import { ReportRepository } from '../repositories/report.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async list() {
    const reports = await this.reportRepository.findMany();
    return successResponse(reports, 'Reports foundation ready');
  }
}
