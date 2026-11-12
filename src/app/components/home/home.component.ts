import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { JsonServerService, Perfume, Category } from '../../services/json-server';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  featuredPerfumes: Perfume[] = []; 
  popularPerfumes: Perfume[] = []; 
  wishlistStatus: { [key: number]: boolean } = {};
  currentSlide = 0;
  loading = true;
  private carouselInterval: any;

  slides = [
    {
      title: 'Créez Votre Parfum Unique',
      subtitle: 'Exprimez votre personnalité à travers les senteurs',
      image: 'assets/images/hero_perfume.jpg',
      cta: 'Commencer',
      link: '/creator'
    },
    {
      title: 'Collection Exclusive',
      subtitle: 'Découvrez nos parfums d\'exception',
      image: 'assets/images/colllection.webp',
      cta: 'Explorer',
      link: '/catalog'
    },
    {
      title: 'L\'Art de la Parfumerie',
      subtitle: 'Des fragrances qui racontent votre histoire',
      image: 'assets/images/parfume.webp',
      cta: 'Découvrir',
      link: '/panier'
    }
  ];

  constructor(
    private jsonServerService: JsonServerService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    this.startCarousel();
  }

  loadData() {
  
    this.jsonServerService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = (categories || []).slice(0, 6);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    
    this.jsonServerService.getPerfumes().subscribe({
      next: (perfumes: Perfume[]) => {
        this.featuredPerfumes = perfumes.filter((p: any) => p.is_featured).slice(0, 6);
        this.popularPerfumes = perfumes
          .filter((p: Perfume) => (p.rating ?? 0) >= 4.0)
          .sort((a: Perfume, b: Perfume) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 6);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading perfumes:', error);
        this.loading = false;
      }
    });
  }

  
  toggleWishlist(perfume: any, event: Event) {
    event.stopPropagation();
    this.wishlistStatus[perfume.id] = !this.wishlistStatus[perfume.id];
    console.log('Wishlist updated for perfume:', perfume.name, 'Status:', this.wishlistStatus[perfume.id]);
  }

  getStarsArray(rating: number): number[] {
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

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopCarousel();
    this.startCarousel();
  }

  navigateTo(path: string) {
    console.log('Navigation vers:', path);
    this.router.navigate([path]).then(success => {
      if (!success) {
        console.error('Échec de la navigation vers:', path);
      }
    });
  }

  addToCart(perfume: any, event: Event) {
    event.stopPropagation();

    this.cartService.addToCart({
      id: perfume.id.toString(),
      name: perfume.name,
      price: perfume.price,
      image_url: perfume.image_url || 'assets/images/parfume.webp',
      quantity: 1
    });

    this.showAddToCartFeedback(perfume.name);
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/parfume.webp';
  }

  resolveImage(url?: string): string {
    if (!url) return '/assets/images/parfume.webp';
    const u = String(url);
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/assets/')) return u;
    if (u.startsWith('assets/')) return `/${u}`;
    if (u.startsWith('/')) return `${environment.assetBaseUrl}${u}`;
    return `/assets/images/${u}`;
  }

  private showAddToCartFeedback(productName: string) {
    const feedback = document.createElement('div');
    feedback.className = 'add-to-cart-feedback';
    feedback.innerHTML = `
      <div class="feedback-content">
        <span>✓</span>
        ${productName} ajouté au panier
      </div>
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      feedback.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 2000);
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnDestroy() {
    this.stopCarousel();
  }
}
