import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from './auth.service';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id?: number;
  perfumeId: number;
  name?: string;
  price?: number;
  quantity: number;
  image_url?: string;
}

export interface ShippingAddress {
  id: number;
  street?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  country?: string;
  phone?: string;
  fullName?: string;
  email?: string;
}

export interface Order {
  id: string;
  userId?: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddressId?: number;
  shippingAddress?: ShippingAddress;
  shippingMethod?: string;
  date?: string | Date;
  paymentMethod?: string;
  createdAt?: string;
}

export interface OrderRequest {
  shippingAddressId?: number;
  paymentMethod: string;
  notes?: string;
  shippingAddress?: ShippingAddress;
  items?: OrderItem[];
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  /**
   * Backend expects POST /orders with ?userId=...
   */
  createOrder(orderRequest: OrderRequest | any): Observable<any> {
    const user = this.authService.getCurrentUser();
    const shippingAddressId = orderRequest?.shippingAddressId ?? orderRequest?.shippingAddress?.id;
    const payload = { ...orderRequest, shippingAddressId };
    if (user && user.id) {
      return this.apiService.post<any>('/orders', payload, { userId: user.id });
    }
    // If no user, we still try to create (depending on backend), here we call without userId
    return this.apiService.post<any>('/orders', payload);
  }

  /**
   * GET /orders?page=..&size=..
   */
  getOrders(page = 0, size = 10): Observable<any> {
    return this.apiService.get<any>('/orders', { page, size });
  }

  getOrderById(orderId: number | string): Observable<Order> {
    return this.apiService.get<Order>(`/orders/${orderId}`);
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.apiService.delete<void>(`/orders/${orderId}`);
  }

  /**
   * Backend expects PUT /orders/{orderId}/status?status=NEW_STATUS
   */
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.apiService.put<any>(`/orders/${orderId}/status`, null, { status });
  }

  getOrdersList(): Order[] {
    return [];
  }
}
