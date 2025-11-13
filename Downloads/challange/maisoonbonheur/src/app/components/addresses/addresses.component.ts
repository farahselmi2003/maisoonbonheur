import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonServerService } from '../../services/json-server';

export interface Address {
  id: number;
  street: string;
  city: string;
  postal_code: string;
  user_id: number;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="addresses-container">
      <h2>Mes Adresses</h2>
      <div class="addresses-list">
        <div *ngFor="let address of addresses" class="address-card">
          <p><strong>{{ address.street }}</strong></p>
          <p>{{ address.city }}, {{ address.postal_code }}</p>
          <button (click)="deleteAddress(address.id)">Supprimer</button>
        </div>
        <p *ngIf="addresses.length === 0">Aucune adresse enregistrée</p>
      </div>
    </div>
  `,
  styles: [`
    .addresses-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .addresses-list {
      margin-top: 20px;
    }
    .address-card {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    button {
      background-color: #ff4d4d;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];

  constructor(private jsonServerService: JsonServerService) {}

  async ngOnInit() {
    // Données mockées pour le moment
    this.addresses = [
      {
        id: 1,
        street: '123 Rue de la Parfumerie',
        city: 'Paris',
        postal_code: '75001',
        user_id: 1
      },
      {
        id: 2,
        street: '456 Avenue des Fleurs',
        city: 'Lyon',
        postal_code: '69001',
        user_id: 1
      }
    ];
  }

  deleteAddress(id: number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
  }
}