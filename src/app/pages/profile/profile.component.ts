import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Données du profil utilisateur
  userProfile = {
    name: 'Farah Selmi',
    email: 'farah@example.com',
    avatarInitials: 'FS',
    notificationsEnabled: true
  };

  // États des modals
  showEditModal = false;
  showPreferencesModal = false;
  showNotificationsModal = false;
  showAvatarModal = false;

  // Données temporaires pour les modals
  tempName = '';
  tempEmail = '';
  tempInitials = '';

  // Préférences olfactives
  olfactoryPreferences = [
    { name: 'Notes florales', selected: true },
    { name: 'Notes boisées', selected: false },
    { name: 'Notes orientales', selected: true },
    { name: 'Notes fraîches', selected: false },
    { name: 'Notes fruitées', selected: true }
  ];

  // Paramètres de notification
  notificationSettings = [
    { name: 'Nouveaux produits', enabled: true },
    { name: 'Promotions', enabled: true },
    { name: 'Parfums recommandés', enabled: false },
    { name: 'Actualités', enabled: true }
  ];

  constructor() {
    this.tempName = this.userProfile.name;
    this.tempEmail = this.userProfile.email;
    this.tempInitials = this.userProfile.avatarInitials;
  }

  // Ouvrir les modals
  openEditModal() {
    this.showEditModal = true;
  }

  openPreferencesModal() {
    this.showPreferencesModal = true;
  }

  openNotificationsModal() {
    this.showNotificationsModal = true;
  }

  openAvatarModal() {
    this.showAvatarModal = true;
  }

  // Fermer tous les modals
  closeAllModals() {
    this.showEditModal = false;
    this.showPreferencesModal = false;
    this.showNotificationsModal = false;
    this.showAvatarModal = false;
  }

  // Sauvegarder les modifications
  saveProfile() {
    this.userProfile.name = this.tempName;
    this.userProfile.email = this.tempEmail;
    this.closeAllModals();
  }

  savePreferences() {
    console.log('Préférences sauvegardées:', this.olfactoryPreferences);
    this.closeAllModals();
  }

  saveNotificationSettings() {
    console.log('Paramètres de notification sauvegardés:', this.notificationSettings);
    this.closeAllModals();
  }

  saveAvatar() {
    if (this.tempInitials.length === 2) {
      this.userProfile.avatarInitials = this.tempInitials.toUpperCase();
      this.closeAllModals();
    }
  }

  // Basculer les notifications
  toggleNotifications() {
    this.userProfile.notificationsEnabled = !this.userProfile.notificationsEnabled;
  }
}