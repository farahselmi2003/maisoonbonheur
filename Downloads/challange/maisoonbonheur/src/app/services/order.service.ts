import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Order {
  id: string;
  date: Date;
  total: number;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  shippingMethod: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersKey = 'user_orders';
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor() {
    this.loadOrdersFromStorage();
  }

  private loadOrdersFromStorage(): void {
    const stored = localStorage.getItem(this.ordersKey);
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
        this.ordersSubject.next(this.orders);
      } catch (error) {
        console.error('Error parsing orders from storage:', error);
        this.orders = [];
      }
    }
  }

  private saveOrdersToStorage(): void {
    localStorage.setItem(this.ordersKey, JSON.stringify(this.orders));
    this.ordersSubject.next(this.orders);
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrdersList(): Order[] {
    return [...this.orders].reverse(); 
  }

  createOrder(orderData: Partial<Order>): Order {
    const order: Order = {
      id: this.generateOrderId(),
      date: new Date(),
      total: orderData.total || 0,
      items: orderData.items || [],
      status: 'confirmed',
      shippingAddress: orderData.shippingAddress || this.getDefaultAddress(),
      paymentMethod: orderData.paymentMethod || 'card',
      shippingMethod: orderData.shippingMethod || 'standard'
    };

    this.orders.push(order);
    this.saveOrdersToStorage();
    return order;
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD-${timestamp}-${random}`;
  }

  private getDefaultAddress(): ShippingAddress {
    return {
      fullName: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Tunisie',
      phone: '',
      email: ''
    };
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  getOrdersCount(): number {
    return this.orders.length;
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }
}