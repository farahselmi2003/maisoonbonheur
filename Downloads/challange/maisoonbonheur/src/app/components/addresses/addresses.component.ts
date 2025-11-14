import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonServerService } from '../../services/json-server';

export interface Address {
  id: number;
  street: string;
  city: string;
  postal_code: string;
  user_id: number;
  is_default?: boolean;
  name?: string;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];

  constructor(private jsonServerService: JsonServerService) {}

  async ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    // Données mockées pour le moment - vous pouvez remplacer par un appel API
    this.addresses = [
      {
        id: 1,
        street: '123 Rue de la Parfumerie',
        city: 'tunis',
        postal_code: '75001',
        user_id: 1,
        is_default: true,
        name: 'Domicile'
      },
      {
        id: 2,
        street: '456 Avenue des Fleurs',
        city: 'manouba',
        postal_code: '69001',
        user_id: 1,
        name: 'Bureau'
      },
      {
        id: 3,
        street: '789 Boulevard des Parfums',
        city: 'beja',
        postal_code: '13001',
        user_id: 1,
        name: 'Chez mes parents'
      }
    ];
  }

  deleteAddress(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.addresses = this.addresses.filter(a => a.id !== id);
      // Ici vous ajouterez l'appel API pour supprimer l'adresse
      console.log('Adresse supprimée:', id);
    }
  }

  setDefaultAddress(id: number) {
    this.addresses = this.addresses.map(address => ({
      ...address,
      is_default: address.id === id
    }));
    // Ici vous ajouterez l'appel API pour définir l'adresse par défaut
    console.log('Adresse par défaut:', id);
  }

  editAddress(address: Address) {
    // Implémentez la logique d'édition ici
    console.log('Édition de l\'adresse:', address);
    // Vous pouvez ouvrir un modal ou naviguer vers une page d'édition
  }

  addNewAddress() {
    // Implémentez l'ajout d'une nouvelle adresse
    console.log('Ajouter une nouvelle adresse');
    // Vous pouvez ouvrir un modal ou naviguer vers une page de création
  }
}