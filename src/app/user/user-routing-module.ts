import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersComponent } from '../pages/orders/orders.component';
import { AddressesComponent } from '../pages/addresses/addresses.component';

const routes: Routes = [
  { path: 'orders', component: OrdersComponent },
  { path: 'addresses', component: AddressesComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
