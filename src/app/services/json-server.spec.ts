import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  image_url: string;
  rating: number;
  intensity: string;
  season: string;
  mood: string;
  category_id: number;
  is_featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface Review {
  id: number;
  perfume_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class JsonServerService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPerfumes(): Observable<Perfume[]> {
    return this.http.get<Perfume[]>(`${this.apiUrl}/perfumes`);
  }

  getPerfumeById(id: number): Observable<Perfume> {
    return this.http.get<Perfume>(`${this.apiUrl}/perfumes/${id}`);
  }

  getFeaturedPerfumes(): Observable<Perfume[]> {
    return this.http.get<Perfume[]>(`${this.apiUrl}/perfumes?is_featured=true`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getReviews(perfumeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews?perfume_id=${perfumeId}`);
  }

  searchPerfumes(query: string): Observable<Perfume[]> {
    return this.http.get<Perfume[]>(`${this.apiUrl}/perfumes?q=${query}`);
  }
}