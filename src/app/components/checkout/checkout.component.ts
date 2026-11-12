import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, ShippingAddress } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  subtotal: number = 0;
  shippingCost: number = 7;
  isLoading: boolean = false;
  isUserLoggedIn: boolean = false;

  checkoutForm: FormGroup;

  shippingMethods = [
    { id: 'standard', name: 'Livraison Standard', cost: 7, delivery: '3-5 jours' },
    { id: 'express', name: 'Livraison Express', cost: 15, delivery: '1-2 jours' }
  ];

  paymentMethods = [
    { id: 'card', name: 'Carte de crédit', icon: 'fa-credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' },
    { id: 'on_delivery', name: 'Paiement à la livraison', icon: 'fa-money-bill-wave' }
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private analyticsService: AnalyticsService
  ) {
    this.checkoutForm = this.createCheckoutForm();
  }

  ngOnInit() {
    this.loadCartData();
    this.setupFormListeners();
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    
    if (!this.isUserLoggedIn) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }
  }

  private loadCartData(): void {
    this.cartItems = this.cartService.getItems();
    this.subtotal = this.cartService.getTotal();
    this.calculateTotals();
    if (this.cartItems.length > 0) {
      this.analyticsService.trackBeginCheckout(this.total, this.cartItems.length);
    }
  }

  private createCheckoutForm(): FormGroup {
    return this.fb.group({
      shippingAddress: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        country: ['Tunisie', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
        email: ['', [Validators.required, Validators.email]]
      }),
      shippingMethod: ['standard', [Validators.required]],
      paymentMethod: ['card', [Validators.required]],
      cardDetails: this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
        cardName: ['', [Validators.required]]
      }),
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }

  private setupFormListeners(): void {
    this.checkoutForm.get('shippingMethod')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.handlePaymentMethodChange(method);
    });
  }

  private handlePaymentMethodChange(method: string): void {
    const cardDetails = this.checkoutForm.get('cardDetails') as FormGroup;
    if (method === 'card') {
      if (cardDetails) {
        Object.keys(cardDetails.controls).forEach(key => {
          const control = cardDetails.get(key);
          if (control) {
            this.setCardValidators(control, key);
          }
        });
      }
    } else {
      if (cardDetails) {
        Object.keys(cardDetails.controls).forEach(key => {
          const control = cardDetails.get(key);
          control?.clearValidators();
          control?.updateValueAndValidity();
        });
      }
    }
  }

  private setCardValidators(control: AbstractControl, controlName: string): void {
    const validatorsMap: { [key: string]: any[] } = {
      cardNumber: [Validators.required, Validators.pattern(/^\d{16}$/)],
      expiryDate: [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      cvv: [Validators.required, Validators.pattern(/^\d{3}$/)],
      cardName: [Validators.required]
    };
    
    const validators = validatorsMap[controlName] || [Validators.required];
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  calculateTotals(): void {
    const selectedShipping = this.shippingMethods.find(
      method => method.id === this.checkoutForm.get('shippingMethod')?.value
    );
    this.shippingCost = selectedShipping?.cost || 7;
    this.total = this.subtotal + this.shippingCost;
  }

  get shippingAddress(): FormGroup {
    return this.checkoutForm.get('shippingAddress') as FormGroup;
  }

  get cardDetails(): FormGroup {
    return this.checkoutForm.get('cardDetails') as FormGroup;
  }

  isFieldInvalid(group: string, field: string): boolean {
    const formGroup = this.checkoutForm.get(group) as FormGroup;
    const control = formGroup?.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  isFieldError(group: string, field: string, error: string): boolean {
    const formGroup = this.checkoutForm.get(group) as FormGroup;
    const control = formGroup?.get(field);
    return !!(control && control.hasError(error) && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Veuillez vous connecter pour finaliser votre commande.');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    this.markFormGroupTouched(this.checkoutForm);

    if (this.checkoutForm.valid && this.cartItems.length > 0) {
      this.isLoading = true;

      setTimeout(() => {
        try {
          const orderData = {
            total: this.total,
            items: this.cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image_url
            })),
            shippingAddress: this.checkoutForm.value.shippingAddress as ShippingAddress,
            paymentMethod: this.checkoutForm.value.paymentMethod,
            shippingMethod: this.checkoutForm.value.shippingMethod,
            orderDate: new Date().toISOString()
          };

          this.orderService.createOrder(orderData).subscribe({
            next: (order: any) => {
              const orderId = (order && order.id) ? order.id : String(order?.orderId || Date.now());
              this.analyticsService.trackPurchase(orderId, orderData.total, this.cartItems);
              this.cartService.clearCart().subscribe(() => {});
              this.isLoading = false;
              this.router.navigate(['/order-confirmation', orderId]);
            },
            error: () => {
              this.isLoading = false;
              alert('Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.');
            }
          });
        } catch (error) {
          console.error('Error creating order:', error);
          this.isLoading = false;
          alert('Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.');
        }
      }, 2000);
    } else {
      this.scrollToFirstError();
    }
  }

  private scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.error-message');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      event.target.value = parts.join(' ');
    } else {
      event.target.value = value;
    }
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/parfume.webp';
  }
}
