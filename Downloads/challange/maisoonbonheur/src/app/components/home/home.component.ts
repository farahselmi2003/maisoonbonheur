import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { JsonServerService } from '../../services/json-server';

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
  categories: any[] = [];
  featuredPerfumes: any[] = [];
  currentSlide = 0;
  loading = true;
  private carouselInterval: any;

  // Propriétés pour la recherche
  searchTerm: string = '';
  searchResults: any[] = [];
  allPerfumes: any[] = [];
  isSearching: boolean = false;

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
    // Charger les catégories
    this.jsonServerService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Charger les parfums en vedette
    this.jsonServerService.getFeaturedPerfumes().subscribe({
      next: (perfumes) => {
        this.featuredPerfumes = perfumes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading perfumes:', error);
        this.loading = false;
      }
    });

    // Charger tous les parfums pour la recherche
    this.jsonServerService.getPerfumes().subscribe({
      next: (perfumes) => {
        this.allPerfumes = perfumes;
      },
      error: (error) => {
        console.error('Error loading all perfumes:', error);
      }
    });
  }

  // Méthodes de recherche
  onSearch() {
    if (!this.searchTerm || this.searchTerm.length < 2) {
      this.searchResults = [];
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    const searchTermLower = this.searchTerm.toLowerCase().trim();

    this.searchResults = this.allPerfumes.filter(perfume => {
      const nameMatch = perfume.name?.toLowerCase().includes(searchTermLower);
      const brandMatch = perfume.brand?.toLowerCase().includes(searchTermLower);
      
      const categoryMatch = this.categories.some(category => 
        category.name?.toLowerCase().includes(searchTermLower) && 
        category.id === perfume.category_id
      );

      return nameMatch || brandMatch || categoryMatch;
    });

    this.searchResults = this.searchResults.slice(0, 12);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.isSearching = false;
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
      image_url: perfume.image_url || 'assets/images/default-perfume.jpg',
      quantity: 1
    });

    this.showAddToCartFeedback(perfume.name);
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

  getPerfumeRows(): any[][] {
    const rows = [];
    for (let i = 0; i < this.featuredPerfumes.length; i += 3) {
      rows.push(this.featuredPerfumes.slice(i, i + 3));
    }
    return rows;
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  ngOnDestroy() {
    this.stopCarousel();
  }
}