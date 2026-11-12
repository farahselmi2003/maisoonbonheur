import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class JsonServerService {
  constructor(private api: ApiService) {}

  // Perfumes
  getPerfumes(params?: any): Observable<any> {
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
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || []))
    );
  }

  getPerfumeById(id: number): Observable<Perfume> {
    return this.api.get<any>(`/perfumes/${id}`).pipe(
      map((resp: any) => (resp?.data || resp))
    );
  }

  getFeaturedPerfumes(): Observable<Perfume[]> {
    return this.api.get<any>('/perfumes/featured').pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || []))
    );
  }

  // search endpoint: /perfumes/search?query=...&page=..&size=..
  searchPerfumes(query: string, page?: number, size?: number): Observable<any> {
    const params: any = { query };
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.size = size;
    return this.api.get<any>('/perfumes/search', params).pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || []))
    );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.api.get<any>('/categories').pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || []))
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.api.get<any>(`/categories/${id}`).pipe(
      map((resp: any) => (resp?.data || resp))
    );
  }

  // Reviews - backend: GET /reviews?perfumeId= or GET /reviews?userId=
  getReviews(perfumeId: number): Observable<Review[]> {
    return this.api.get<any>('/reviews', { perfumeId, perfume_id: perfumeId }).pipe(
      map((resp: any) => Array.isArray(resp) ? resp : (resp?.content || resp?.items || resp?.data || []))
    );
  }

  addReview(perfumeId: number, rating: number, comment?: string) {
    const body = { perfumeId, rating, comment };
    // backend create is POST /reviews with params userId & perfumeId in controller; adapt in caller
    return this.api.post<Review>('/reviews', body);
  }

  // Addresses
  getAddresses(userId?: number) {
    const params = userId ? { userId } : undefined;
    return this.api.get<Address[]>('/addresses', params);
  }

  addAddress(address: Address, userId?: number) {
    // backend create address supports optional userId request param
    return this.api.post<Address>('/addresses', address, userId ? { userId } : undefined);
  }

  updateAddress(id: number, address: Partial<Address>) {
    return this.api.put<Address>(`/addresses/${id}`, address);
  }

  deleteAddress(id: number) {
    return this.api.delete<void>(`/addresses/${id}`);
  }

  register(email: string, password: string, userData?: any) {
    const body: any = { email, password, ...(userData || {}) };
    return this.api.post<any>('/users', body);
  }

  signIn(email: string, password: string) {
    const body = { email, password };
    return this.api.post<any>('/auth/login', body);
  }

  addCreation(creation: any) {
    return this.api.post<any>('/creations', creation);
  }
}
