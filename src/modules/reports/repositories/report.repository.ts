import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.report.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
