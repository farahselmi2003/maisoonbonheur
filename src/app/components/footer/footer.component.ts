import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = '';

  constructor() { }

  ngOnInit(): void {
    // Initialisation du composant
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {
      // Simulation d'envoi à l'API
      console.log('Email inscrit à la newsletter:', this.newsletterEmail);
      
      // Afficher un message de succès (à implémenter avec un service de notification)
      this.showNotification('Merci pour votre inscription à notre newsletter!', 'success');
      
      // Réinitialiser le champ
      this.newsletterEmail = '';
    } else {
      this.showNotification('Veuillez entrer une adresse email valide', 'error');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // À implémenter avec votre service de notification préféré
    // Pour l'instant, on utilise un simple alert
    alert(message);
    
    // Exemple avec un service de notification :
    // this.notificationService.show(message, type);
  }
}