import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Tạo HTTP application
  const app = await NestFactory.create(AppModule);
  
  // Cấu hình CORS
  app.enableCors();
  
  // Cấu hình Kafka microservice
  const kafkaBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'order-service',
        brokers: [kafkaBrokers],
      },
      consumer: {
        groupId: 'order-consumer',
      },
    },
  });

  // Khởi động cả HTTP server và microservice
  await app.startAllMicroservices();
  await app.listen(3000);
  
  console.log('Order Service đang chạy trên port 3000');
  console.log(`Kafka brokers: ${kafkaBrokers}`);
}

bootstrap(); 