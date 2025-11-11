import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { JsonServerService, Category, Perfume } from '../../services/json-server';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  perfumes: Perfume[] = [];
  categoryCollections: { category: Category; perfumes: Perfume[] }[] = [];
  categories: Category[] = [];

  selectedCategoryId: number | null = null;
  priceMinLimit = 80;
  priceMaxLimit = 500;
  leftPercent = '0%';
  rightPercent = '0%';
  minPrice: number = 80;
  maxPrice: number = 500;
  minRating: number | null = null;
  sortOption: string | null = null;
  pageSize = 12;
  pageOffset = 0;
  endReached = false;
  loading = false;
  starArray = [1, 2, 3, 4, 5];

  // État des favoris pour chaque produit
  wishlistStatus: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jsonServerService: JsonServerService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.initFromUrl();
    this.loadCategories();
    this.loadWishlistStatus();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.updateTrack();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  private loadWishlistStatus(): void {
    // S'abonner aux changements de la wishlist
    this.wishlistService.getWishlist().subscribe(wishlist => {
      this.perfumes.forEach(perfume => {
        this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
      });
      
      this.categoryCollections.forEach(collection => {
        collection.perfumes.forEach(perfume => {
          this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
        });
      });
    });
  }

  private initFromUrl() {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      this.selectedCategoryId = category ? parseInt(category, 10) : null;
      this.perfumes = [];
      this.pageOffset = 0;
      this.endReached = false;
      
      if (this.selectedCategoryId) {
        this.loadPerfumesByCategory(this.selectedCategoryId, true);
      } else {
        this.loadAllPerfumes(true);
      }
    });
  }

  loadCategories() {
    this.jsonServerService.getCategories().subscribe({
      next: (data) => {
        if (data) {
          this.categories = data;
          if (!this.selectedCategoryId) {
            this.loadCategoryCollections(true);
          }
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Méthode pour ajouter aux favoris et rediriger
  addToWishlistAndRedirect(perfume: Perfume, event: Event): void {
    event.stopPropagation(); // Empêche la navigation vers la page produit
    
    // Ajouter le produit aux favoris s'il n'y est pas déjà
    if (!this.isInWishlist(perfume.id)) {
      this.wishlistService.addToWishlist(perfume);
      this.wishlistStatus[perfume.id] = true;
    }
    
    // Rediriger vers la page des favoris après un court délai
    setTimeout(() => {
      this.router.navigate(['/wishlist']);
    }, 300);
  }

  isInWishlist(perfumeId: number): boolean {
    return this.wishlistService.isInWishlist(perfumeId);
  }

  onPriceInput() {
    if (this.minPrice > this.maxPrice) {
      const tmp = this.minPrice;
      this.minPrice = this.maxPrice;
      this.maxPrice = tmp;
    }
    this.updateTrack();
  }

  updateTrack() {
    const range = this.priceMaxLimit - this.priceMinLimit;
    const left = ((this.minPrice - this.priceMinLimit) / range) * 100;
    const right = ((this.priceMaxLimit - this.maxPrice) / range) * 100;

    this.leftPercent = `${left}%`;
    this.rightPercent = `${right}%`;
  }

  private getSortParams(): any {
    switch (this.sortOption) {
      case 'price_asc':
        return { _sort: 'price', _order: 'asc' };
      case 'price_desc':
        return { _sort: 'price', _order: 'desc' };
      case 'popularity':
        return { _sort: 'rating', _order: 'desc' };
      case 'new':
        return { _sort: 'id', _order: 'desc' };
      default:
        return {};
    }
  }

  loadAllPerfumes(reset = false) {
    this.loading = true;
    if (reset) {
      this.perfumes = [];
      this.pageOffset = 0;
      this.endReached = false;
    }

    const params: any = {
      price_gte: this.minPrice,
      price_lte: this.maxPrice,
      _start: this.pageOffset,
      _limit: this.pageSize
    };

    if (this.minRating !== null) {
      params.rating_gte = this.minRating;
    }

    Object.assign(params, this.getSortParams());

    this.jsonServerService.getPerfumes(params).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.endReached = true;
        } else {
          this.perfumes = reset ? data : [...this.perfumes, ...data];
          this.pageOffset += data.length;
          
          // Charger le statut des favoris pour les nouveaux produits
          data.forEach(perfume => {
            this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading perfumes:', error);
        this.loading = false;
        this.endReached = true;
      }
    });
  }

  loadPerfumesByCategory(categoryId: number, reset = false) {
    this.loading = true;
    if (reset) {
      this.perfumes = [];
      this.pageOffset = 0;
      this.endReached = false;
    }

    const params: any = {
      category_id: categoryId,
      price_gte: this.minPrice,
      price_lte: this.maxPrice,
      _start: this.pageOffset,
      _limit: this.pageSize
    };

    if (this.minRating !== null) {
      params.rating_gte = this.minRating;
    }

    Object.assign(params, this.getSortParams());

    this.jsonServerService.getPerfumes(params).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.endReached = true;
        } else {
          this.perfumes = reset ? data : [...this.perfumes, ...data];
          this.pageOffset += data.length;
          
          // Charger le statut des favoris pour les nouveaux produits
          data.forEach(perfume => {
            this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading perfumes by category:', error);
        this.loading = false;
        this.endReached = true;
      }
    });
  }

  loadCategoryCollections(reset = false) {
    this.loading = true;
    const collections: { category: Category; perfumes: Perfume[] }[] = [];
    let completedRequests = 0;

    if (this.categories.length === 0) {
      this.loading = false;
      return;
    }

    this.categories.forEach((cat) => {
      const params: any = {
        category_id: cat.id,
        price_gte: this.minPrice,
        price_lte: this.maxPrice,
        _limit: 6
      };

      if (this.minRating !== null) {
        params.rating_gte = this.minRating;
      }

      Object.assign(params, this.getSortParams());

      this.jsonServerService.getPerfumes(params).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            collections.push({ category: cat, perfumes: data });
            
            // Charger le statut des favoris
            data.forEach(perfume => {
              this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
            });
          }
          completedRequests++;
          
          if (completedRequests === this.categories.length) {
            this.categoryCollections = collections;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading perfumes for category:', cat.id, error);
          completedRequests++;
          
          if (completedRequests === this.categories.length) {
            this.categoryCollections = collections;
            this.loading = false;
          }
        }
      });
    });
  }

  onCategoryChange(value: string | null) {
    const categoryId = value ? parseInt(value, 10) : null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryId || undefined },
      queryParamsHandling: 'merge',
    });
  }

  onFilterChange() {
    this.pageOffset = 0;
    this.endReached = false;
    if (this.selectedCategoryId) {
      this.loadPerfumesByCategory(this.selectedCategoryId, true);
    } else {
      this.loadAllPerfumes(true);
    }
  }

  resetFilters() {
    this.minPrice = 80;
    this.maxPrice = 500;
    this.minRating = null;
    this.sortOption = null;
    this.onFilterChange();
  }

  private onScroll = () => {
    if (this.loading || this.endReached) return;
    
    const threshold = 300;
    const pos = window.innerHeight + window.scrollY;
    const max = document.body.offsetHeight;
    
    if (max - pos < threshold) {
      this.loadMore();
    }
  };
  
  loadMore() {
    if (this.loading || this.endReached) return;
    
    if (this.selectedCategoryId) {
      this.loadPerfumesByCategory(this.selectedCategoryId);
    } else {
      this.loadAllPerfumes();
    }
  }

  addToCart(perfume: Perfume, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart({
      id: perfume.id.toString(),
      name: perfume.name,
      price: perfume.price,
      image_url: perfume.image_url || 'assets/images/default-perfume.jpg',
      quantity: 1
    });
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '⭐'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }

  getTotalDisplayedProducts(): number {
    if (this.selectedCategoryId) {
      return this.perfumes.length;
    } else {
      return this.categoryCollections.reduce((total, collection) => total + collection.perfumes.length, 0);
    }
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }
}