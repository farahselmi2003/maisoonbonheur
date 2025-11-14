import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

 
  getItemCount(): number {
    return this.getTotalItems();
  }

  getCart() {
    return this.cart$;
  }

  getItems(): CartItem[] {
    return [...this.cartItems];
  }

  getTotal(): number {
    return this.getTotalPrice();
  }


  addToCart(item: CartItem) {
    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push({...item});
    }
    
    this.cartSubject.next([...this.cartItems]);
  }

  removeFromCart(itemId: string) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.cartSubject.next([...this.cartItems]);
  }

  updateQuantity(itemId: string, quantity: number) {
    const item = this.cartItems.find(cartItem => cartItem.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.cartSubject.next([...this.cartItems]);
    }
  }

  clearCart() {
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}