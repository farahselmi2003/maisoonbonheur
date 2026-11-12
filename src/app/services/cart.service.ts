import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService, User } from './auth.service';
import { AnalyticsService } from './analytics.service';

export interface CartItem {
  id: number;
  perfumeId: number;
  name?: string;
  imageUrl?: string;
  image_url?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Cart {
  id: number;
  userId?: number;
  items: CartItem[];
  total: number;
}

export interface CartRequest {
  perfumeId?: number;
  id?: number | string;
  quantity: number;
  name?: string;
  price?: number;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$: Observable<CartItem[]> = this.cartSubject.asObservable().pipe(map(c => c?.items || []));

  // key for guest (not-authenticated) cart
  private guestCartKey = 'guest_cart';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {
    this.loadCart();
    // optional: react to auth changes to reload cart when user logs in/out
    this.authService.currentUser$.subscribe(user => this.loadCart());
  }

  private loadCart(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.getCartForUser(user.id).subscribe({
        next: () => {},
        error: () => {
          this.cartSubject.next(null);
        }
      });
    } else {
      // load guest cart from localStorage
      const stored = localStorage.getItem(this.guestCartKey);
      if (stored) {
        try {
          const cart: Cart = JSON.parse(stored);
          this.cartSubject.next(cart);
        } catch {
          localStorage.removeItem(this.guestCartKey);
          this.cartSubject.next(null);
        }
      } else {
        this.cartSubject.next(null);
      }
    }
  }

