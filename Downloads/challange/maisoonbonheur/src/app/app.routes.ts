import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./components/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'creator',
    loadComponent: () => import('./components/creator/creator.component').then(m => m.CreatorComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'panier',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
    // canActivate: [authGuard] - décommenter si nécessaire plus tard
  },
    {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./components/ConfirmationCommande/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent)

  },
  { 
    path: 'user/addresses', 
    loadComponent: () => import('./components/addresses/addresses.component').then(m => m.AddressesComponent)
  },
];

