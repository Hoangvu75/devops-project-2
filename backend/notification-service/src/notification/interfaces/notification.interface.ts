export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  message: string;
  status: NotificationStatus;
  orderId?: string;
  createdAt: Date;
  sentAt?: Date;
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}