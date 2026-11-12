import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare const gtag: Function | undefined;
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);

  constructor() {
    this.initPageTracking();
  }

  /**
   * Suivi automatique des changements de page (Router Angular)
   * Dans une SPA (Single Page Application), la page ne recharge jamais complètement.
   * Il faut donc notifier Google Analytics à chaque navigation de l'utilisateur.
   */
  private initPageTracking(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Envoi d'une vue de page (Page View) à Google Analytics et Google Tag Manager
   */
  trackPageView(url: string, title?: string): void {
    const pageTitle = title || document.title;

    // 1. Envoi via Google Analytics (gtag.js)
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: url,
        page_title: pageTitle,
        page_location: window.location.href
      });
    }

    // 2. Envoi via Google Tag Manager (dataLayer)
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'virtual_page_view',
        page_path: url,
        page_title: pageTitle
      });
    }
  }

  /**
   * Envoi d'un événement personnalisé générique
   */
  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    // Via gtag
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }

    // Via dataLayer (GTM)
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }
  }

  // ========================================================
  // ÉVÉNEMENTS E-COMMERCE SPÉCIFIQUES (Maison Bonheur)
  // ========================================================

  /**
   * 1. Vue d'un parfum / fiche produit (view_item)
   */
  trackViewItem(item: { id: string | number; name: string; price: number; category?: string }): void {
    this.trackEvent('view_item', {
      currency: 'TND',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category || 'Parfums',
          quantity: 1
        }
      ]
    });
  }

  /**
   * 2. Ajout d'un parfum au panier (add_to_cart)
   */
  trackAddToCart(item: { id: string | number; name: string; price: number; quantity?: number }): void {
    const quantity = item.quantity || 1;
    this.trackEvent('add_to_cart', {
      currency: 'TND',
      value: item.price * quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: quantity
        }
      ]
    });
  }

  /**
   * 3. Retrait d'un parfum du panier (remove_from_cart)
   */
  trackRemoveFromCart(item: { id: string | number; name: string; price: number; quantity?: number }): void {
    const quantity = item.quantity || 1;
    this.trackEvent('remove_from_cart', {
      currency: 'TND',
      value: item.price * quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: quantity
        }
      ]
    });
  }

  /**
   * 4. Lancement du processus de commande (begin_checkout)
   */
  trackBeginCheckout(totalValue: number, itemsCount: number): void {
    this.trackEvent('begin_checkout', {
      currency: 'TND',
      value: totalValue,
      items_count: itemsCount
    });
  }

  /**
   * 5. Commande finalisée avec succès (purchase)
   */
  trackPurchase(orderId: string | number, totalValue: number, items: any[]): void {
    this.trackEvent('purchase', {
      transaction_id: orderId,
      currency: 'TND',
      value: totalValue,
      items: items.map(i => ({
        item_id: i.id || i.perfumeId,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  }

  /**
   * 6. Connexion utilisateur (login)
   */
  trackLogin(method: string = 'email'): void {
    this.trackEvent('login', { method });
  }

  /**
   * 7. Inscription utilisateur (sign_up)
   */
  trackSignUp(method: string = 'email'): void {
    this.trackEvent('sign_up', { method });
  }

  /**
   * 8. Recherche dans le catalogue (search)
   */
  trackSearch(searchTerm: string): void {
    this.trackEvent('search', { search_term: searchTerm });
  }
}
