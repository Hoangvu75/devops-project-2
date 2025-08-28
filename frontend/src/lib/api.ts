import axios from 'axios';
import { getOrderServiceUrl, getNotificationServiceUrl } from './config';

const ORDER_SERVICE_URL = getOrderServiceUrl();
const NOTIFICATION_SERVICE_URL = getNotificationServiceUrl();

// Order Service API
export const orderApi = axios.create({
  baseURL: ORDER_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Notification Service API
export const notificationApi = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  orderId?: string;
  createdAt: string;
  sentAt?: string;
}

// Order API functions
export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await orderApi.post('/orders', data);
    return response.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const response = await orderApi.get('/orders');
    return response.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await orderApi.get(`/orders/${orderId}`);
    return response.data;
  },

  async confirmOrder(orderId: string): Promise<Order> {
    const response = await orderApi.put(`/orders/${orderId}/confirm`);
    return response.data;
  },
};

// Notification API functions
export const notificationService = {
  async getAllNotifications(): Promise<Notification[]> {
    const response = await notificationApi.get('/notifications');
    return response.data;
  },

  async getNotificationsByOrderId(orderId: string): Promise<Notification[]> {
    const response = await notificationApi.get(`/notifications/order/${orderId}`);
    return response.data;
  },
};

// Error handling interceptors
orderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Order API Error:', error);
    return Promise.reject(error);
  }
);

notificationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Notification API Error:', error);
    return Promise.reject(error);
  }
); 