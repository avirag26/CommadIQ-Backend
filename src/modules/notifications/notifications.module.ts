import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsService } from './services/notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
