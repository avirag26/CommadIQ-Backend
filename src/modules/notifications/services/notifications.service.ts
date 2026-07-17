import { Injectable } from '@nestjs/common';
import { successResponse } from '../../../common/utils/response.util';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async listForUser(userId: string) {
    const notifications =
      await this.notificationRepository.findByUserId(userId);
    return successResponse(notifications, 'Notifications foundation ready');
  }
}
