import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  address: string;
  createdAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userKey = environment.userKey || 'mb_user_session';
  private tokenKey = environment.tokenKey || 'mb_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public user$ = this.currentUser$;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch {
        localStorage.removeItem(this.userKey);
      }
    }
  }

  /**
   * Login flow:
   * - call /auth/login (backend currently returns a stub)
   * - if backend returns a user-like payload, save it
   * - otherwise, fallback: fetch /users and match email/password (dev stub only)
   */
  login(loginRequest: LoginRequest): Observable<User> {
    return this.apiService.post<any>('/auth/login', loginRequest).pipe(
      switchMap(authResp => {
        if (authResp && authResp.user) {
          const user = authResp.user as User;
          this.saveUser(user);
          if (authResp.token) localStorage.setItem(this.tokenKey, authResp.token);
          return of(user);
        }
        return this.apiService.get<User[]>('/users').pipe(
          map(users => {
            const u = users.find(x => x.email === loginRequest.email && x.password === loginRequest.password);
            if (!u) {
              throw new Error('Identifiants invalides ');
            }
            this.saveUser(u);
            return u;
          })
        );
      }),
      catchError(() => {
        return this.apiService.get<User[]>('/users').pipe(
          map(users => {
            const u = users.find(x => x.email === loginRequest.email && x.password === loginRequest.password);
            if (!u) {
              throw new Error('Identifiants invalides ');
            }
            this.saveUser(u);
            return u;
          })
        );
      })
    );
  }

  /**
   * Registration via backend: POST /auth/register
   * Fallback to /users only if backend not available.
   */
  register(registerRequest: RegisterRequest): Observable<User> {
    return this.apiService.post<User>('/auth/register', registerRequest).pipe(
      tap(user => {
        this.saveUser(user);
      }),
      catchError(() => {
        return this.apiService.post<User>('/users', registerRequest).pipe(
          tap(user => this.saveUser(user))
        );
      })
    );
  }

  private saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  updateUserProfile(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  updateUser(user: User): { success: boolean; message?: string } {
    try {
      this.updateUserProfile(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Échec de la mise à jour du profil' };
    }
  }
}
