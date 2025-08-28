import { Controller, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { Notification } from './interfaces/notification.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Kafka message handlers
  @MessagePattern('order.created')
  async handleOrderCreated(@Payload() orderData: any) {
    console.log('Nhận được event order.created:', orderData);
    return await this.notificationService.sendOrderCreatedNotification(orderData);
  }

  @MessagePattern('order.confirmed')
  async handleOrderConfirmed(@Payload() orderData: any) {
    console.log('Nhận được event order.confirmed:', orderData);
    return await this.notificationService.sendOrderConfirmedNotification(orderData);
  }

  // REST API endpoints
  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationService.getAllNotifications();
  }

  @Get('order/:orderId')
  async getNotificationsByOrderId(@Param('orderId') orderId: string): Promise<Notification[]> {
    return this.notificationService.getNotificationsByOrderId(orderId);
  }
}