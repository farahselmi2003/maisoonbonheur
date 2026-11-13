import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: number;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  rating: number;
  intensity: string;
  season: string;
  mood: string;
  categoryId?: number;
  category_id: number;
  isFeatured?: boolean;
  is_featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
}

export interface Review {
  id: number;
  perfumeId: number;
  userId: number;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  perfume_id: number;
  user_id: number;
  user_name: string;
  created_at: string;
}

export interface Address {
  id?: number;
  street?: string;
  city?: string;
  postalCode?: string;
  userId?: number;
  isDefault?: boolean;
}

interface LocalDatabase {
  categories: Category[];
  perfumes: Perfume[];
  reviews: Review[];
  users?: any[];
  orders?: any[];
  addresses?: Address[];
}

@Injectable({
  providedIn: 'root'
})
export class JsonServerService {
  private localData$?: Observable<LocalDatabase>;

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Charge le fichier local /assets/data.json (fallback 100% autonome pour Netlify)
   */
  private getLocalData(): Observable<LocalDatabase> {
    if (!this.localData$) {
      this.localData$ = this.http.get<LocalDatabase>('/assets/data.json').pipe(
        catchError(() => of({ categories: [], perfumes: [], reviews: [] })),
        shareReplay(1)
      );
    }
    return this.localData$;
  }

