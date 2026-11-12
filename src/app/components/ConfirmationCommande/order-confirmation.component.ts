import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { environment } from '../../../environments/environment';

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
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order: Order) => {
        this.order = order;
      },
      error: () => {
        this.router.navigate(['/orders']);
      }
    });
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

  resolveImage(url?: string): string {
    if (!url) return '/assets/images/parfume.webp';
    const u = String(url);
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/assets/')) return u;
    if (u.startsWith('assets/')) return `/${u}`;
    if (u.startsWith('/')) return `${environment.assetBaseUrl}${u}`;
    return `/assets/images/${u}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/parfume.webp';
  }
}
