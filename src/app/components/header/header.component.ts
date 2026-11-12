import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
 
  showMobileMenu = false;
  

  searchQuery = '';
  showSearchResults = false;
  searchResults: any[] = [];
  
 
  showProfileMenu = false;
  

  user: User | null = null;
  displayName: string = ''; 
  
  
  cartItemCount = 0;
  
 
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    
    this.cartItemCount = this.cartService.getTotalItems();
    

    this.cartSubscription = this.cartService.cart$.subscribe((items: CartItem[]) => {
      this.cartItemCount = this.cartService.getTotalItems();
    });

  
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      this.setDisplayName();
    });
  }


  private setDisplayName(): void {
    if (!this.user) {
      this.displayName = '';
      return;
    }

  
    if ((this.user as any).firstName && (this.user as any).lastName) {
      this.displayName = `${(this.user as any).firstName} ${(this.user as any).lastName}`;
    } else if ((this.user as any).username) {
      this.displayName = (this.user as any).username;
    } else if (this.user.email) {
      
      this.displayName = this.user.email.split('@')[0];
    } else {
      this.displayName = 'Utilisateur';
    }
  }

  ngOnDestroy() {
  
    this.cartSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }



 
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }


  onSearchInput(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.performSearch();
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  performSearch(): void {
  
    this.searchResults = [
      { id: 1, name: 'Parfum Florale', brand: 'Dior', price: 120, image: 'assets/images/perfume1.jpg' },
      { id: 2, name: 'Eau de Toilette', brand: 'Chanel', price: 95, image: 'assets/images/perfume2.jpg' },
      { id: 3, name: 'Parfum Oriental', brand: 'Yves Saint Laurent', price: 150, image: 'assets/images/perfume3.jpg' }
    ];
    this.showSearchResults = true;
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
      this.showSearchResults = false;
      this.searchQuery = '';
    }
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
    this.showSearchResults = false;
    this.searchQuery = '';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }


  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeProfileMenu();
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
 
    if (this.showProfileMenu && !target.closest('.profile-dropdown')) {
      this.closeProfileMenu();
    }

    if (this.showSearchResults && !target.closest('.search-container')) {
      this.showSearchResults = false;
    }
    
    
    if (this.showMobileMenu && window.innerWidth <= 768) {
      if (!target.closest('.header-left') && !target.closest('.nav-menu')) {
        this.showMobileMenu = false;
      }
    }
  }

  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768) {
      this.showMobileMenu = false;
    }
  }
}