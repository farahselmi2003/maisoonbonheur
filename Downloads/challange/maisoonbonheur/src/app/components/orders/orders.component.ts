import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order, OrderItem } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  reordering: { [orderId: string]: boolean } = {};

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    // Simuler un appel API ou utiliser le service
    setTimeout(() => {
      this.orders = this.orderService.getOrdersList().reverse();
      this.loading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return 'En attente';
    }
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalItemsCount(): number {
    return this.orders.reduce((total, order) => total + this.getTotalItems(order), 0);
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/order-details', orderId]);
  }

  reorder(order: Order): void {
    this.reordering[order.id] = true;
    
    // Ajouter tous les articles de la commande au panier
    order.items.forEach((item: OrderItem) => {
      const cartItem = {
        id: item.id, // Utiliser item.id au lieu de item.productId
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url
      };
      
      // Appeler addToCart avec un seul argument
      this.cartService.addToCart({ ...cartItem, image_url: cartItem.image || 'assets/images/default-perfume.jpg' });
    });

    // Simulation d'un délai pour l'UI
    setTimeout(() => {
      this.reordering[order.id] = false;
      this.showSuccess(`${order.items.length} article(s) ajouté(s) au panier !`);
      
      // Optionnel : Redirection vers le panier après un délai
      setTimeout(() => {
        this.router.navigate(['/cart']);
      }, 1500);
    }, 1000);
  }

  isReordering(orderId: string): boolean {
    return this.reordering[orderId] || false;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  // Méthode pour formater l'adresse
  formatAddress(address: any): string {
    if (!address) return 'Adresse non disponible';
    
    const parts = [
      address.fullName,
      address.address,
      address.complement,
      `${address.postalCode} ${address.city}`,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  // Méthode pour gérer les erreurs d'image
  handleImageError(event: any): void {
    event.target.src = 'assets/images/default-perfume.jpg';
  }

  // Méthode pour obtenir le texte de la méthode de paiement
  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'credit_card': return 'Carte de crédit';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Virement bancaire';
      case 'cash': return 'Paiement à la livraison';
      default: return method;
    }
  }

  // Méthode de remplacement pour ToastService
  private showSuccess(message: string): void {
    // Vous pouvez implémenter un système de notification simple ici
    console.log('Success:', message);
    // Ou utiliser alert() temporairement
    // alert(message);
  }
}