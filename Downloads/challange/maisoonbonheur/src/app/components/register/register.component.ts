import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { JsonServerService } from '../../services/json-server';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  userData = {
    firstName: '',
    lastName: '',
    address: ''
  };
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private jsonServerService: JsonServerService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = null;
    

    if (!this.email || !this.password || !this.userData.firstName || !this.userData.lastName || !this.userData.address) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      this.loading = false;
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      this.loading = false;
      return;
    }

   
    this.jsonServerService.register(this.email, this.password, this.userData).subscribe({
      next: (response) => {
 
        console.log('Inscription réussie:', response);
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'success' } 
        });
      },
      error: (err) => {
       
        console.error('Erreur lors de l\'inscription:', err);
        
        if (err.status === 409) {
          this.error = 'Un compte avec cet email existe déjà.';
        } else if (err.status === 400) {
          this.error = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else {
          this.error = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}