  private persistGuestCart(cart: Cart | null) {
    if (!cart) {
      localStorage.removeItem(this.guestCartKey);
      this.cartSubject.next(null);
      return;
    }
    localStorage.setItem(this.guestCartKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  // Backend: GET /carts/by-user/{userId}
  getCartForUser(userId: number): Observable<Cart> {
    return this.apiService.get<Cart[]>(`/carts`, { userId }).pipe(
      switchMap((carts: Cart[]) => {
        const cart = carts && carts[0];
        if (cart) {
          this.cartSubject.next(cart);
          return of(cart);
        }
        return this.createCartForUser(userId, []);
      })
    );
  }

  // Create a cart for a user: POST /carts?userId={userId}
  createCartForUser(userId: number, items: Partial<CartItem>[]): Observable<Cart> {
    const body: Partial<Cart> = { items: items as any, total: 0, userId };
    return this.apiService.post<Cart>('/carts', body).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Add to cart:
   * - if authenticated: fetch cart (or create it), modify items, PUT /carts/{id}
   * - if guest: modify localStorage guest cart
   */
  addToCart(cartRequest: CartRequest): Observable<Cart> {
    const user = this.authService.getCurrentUser();
    const pid = (cartRequest.perfumeId !== undefined && cartRequest.perfumeId !== null)
      ? Number(cartRequest.perfumeId)
      : Number(cartRequest.id);
    if (isNaN(pid)) {
      return throwError(() => new Error('Identifiant de parfum invalide'));
    }

    // Suivi Analytics de l'ajout au panier (GA4 / GTM)
    this.analyticsService.trackAddToCart({
      id: pid,
      name: cartRequest.name || `Parfum #${pid}`,
      price: cartRequest.price ?? 0,
      quantity: cartRequest.quantity
    });

    if (user && user.id) {
      return this.getCartForUser(user.id).pipe(
        switchMap(cart => {
          // if cart exists, update items and PUT
          if (cart && cart.id) {
            const existing = cart.items.find(i => i.perfumeId === pid);
          if (existing) {
            existing.quantity += cartRequest.quantity;
            existing.subtotal = (existing.price || 0) * existing.quantity;
          } else {
            const newItem: CartItem = {
              id: Date.now(), // temporary id client-side; backend should replace
              perfumeId: pid,
              quantity: cartRequest.quantity,
              price: cartRequest.price ?? 0,
              imageUrl: cartRequest.image_url,
              image_url: cartRequest.image_url,
              subtotal: (cartRequest.price ?? 0) * cartRequest.quantity
            };
            cart.items.push(newItem);
          }
            // recompute total locally (backend will compute authoritative value)
            cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
            return this.apiService.put<Cart>(`/carts/${cart.id}`, cart).pipe(
              tap(updated => this.cartSubject.next(updated))
            );
          } else {
            // no cart: create one for user
            return this.createCartForUser(user.id, [{ perfumeId: pid, quantity: cartRequest.quantity } as any]);
          }
        }),
        catchError(err => {
          return throwError(() => err);
        })
      );
    } else {
      // guest path: store in localStorage
      const current = this.cartSubject.value;
      let cart: Cart;
      if (!current) {
        cart = {
          id: Date.now(),
          items: [{
            id: Date.now(),
            perfumeId: pid,
            quantity: cartRequest.quantity,
            price: cartRequest.price ?? 0,
            imageUrl: cartRequest.image_url,
            image_url: cartRequest.image_url,
            subtotal: (cartRequest.price ?? 0) * cartRequest.quantity
          }],
          total: 0
        };
      } else {
        cart = { ...current };
        const existing = cart.items.find(i => i.perfumeId === pid);
        if (existing) {
          existing.quantity += cartRequest.quantity;
          existing.subtotal = (existing.price || 0) * existing.quantity;
        } else {
          cart.items.push({
            id: Date.now(),
            perfumeId: pid,
            quantity: cartRequest.quantity,
            price: cartRequest.price ?? 0,
            imageUrl: cartRequest.image_url,
            image_url: cartRequest.image_url,
            subtotal: 0
          });
        }
        cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
      }
      this.persistGuestCart(cart);
      return of(cart);
    }
  }

  /**
   * Update a cart item quantity.
   * Implementation: get cart (user or guest), modify items, PUT /carts/{id} or persist guest.
   */
  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    const user = this.authService.getCurrentUser();
    const current = this.cartSubject.value;

    if (user && user.id && current && current.id) {
      return this.apiService.get<Cart>(`/carts/${current.id}`).pipe(
        switchMap(cart => {
          const item = cart.items.find(i => i.id === itemId);
          if (!item) throw new Error('Item non trouvé dans le panier');
          if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.id !== itemId);
          } else {
            item.quantity = quantity;
            item.subtotal = (item.price || 0) * item.quantity;
          }
          cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
          return this.apiService.put<Cart>(`/carts/${cart.id}`, cart).pipe(
            tap(updated => this.cartSubject.next(updated))
          );
        })
      );
    } else {
      // guest update
      if (!current) return throwError(() => new Error('Panier introuvable'));
      const cart = { ...current };
      const item = cart.items.find(i => i.id === itemId);
      if (!item) return throwError(() => new Error('Item introuvable'));
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.id !== itemId);
      } else {
        item.quantity = quantity;
        item.subtotal = (item.price || 0) * item.quantity;
      }
      cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
      this.persistGuestCart(cart);
      return of(cart);
    }
  }

  removeFromCart(itemId: number): Observable<Cart> {
    const user = this.authService.getCurrentUser();
    const current = this.cartSubject.value;

    // Suivi Analytics du retrait du panier (GA4 / GTM)
    const itemToRemove = current?.items.find(i => i.id === itemId);
    if (itemToRemove) {
      this.analyticsService.trackRemoveFromCart({
        id: itemToRemove.perfumeId || itemToRemove.id,
        name: itemToRemove.name || `Parfum #${itemToRemove.perfumeId || itemToRemove.id}`,
        price: itemToRemove.price || 0,
        quantity: itemToRemove.quantity || 1
      });
    }

    if (user && user.id && current && current.id) {
      return this.apiService.get<Cart>(`/carts/${current.id}`).pipe(
        switchMap(cart => {
          cart.items = cart.items.filter(i => i.id !== itemId);
          cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
          return this.apiService.put<Cart>(`/carts/${cart.id}`, cart).pipe(
            tap(updated => this.cartSubject.next(updated))
          );
        })
      );
    } else {
      if (!current) return throwError(() => new Error('Panier introuvable'));
      const cart: Cart = {
        ...current,
        items: current.items.filter(i => i.id !== itemId)
      };
      cart.total = cart.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
      this.persistGuestCart(cart);
      return of(cart);
    }
  }

  clearCart(): Observable<Cart | null> {
    const user = this.authService.getCurrentUser();
    const current = this.cartSubject.value;

    if (user && user.id && current && current.id) {
      return this.apiService.delete<Cart>(`/carts/${current.id}`).pipe(
        tap(() => this.cartSubject.next(null)),
        map(() => null)
      );
    } else {
      this.persistGuestCart(null);
      return of(null);
    }
  }

  getCartCount(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartSubject.value?.total || 0;
  }

  getItems(): CartItem[] {
    return this.cartSubject.value?.items || [];
  }

  getTotal(): number {
    return this.getCartTotal();
  }

  getTotalItems(): number {
    return this.getCartCount();
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.updateCartItem(itemId, quantity);
  }

  getCart(): Cart | null {
    return this.cartSubject.value;
  }

  addItem(cartRequest: CartRequest): Observable<Cart> {
    return this.addToCart(cartRequest);
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.removeFromCart(itemId);
  }

  clearAll(): Observable<Cart | null> {
    return this.clearCart();
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.updateCartItem(itemId, quantity);
  }
}
