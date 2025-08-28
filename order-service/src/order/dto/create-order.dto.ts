export class CreateOrderDto {
  customerName: string;
  customerEmail: string;
  products: OrderProductDto[];
  totalAmount: number;
}

export class OrderProductDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
} 