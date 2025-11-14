import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, ShippingAddress } from '../../services/order.service';

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
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.createCheckoutForm();
  }

  ngOnInit() {
    this.loadCartData();
    this.calculateTotals();
  }

  private loadCartData(): void {
    this.cartItems = this.cartService.getItems(); // Synchronous cart items
    this.subtotal = this.cartService.getTotal();
    this.calculateTotals();
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

  calculateTotals(): void {
    const selectedShipping = this.shippingMethods.find(
      method => method.id === this.checkoutForm.get('shippingMethod')?.value
    );
    this.shippingCost = selectedShipping?.cost || 7;
    this.total = this.subtotal + this.shippingCost;
  }

  onShippingMethodChange(): void {
    this.calculateTotals();
  }

  get shippingAddress() {
    return this.checkoutForm.get('shippingAddress') as FormGroup;
  }

  get cardDetails() {
    return this.checkoutForm.get('cardDetails') as FormGroup;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && this.cartItems.length > 0) {
      this.isLoading = true;

      
      setTimeout(() => {
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
          shippingMethod: this.checkoutForm.value.shippingMethod
        };

        const order = this.orderService.createOrder(orderData);
        this.cartService.clearCart();
        this.isLoading = false;
        
        this.router.navigate(['/order-confirmation', order.id]);
      }, 2000);
    } else {
      this.markFormGroupTouched(this.checkoutForm);
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
}