import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadWishlist();
   
    this.wishlistService.getWishlist().subscribe(items => {
      this.wishlistItems = items;
    });
  }

  private loadWishlist(): void {
    this.wishlistItems = this.wishlistService.getWishlistItems();
  }

  removeFromWishlist(itemId: number): void {
    this.wishlistService.removeFromWishlist(itemId);
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
  }

  addToCart(item: WishlistItem): void {
    this.cartService.addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image_url: item.image_url || 'assets/images/default-perfume.jpg',
      quantity: 1
    });
  }

  getTotalPrice(): number {
    return this.wishlistItems.reduce((total, item) => total + item.price, 0);
  }
}