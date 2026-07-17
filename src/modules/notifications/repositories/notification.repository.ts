import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
