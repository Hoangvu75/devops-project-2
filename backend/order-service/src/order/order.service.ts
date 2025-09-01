import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './interfaces/order.interface';

@Injectable()
export class OrderService {
  private orders: Order[] = [];

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Kết nối Kafka client
    await this.kafkaClient.connect();
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order: Order = {
      id: uuidv4(),
      ...createOrderDto,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Lưu đơn hàng vào memory (trong thực tế sẽ lưu vào database)
    this.orders.push(order);

    // Gửi event qua Kafka để thông báo đơn hàng mới
    this.kafkaClient.emit('order.created', {
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.totalAmount,
      products: order.products,
      createdAt: order.createdAt,
    });

    console.log(`Đơn hàng ${order.id} đã được tạo và gửi thông báo qua Kafka`);
    
    return order;
  }

  async confirmOrder(orderId: string): Promise<Order> {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    order.status = OrderStatus.CONFIRMED;
    order.updatedAt = new Date();

    // Gửi event xác nhận đơn hàng
    this.kafkaClient.emit('order.confirmed', {
      orderId: order.id,
      customerEmail: order.customerEmail,
      status: order.status,
      updatedAt: order.updatedAt,
    });

    console.log(`Đơn hàng ${orderId} đã được xác nhận`);
    
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    
    return order;
  }
} 