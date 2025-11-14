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
   
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {
  
      console.log('Email inscrit à la newsletter:', this.newsletterEmail);
      
     
      this.showNotification('Merci pour votre inscription à notre newsletter!', 'success');
      
    
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
  
    alert(message);
    
  }
}