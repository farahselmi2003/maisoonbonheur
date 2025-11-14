import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Données du profil utilisateur
  userProfile: User | null = null;

  // États des modals
  showEditModal = false;
  showPreferencesModal = false;
  showNotificationsModal = false;
  showAvatarModal = false;

  // Données temporaires pour les modals
  tempName = '';
  tempEmail = '';
  tempInitials = '';
  tempAddress = '';

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

  constructor(private authService: AuthService) {
    this.userProfile = this.authService.currentUser;
    if (this.userProfile) {
      this.tempName = this.userProfile.firstName + ' ' + this.userProfile.lastName;
      this.tempEmail = this.userProfile.email;
      this.tempInitials = (this.userProfile.firstName[0] || '') + (this.userProfile.lastName[0] || '');
      this.tempAddress = this.userProfile.address;
    }
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
    if (this.userProfile) {
      const [firstName, ...lastNameArr] = this.tempName.split(' ');
      const lastName = lastNameArr.join(' ');
      const updatedUser: User = {
        ...this.userProfile,
        firstName: firstName,
        lastName: lastName,
        email: this.tempEmail,
        address: this.tempAddress,
      };
      const result = this.authService.updateUser(updatedUser);
      if (result.success) {
        this.userProfile = this.authService.currentUser;
        this.closeAllModals();
      } else {
        alert(result.message);
      }
    }
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
    if (this.tempInitials.length === 2 && this.userProfile) {
      // Ici, tu pourrais ajouter la logique pour sauvegarder les initiales dans le profil si tu ajoutes ce champ au modèle User
      this.closeAllModals();
    }
  }

  // Basculer les notifications
  toggleNotifications() {
    // Ici, tu pourrais ajouter la logique pour gérer les notifications dans le modèle User si tu ajoutes ce champ
  }
}