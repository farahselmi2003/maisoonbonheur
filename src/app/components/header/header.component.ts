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
  // Propriétés pour le menu mobile
  showMobileMenu = false;
  
  // Propriétés pour la recherche
  searchQuery = '';
  showSearchResults = false;
  searchResults: any[] = [];
  
  // Propriétés pour le menu profil
  showProfileMenu = false;
  
  // Propriétés utilisateur
  user: User | null = null;
  displayName: string = ''; // Propriété pour afficher le nom
  
  // Propriétés panier
  cartItemCount = 0;
  
  // Souscriptions
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialiser le compteur du panier avec les données actuelles
    this.cartItemCount = this.cartService.getTotalItems();
    
    // Souscription aux changements du panier
    this.cartSubscription = this.cartService.cart$.subscribe((items: CartItem[]) => {
      this.cartItemCount = this.cartService.getTotalItems();
    });

    // Souscription aux changements de l'utilisateur
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      this.setDisplayName();
    });
  }

  // Méthode pour déterminer le nom à afficher
  private setDisplayName(): void {
    if (!this.user) {
      this.displayName = '';
      return;
    }

    // Priorité: firstName + lastName > username > email
    if ((this.user as any).firstName && (this.user as any).lastName) {
      this.displayName = `${(this.user as any).firstName} ${(this.user as any).lastName}`;
    } else if ((this.user as any).username) {
      this.displayName = (this.user as any).username;
    } else if (this.user.email) {
      // Afficher seulement la partie avant @ de l'email
      this.displayName = this.user.email.split('@')[0];
    } else {
      this.displayName = 'Utilisateur';
    }
  }

  ngOnDestroy() {
    // Nettoyage des souscriptions
    this.cartSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  // ... le reste des méthodes reste inchangé ...

  // Méthodes pour le menu mobile
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  // Méthodes pour la recherche
  onSearchInput(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.performSearch();
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  performSearch(): void {
    // Simulation de résultats de recherche
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

  // Méthodes pour le menu profil
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

  // Fermer les menus en cliquant à l'extérieur
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Fermer le menu profil si on clique à l'extérieur
    if (this.showProfileMenu && !target.closest('.profile-dropdown')) {
      this.closeProfileMenu();
    }
    
    // Fermer les résultats de recherche si on clique à l'extérieur
    if (this.showSearchResults && !target.closest('.search-container')) {
      this.showSearchResults = false;
    }
    
    // Fermer le menu mobile si on clique à l'extérieur (sur mobile)
    if (this.showMobileMenu && window.innerWidth <= 768) {
      if (!target.closest('.header-left') && !target.closest('.nav-menu')) {
        this.showMobileMenu = false;
      }
    }
  }

  // Fermer le menu mobile lors du redimensionnement de la fenêtre
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768) {
      this.showMobileMenu = false;
    }
  }
}