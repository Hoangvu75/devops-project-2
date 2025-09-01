import { Module } from '@nestjs/common';
import { NotificationController } from './notification/notification.controller';
import { NotificationService } from './notification/notification.service';

@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AppModule {} 