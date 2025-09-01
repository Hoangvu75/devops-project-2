import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType, NotificationStatus } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  private notifications: Notification[] = [];

  async sendOrderCreatedNotification(orderData: any): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      type: NotificationType.EMAIL,
      recipient: orderData.customerEmail,
      subject: 'Xác nhận đơn hàng mới',
      message: `Chào ${orderData.customerName}, đơn hàng ${orderData.orderId} của bạn đã được tạo thành công với tổng giá trị ${orderData.totalAmount} VND.`,
      status: NotificationStatus.PENDING,
      orderId: orderData.orderId,
      createdAt: new Date(),
    };

    // Lưu thông báo vào memory
    this.notifications.push(notification);

    // Giả lập việc gửi email
    await this.simulateEmailSending(notification);

    console.log(`Đã gửi thông báo đơn hàng mới đến ${orderData.customerEmail}`);
    
    return notification;
  }

  async sendOrderConfirmedNotification(orderData: any): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      type: NotificationType.EMAIL,
      recipient: orderData.customerEmail,
      subject: 'Đơn hàng đã được xác nhận',
      message: `Đơn hàng ${orderData.orderId} của bạn đã được xác nhận và đang được xử lý.`,
      status: NotificationStatus.PENDING,
      orderId: orderData.orderId,
      createdAt: new Date(),
    };

    // Lưu thông báo vào memory
    this.notifications.push(notification);

    // Giả lập việc gửi email
    await this.simulateEmailSending(notification);

    console.log(`Đã gửi thông báo xác nhận đơn hàng đến ${orderData.customerEmail}`);
    
    return notification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.notifications;
  }

  async getNotificationsByOrderId(orderId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.orderId === orderId);
  }

  private async simulateEmailSending(notification: Notification): Promise<void> {
    // Giả lập thời gian gửi email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Giả sử 90% email được gửi thành công
    if (Math.random() > 0.1) {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } else {
      notification.status = NotificationStatus.FAILED;
    }
  }
} 