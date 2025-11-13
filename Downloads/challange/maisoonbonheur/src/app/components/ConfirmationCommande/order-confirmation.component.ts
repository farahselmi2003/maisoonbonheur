import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | undefined;
  orderId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.order = this.orderService.getOrderById(this.orderId);
    
    if (!this.order) {
      this.router.navigate(['/orders']);
    }
  }

  getEstimatedDeliveryDate(): Date {
    const deliveryDate = new Date(this.order?.date || new Date());
    const daysToAdd = this.order?.shippingMethod === 'express' ? 2 : 5;
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    return deliveryDate;
  }

  printOrder(): void {
    window.print();
  }
}