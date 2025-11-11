import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ← Import direct
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true, // ← Important pour les standalone components
  imports: [CommonModule, FormsModule], // ← Ajoutez FormsModule ici
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userProfile = {
    name: "Farah Selmi",
    email: "farah@example.com",
    avatarInitials: "FS",
    notificationsEnabled: false
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
    { name: 'Floral', selected: false },
    { name: 'Boisé', selected: false },
    { name: 'Citronné', selected: false },
    { name: 'Oriental', selected: false },
    { name: 'Fruité', selected: false },
    { name: 'Aquatique', selected: false }
  ];

  // Paramètres de notification
  notificationSettings = [
    { name: 'Nouveaux parfums', enabled: true },
    { name: 'Promotions exclusives', enabled: true },
    { name: 'Conseils personnalisés', enabled: false },
    { name: 'Actualités olfactives', enabled: true }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleNotifications(): void {
    this.userProfile.notificationsEnabled = !this.userProfile.notificationsEnabled;
    
    if (this.userProfile.notificationsEnabled) {
      setTimeout(() => {
        this.userProfile.notificationsEnabled = false;
      }, 2000);
    }
  }

  // Gestion des modals
  openEditModal(): void {
    this.tempName = this.userProfile.name;
    this.tempEmail = this.userProfile.email;
    this.showEditModal = true;
  }

  saveProfile(): void {
    this.userProfile.name = this.tempName;
    this.userProfile.email = this.tempEmail;
    this.showEditModal = false;
  }

  openPreferencesModal(): void {
    this.showPreferencesModal = true;
  }

  savePreferences(): void {
    const selected = this.olfactoryPreferences.filter(pref => pref.selected).map(pref => pref.name);
    this.showPreferencesModal = false;
  }

  openNotificationsModal(): void {
    this.showNotificationsModal = true;
  }

  saveNotificationSettings(): void {
    this.showNotificationsModal = false;
  }

  openAvatarModal(): void {
    this.tempInitials = this.userProfile.avatarInitials;
    this.showAvatarModal = true;
  }

  saveAvatar(): void {
    if (this.tempInitials.length === 2) {
      this.userProfile.avatarInitials = this.tempInitials.toUpperCase();
    }
    this.showAvatarModal = false;
  }

  closeAllModals(): void {
    this.showEditModal = false;
    this.showPreferencesModal = false;
    this.showNotificationsModal = false;
    this.showAvatarModal = false;
  }
}