// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;
  shipping = 7; // Frais de livraison fixes à 7 TND
  total = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.items = this.cartService.getItems();
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.total = this.subtotal + this.shipping;
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
    this.loadCart();
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
      this.loadCart();
    }
  }

  onQuantityInput(item: CartItem, value: string): void {
    const quantity = parseInt(value, 10);
    if (quantity > 0) {
      this.cartService.updateQuantity(item.id, quantity);
      this.loadCart();
    }
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.id);
    this.loadCart();
  }

  clear(): void {
    this.cartService.clearCart();
    this.loadCart();
  }

  continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  checkout(): void {
    if (this.items.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}