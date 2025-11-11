import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}
export interface Creation {
  id?: number;
  created_at: string;
  notes: string[];
  families: string[];
  intensity: number;
  season: string;
  mood: string;
}
export interface Perfume {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  brand: string;
  category_id: number;
  rating: number;
  stock: number;
  is_featured: boolean;
  intensity: string;
  season: string;
  mood: string;
  created_at: string;
  in_stock?: boolean;
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

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone?: string;
}
export interface Address {
  id: number;
  street: string;
  city: string;
  postal_code: string;
  user_id: number;
  is_default?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JsonServerService {
  private apiUrl = 'http://localhost:3000';
  private STORAGE_KEY = 'mb_user_session';
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadSession(); 
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  // Perfumes
  getPerfumes(params?: any): Observable<Perfume[]> {
    let url = `${this.apiUrl}/perfumes`;
    const queryParams = [];

    if (params?.category_id) {
      queryParams.push(`category_id=${params.category_id}`);
    }
    if (params?.price_gte !== undefined) {
      queryParams.push(`price_gte=${params.price_gte}`);
    }
    if (params?.price_lte !== undefined) {
      queryParams.push(`price_lte=${params.price_lte}`);
    }
    if (params?.rating_gte !== undefined) {
      queryParams.push(`rating_gte=${params.rating_gte}`);
    }
    if (params?._sort) {
      queryParams.push(`_sort=${params._sort}`);
    }
    if (params?._order) {
      queryParams.push(`_order=${params._order}`);
    }
    if (params?._start !== undefined) {
      queryParams.push(`_start=${params._start}`);
    }
    if (params?._limit !== undefined) {
      queryParams.push(`_limit=${params._limit}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    return this.http.get<Perfume[]>(url);
  }
  // Creations
  getCreations(): Observable<Creation[]> {
    return this.http.get<Creation[]>(`${this.apiUrl}/creations`);
  }

  addCreation(creation: Omit<Creation, 'id'>): Observable<Creation> {
    return this.http.post<Creation>(`${this.apiUrl}/creations`, creation);
  }

  getFeaturedPerfumes(): Observable<Perfume[]> {
    return this.http.get<Perfume[]>(`${this.apiUrl}/perfumes?is_featured=true&_limit=9`);
  }

  getPerfumeById(id: number): Observable<Perfume> {
    return this.http.get<Perfume>(`${this.apiUrl}/perfumes/${id}`);
  }

  searchPerfumes(query: string): Observable<Perfume[]> {
    return this.http.get<Perfume[]>(`${this.apiUrl}/perfumes?q=${query}`);
  }

  // Auth
  signIn(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length > 0) {
            const user = users[0];
            this.currentUser$.next(user);
            return user;
          }
          throw new Error('Utilisateur non trouvé');
        }),
        tap(user => {
          // Persistance en localStorage pour garder la session
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        })
      );
  }

  register(email: string, password: string, userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, {
      email,
      password,
      ...userData
    }).pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  signOut(): void {
    this.currentUser$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }

  getUserObservable(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  setCurrentUser(user: User): void {
    this.currentUser$.next(user);
  }

  private loadSession() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const user = JSON.parse(data) as User;
        this.currentUser$.next(user);
      } catch (_) {
        // ignore malformed storage
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  // Reviews
  getReviews(perfumeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews?perfume_id=${perfumeId}`);
  }

  addReview(review: Omit<Review, 'id'>): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, review);
  }
  // Dans json-server.service.ts, ajoutez ces méthodes :

// Address methods
getAddresses(userId?: number): Observable<Address[]> {
  let url = `${this.apiUrl}/addresses`;
  if (userId) {
    url += `?user_id=${userId}`;
  }
  return this.http.get<Address[]>(url);
}

addAddress(address: Omit<Address, 'id'>): Observable<Address> {
  return this.http.post<Address>(`${this.apiUrl}/addresses`, address);
}

updateAddress(id: number, address: Partial<Address>): Observable<Address> {
  return this.http.patch<Address>(`${this.apiUrl}/addresses/${id}`, address);
}

deleteAddress(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/addresses/${id}`);
}
}