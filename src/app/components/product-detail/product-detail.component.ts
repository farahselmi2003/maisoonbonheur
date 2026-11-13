import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { JsonServerService, Perfume } from '../../services/json-server';
import { AnalyticsService } from '../../services/analytics.service';
import { environment } from '../../../environments/environment';

interface Review {
  id: number;
  perfume_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  features: string[];
  reviews: Review[];
  brand: string;
  rating: number;
  intensity: string;
  season: string;
  mood: string;
  category_id: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  similarProducts: Product[] = [];
  quantity: number = 1;
  loading: boolean = true;
  error: boolean = false;
  selectedImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private jsonServerService: JsonServerService,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(parseInt(productId, 10));
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = false;

    this.jsonServerService.getPerfumeById(id).subscribe({
      next: (perfume: Perfume) => {
        if (perfume) {
          this.jsonServerService.getReviews(id).subscribe({
            next: (reviews: Review[]) => {
              const safeReviews = reviews.map(review => ({
                ...review,
                user_name: review.user_name || 'Utilisateur'
              }));
              this.product = this.mapPerfumeToProduct(perfume, safeReviews);
              this.updateSeoTags(this.product);
              this.analyticsService.trackViewItem({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                category: perfume.brand || 'Parfums'
              });
              this.loadSimilarProducts(perfume.category_id, perfume.id);
              this.loading = false;
            },
            error: (reviewError) => {
              this.product = this.mapPerfumeToProduct(perfume, []);
              this.updateSeoTags(this.product);
              this.analyticsService.trackViewItem({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                category: perfume.brand || 'Parfums'
              });
              this.loadSimilarProducts(perfume.category_id, perfume.id);
              this.loading = false;
            }
          });
        } else {
          this.error = true;
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private updateSeoTags(product: Product): void {
    const pageTitle = `${product.name} - Eau de Parfum | Maison Bonheur Tunisie`;
    this.titleService.setTitle(pageTitle);

    const description = product.description && product.description.length > 30 
      ? product.description 
      : `Achetez ${product.name} (${product.price} TND) en Tunisie. Eau de parfum haut de gamme signée ${product.brand}. Livraison rapide partout en Tunisie.`;

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({
      name: 'keywords',
      content: `${product.name}, parfum ${product.name}, acheter ${product.name} tunisie, parfum ${product.brand}, parfum ${product.intensity || 'eau de parfum'} tunisie, prix parfum tunisie`
    });

    // Balises Open Graph dynamiques
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (product.images && product.images.length > 0) {
      this.metaService.updateTag({ property: 'og:image', content: `https://maisonbonheur.tn${product.images[0]}` });
    }
  }

  private mapPerfumeToProduct(perfume: Perfume, reviews: Review[]): Product {
    const features = [];
    if (perfume.intensity) features.push(`Intensité: ${perfume.intensity}`);
    if (perfume.season && perfume.season !== 'All') features.push(`Saison: ${perfume.season}`);
    if (perfume.mood) features.push(`Ambiance: ${perfume.mood}`);
    
    const randomStock = Math.floor(Math.random() * 20) + 1;
    const images = this.generateProductImages(perfume);

    return {
      id: perfume.id,
      name: perfume.name,
      description: perfume.description || 'Une fragrance exceptionnelle qui captive les sens.',
      price: perfume.price,
      stock: randomStock,
      images: images,
      features: features,
      reviews: reviews,
      brand: perfume.brand,
      rating: perfume.rating,
      intensity: perfume.intensity,
      season: perfume.season,
      mood: perfume.mood,
      category_id: perfume.category_id
    };
  }

  private generateProductImages(perfume: Perfume): string[] {
    const baseImage = perfume.image_url || '/assets/images/parfume.webp';
    const u = String(baseImage);
    if (u.startsWith('http://') || u.startsWith('https://')) return [u];
    if (u.startsWith('/assets/')) return [u];
    if (u.startsWith('assets/')) return [`/${u}`];
    if (u.startsWith('/')) return [`${environment.assetBaseUrl}${u}`];
    return [`/assets/images/${u}`];
  }

  private loadSimilarProducts(categoryId: number, currentProductId: number): void {
    this.jsonServerService.getPerfumes().subscribe({
      next: (perfumes: Perfume[]) => {
        this.similarProducts = perfumes
          .filter(p => p.id !== currentProductId)
          .slice(0, 4)
          .map(perfume => {
            const product = this.mapPerfumeToProduct(perfume, []);
            product.stock = Math.floor(Math.random() * 20) + 1;
            return product;
          });
      },
      error: (err) => {
        console.error('Error loading similar products:', err);
      }
    });
  }

  getReviewerInitial(userName: string | undefined): string {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  onImageErrorMain() {
    if (!this.product) return;
    this.product.images[this.selectedImageIndex] = '/assets/images/parfume.webp';
  }

  onImageErrorThumb(index: number) {
    if (!this.product) return;
    this.product.images[index] = '/assets/images/parfume.webp';
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.product.stock > 0) {
      this.cartService.addToCart({
        id: this.product.id.toString(),
        name: this.product.name,
        price: this.product.price,
        image_url: this.product.images[0],
        quantity: this.quantity
      });
      alert(`${this.product.name} a été ajouté au panier!`);
    }
  }

  addToWishlist(): void {
    if (this.product) {
      this.wishlistService.addToWishlist({
        id: this.product.id.toString(),
        name: this.product.name,
        price: this.product.price,
        image_url: this.product.images[0],
        brand: this.product.brand
      });
      alert(`${this.product.name} a été ajouté aux favoris!`);
    }
  }

  addToWishlistFromCard(product: Product): void {
    this.wishlistService.addToWishlist({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image_url: product.images[0],
      brand: product.brand
    });
    alert(`${product.name} a été ajouté aux favoris!`);
  }

  addSimilarToCart(product: Product): void {
    this.cartService.addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image_url: product.images[0],
      quantity: 1
    });
    alert(`${product.name} a été ajouté au panier!`);
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getAverageRating(): number {
    if (!this.product || !this.product.reviews.length) {
      return this.product?.rating || 0;
    }
    
    const total = this.product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / this.product.reviews.length;
  }

  getRatingCount(rating: number): number {
    if (!this.product) return 0;
    return this.product.reviews.filter(review => review.rating === rating).length;
  }

  getRatingPercentage(rating: number): number {
    if (!this.product || !this.product.reviews.length) return 0;
    return (this.getRatingCount(rating) / this.product.reviews.length) * 100;
  }

  getStockPercentage(): number {
    if (!this.product) return 0;
    return (this.product.stock / 20) * 100;
  }

  getStarArray(): number[] {
    const rating = this.getAverageRating();
    return this.generateStarArray(rating);
  }

  getStarArrayForRating(rating: number): number[] {
    return this.generateStarArray(rating);
  }

  private generateStarArray(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(0);
    }
    
    return stars;
  }
}
