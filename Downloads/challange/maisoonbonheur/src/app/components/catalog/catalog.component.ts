import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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

  wishlistStatus: { [key: number]: boolean } = {};

  showNotification = false;
  notificationMessage = '';
  notificationTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jsonServerService: JsonServerService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.initFromUrl();
    this.loadCategories();
    this.loadWishlistStatus();
    
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
    
    this.updateTrack();
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
    }
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
  }

  isNewPerfume(perfume: Perfume): boolean {
    return perfume.id >= 15;
  }

  private showCartNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }

    this.notificationTimer = setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  private loadWishlistStatus(): void {
    this.updateAllWishlistStatus();
    
    this.wishlistService.getWishlist().subscribe(wishlist => {
      this.updateAllWishlistStatus();
    });
  }

  private updateAllWishlistStatus(): void {
    this.perfumes.forEach(perfume => {
      this.wishlistStatus[perfume.id] = this.wishlistService.isInWishlist(perfume.id);
    });
  }

  private initFromUrl() {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      const minPrice = params.get('minPrice');
      const maxPrice = params.get('maxPrice');
      const rating = params.get('rating');
      const sort = params.get('sort');

      this.selectedCategoryId = category ? parseInt(category, 10) : null;
      this.minPrice = minPrice ? parseInt(minPrice, 10) : 80;
      this.maxPrice = maxPrice ? parseInt(maxPrice, 10) : 500;
      this.minRating = rating ? parseInt(rating, 10) : null;
      this.sortOption = sort;

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
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  toggleWishlist(perfume: Perfume, event: Event): void {
    event.stopPropagation();
    
    if (this.isInWishlist(perfume.id)) {
      this.wishlistService.removeFromWishlist(perfume.id);
      this.wishlistStatus[perfume.id] = false;
      this.showCartNotification('Produit retiré des favoris');
    } else {
      this.wishlistService.addToWishlist(perfume);
      this.wishlistStatus[perfume.id] = true;
      this.showCartNotification('Produit ajouté aux favoris');
    }
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

  onPriceChange() {
    this.updateTrack();
    this.onFilterChange();
  }

  updateTrack() {
    const range = this.priceMaxLimit - this.priceMinLimit;
    const left = ((this.minPrice - this.priceMinLimit) / range) * 100;
    const right = ((this.priceMaxLimit - this.maxPrice) / range) * 100;

    this.leftPercent = `${left}%`;
    this.rightPercent = `${right}%`;
  }

  private updateUrl(): void {
    const queryParams: any = {};
    
    if (this.selectedCategoryId) {
      queryParams.category = this.selectedCategoryId;
    }
    if (this.minPrice !== 80) {
      queryParams.minPrice = this.minPrice;
    }
    if (this.maxPrice !== 500) {
      queryParams.maxPrice = this.maxPrice;
    }
    if (this.minRating !== null) {
      queryParams.rating = this.minRating;
    }
    if (this.sortOption) {
      queryParams.sort = this.sortOption;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
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

  onCategoryChange(value: string | null) {
    const categoryId = value ? parseInt(value, 10) : null;
    this.selectedCategoryId = categoryId;
    
    this.perfumes = [];
    this.pageOffset = 0;
    this.endReached = false;
    
    if (this.selectedCategoryId) {
      this.loadPerfumesByCategory(this.selectedCategoryId, true);
    } else {
      this.loadAllPerfumes(true);
    }
    
    this.updateUrl();
  }

  onFilterChange() {
    this.perfumes = [];
    this.pageOffset = 0;
    this.endReached = false;
    
    if (this.selectedCategoryId) {
      this.loadPerfumesByCategory(this.selectedCategoryId, true);
    } else {
      this.loadAllPerfumes(true);
    }
    
    this.updateUrl();
  }

  onRatingChange(rating: number | null) {
    this.minRating = rating;
    this.onFilterChange();
  }

  onSortChange(sortOption: string | null) {
    this.sortOption = sortOption;
    this.onFilterChange();
  }

  resetFilters() {
    this.minPrice = 80;
    this.maxPrice = 500;
    this.minRating = null;
    this.sortOption = null;
    this.updateTrack();
    
    this.perfumes = [];
    this.pageOffset = 0;
    this.endReached = false;
    
    if (this.selectedCategoryId) {
      this.loadPerfumesByCategory(this.selectedCategoryId, true);
    } else {
      this.loadAllPerfumes(true);
    }
    
    this.updateUrl();
  }

  private onScroll = () => {
    if (this.loading || this.endReached || !isPlatformBrowser(this.platformId)) return;
    
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
    this.showCartNotification('Produit ajouté au panier !');
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
    return this.perfumes.length;
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }
}