import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  subtotal = 0;
  shipping = 7;
  total = 0;

  private sub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Le panier se met à jour automatiquement après chaque modification
    // (les méthodes du service sont asynchrones pour un utilisateur connecté).
    this.sub = this.cartService.cart$.subscribe(items => {
      this.items = [...items];
      this.calculateTotals();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.total = this.items.length > 0 ? this.subtotal + this.shipping : 0;
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe({
      error: (e) => console.error('Erreur quantité:', e)
    });
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe({
        error: (e) => console.error('Erreur quantité:', e)
      });
    }
  }

  onQuantityInput(item: CartItem, value: string): void {
    const quantity = parseInt(value, 10);
    if (quantity > 0) {
      this.cartService.updateQuantity(item.id, quantity).subscribe({
        error: (e) => console.error('Erreur quantité:', e)
      });
    }
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      error: (e) => console.error('Erreur suppression:', e)
    });
  }

  clear(): void {
    this.cartService.clearCart().subscribe({
      error: (e) => console.error('Erreur vidage panier:', e)
    });
  }

  continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  checkout(): void {
    if (this.items.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  resolveImage(url?: string | null): string {
    const fallback = '/assets/images/parfume.webp';
    if (!url) return fallback;
    const u = String(url).trim();
    if (/^(https?:)?\/\//.test(u) || u.startsWith('data:')) return u;
    if (u.startsWith('/assets/')) return u;
    if (u.startsWith('assets/')) return `/${u}`;
    const base = (environment.assetBaseUrl || 'http://localhost:8080').replace(/\/$/, '');
    if (u.startsWith('/')) return `${base}${u}`;
    if (u.includes('/')) return `${base}/${u}`;
    return `/assets/images/${u}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const fallback = '/assets/images/parfume.webp';
    if (!img.src.endsWith(fallback)) {
      img.src = fallback;
    } else {
      img.onerror = null;
    }
  }
}