  // Perfumes
  getPerfumes(params?: any): Observable<Perfume[]> {
    const p = params || {};
    const { _start, _limit, _sort, _order, price_gte, price_lte, rating_gte, category_id, ...rest } = p;
    const backendParams: any = { ...rest, ...p };
    if (_limit !== undefined) {
      const limitNum = Number(_limit) || 20;
      const startNum = Number(_start) || 0;
      backendParams.page = Math.floor(startNum / limitNum);
      backendParams.size = limitNum;
      backendParams._start = startNum;
      backendParams._limit = limitNum;
    }
    if (_sort) {
      backendParams.sort = _sort;
      backendParams._sort = _sort;
    }
    if (_order) {
      backendParams.order = _order;
      backendParams._order = _order;
    }
    if (price_gte !== undefined) {
      backendParams.minPrice = price_gte;
      backendParams.price_gte = price_gte;
    }
    if (price_lte !== undefined) {
      backendParams.maxPrice = price_lte;
      backendParams.price_lte = price_lte;
    }
    if (rating_gte !== undefined) {
      backendParams.minRating = rating_gte;
      backendParams.rating_gte = rating_gte;
    }
    if (category_id !== undefined) {
      backendParams.categoryId = category_id;
      backendParams.category_id = category_id;
    }

    return this.api.get<any>('/perfumes', backendParams).pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || [])),
      catchError(() => {
        // Mode autonome : lecture et filtrage depuis data.json local
        return this.getLocalData().pipe(
          map(db => {
            let list = [...(db.perfumes || [])];
            if (category_id !== undefined) {
              list = list.filter(item => item.category_id === Number(category_id));
            }
            if (price_gte !== undefined) {
              list = list.filter(item => item.price >= Number(price_gte));
            }
            if (price_lte !== undefined) {
              list = list.filter(item => item.price <= Number(price_lte));
            }
            if (rating_gte !== undefined) {
              list = list.filter(item => (item.rating || 0) >= Number(rating_gte));
            }
            if (_sort === 'price') {
              list.sort((a, b) => _order === 'desc' ? b.price - a.price : a.price - b.price);
            } else if (_sort === 'rating') {
              list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (_sort === 'id') {
              list.sort((a, b) => b.id - a.id);
            }
            const start = Number(_start) || 0;
            const limit = Number(_limit) || list.length;
            return list.slice(start, start + limit);
          })
        );
      })
    );
  }

  getPerfumeById(id: number): Observable<Perfume> {
    return this.api.get<any>(`/perfumes/${id}`).pipe(
      map((resp: any) => (resp?.data || resp)),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => {
            const found = (db.perfumes || []).find(p => p.id === Number(id));
            if (!found) throw new Error('Perfume not found');
            return found;
          })
        );
      })
    );
  }

  getFeaturedPerfumes(): Observable<Perfume[]> {
    return this.api.get<any>('/perfumes/featured').pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || [])),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => (db.perfumes || []).filter(p => p.is_featured))
        );
      })
    );
  }

  // search endpoint: /perfumes/search?query=...&page=..&size=..
  searchPerfumes(query: string, page?: number, size?: number): Observable<any> {
    const params: any = { query };
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    return this.api.get<any>('/perfumes/search', params).pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || [])),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => {
            const q = (query || '').toLowerCase().trim();
            const list = (db.perfumes || []).filter(p => 
              (p.name && p.name.toLowerCase().includes(q)) ||
              (p.brand && p.brand.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q))
            );
            return list;
          })
        );
      })
    );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.api.get<any>('/categories').pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || [])),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => db.categories || [])
        );
      })
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.api.get<any>(`/categories/${id}`).pipe(
      map((resp: any) => (resp?.data || resp)),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => {
            const found = (db.categories || []).find(c => c.id === Number(id));
            if (!found) throw new Error('Category not found');
            return found;
          })
        );
      })
    );
  }

  // Reviews - backend: GET /reviews?perfumeId= or GET /reviews?userId=
  getReviews(perfumeId: number): Observable<Review[]> {
    return this.api.get<any>('/reviews', { perfumeId, perfume_id: perfumeId }).pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || [])),
      catchError(() => {
        return this.getLocalData().pipe(
          map(db => (db.reviews || []).filter(r => (r.perfume_id === Number(perfumeId) || r.perfumeId === Number(perfumeId))))
        );
      })
    );
  }

  addReview(perfumeId: number, rating: number, comment?: string) {
    const body = { perfumeId, rating, comment };
    return this.api.post<Review>('/reviews', body).pipe(
      catchError(() => {
        const mockReview: Review = {
          id: Date.now(),
          perfumeId,
          perfume_id: perfumeId,
          userId: 1,
          user_id: 1,
          userName: 'Client vérifié',
          user_name: 'Client vérifié',
          rating,
          comment: comment || '',
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        return of(mockReview);
      })
    );
  }

  // Addresses
  getAddresses(userId?: number) {
    const params = userId ? { userId } : undefined;
    return this.api.get<Address[]>('/addresses', params).pipe(
      catchError(() => {
        try {
          const raw = localStorage.getItem('mb_user_addresses');
          return of(raw ? JSON.parse(raw) : []);
        } catch {
          return of([]);
        }
      })
    );
  }

  addAddress(address: Address, userId?: number) {
    return this.api.post<Address>('/addresses', address, userId ? { userId } : undefined).pipe(
      catchError(() => {
        const saved: Address = { ...address, id: Date.now() };
        try {
          const raw = localStorage.getItem('mb_user_addresses');
          const list = raw ? JSON.parse(raw) : [];
          list.push(saved);
          localStorage.setItem('mb_user_addresses', JSON.stringify(list));
        } catch {}
        return of(saved);
      })
    );
  }

  updateAddress(id: number, address: Partial<Address>) {
    return this.api.put<Address>(`/addresses/${id}`, address).pipe(
      catchError(() => of({ ...address, id } as Address))
    );
  }

  deleteAddress(id: number) {
    return this.api.delete<void>(`/addresses/${id}`).pipe(
      catchError(() => of(undefined as any))
    );
  }

  register(email: string, password: string, userData?: any) {
    const body: any = { email, password, ...(userData || {}) };
    return this.api.post<any>('/users', body).pipe(
      catchError(() => {
        const user = { id: Date.now(), email, name: userData?.name || email.split('@')[0] };
        return of(user);
      })
    );
  }

  signIn(email: string, password: string) {
    const body = { email, password };
    return this.api.post<any>('/auth/login', body).pipe(
      catchError(() => {
        const user = { id: 1, email, name: email.split('@')[0], token: 'mb_mock_jwt_token' };
        return of(user);
      })
    );
  }

  addCreation(creation: any) {
    return this.api.post<any>('/creations', creation).pipe(
      catchError(() => of({ id: Date.now(), ...creation }))
    );
  }
}
