import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;

}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistKey = 'user_wishlist';
  private wishlistItems: WishlistItem[] = [];
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);

  constructor() {
    this.loadWishlistFromStorage();
  }

  private loadWishlistFromStorage(): void {
    const stored = localStorage.getItem(this.wishlistKey);
    if (stored) {
      try {
        this.wishlistItems = JSON.parse(stored);
        this.wishlistSubject.next(this.wishlistItems);
      } catch (error) {
        console.error('Error parsing wishlist from storage:', error);
        this.wishlistItems = [];
      }
    }
  }

  private saveWishlistToStorage(): void {
    localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlistItems));
    this.wishlistSubject.next(this.wishlistItems);
  }

  getWishlist(): Observable<WishlistItem[]> {
    return this.wishlistSubject.asObservable();
  }

  getWishlistItems(): WishlistItem[] {
    return [...this.wishlistItems];
  }

  addToWishlist(perfume: any): void {
    const existingItem = this.wishlistItems.find(item => item.id === perfume.id);
    
    if (!existingItem) {
      const wishlistItem: WishlistItem = {
        id: perfume.id,
        name: perfume.name,
        price: perfume.price,
        image_url: perfume.image_url
      };
      
      this.wishlistItems.push(wishlistItem);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(perfumeId: number): void {
    this.wishlistItems = this.wishlistItems.filter(item => item.id !== perfumeId);
    this.saveWishlistToStorage();
  }

  isInWishlist(perfumeId: number): boolean {
    return this.wishlistItems.some(item => item.id === perfumeId);
  }

  clearWishlist(): void {
    this.wishlistItems = [];
    this.saveWishlistToStorage();
  }

  getWishlistCount(): number {
    return this.wishlistItems.length;
  }
}